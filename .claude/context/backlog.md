# Passdropit — Shared Agent Backlog

*Agents add to this file. User prioritizes. Developer Agent picks from "Developer Tasks".*

---

## Developer Tasks

### High Priority
- [ ] Fix social share URL bug in `src/views/Blog/Detail/index.tsx` lines 45, 51 — `/blog/detail/[slug]` should be `/blog/[slug]`; currently points to 404 on every blog post share (found in SEO audit W42)
- [ ] Add descriptive `alt` text to all 7 blog post `feature_image_alt` fields in `src/lib/blog/posts.ts` — currently all empty, hurting image SEO and accessibility
- [ ] Remove dead Universal Analytics (UA) snippet from `src/layouts/Main/index.tsx` (lines ~173–185) — UA sunset July 2023, dead network requests on every page load
- [ ] Delete `public/robots.txt` (static file conflicts with dynamic `src/app/robots.ts`)
- [ ] Delete stale `public/sitemap.xml` (references www.passdropit.com, no blog posts — dynamic `src/app/sitemap.ts` is correct)

### Medium Priority
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
- [ ] "How to set an expiry date on a Dropbox link (for free)" — keyword: `dropbox link expiry date free`, `expire dropbox link automatically` — Dropbox charges for this; Passdropit offers it free (added W42)
- [ ] "How to prevent your Dropbox link from being shared beyond your audience" — keyword: `restrict dropbox link access`, `how to prevent dropbox link sharing` — high-intent, no dominant content (added W42)

### Published
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

---

## Ad Optimization

*(Added by Revenue Agent — W42, 2026-10-18)*

### Queue
- [ ] **Add Setupad ad slots to MainLayout** — Home page (558 views/wk) and blog pages have zero ad monetization. Add `stpdwrapper` slots to `src/layouts/Main/index.tsx`. Request new tag IDs from Setupad for these surfaces. Expected lift: +25–35% ad impressions at current traffic. *(Revenue Agent)*
- [ ] **Refresh ads.txt** — Last generated 2026-04-29 via Setupad Ads.txt Manager. Regenerate via Setupad dashboard to include any new SSP partners added since April. *(Revenue Agent)*
- [ ] **Correct metrics.md Setupad estimate** — `context/metrics.md` shows "~$2/week est." for Setupad; actual Aug 2026 data shows ~$0.23/week. Update to reflect reality. *(Revenue Agent)*
- [ ] **Download fresh Setupad export** — Spreadsheet `setupad.xlsx` ends 2026-08-20; 2-month data gap. Export through Oct 2026 and drop in repo root. *(Revenue Agent)*
- [ ] **Test above-card banner on download page** — A `stpdwrapper` slot above the password card at `/download/[slug]` could increase impressions on highest-traffic page. UX test needed to confirm it doesn't hurt password submission rate. *(Revenue Agent)*

---

## Email Campaigns

*(Added by Email Agent or user)*

### Queue
- [ ] Re-engagement campaign — dormant free users (signed up >6 months ago, never upgraded)

### Sent
*(none yet)*
