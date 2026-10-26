# Passdropit — Supabase Security Audit Report

**Date:** 2026-10-26  
**Scope:** RLS, views, privilege hygiene, FK cascades, SECURITY DEFINER functions, privilege-escalation columns, API ownership checks, webhooks, hardcoded keys, safety net.  
**SQL fixes:** `supabase/security-audit.sql`  
**Code fixes:** `src/lib/db/links.ts` (atomic balance deduction)

---

## Summary

| # | Severity | Finding | Fixed |
|---|----------|---------|-------|
| 1 | 🔴 Critical | No RLS on any table | SQL §1 |
| 2 | 🔴 Critical | No revoke of anon/authenticated grants | SQL §2 |
| 3 | 🟠 High | Double-spend race condition in `buyLink` | Code fix |
| 4 | 🟠 High | Privilege-escalation columns unprotected at DB level | SQL §3 |
| 5 | 🟡 Medium | No audit log for deleted rows | SQL §5 |
| 6 | 🟡 Medium | No bulk-delete limit on `file_list_user` | SQL §6 |
| 7 | 🟡 Medium | No backup strategy documented | SQL §8 |
| 8 | 🟢 Low | `check-google-link` accessible without auth | Info only |
| 9 | 🟢 Low | No views, no SECURITY DEFINER functions | N/A |
| 10 | ✅ Pass | API routes always use verified JWT `session.user.id` | — |
| 11 | ✅ Pass | Stripe webhook signature verified | — |
| 12 | ✅ Pass | Service role key is server-only (not NEXT_PUBLIC_) | — |
| 13 | ✅ Pass | `hash-passwords.mjs` reads key from env, not hardcoded | — |

---

## Finding 1 — No Row-Level Security (Critical)

**Tables affected:** `users`, `file_list_user`, `daily_downloads`, `ip_tracker`, `paid_links`, `paid_membership`, `password_reset_tokens`, `rate_limits`

**What an attacker can do today:**  
Every Supabase project exposes its anon key in the dashboard (and it may appear in browser network requests or third-party integrations). With no RLS enabled, any caller who obtains the anon key can directly query the Supabase REST API and:
- `GET /rest/v1/users?select=*` → dump all user records including `password_hash`, `balance`, `stripe_id`, `subscription_id`
- `PATCH /rest/v1/users?id=eq.1` → rewrite any column on any user row
- `DELETE /rest/v1/file_list_user?user_id=eq.X` → destroy another user's links
- `GET /rest/v1/password_reset_tokens?select=*` → harvest live reset tokens and take over any account

**Fix:** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on all eight tables (SQL §1). With RLS enabled and no permissive policies, `anon` and `authenticated` roles are denied by default. The `service_role` key (used by the app server) bypasses RLS transparently — no app changes required.

---

## Finding 2 — anon/authenticated Grants Not Revoked (Critical)

**What an attacker can do today:**  
Supabase projects inherit `GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated` from the project provisioning template. Even after RLS is enabled, removing these grants is defence-in-depth: a misconfigured future RLS policy can't accidentally allow more than the GRANT permits.

**Fix:** `REVOKE ALL` on all eight tables from both roles, plus `ALTER DEFAULT PRIVILEGES` so new tables don't inherit the grants (SQL §2).

---

## Finding 3 — Double-Spend Race Condition in `buyLink` (High)

**File:** `src/lib/db/links.ts:408–438`

**What an attacker can do today:**  
The balance deduction flow is:
1. Read buyer's balance from DB
2. Compute `new_balance = balance - price` in JavaScript
3. `UPDATE users SET balance = <new_balance> WHERE id = X AND balance >= price`

Between steps 1 and 3, a concurrent request from the same buyer can read the same `balance`, also pass the `>= price` check, and both UPDATEs succeed — because both set `balance` to the same lower value. The buyer receives the paid link twice while only being charged once.

**Fix (applied):** The `buyLink` function now calls a database RPC `deduct_user_balance` (SQL §4) that executes `UPDATE … SET balance = balance - $amount WHERE balance >= $amount` atomically. If the balance is insufficient the function returns `false` and no deduction occurs. The seller credit is similarly updated to `SET balance = balance + amount` (atomic addition, no read-modify-write).

---

## Finding 4 — Privilege-Escalation Columns Unprotected at DB Level (High)

**Columns:** `users.is_pro`, `users.balance`, `users.stripe_id`, `users.subscription_id`, `users.paypal_id`

**What an attacker can do today:**  
The application's NextAuth JWT callback correctly refuses to let clients update `level`, `balance`, `stripe_id`, etc. through the session update path. However, this protection exists only in the application layer. A compromised API route, a future developer mistake, or a direct DB connection bypasses it. Any caller who gains UPDATE on `users` through a misconfigured RLS policy can self-promote to Pro (`is_pro = 1`), credit their own balance, or redirect PayPal payouts.

**Fix:** A `BEFORE UPDATE` trigger (`trg_block_privilege_escalation`) on `users` raises an exception if any of those five columns changes and the current Postgres role is not one of the trusted server roles (`service_role`, `postgres`, `supabase_admin`, `authenticator`) (SQL §3).

---

## Finding 5 — No Audit Log for Deleted Rows (Medium)

**What an attacker can do today:**  
A stolen session token or a bug in the `delete-link` or `delete-logo` routes would let an attacker silently delete a user's links, analytics data, or account. With ON DELETE CASCADE, the deletion propagates to `daily_downloads` and `ip_tracker`. There is currently no way to reconstruct what was deleted without a full backup restore.

**Fix:** `audit_deleted_rows` table with append-only BEFORE DELETE triggers on `file_list_user` and `users` (SQL §5). The table itself has RLS enabled with no DELETE policy, making it extremely hard to purge programmatically. The `row_data JSONB` column captures the full row before deletion.

---

## Finding 6 — No Bulk-Delete Limit on `file_list_user` (Medium)

**What an attacker can do today:**  
A compromised session token gives an attacker access to the `delete-link` endpoint. While the current implementation only deletes one link per request, a future bug or endpoint change could issue a multi-row DELETE. A single statement could wipe all of a user's links (and cascade into their analytics).

**Fix:** A statement-level AFTER DELETE trigger rejects any DELETE that affects more than 50 rows at once (SQL §6). Normal usage (single-link deletion) never hits this limit.

---

## Finding 7 — No Backup Strategy (Medium)

**What is missing:**  
`supabase/schema.sql` documents the schema but has no note on backup configuration. The audit tables in §5 provide row-level recovery, but a full DB disaster still requires a PostgreSQL backup.

**Recommendation (documented in SQL §8):**
1. Enable **Point-in-Time Recovery** in Supabase Project Settings → Add-Ons (requires Pro plan).
2. For Free/Pro tiers: schedule a daily `pg_dump` via GitHub Actions cron or an external backup service.
3. Test a restore to a staging project at least quarterly.

---

## Finding 8 — `check-google-link` Accessible Without Auth (Low)

**File:** `src/app/api/gateway/[path]/route.ts:262–272`

**What an attacker can do today:**  
The endpoint is not in `guardedPaths` for POST, so unauthenticated callers can make the Passdropit server issue a HEAD request to any URL that passes `isValidLinkUrl`. The SSRF mitigation is solid (rejects localhost, RFC-1918 CIDRs, link-local, IPv6 ULA/loopback) so internal network probing is blocked. The remaining risk is low-rate abuse using Passdropit as a proxy to check whether public URLs are alive.

**Recommendation:** Add `'check-google-link'` to the POST `guardedPaths` list to require authentication. No security fix applied automatically since it's a low-priority UX trade-off.

---

## Audit Sections With No Findings

### Views
No views exist in the public schema — nothing to audit.

### SECURITY DEFINER Functions
No user-defined `SECURITY DEFINER` functions exist in the schema prior to this audit. The three functions added by this audit (`trg_block_privilege_escalation_fn`, `deduct_user_balance`, `credit_user_balance`, `trg_audit_delete_*`) are defined with `SECURITY DEFINER` intentionally so they run with `service_role` privileges. They do **not** accept a `user_id` parameter — they read the target from the trigger's `OLD`/`NEW` record or from a validated caller-supplied parameter that is validated against DB state.

### ON DELETE CASCADE Audit
| FK | CASCADE | Assessment |
|----|---------|------------|
| `file_list_user.user_id → users(id)` | ✅ ON DELETE CASCADE | Correct: links belong to the user |
| `daily_downloads.link_id → file_list_user(id)` | ✅ ON DELETE CASCADE | Correct: analytics are per-link |
| `ip_tracker.link_id → file_list_user(id)` | ✅ ON DELETE CASCADE | Correct: IP logs are per-link |
| `password_reset_tokens.user_id → users(id)` | ✅ ON DELETE CASCADE | Correct: tokens belong to the user |
| `daily_downloads.user_id → users(id)` | ⚠️ NO ACTION | Safe: cascade via link_id handles deletion; user_id rows are gone before the FK fires |
| `paid_links.user_id → users(id)` | ✅ NO ACTION | Correct: financial records must be preserved |
| `paid_links.link_id → file_list_user(id)` | ✅ NO ACTION | Correct: financial records must be preserved |
| `paid_membership.user_id → users(id)` | ✅ NO ACTION | Correct: financial records must be preserved |

### API Route Ownership Checks
All privileged API routes read `userId` exclusively from `session?.user?.id` (the verified NextAuth JWT). No route accepts `userId` from the request body for authenticated operations. The `validate-link` and `get-link-detail` public routes correctly treat the caller as anonymous when no session exists.

### Stripe Webhook
`/api/webhooks/stripe/route.ts` correctly:
- Returns 400 immediately if `stripe-signature` header or `STRIPE_WEBHOOK_SECRET` env var is missing
- Uses `stripe.webhooks.constructEvent` to cryptographically verify the payload
- Never trusts `user_id` from the event without it being embedded in Stripe metadata

### Service Role Key
`src/lib/supabase.ts` uses `process.env.SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). The service role key is never exposed to the browser. No `NEXT_PUBLIC_SUPABASE_*` variables exist in the codebase.

### `hash-passwords.mjs`
This migration script reads credentials from environment variables only and contains no hardcoded values. It is currently untracked (git status). **Ensure it is listed in `.gitignore`** to prevent accidental commit alongside an `.env.local` file.

---

## Applying the Fixes

1. Copy `supabase/security-audit.sql` into the Supabase SQL editor for your project.
2. Review each section, then run the file in its entirety (it is idempotent).
3. Deploy the updated `src/lib/db/links.ts` (atomic balance deduction).
4. Verify the app works end-to-end in staging before applying to production.
5. Enable Point-in-Time Recovery in the Supabase dashboard.
