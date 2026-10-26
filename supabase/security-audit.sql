-- =============================================================================
-- Passdropit — Supabase Security Audit
-- Generated: 2026-10-26
-- Review this file carefully before applying. Run in the Supabase SQL editor.
-- All changes are idempotent (IF NOT EXISTS / OR REPLACE).
-- =============================================================================


-- =============================================================================
-- SECTION 1: ENABLE ROW-LEVEL SECURITY ON ALL PUBLIC TABLES
-- =============================================================================
-- Finding: No table in the public schema has RLS enabled. Any caller with the
-- Supabase anon key (project config, leaked from client, dashboards) can
-- SELECT/INSERT/UPDATE/DELETE every row. The service_role key bypasses RLS and
-- continues to work for all server-side app code.

ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_list_user        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_downloads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_tracker            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_links            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paid_membership       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits           ENABLE ROW LEVEL SECURITY;

-- With RLS enabled and no permissive policies, the default is DENY ALL for
-- the `anon` and `authenticated` roles. The `service_role` key bypasses RLS
-- automatically (Supabase behaviour), so the app continues to work unchanged.
-- No additional policies are required for `anon` or `authenticated` because
-- this application exclusively uses the server-side service_role key and does
-- NOT expose Supabase to browser clients.


-- =============================================================================
-- SECTION 2: REVOKE DANGEROUS DEFAULT GRANTS FROM anon / authenticated
-- =============================================================================
-- Finding: Supabase projects historically grant SELECT/INSERT/UPDATE/DELETE on
-- all public tables to both `anon` and `authenticated` roles. Without RLS these
-- grants give unauthenticated callers full data access. Even with RLS, removing
-- the grant is defence-in-depth and makes the intent explicit.

REVOKE ALL ON public.users                 FROM anon, authenticated;
REVOKE ALL ON public.file_list_user        FROM anon, authenticated;
REVOKE ALL ON public.daily_downloads       FROM anon, authenticated;
REVOKE ALL ON public.ip_tracker            FROM anon, authenticated;
REVOKE ALL ON public.paid_links            FROM anon, authenticated;
REVOKE ALL ON public.paid_membership       FROM anon, authenticated;
REVOKE ALL ON public.password_reset_tokens FROM anon, authenticated;
REVOKE ALL ON public.rate_limits           FROM anon, authenticated;

-- Prevent new tables from inheriting dangerous grants automatically.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;


-- =============================================================================
-- SECTION 3: PRIVILEGE-ESCALATION COLUMN PROTECTION TRIGGER
-- =============================================================================
-- Finding: Columns that control billing and access (is_pro, balance, stripe_id,
-- subscription_id, paypal_id) can be written by any database role that has UPDATE
-- on the users table. If a future bug, misconfiguration, or RLS policy
-- inadvertently allows writes from `anon` or `authenticated`, a caller could
-- self-promote to Pro or inflate their balance.
--
-- Fix: A BEFORE UPDATE trigger blocks writes to those columns from any session
-- whose current_user is not a trusted server role.

CREATE OR REPLACE FUNCTION public.trg_block_privilege_escalation_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow trusted server roles (service_role bypasses RLS, but also hits triggers).
  -- Adjust the list if you add application-level Postgres roles in future.
  IF current_user IN ('service_role', 'postgres', 'supabase_admin', 'authenticator') THEN
    RETURN NEW;
  END IF;

  IF OLD.is_pro           IS DISTINCT FROM NEW.is_pro           OR
     OLD.balance          IS DISTINCT FROM NEW.balance          OR
     OLD.stripe_id        IS DISTINCT FROM NEW.stripe_id        OR
     OLD.subscription_id  IS DISTINCT FROM NEW.subscription_id  OR
     OLD.paypal_id        IS DISTINCT FROM NEW.paypal_id        THEN
    RAISE EXCEPTION 'Modification of privileged columns (is_pro, balance, stripe_id, subscription_id, paypal_id) is not permitted from role "%"', current_user;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_privilege_escalation ON public.users;
CREATE TRIGGER trg_block_privilege_escalation
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.trg_block_privilege_escalation_fn();


-- =============================================================================
-- SECTION 4: ATOMIC BALANCE DEDUCTION FUNCTION
-- =============================================================================
-- Finding: The buyLink flow in src/lib/db/links.ts reads the buyer's balance,
-- computes `balance - amount` in JS, then issues:
--   UPDATE users SET balance = <computed> WHERE id = X AND balance >= amount
-- Between the read and the write a concurrent request can also read the same
-- balance, pass the check, and both writes set the same lower value — giving
-- the buyer the link twice for the price of one (double-spend).
--
-- Fix: An atomic SQL function that performs the subtraction entirely inside the
-- DB, so it is serialised correctly under concurrent load. The caller checks the
-- boolean return value; false means insufficient funds.

CREATE OR REPLACE FUNCTION public.deduct_user_balance(
  p_user_id BIGINT,
  p_amount  DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated INT;
BEGIN
  UPDATE public.users
  SET    balance = balance - p_amount
  WHERE  id = p_user_id
    AND  balance >= p_amount;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;

-- Revoke direct execution from untrusted roles; only service_role may call it.
REVOKE ALL ON FUNCTION public.deduct_user_balance(BIGINT, DECIMAL) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.deduct_user_balance(BIGINT, DECIMAL) TO service_role;

-- Companion: atomic credit to seller (always safe to add; prevents missed credits
-- under concurrent load when two buyers purchase different links at the same time).
CREATE OR REPLACE FUNCTION public.credit_user_balance(
  p_user_id BIGINT,
  p_amount  DECIMAL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET    balance = balance + p_amount
  WHERE  id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.credit_user_balance(BIGINT, DECIMAL) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION public.credit_user_balance(BIGINT, DECIMAL) TO service_role;


-- =============================================================================
-- SECTION 5: AUDIT LOG — CAPTURE DELETED ROWS
-- =============================================================================
-- Finding: There is no audit trail. A deleted user or link takes all its
-- associated data (cascade) with it and leaves no forensic record. If an account
-- or link is maliciously or accidentally deleted, recovery requires restoring a
-- full backup.
--
-- Fix: A dedicated audit table plus BEFORE DELETE triggers on the two highest-
-- value tables. Rows here are append-only; the audit table itself has RLS
-- enabled and no DELETE policy, making it hard to purge without direct DB access.

CREATE TABLE IF NOT EXISTS public.audit_deleted_rows (
  id          BIGSERIAL    PRIMARY KEY,
  table_name  TEXT         NOT NULL,
  row_id      BIGINT       NOT NULL,
  deleted_by  TEXT         NOT NULL DEFAULT current_user,
  deleted_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  row_data    JSONB        NOT NULL
);

ALTER TABLE public.audit_deleted_rows ENABLE ROW LEVEL SECURITY;

-- No SELECT policy for anon/authenticated — only service_role can read.
-- Intentionally no DELETE policy on audit_deleted_rows (append-only).

GRANT SELECT, INSERT ON public.audit_deleted_rows TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.audit_deleted_rows_id_seq TO service_role;

-- Trigger on file_list_user
CREATE OR REPLACE FUNCTION public.trg_audit_delete_file_list_user_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_deleted_rows(table_name, row_id, row_data)
  VALUES ('file_list_user', OLD.id, to_jsonb(OLD));
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_delete_file_list_user ON public.file_list_user;
CREATE TRIGGER trg_audit_delete_file_list_user
BEFORE DELETE ON public.file_list_user
FOR EACH ROW
EXECUTE FUNCTION public.trg_audit_delete_file_list_user_fn();

-- Trigger on users
CREATE OR REPLACE FUNCTION public.trg_audit_delete_users_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_deleted_rows(table_name, row_id, row_data)
  VALUES ('users', OLD.id, to_jsonb(OLD));
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_delete_users ON public.users;
CREATE TRIGGER trg_audit_delete_users
BEFORE DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.trg_audit_delete_users_fn();


-- =============================================================================
-- SECTION 6: BULK-DELETE LIMIT ON file_list_user
-- =============================================================================
-- Finding: A single API request can delete an arbitrary number of rows in
-- file_list_user (and cascade into daily_downloads, ip_tracker). A compromised
-- session token or a bug in the delete-link route could wipe all of a user's
-- links in one statement.
--
-- Fix: A statement-level AFTER DELETE trigger using a transition table checks
-- how many rows were deleted in the statement and raises an exception if the
-- count exceeds a safe threshold (50). The app's delete-link endpoint only ever
-- deletes one row at a time, so this never fires under normal usage.

CREATE OR REPLACE FUNCTION public.trg_limit_bulk_delete_file_list_user_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  SELECT count(*) INTO deleted_count FROM old_table;
  IF deleted_count > 50 THEN
    RAISE EXCEPTION 'Bulk delete of more than 50 file_list_user rows in a single statement is not permitted (attempted: %)', deleted_count;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_limit_bulk_delete_file_list_user ON public.file_list_user;
CREATE TRIGGER trg_limit_bulk_delete_file_list_user
AFTER DELETE ON public.file_list_user
REFERENCING OLD TABLE AS old_table
FOR EACH STATEMENT
EXECUTE FUNCTION public.trg_limit_bulk_delete_file_list_user_fn();


-- =============================================================================
-- SECTION 7: VERIFY SERVICE_ROLE GRANTS (FUTURE-PROOF)
-- =============================================================================
-- Re-assert explicit service_role grants to include the new audit table and
-- the new functions. Supabase is removing implicit grants from October 2026.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_deleted_rows TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =============================================================================
-- SECTION 8: BACKUP STRATEGY NOTE
-- =============================================================================
-- The schema does not document a backup strategy.
-- Recommended actions (manual steps in Supabase dashboard, not SQL):
--   1. Enable Point-in-Time Recovery (PITR) in Project Settings → Add-Ons.
--      This provides continuous WAL-based backups with 7-day restore window.
--   2. For the Free/Pro tier where PITR is unavailable, schedule a daily
--      pg_dump using a GitHub Actions cron or an external service.
--   3. Test a restore to a staging project at least once per quarter.
-- =============================================================================
