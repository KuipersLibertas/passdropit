# Passdropit — Product Context

## What It Does
Passdropit lets users add a password gate, expiry date, download limit, IP tracking, email notifications, and custom branding to any Dropbox, Google Drive, or Notion sharing link. The protected link becomes a `passdropit.com/<slug>` URL that the recipient must authenticate before being forwarded to the original file.

## Core User Flow
1. User connects their Dropbox file/folder or pastes a Google Drive / Notion URL
2. Passdropit generates a `passdropit.com/<slug>` link
3. User optionally configures: password, custom slug, expiry date/download count, IP tracking, email notification per access, pay-per-download price
4. User shares the Passdropit link
5. Recipient visits the link, enters the password (if set), is forwarded to the original file
6. User sees download stats in their dashboard (IP, location, timestamps)

## Plans
- **Free:** Basic link protection, password, limited analytics
- **Pro — $5/month:** Advanced analytics with location data, email notifications on access, expiring links (by date or download count), logo branding on download pages, multiple file links

## Tech Stack
- Next.js 14 (App Router), TypeScript, MUI v5
- Supabase (PostgreSQL) — primary database
- Stripe — Pro subscriptions
- Resend — transactional email
- Vercel — hosting
- Setupad + AdSense — ad revenue

## Key Pages
| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing + pricing |
| Create link | `/create-new-link/file` | Link creation wizard |
| Manage links | `/manage-link` | Dashboard (authenticated) |
| Download gate | `/download/[slug]` | Public password entry page |
| Blog | `/blog` | SEO content |
| Admin | `/admin/` | Internal admin (restricted) |

## Database Tables (Supabase)
- `users` — accounts (id, email, password_hash, is_pro 0/1/2, stripe_id, subscription_id, logo, balance)
- `file_list_user` — protected links (slug, original URLs, password hash, expiry, download count, track_ip, email_notify, is_paid)
- `daily_downloads` — per-day analytics per link
- `ip_tracker` — per-access IP/city/country/lat-long
- `paid_links` — pay-per-download purchases
- `paid_membership` — Pro subscription records

## Current Metrics (as of Oct 2026)
See `context/metrics.md` for weekly-updated figures.
- ~10,100 MAU, ~330 DAU
- 37,936 registered users
- ~10–12K download events/month
- MRR: ~$21 (Stripe $19 + Setupad ~$2)
- Top country: Indonesia, followed by US, India, Philippines, Brazil
- Top acquisition channel: Organic Video (YouTube)

## Key Files
```
src/app/layout.tsx              — Root layout, meta tags, JSON-LD
src/app/page.tsx                — Home page
src/app/download/[slug]/        — Download gate (highest traffic)
src/app/manage-link/            — Dashboard
src/layouts/Main/index.tsx      — Global layout + GA4
src/lib/blog/posts.ts           — Blog post data (IPost[])
src/app/sitemap.ts              — Dynamic sitemap
src/app/robots.ts               — Dynamic robots.txt
supabase/schema.sql             — DB schema
```

## Ad Integration
- Download pages: Setupad (`stpd.cloud/assets/stpdwrapper.js`)
- Home page: demand.supply + copyrightcontent.org scripts
- `public/ads.txt` — publisher declaration (23KB)
