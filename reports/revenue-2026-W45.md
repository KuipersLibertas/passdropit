# Revenue Report — 2026-W45
*Generated: 2026-11-06 (Friday) by Revenue Agent*
**Period:** Mon 2026-11-02 – Sun 2026-11-08 (run mid-week, Friday)
**Compared against:** W42 report (2026-10-18) — no revenue reports were written for W43/W44.

---

## Weekly Revenue

| Source | This Week (W45, Nov 2–5, 4 days) | Last Week (W44, Oct 26–Nov 1) | Change |
|--------|-----------|------------------------|--------|
| Setupad | **€0.34** (~$0.37) ✓ live, ~€0.60 projected for 7 days | **€0.85** (~$0.94) ✓ | -29% projected (W44 inflated by a €0.30 Nov 1 spike) |
| AdSense (direct) | n/a (migrated to Setupad) | n/a | — |
| Stripe MRR | **€16.91 (~$18.60)** ✓ live | €16.91 | 0% |
| **Total (monthly-equivalent)** | **~€19.50/mo** | ~€20.60/mo | ~flat |

> **Setupad (live, read via Chrome at `client.setupad.com/home` on 2026-11-06).** Dashboard currency is EUR, converted to USD at ~1.10, the same rate as Stripe. Last 30 days: **€1.99 revenue (+63% vs same dates last month)**, 4.49K impressions, eCPM €0.44, viewability 78.0%, fill 100%, 16.57K pageviews, pvRPM €0.12. Hourly data runs ~5h behind, so Nov 6 is not included.
>
> **Stripe (live, read via Chrome 2026-11-06):** Billing overview MRR **€16.91**, ARR **€202.92**, MRR growth **-0.29%** (FX drift only). Lifetime net volume €934.60.

### 🟢 The new GPT ad units (launched Oct 27) roughly doubled ad revenue

| Week (ISO) | Impressions | Revenue | eCPM | Pageviews | Imp / pageview |
|------------|------------:|--------:|-----:|----------:|---------------:|
| W42 (Oct 12–18) | 661 | €0.26 | €0.39 | 3,840 | 0.17 |
| W43 (Oct 19–25) | 753 | €0.32 | €0.42 | 4,207 | 0.18 |
| W44 (Oct 26–Nov 1) | 1,516 | €0.85 | €0.56 | 3,647 | 0.42 |
| W45 to date (Nov 2–5) | 1,034 | €0.34 | €0.33 | 2,005 | 0.52 |

- **Before vs after launch:** Oct 7–26 averaged **€0.043/day** at 0.17 impressions per pageview. Oct 27–Nov 5 averaged **€0.113/day** at 0.48 per pageview. That is about **2.6× daily revenue** from about **2.8× ad density**, with the same traffic.
- **eCPM held up** (€0.43 before vs €0.46 after), and viewability stayed at 69–84% per day. The extra inventory is not cheapening each impression.
- Nov 1 was an outlier (€0.30, eCPM €1.09). Without it, the post-launch run rate is about €0.09/day, still **~2× the old baseline**. The sustainable estimate is **€0.55–0.65/week (~€2.50/month)**, up from ~€0.30/week.
- ⚠️ **Traffic is dipping:** Nov 3–5 pageviews were 448–490 a day, against ~550–650 in October. Visits are down to ~240–265 a day (from ~300–350). If this lasts, it will eat into the gain.

### ⚠️ Stripe subscription health has changed
| Status | Count | Notes |
|--------|-------|-------|
| Active (Actief) | **1** | Single customer, current |
| **Past due (Achterstallig)** | **2** | Both belong to **one customer** (account name "HUSTLE") |
| Canceled (Geannuleerd) | 16 | No new cancellations since 2025-02 (most recent real churn: Feb 2025; Apr 2026 entry is the owner's own test account) |

Stripe still counts past-due subs in MRR, so the €16.91 headline **overstates secure revenue**. If the two past-due subscriptions churn after Smart Retries run out, MRR falls to roughly **€4.5–8** (depending on which plan the active sub is on, $5 or $9). That loss would be about 4× the entire monthly ad gain from the new units. It is still the biggest revenue risk.

---

## Ad Placement Audit

*Codebase state at `2fa9edb` (main). Changes since W42: `04f2e48` ad infrastructure, `4bb6c0a` GPT display timing fix, `7e92733` GPT interstitial removed (it popped up for Pro users), `a2e5291` Sulvo adblock detection removed.*

### Inventory by page

| Page | Side rails (4218 / 4219) | Sticky anchor (GPT) | In-article (GPT) | Other |
|------|:---:|:---:|:---:|------|
| `/download/[slug]` | ✓ | ✓ | — | Gateway overlay (5s), reuses **4218** |
| `/invalid-link` | ✓ | ✓ | — | — |
| `/blog` (index) | ✓ | ✓ | — | — |
| `/blog/[id]` | ✓ | ✓ | ✓ (variant 1 above, variant 2 lazy below) | — |
| `/` (home) | — | ✓ | — | — |
| All other pages | — | ✓ | — | — |

`StickyAnchorAd` is mounted in the root `src/app/layout.tsx`, so **every page, the home page included, now has one ad unit**. The W42 finding that the home page had no ads is partly resolved.

### Blog (`src/views/Blog/index.tsx`, `src/views/Blog/Detail/index.tsx`)
- Side rails 4218/4219 are fixed at `top: 70` with unique slot IDs (`blog-index-*`, `blog-detail-*`) ✓
- Blog detail: `InArticleAdSlot variant={1}` (line 69) and `variant={2}` (line 107) ✓. The variant-1 slot is predefined and displayed in the layout GPT block, and variant 2 lazy-loads on viewport entry.
- The mount bug from W43 is fixed (deps `[status, session, variant]`, `initialized` guard) ✓
- Side rails are 160/300px-wide units fixed to viewport edges. On a <1200px viewport they will overlap the content column unless `AdSlot` hides them. Worth a visual check (not verified this run).

### Main layout (`src/layouts/Main/index.tsx`)
- No ad code, only GA4 (`G-6ZR1JRBKNW`). All ad scripts live in the root `src/app/layout.tsx`: CMP (prop 6396), GPT, and the prebid wrapper `stpd.cloud/saas/4179` ✓

### Issues found in `src/app/layout.tsx` GPT init (lines 103–119)
1. **Pro users still trigger the sticky-anchor request.** `googletag.display('…sticky_anchorad_responsive')` runs in an inline script before the session resolves. `StickyAnchorAd` renders its div during `status === 'loading'` (SSR), so the slot is requested and only hidden after hydration. Result: Pro users may briefly see the anchor, and every Pro page view burns an unviewable impression, which lowers viewability scores for the whole site. This is the same class of bug as the interstitial removed in `7e92733`.
2. **`display()` for the in-article slot is called on every page**, but its div exists only on `/blog/[id]`. Elsewhere GPT logs a "div not found" error and the slot is dead weight in the single request. Low impact, but it adds console noise and may count as a wasted ad request.
3. **Duplicate tag 4218 on `/download`** (from the W43 backlog item, still open): `DownloadGateway.tsx:58` mounts `AdSlot tagId="4218"` while the left rail `download-left` (4218) is also mounted. The TODO comment in the file confirms it is a placeholder.

### ads.txt
- **Refreshed 2026-10-18** ("generated by Setupad Ads.txt Manager on 2026-10-18 18:14"), 435 lines, includes `MANAGERDOMAIN=setupad.com` ✓. The backlog item "Refresh ads.txt" is done.

---

## Recommendations

- [ ] **Chase the 2 past-due Stripe subscriptions (owner action)** — check Stripe → Billing → Smart Retries / failed-payment emails are on for the "HUSTLE" customer, and consider a personal nudge. Impact: protects about 60–75% of current MRR (~€9–12/mo). Highest-value action this week.
- [x] **Setupad reporting access restored**: the working dashboard is `https://client.setupad.com/home` (Reporting → Daily; per-day data can be read from the page's AmCharts `dataProvider`). Recorded in `metrics.md`.
- [ ] **Keep the GPT units, and fix their Pro leak before adding more** — the data shows the Oct 27 units doubled revenue at a steady eCPM. Fixing the Pro-user leak (below) protects viewability, which is currently 78% and drives eCPM.
- [ ] **Gate the GPT sticky-anchor `display()` on user tier** — move the `display()` call into `StickyAnchorAd` after the session resolves, or render the div only once `status !== 'loading'` and non-Pro. Impact: fixes ads shown to Pro users and lifts viewability.
- [ ] **Only `display()` the in-article slot when its div exists** — guard with `document.getElementById(...)` in the layout script, or move it into `InArticleAdSlot` variant 1. Impact: removes GPT errors and the wasted request on non-blog pages.
- [ ] **Resolve duplicate 4218 on `/download`** (carried from W43) — still open.

*Added to `.claude/context/backlog.md` → Ad Optimization: the 3 new code items plus the past-due Stripe item. Marked stale/done: "Refresh ads.txt" (done 2026-10-18) and "Replace gateway with GPT interstitial" (interstitial removed 2026-10-27). Added a note that the home page now has the sticky anchor.*

---

## Alerts

- 🔴 **2 of 3 Stripe subscriptions are past due.** MRR at risk.
- 🟢 **Setupad reachable again** at `client.setupad.com`. Last-30-day revenue is up 63%, and the new GPT units roughly doubled daily ad revenue.
- 🟠 **Traffic dip Nov 3–5**: pageviews and visits are down ~15–25% against October daily averages. Watch next week.
- ✅ Setupad ticket AD-492 ("New ad units") is marked Done. No open support items.
- 🟠 **Pro users likely receive a sticky-anchor ad request** (layout GPT init runs before the session check).
- ✅ ads.txt refreshed 2026-10-18 (Setupad-managed).
- ✅ GPT interstitial removed (2026-10-27). No policy-risky out-of-page units remain except the custom 5s download gateway (see backlog).
- ✅ CMP (Setupad prop 6396) present.

---
*Data sources: Setupad client dashboard (live, Chrome, 2026-11-06, daily data Oct 7–Nov 5); Stripe dashboard (live, Chrome, 2026-11-06); codebase at `2fa9edb`.*
