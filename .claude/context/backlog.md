# Passdropit — Shared Agent Backlog

*Agents add to this file. User prioritizes. Developer Agent picks from "Developer Tasks".*

---

## Developer Tasks

### High Priority
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

## Email Campaigns

*(Added by Email Agent or user)*

### Queue
- [ ] Re-engagement campaign — dormant free users (signed up >6 months ago, never upgraded)

### Sent
*(none yet)*
