# Passdropit — Shared Agent Backlog

*Agents add to this file. User prioritizes. Developer Agent picks from "Developer Tasks".*

---

## Developer Tasks

### High Priority
- [ ] **Fix the apex/www host mismatch** — `https://passdropit.com/*` returns a **307** to `https://www.passdropit.com/*`, but every canonical, all 19 sitemap `<loc>`s and the robots.txt `Sitemap:` line point to apex (`SITE_URL` falls back to apex in `src/app/sitemap.ts`, `src/app/robots.ts` and `src/app/blog/[id]/page.tsx`). Google is getting contradictory signals: "Page with redirect" has risen to 55 (49 → 51 → 55), and new posts are being indexed under www despite their apex canonicals. Fix: pick one primary host in Vercel (recommended: apex primary, with www → apex as a permanent **308**), or set `NEXT_PUBLIC_PASSDROPIT_SITE_URL=https://www.passdropit.com`. Then resubmit the sitemap in GSC under the canonical host. *(SEO W45, re-added W46: this item had been lost from the backlog)* — **Still open 2026-11-10: owner action in the Vercel dashboard** (Settings → Domains); no code change is needed for the apex option.
- [x] **Return a real 404 for unknown and retired blog slugs** — `src/app/blog/[id]/page.tsx` renders an empty "Blog — Passdropit" page with **200**, `index, follow` and a self canonical when `getPost()` returns null. Add `notFound()` plus `export const dynamicParams = false`. **W46:** GSC shows 11 retired legacy Ghost URLs that still get about 110 impressions at positions 3–11 while serving this empty page. Add `redirects()` in `next.config.js` (permanent): `/blog/manage-your-notion-links`, `/blog/sharing-content-with-your-audience-a-guide-to-using-notion`, `/blog/how-to-secure-your-notion-content-tips-and-tricks` and `/blog/unlock-the-power-of-notion-content-sharing` → `/blog/how-to-share-a-notion-link`, once the Notion post below is published. Until then, point them at `/`. Let `why-should-you-enhance-your-screenshots`, `how-to-create-perfect-social-media-screenshots-tips-and-tricks`, `watermarking`, `device-template-mockups-for-screenshots-a-comprehensive-guide`, `how-to-use-screenshots-for-social-media-branding` and `how-to-create-presets` return 404 (off-topic). *(SEO W45, widened W46)* — **Done 2026-11-10 (branch `fix/seo-w46-soft404-host`):** `notFound()` + `dynamicParams = false`, new `src/app/not-found.tsx` (noindex); the 5 Notion slugs 307 → `/` via `next.config.js` (switch to permanent → Notion post once it exists); off-topic slugs now 404.
- [x] **Noindex user link-gate pages** — `src/app/[slug]/page.tsx` inherits `index: true` from the root layout, so user links (`www.passdropit.com/goldene`, `/58gAG0YI`, …) get crawled. GSC "Duplicate without user-selected canonical" is now 36 (was 32). `/download/go/*` URLs are "Indexed, though blocked by robots.txt": 8 of them, and `/download/go/WBnQPLJe` alone has 254 impressions in 28 days. Fix: export `metadata = { robots: { index: false, follow: false } }` from `[slug]/page.tsx`, the `download/` routes and `invalid-link`. Then temporarily remove `/download/` from the `src/app/robots.ts` disallow list so Google can see the noindex, and re-add it once GSC shows the pages dropped. **W46: ship now, no need to wait for the blog retitle.** The `dropbox password protected link` ranking that came from user pages (pos 7.1 in W45) has already disappeared from GSC. *(SEO W44, updated W46)* — **Done 2026-11-09, merged in #5 and live (verified 2026-11-10):** noindex on `[slug]`, `download/[slug]`, `download/go/[slug]`, `invalid-link`; `/download/` removed from robots disallow (comment in `robots.ts` says to re-add later).
- [x] **Fix broken `/register` CTA links in 5 blog posts** — `src/lib/blog/posts.ts` lines **81** (Lightroom), **117** (prevent-sharing), **153** (expiry), **369** (create-google-drive-link) and **405** (share-and-protect-dropbox-link) link to `https://www.passdropit.com/register`. That route doesn't exist: it falls through to `/[slug]` and returns a 307 to `/invalid-link`. Change these links to relative `/signup`. Also replace the absolute `https://www.passdropit.com` links (lines 81, 117, 153) and `.../user/prosignup` (line 333) with relative links. The two newest posts (Alight Motion and subscriber-special) are already correct. *(SEO W44, updated W46)* — **Done 2026-11-09, merged in #5 and live (verified 2026-11-10):** all `/register` → `/signup`, `/user/prosignup` → `/prosignup`, all `https://www.passdropit.com` hrefs → `/`.
- [ ] **Re-add `/download/` to `src/app/robots.ts` disallow** once GSC shows the `/download/go/*` pages dropped from the index (check ~2–4 weeks after the noindex deploy). *(SEO W46)*
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
- [x] **Use `meta_title` / `meta_description` in blog `generateMetadata`** — `src/app/blog/[id]/page.tsx` uses `title` / `custom_excerpt` instead, so tuned meta titles such as "…(Without Upgrading Dropbox)" never reach the `<title>` tag. *(SEO W45, re-added W46)* — **Done 2026-11-10 (branch `fix/seo-w46-soft404-host`).**
- [x] **Fix the UTM tag on the subscriber-special post** — the `/signup` CTA in `subscriber-special-preset-pack-password-in-video` (`src/lib/blog/posts.ts` ~line 45) uses `utm_campaign=alight-motion`, a copy-paste from the Alight Motion post. Change it to `utm_campaign=subscriber-special`. *(SEO W46)* — **Done 2026-11-10 (branch `fix/seo-w46-soft404-host`).**

---

## Content Ideas

*(Added by SEO Agent and Marketing Agent)*

### Queue (to assign to Content Agent)
- [ ] "How music producers can protect their sample packs" — new niche targeting
- [ ] "Google Drive vs Dropbox for sharing files with clients" — keyword: `google drive vs dropbox file sharing`
- [ ] "How to set a download limit on a Dropbox link" — keyword: `dropbox download limit`
- [ ] "How to password protect a Google Drive folder" — keyword: `password protect google drive folder`
- [ ] "Does Google Drive have password protection? (No — here's the workaround)" — keyword: `google drive password protection`; short definitional answer up top for featured snippet (added W44)

- [ ] "How to stop your sample pack from being leaked on free-VST sites" — music production niche (added 2026-11)
- [ ] "How to limit downloads on a Dropbox sample pack link" — music production niche (added 2026-11)
- [ ] "Share a Procreate brush pack from Google Drive without it leaking" — Procreate niche (added 2026-11)
- [ ] ⭐ **"How to password protect a Notion page link"**, to be published at slug **`how-to-share-a-notion-link`**. Keyword: `password protect notion page` / `protect notion link`. Five retired Notion URLs still rank around position 10 (about 83 impressions in 28 days) while serving empty pages, so re-using this slug, with 301s from the others, recovers that equity immediately. The SERP is vendor blogs (Papermark, Peony, bullet.so, Super), so lead with the free option. *(SEO W46)*
- [ ] "How to share CapCut templates / VN presets with a password" — creator niche. The Alight Motion post reached position 17.7 within a week of publishing. *(SEO W46)*
- [ ] Indonesian-language version of the core "password protect a Dropbox link" how-to. Keyword: `cara memberi password link dropbox`. Competitor lock.pub localises this topic, and Indonesia is the #1 country. *(SEO W45, re-added W46)*

### Published
- how-to-track-who-downloads-your-lightroom-presets (2026-11-01) — keyword: `track dropbox downloads`; feature image added
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
- [x] ~~**Consider replacing custom download gateway with Setupad's GPT interstitial**~~ — stale: GPT interstitial removed in `7e92733` (2026-10-27) because it popped up for Pro users. *(Revenue Agent W45)*
  - Original note: — `layout.tsx` now initializes `passdropit.com_interstitial` via `defineOutOfPageSlot` (Google-managed, frequency-capped, Better Ads compliant). This could replace the custom 5s countdown in `DownloadGateway.tsx`. The Google interstitial fires automatically at page load via `googletag.display(interstitialSlot)` — currently active on all pages (Google decides when to show it). Evaluate revenue vs UX trade-off. *(Revenue Agent W44)*
- [ ] **Add a home-page ad slot** — `/` gets ~14% of page views with no ads. *(Revenue Agent W42, re-confirmed W43)* — W45: partly resolved, because the root-layout `StickyAnchorAd` now serves on `/`. An in-page unit is still optional.
- [x] **Fix revenue data access** — RESOLVED W45: working URL is `https://client.setupad.com/home`, recorded in `metrics.md`. (Earlier W45 note: still 404; `my.setupad.com` and `dashboard.stpd.cloud` also fail; 3rd consecutive run without Setupad data) `dashboard.setupad.io` 404s and `stpd.cloud` is only a landing page; record the working Setupad dashboard URL in `metrics.md`. *(Revenue Agent W43)* Stripe Chrome session is working again (W45).
- [ ] **Request Setupad interstitial/leaderboard tag ID for download gateway** — `src/views/Download/blocks/DownloadGateway.tsx` currently uses tag 4218 as a placeholder. A properly configured interstitial or large-format tag from Setupad would yield much higher eCPM ($2–5 vs current $0.37). Request and swap in.
- [x] **Refresh ads.txt** — done: regenerated by Setupad Ads.txt Manager 2026-10-18 (435 lines). *(verified W45)* Previously: last generated 2026-04-29 via Setupad Ads.txt Manager. Regenerate via Setupad dashboard to include any new SSP partners. *(Revenue Agent)*
- [ ] **Gate GPT sticky-anchor `display()` on user tier** — `src/app/layout.tsx:117` calls `googletag.display('passdropit_com_1000x100_sticky_anchorad_responsive')` in an inline script before the session resolves. `StickyAnchorAd` renders its div while `status === 'loading'`, so Pro users trigger an ad request (and may briefly see it) before the div is hidden. Move `display()` into `StickyAnchorAd` after the session resolves, for non-Pro only. *(Revenue Agent W45)*
- [ ] **Only `display()` the in-article slot where its div exists** — `src/app/layout.tsx:118` displays `passdropit_com_1140x280_in_article_responsive_1` on every page, but the div only exists on `/blog/[id]`, which causes GPT "div not found" errors and a wasted request. Guard it with `getElementById`, or move the call into `InArticleAdSlot` variant 1. *(Revenue Agent W45)*
- [ ] **Chase 2 past-due Stripe subscriptions (owner action, not code)** — as of 2026-11-06, 2 of 3 subs (one customer) are `past_due`. Check that Smart Retries and failed-payment emails are on. If they churn, MRR drops from €16.91 to ~€4.5–8. *(Revenue Agent W45)*
- [ ] **Verify side rails don't overlap content below 1200px** — fixed 4218/4219 rails at `left/right: 0`. Confirm `AdSlot` hides them on narrow viewports. *(Revenue Agent W45)*
- [x] ~~**Download fresh Setupad export**~~ — no longer needed; the agent reads the live dashboard at `client.setupad.com`. *(W45)*

---

## Email Campaigns

*(Added by Email Agent or user)*

### Queue
- [ ] Re-engagement campaign — dormant free users (signed up >6 months ago, never upgraded)

### Sent
*(none yet)*
