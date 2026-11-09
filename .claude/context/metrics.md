# Passdropit — Live Metrics

*Updated weekly by Analytics Agent. Last agent run: 2026-11-08 (W45 full scheduled run). Full weekly KPI: see reports/kpi-2026-W45.md.*

## Latest Weekly Snapshot
*Updated by Analytics Agent — 2026-W45 (Nov 2–8; GA4 includes partial Sun Nov 8). Compared vs W44 (Oct 26–Nov 1). See reports/kpi-2026-W45.md.*

| Metric | Value | Week |
|--------|-------|------|
| Total Users (7d) | 1,380 (W44: 2,004, −31% — mostly W44 Boardman bot spike ending) | 2026-W45 |
| New Users (7d) | 1,302 (W44: 1,939) | 2026-W45 |
| Sessions (7d) | 1,618 (W44: 2,217, −27%) | 2026-W45 |
| Page Views (7d) | 3,041 (W44: 3,647); Setupad full-day PV/day only −6% | 2026-W45 |
| Form starts (7d) | 951 / 539 users (W44: 929) ↑ | 2026-W45 |
| Download events (7d) | 28 ⚠️ (GA4 only; tracking gap, DB still blocked) | 2026-W45 |
| Organic Search sessions (7d) | 7 (0.43%) 🔴 — 4th week collapsed | 2026-W45 |
| Top channel | Organic Video 902 sessions (55.8%); Direct 590 (36.5%, −49% as bots stopped) | 2026-W45 |
| Organic Video source | youtube.com/referral | 2026-W45 |
| Top country | Indonesia 345 → US 265 (was 808 bot-inflated) → Philippines 178 | 2026-W45 |
| Stripe MRR | €16.91 (~$19) contracted; only $9/mo actually collecting (2 HUSTLE subs past due) | 2026-W45 |
| Active subscriptions | 1 active + 2 past due; 0 new / 0 cancelled | 2026-W45 |
| Ad revenue (7d) | €0.45 Nov 2–7 (W44 €0.85 incl. €0.30 outlier day); eCPM sliding €0.34 → €0.14 | 2026-W45 |
| Registered users / DB downloads | unavailable — no Passdropit Supabase credentials on this machine | 2026-W45 |

## Data Source Access
- **Setupad dashboard:** https://client.setupad.com/home (logged in via Chrome). Reporting → Daily → Last 30 days. Per-day rows can be read from `AmCharts.charts[0].dataProvider`. Currency: EUR. (`dashboard.setupad.io` is dead and returns 404.)
- **Stripe:** https://dashboard.stripe.com/acct_1M5Q13E4EcK5n9Ja/billing (logged in via Chrome, as of 2026-11-06)

## Baseline Metrics (Aug–Oct 2026)
- MAU: ~10,100
- DAU: ~330
- Registered users: 37,936
- Protected links created: 111,410
- Total download events (DB): 1,953,124
- Current MRR: ~$19 (Stripe $19 + Setupad ~$0.25/wk confirmed Oct 2026; peak was $200/mo in 2023)

## Traffic Channels (last 28 days, from Apr 2026 GA4)
| Channel | New Users | % |
|---------|-----------|---|
| Organic Video (YouTube) | 4,240 | 42% |
| Organic Search | est. 3,000 | ~30% |
| Direct | est. 1,500 | ~15% |
| Other | est. 1,360 | ~13% |

## Top Countries (Apr 2026 GA4)
| Country | Users |
|---------|-------|
| Indonesia | 2,881 |
| United States | 1,174 |
| India | 918 |
| Philippines | 667 |
| Brazil | 220 |

## Revenue History
| Period | Source | Revenue |
|--------|--------|---------|
| 2021 (full year) | AdSense | $8,625 |
| Jan–Oct 2022 | AdSense | $6,504 |
| Nov 2022–Mar 2023 | AdSense | ~$1,500 (est) |
| Apr 2023–Aug 2026 | Setupad | $2,610 |
| Nov 2022–Aug 2026 | Stripe | $1,107 |
| **Total verified** | | **$18,846** |

## Download Volume History
| Period | Downloads |
|--------|-----------|
| 2023 (Mar–Dec) | 1,586,703 |
| 2024 | 559,171 |
| 2025 | 291,170 |
| 2026 (Jan–Apr) | 48,613 |
| Current rate | ~10–12K/month |

## GA4 Property
G-6ZR1JRBKNW
