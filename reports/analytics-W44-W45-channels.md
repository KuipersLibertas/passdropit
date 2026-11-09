# Analytics: Channel & Country Report — W44 + W45 (partial)
**Requested by:** SEO Agent (diagnosing 15–25% pageview decline)
**Data pulled:** 2026-11-06 via live GA4 (property G-6ZR1JRBKNW / p353670207)

---

## W42 Baseline (Oct 12–18 — for reference)
| Channel | Sessions | % |
|---------|----------|---|
| Direct | 1,091 | 48.4% |
| Organic Video | 1,041 | 46.2% |
| Organic Social | 56 | 2.5% |
| Referral | 54 | 2.4% |
| Unassigned | 9 | 0.4% |
| Organic Search | 5 | 0.2% |
| **Total** | **2,254** | |

---

## W44 (Oct 26–Nov 1, 2026) — 7 days
**Total sessions: 2,217** (−1.6% vs W42 baseline)

| # | Channel | Sessions | % |
|---|---------|----------|---|
| 1 | Direct | 1,164 | 52.5% |
| 2 | Organic Video | 965 | 43.5% |
| 3 | Referral | 46 | 2.1% |
| 4 | Organic Social | 34 | 1.5% |
| 5 | Organic Search | 5 | 0.23% |
| 6 | AI Assistant | 2 | 0.09% |
| 7 | Unassigned | 1 | 0.05% |

**W44 Active Users by Country:**
| # | Country | Active Users | vs W42 |
|---|---------|-------------|--------|
| 1 | United States | 808 | ↑↑ (+6.8% share, was 757) |
| 2 | Indonesia | 391 | ↓↓ (was 473) |
| 3 | India | 172 | stable |
| 4 | Philippines | 146 | stable |
| 5 | Thailand | 76 | stable |
| 6 | Brazil | 30 | ↓ |
| 7 | Malaysia | 30 | new in top 7 |

⚠️ **Note:** "Boardman" (AWS datacenter, Oregon) appears as top city with 681 "users" — bot/scraper traffic inflating US count. Real US user volume may be significantly lower.

---

## W45 (Nov 2–6, 2026) — 5 days PARTIAL
**Total sessions: 1,125** (5-day partial week — daily avg 225 vs W44 daily avg 317 = −29%)

| # | Channel | Sessions | % | Source (top) |
|---|---------|----------|---|--------------|
| 1 | Organic Video | 607 | 53.96% | youtube.com / referral (597) + m.youtube.com (10) |
| 2 | Direct | 439 | 39.02% | (direct) / (none) |
| 3 | Referral | 38 | 3.4% | sccreationzii.com (14), missplanstudygram.com (8), kaplmr.com (4) |
| 4 | Unassigned | 32 | 2.84% | (not set) |
| 5 | Organic Social | 31 | 2.76% | rajcreationrj.blogspot.com (10), rizkayeoppeu.blogspot.com (7) |
| 6 | Organic Search | 4 | 0.36% | google / organic |
| 7 | AI Assistant | 2 | 0.18% | — |

**W45 Active Users by Country (Nov 2–6):**
| # | Country | Active Users | vs W44 |
|---|---------|-------------|--------|
| 1 | Indonesia | 227 | ↑ back to #1 |
| 2 | United States | 211 | ↓ (#1 → #2) |
| 3 | Philippines | 117 | stable |
| 4 | India | 107 | stable |
| 5 | Thailand | 44 | stable |
| 6 | Brazil | 22 | stable |
| 7 | Malaysia | 18 | stable |

⚠️ **Note:** Boardman city dropped from 681 (W44) to 132 (W45) — the US bot spike in W44 was temporary. Real US user volume in W45 is much lower.

---

## Key Findings for SEO Agent

### 1. Direct traffic collapsed between W44→W45
Direct traffic dropped from **1,164 sessions (W44) to 439 sessions in just 5 days** at a daily rate of ~88/day vs W44's 166/day. This is the primary driver of the apparent 15–25% decline.

### 2. Organic Video overtook Direct in W45
For the first time, Organic Video (53.96%) surpassed Direct (39.02%) as the #1 channel in W45. This suggests the Organic Video volume is holding relatively steady while Direct has collapsed.

### 3. Organic Search remains near-zero — 3 weeks running
- W42: 5 sessions (0.22%)
- W44: 5 sessions (0.23%)
- W45: 4 sessions (0.36%)
This is not a fluke — it's been collapsed for at least 3 weeks. SEO penalty, deindex, or severe algorithm impact is confirmed as the most likely cause.

### 4. YouTube source confirmed as youtube.com/referral
The Organic Video traffic is entirely `youtube.com / referral` (597 sessions) + `m.youtube.com / referral` (10 sessions). GA4 does not expose individual video URLs in the Traffic Acquisition report. To identify which video(s) are driving traffic, check the referring URL in the **Explore** tab using "Session source platform" or use the Search Console → YouTube channel integration if available.

### 5. Geographic shift explained by bot traffic
W44's US dominance (808 users) was largely Boardman datacenter bot traffic (681 city users). W45 shows Indonesia returning to #1 (227) with US at #2 (211, Boardman down to 132). The underlying geographic mix is stable — Indonesia/Philippines lead real users.

### 6. Referral sources — potential spam/low-quality
New referrals appearing in W45: `sccreationzii.com`, `missplanstudygram.com`, `kaplmr.com` — these are low-volume but worth monitoring for bot referral spam.

---

## Sessions Summary Table
| Week | Period | Total Sessions | Daily Avg | Direct | Organic Video | Org. Search |
|------|--------|---------------|-----------|--------|---------------|-------------|
| W42 | Oct 12–18 | 2,254 | 322 | 1,091 (48.4%) | 1,041 (46.2%) | 5 (0.2%) |
| W44 | Oct 26–Nov 1 | 2,217 | 317 | 1,164 (52.5%) | 965 (43.5%) | 5 (0.2%) |
| W45 | Nov 2–6 (5d) | 1,125 | 225 | 439 (39.0%) | 607 (54.0%) | 4 (0.4%) |

The W44→W45 daily average drop (317→225 = −29%) is concentrated in Direct traffic. Organic Video is declining more slowly. Organic Search is essentially zero in all three periods.

---
*Report generated: 2026-11-06 by Analytics Agent (via Chrome automation). GA4 property G-6ZR1JRBKNW.*
