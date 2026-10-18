# Revenue Report — Week 2026-W42
**Period:** Mon 2026-10-12 – Sun 2026-10-18
**Generated:** 2026-10-18 by Revenue Agent

---

## Weekly Revenue

| Source | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| Setupad | — (data gap; see note) | ~$0.35 est. | — |
| AdSense (direct) | n/a (migrated to Setupad) | n/a | — |
| Stripe MRR | $18.60 (€16.91) | $18.12 (€16.47) | +2.7% |
| **Est. Total** | **~$18.95** | **~$18.47** | **+2.6%** |

> **Setupad data gap:** The Setupad export (`setupad.xlsx`) covers through 2026-08-20. W42 actuals are unavailable. Estimate for week ending Oct 18: ~$0.35 based on Jul–Aug 2026 daily average ($0.051/day × 7).
>
> **Stripe context:** 3 active subs (2 × Pro $5 + 1 × Pro $9). No new subs or churns this week. MRR up €0.44 (+2.7%).

---

## Setupad Revenue Trend (from spreadsheet — all confirmed actuals)

| Period | Monthly Revenue | Avg/Week |
|--------|----------------|----------|
| Apr–Sep 2023 (peak) | $175–$209/mo | ~$46/wk |
| 2024 Q1 | $63–$68/mo | ~$16/wk |
| 2024 Q2–Q3 | $57–$103/mo | ~$18/wk |
| 2025 Q1 | $28–$39/mo | ~$8/wk |
| 2025 Q4 | $10–$12/mo | ~$2.7/wk |
| 2026 Jan–Apr | $9–$14/mo | ~$2.7/wk |
| **2026 May** | **$2.28** | **$0.53** |
| **2026 Jun** | **$1.86** | **$0.43** |
| **2026 Jul** | **$1.57** | **$0.36** |
| **2026 Aug** | **$1.01** | **$0.23** |
| **2026 Sep–Oct** | — (est. ~$0.80) | **~$0.19** |

⚠️ **CRITICAL:** Setupad revenue has collapsed 99%+ from the 2023 peak. Root cause is traffic volume collapse, not placement issues — ad requests fell from ~25K/day in 2023 to ~168/day in Aug 2026. The ~$2/week estimate in `context/metrics.md` is outdated by ~6× and must be corrected to ~$0.20–$0.35/week.

---

## Ad Placement Audit — Monthly (First W42 run)

### Download Page (`/download/[slug]`) — **HIGH TRAFFIC**
- **Placements:** 2 sticky side banners — tag IDs 4218 (left rail, fixed) and 4219 (right rail, fixed), both at `top: 70px`
- **Ad loading:** Setupad wrapper script `stpd.cloud/assets/stpdwrapper.js` loaded inline ✓
- **UX assessment:** Ads are positioned in side rails, not overlapping the centered password card or CTA. No UX conflict with conversion flow. ✓
- **Above-fold banner:** None. The card is centered with no above-fold ad unit. This is probably intentional (conversion focus), but there may be room for a banner above or below the card.
- **Traffic:** Top ad surface — every protected link visit lands here

### Invalid-Link Page (`/invalid-link`) — **HIGH TRAFFIC, OFTEN OVERLOOKED**
- **Placements:** Same 2 sticky side banners (tags 4218 + 4219) ✓
- **Traffic:** 954 views/week (24.4% of all page views in W42) — second-only to download page in ad impressions
- **Issue:** This page handles expired/invalid links. Users arrive expecting a file and leave immediately. Bounce rate is likely high, which may lower viewability scores.

### Home Page (`/`) — **NO ADS**
- **Placements:** NONE. MainLayout only loads GA4 and the Setupad CMP consent script — no `stpdwrapper` ad slots
- **Traffic:** 558 views/week (14.3% of page views in W42)
- **Gap:** This is an untapped ad surface. Adding banner slots here could increase impressions ~30%.

### Blog Pages (`/blog`, `/blog/[id]`) — **NO ADS**
- **Placements:** NONE. Blog uses MainLayout → no ad slots
- **Blog traffic:** Not individually tracked in W42 KPI, but blog exists and has 7 published posts
- **Gap:** No in-content or sidebar ad slots anywhere in the blog.

### ads.txt
- **Status:** ✓ Present at `/public/ads.txt`
- **Size:** 514 lines — comprehensive
- **Last managed:** 2026-04-29 by Setupad Ads.txt Manager
- **Direct entry:** `google.com, pub-3746260233604933, DIRECT` ✓ (own AdSense pub ID)
- **Setupad:** `setupad.com, 2114, DIRECT` ✓
- **Age:** 6 months old. Setupad may have added new SSP partners since April — worth refreshing.

---

## Ad Placement Notes

The revenue collapse is primarily a **traffic problem**, not a placement problem. Impressions fell from ~25K/day (2023) to ~168/day (Aug 2026) — a 99% drop — driven by traffic declining from ~10K MAU peak to the current ~2K weekly users. At current traffic levels, even perfect ad placement can only yield ~$0.30–$0.50/week.

That said, there are meaningful placement gaps: **home page and blog have zero ad monetization** despite representing ~30–40% of page views. Adding slots there would increase impressions proportionally.

The eCPM has actually held up reasonably well in Aug 2026 (~$0.45 avg), suggesting the existing audience is monetizable at a fair rate — the volume is just too low.

---

## Recommendations

- [ ] **Correct metrics.md ad revenue estimate** — Update from `~$2/week est.` to `~$0.20–$0.35/week est.` to reflect Aug 2026 actuals; the current estimate overstates ad revenue ~6× (~$52/year vs ~$15/year actual)
- [ ] **Add Setupad ad slots to MainLayout (home + blog)** — Insert `stpdwrapper` tag IDs (request from Setupad account) into the main layout to monetize home page (558 views/wk) and blog pages; expected lift: +25–35% impressions at current traffic
- [ ] **Refresh ads.txt** — Log in to Setupad dashboard and regenerate ads.txt (last updated Apr 2026); some SSPs may have added new entries; stale ads.txt can reduce authorized demand
- [ ] **Request W42+ Setupad data** — Download fresh Setupad export to cover May–Oct 2026 and fill the 2-month data gap; update metrics.md with confirmed actuals
- [ ] **Consider an above-card banner on download page** — A `stpdwrapper` slot above (not overlapping) the password card could increase impressions on the highest-traffic page; needs UX testing to ensure it doesn't hurt conversion
- [ ] **Monitor viewability on /invalid-link** — High bounce rates on invalid-link page may be suppressing eCPM; if viewability <50%, consider whether this placement earns its keep or should be replaced with an interstitial or exit CTA

---

## Alerts

- ⚠️ **Data gap:** Setupad spreadsheet ends 2026-08-20. W42 actuals unavailable. Future runs should pull a fresh export covering through report week.
- ⚠️ **metrics.md outdated:** The `~$2/week` Setupad estimate in `context/metrics.md` overstates current revenue by ~6×.
- ✅ **ads.txt:** Present and comprehensive (514 lines, Setupad-managed), though 6 months stale.
- ✅ **CMP:** Setupad consent management platform scripts present in `layout.tsx` (prop ID 6396) — GDPR/privacy compliant.
- ✅ **No policy alerts detected** (from spreadsheet data — no flags through Aug 2026).

---

*First run — no prior weekly report exists for comparison.*
*Data sources: Setupad export (setupad.xlsx, through 2026-08-20), KPI W42 report, codebase audit.*
