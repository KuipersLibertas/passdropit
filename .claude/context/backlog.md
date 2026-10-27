# Passdropit — Shared Agent Backlog

*Agents add to this file. User prioritizes. Developer Agent picks from "Developer Tasks".*

---

## Developer Tasks

### High Priority
- [ ] **Noindex user link-gate pages** — `src/app/[slug]/page.tsx` inherits `index: true` from root layout, so user links (`www.passdropit.com/goldene`, `/58gAG0YI`, …) are crawled and cause all 32 GSC "Duplicate without user-selected canonical" pages; 6 `/download/go/*` URLs are "Indexed, though blocked by robots.txt". Fix: export `metadata = { robots: { index: false, follow: false } }` from `[slug]/page.tsx`, `download/` routes and `invalid-link`; temporarily remove `/download/` from `src/app/robots.ts` disallow so Google can see the noindex (re-add once GSC shows them dropped). *(SEO W44)*
- [ ] **Fix broken CTA links in new blog posts** — `src/lib/blog/posts.ts`, posts `how-to-set-an-expiry-date-on-a-dropbox-link` and `how-to-prevent-your-dropbox-link-from-being-shared`: 4× `https://www.passdropit.com/register` (no such route → hits `/[slug]` → redirects to `/invalid-link`); change to `/signup`. Also replace absolute `https://www.passdropit.com` (4×) and `.../user/prosignup` with relative links to avoid www→apex redirect hops. *(SEO W44)*
- [x] Fix social share URL bug in `src/views/Blog/Detail/index.tsx` — verified fixed W44
- [x] Add descriptive `alt` text to blog post `feature_image_alt` fields — verified done W44 (all 9 posts)
- [x] Remove dead Universal Analytics (UA) snippet from `src/layouts/Main/index.tsx` — verified removed W44
- [x] Delete `public/robots.txt` — verified absent W44
- [x] Delete stale `public/sitemap.xml` — verified absent W44

### Medium Priority
- [ ] Add descriptive `alt` text to the 11 inline `<img alt="">` tags inside blog post HTML in `src/lib/blog/posts.ts` *(SEO W44)*
- [ ] Refresh `how-to-share-a-folder-on-dropbox-a-step-by-step-guide` (543 impr / 0 clicks in 28d — biggest impression asset): 2026 screenshots, "with multiple users" H2, FAQ, protect-link CTA; and rewrite title/meta of `how-to-share-and-protect-a-dropbox-link` to target `dropbox password protected link` (65 impr / 0 clicks) *(SEO W44)*
- [ ] Render `post.feature_image` on blog detail page (`src/views/Blog/Detail/index.tsx`) — still missing *(SEO W42, re-confirmed W44)*
- [ ] Add referral tracking: capture UTM parameters at signup and store in `users` table for attribution
- [ ] Improve onboarding: new user after signup lands on create-link page with no guidance — add a simple 3-step tooltip/overlay
- [ ] Add niche-specific landing pages (e.g., `/for/music-producers`, `/for/educators`) for SEO + conversion
- [ ] Remove Facebook OAuth dependency (`@greatsumini/react-facebook-login`) if rarely used — reduces bundle size
- [ ] Wire Stripe revenue events to GA4 (currently $0 shown in GA4 despite active Stripe revenue)

### Low Priority
- [ ] PWA manifest check — `next-pwa` is installed; verify manifest.json is correct
- [ ] Image optimization audit — verify all `<img>` tags use `next/image` for automatic optimization

---

## Content Ideas

*(Added by SEO Agent and Marketing Agent)*

### Queue (to assign to Content Agent)
- [ ] "How to track who downloads your Lightroom presets" — keyword: `track dropbox downloads`
- [ ] "How music producers can protect their sample packs" — new niche targeting
- [ ] "Google Drive vs Dropbox for sharing files with clients" — keyword: `google drive vs dropbox file sharing`
- [ ] "How to set a download limit on a Dropbox link" — keyword: `dropbox download limit`
- [ ] "How to password protect a Google Drive folder" — keyword: `password protect google drive folder`
- [ ] "Does Google Drive have password protection? (No — here's the workaround)" — keyword: `google drive password protection`; short definitional answer up top for featured snippet (added W44)

### Published
- how-to-set-an-expiry-date-on-a-dropbox-link (2026-10-18)
- how-to-prevent-your-dropbox-link-from-being-shared (2026-10-20)
- how-to-share-and-protect-a-dropbox-link
- how-to-create-a-google-drive-link
- dropbox-vs-google-drive-a-comprehensive-comparison-of-features-pros-and-cons
- how-to-share-a-folder-on-dropbox-a-step-by-step-guide
- how-to-reset-your-dropbox-password
- the-benefits-of-dropbox-for-photographers
- get-notified-when-your-link-is-accessed

---

## Marketing Experiments

*(Added by Marketing Agent)*

### Queue
- [ ] Music producer niche exploration — identify YouTube creators sharing sample packs via Dropbox
- [ ] **Paid links feature — payment processor research** — Stripe doesn't support micro-payments (<$1); evaluate Lemon Squeezy, Paddle, PayPal as alternatives. Code nearly ready. Once resolved, unlocks new creator niches: sample pack sellers, Procreate brush creators, paid Notion templates (all Tier 1). Tabled Oct 2026 — revisit Nov 2026. *(Marketing Agent)*

---

## Ad Optimization

*(Added by Revenue Agent — W42, 2026-10-18)*

### Queue
- [x] **Add AdSlot component + Pro suppression** — `src/components/AdSlot/index.tsx` created. All pages now use it; Pro/Admin users see no ads. *(done W42)*
- [x] **Add blog ad slots** — Blog overview and blog detail now have side-rail AdSlots. Blog detail also has in-article slots above/below post body. *(done W42)*
- [x] **Download gateway** — 5-second countdown interstitial at `src/views/Download/blocks/DownloadGateway.tsx`. Shows once per session after password validation; skipped for Pro users. *(done W42)*
- [x] ~~**Request Setupad in-article tag IDs**~~ — superseded W43: blog detail now uses dedicated GPT in-article units (`passdropit.com_1140x280_in_article_*`) via `InArticleAdSlot`. Still missing: the prebid wrapper (see below).
- [x] **Fix `InArticleAdSlot` mount bug** — `src/components/InArticleAdSlot/index.tsx`: fixed `[]` deps → now uses `[status, session, variant]`; div renders during session load so `getElementById` works; `initialized.current` prevents double-init. *(done W44)*
- [x] **Add Setupad prebid wrapper script + GPT slot init** — `src/app/layout.tsx`: added GPT init block (defines all slots + interstitial + enableServices/disableInitialLoad) and prebid wrapper `https://stpd.cloud/saas/4179`. Also added `StickyAnchorAd` component. *(done W44)*
- [ ] **Resolve duplicate tag 4218 on download page + gateway policy check** — `DownloadGateway.tsx` reuses 4218 while the left rail 4218 is mounted. The countdown overlay also looks like a Better Ads "countdown prestitial" (AdX/Google demand risk), and the 5s unmount hurts viewability. Confirm with Setupad before deploying; the alternative is a static in-page unit below the unlocked card. *(Revenue Agent W43)*
- [ ] **Consider replacing custom download gateway with Setupad's GPT interstitial** — `layout.tsx` now initializes `passdropit.com_interstitial` via `defineOutOfPageSlot` (Google-managed, frequency-capped, Better Ads compliant). This could replace the custom 5s countdown in `DownloadGateway.tsx`. The Google interstitial fires automatically at page load via `googletag.display(interstitialSlot)` — currently active on all pages (Google decides when to show it). Evaluate revenue vs UX trade-off. *(Revenue Agent W44)*
- [ ] **Add a home-page ad slot** — `/` gets ~14% of page views with no ads. *(Revenue Agent W42, re-confirmed W43)*
- [ ] **Fix revenue data access** — `dashboard.setupad.io` 404s and `stpd.cloud` is only a landing page; record the working Setupad dashboard URL in `metrics.md`. The Stripe Chrome session has expired too. *(Revenue Agent W43)*
- [ ] **Request Setupad interstitial/leaderboard tag ID for download gateway** — `src/views/Download/blocks/DownloadGateway.tsx` currently uses tag 4218 as a placeholder. A properly configured interstitial or large-format tag from Setupad would yield much higher eCPM ($2–5 vs current $0.37). Request and swap in.
- [ ] **Refresh ads.txt** — Last generated 2026-04-29 via Setupad Ads.txt Manager. Regenerate via Setupad dashboard to include any new SSP partners. *(Revenue Agent)*
- [ ] **Download fresh Setupad export** — Drop current export in repo root for W43+ Revenue Agent runs. *(Revenue Agent)*

---

## Email Campaigns

*(Added by Email Agent or user)*

### Queue
- [ ] Re-engagement campaign — dormant free users (signed up >6 months ago, never upgraded)

### Sent
*(none yet)*
