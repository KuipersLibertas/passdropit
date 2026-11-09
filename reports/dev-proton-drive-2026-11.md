# Proton Drive as a link source: feasibility (Developer Agent, 2026-11-02)

**Verdict: EASY.** Proton-only support is about half a day of work (S, ~4–6 h). Nothing in the storage or forwarding path changes. The one real catch is an existing problem, not a Proton one: today the original file URL is sent to the visitor's browser *before* they enter the password. For Proton that URL includes the decryption key. That gap should be fixed (M, ~4–6 h) before we market Proton support as "protected".

No source code was changed. The only thing I ran was a local node check of `isValidLinkUrl`, copied into a scratchpad file.

---

## 1. How sources work today

### Picking a source (client, per-provider code)
- `src/views/create-new-link/blocks/ChooseLink/index.tsx:32-44`: two buttons, Dropbox and Google Drive. There is **no Notion option and no paste-a-URL option** in this wizard.
  - Dropbox uses the Dropbox Chooser (`window.Dropbox.choose`), `src/utils/functions.tsx:81-109`. The script is loaded in `src/app/create-new-link/file/page.tsx:19`.
  - Google Drive uses OAuth plus Google Picker, `src/utils/functions.tsx:24-79`. Then `/api/gateway/check-google-link` sends a HEAD request to check the file is public (`src/app/api/gateway/[path]/route.ts:268-279`).
- Dropbox folder tab: a pasted URL with a client-side prefix check only (`dl.dropboxusercontent.com` / `www.dropbox.com`), `src/views/create-new-link/blocks/ChooseFolder/index.tsx:31`. This is the closest existing pattern to a Proton paste flow.
- Service enum: `src/utils/constants.ts:14-17` (`DropBox: 1, GoogleDrive: 2`). The schema comment says `3=notion` (`supabase/schema.sql:29`), but no code path in this repo uses 3.
- `service` is used for display and edit branching only:
  - Icon in the dashboard: `src/views/ManageLink/index.tsx:~179-190`.
  - "Add file" button in the edit modal: `src/modals/EditLink/index.tsx:~185-195`.

### Validation and storage (server, already generic)
- `saveLink` / `updateLink` call `isValidLinkUrl` on every file URL (`src/lib/db/links.ts:114-118` and the matching loop in `updateLink`).
- `isValidLinkUrl` (`src/lib/db/links.ts:44-82`) is an **SSRF-style denylist, not a host allowlist**. It checks:
  - the URL is `https:`;
  - the host is not localhost, `.local`, `.internal` or `.localhost`;
  - the host is not a private IPv4 address or an IPv6 loopback/ULA address.

  Any public https URL passes. So the API **already accepts arbitrary URLs**; only the UI limits users to Dropbox and Drive.
- Storage: URLs are joined with `,` into `file_list_user.dropbox_url` TEXT (`links.ts:134`, `schema.sql:25`). They are read back with `split(',')` + `trim()` (`links.ts:23-26`, and `getLinkDetail`). The URL is stored raw: nothing parses it into parts or strips anything.

### Forwarding to the original URL: a client-side `<a href>` link
- `src/app/[slug]/page.tsx`, `src/app/download/[slug]/page.tsx` and `src/app/download/go/[slug]/page.tsx` are all identical server components. Each one calls `getLinkDetail(slug)` and passes the whole `linkInfo`, **including `files[].url`**, as a prop to the client component `DownloadView` (`src/views/Download/index.tsx:1`, `'use client'`).
- After the password check, `SharedFiles` renders `<Link href={file.url} target="_blank">` and an `IconButton href={file.url}` (`src/views/Download/blocks/SharedFiles/index.tsx:80-100`). There is no server redirect and no `window.location` assignment. `DownloadGateway.tsx` is only a 5-second ad countdown.
- `validateLink` (`links.ts`, section starting at "export async function validateLink") checks the password and counts the download. It returns only `{ success: true }` and **no URLs**. The URLs were already sent to the browser.

---

## 2. Proton Drive specifics

**Link format.** Proton's support docs ([How to create a shareable link](https://proton.me/support/drive-shareable-link)) describe "Get link", an optional link password, an optional expiry and one item per link (use a folder for several files). The docs do not spell out the URL structure. The format `https://drive.proton.me/urls/<TOKEN>#<KEY>` comes from the Marketing Agent's brief and matches what I know of the format. **We should test one real link from a creator before shipping.** The part after `#` is the client-side decryption secret. Browsers never send it to Proton's servers, or to ours on navigation. An optional Proton-side "link password" means the recipient must type a second password on Proton.

**(a) Is the `#fragment` kept end-to-end? Yes.**
- Storage keeps the raw string. A local test of `isValidLinkUrl` on a sample Proton URL returned `true`, and the `join(',')`/`split(',')` round trip returned the identical string, fragment included.
- There is no `new URL()` normalisation on save. There is no `.hash`, `split('#')` or `encodeURI` anywhere in the link path (grep found none).
- Forwarding is a plain `<a href>`, which keeps fragments. This also works for a future server-side 302: browsers honour a fragment in `Location`.
- Risk to watch: Proton key characters are alphanumeric, so a comma in the key is not a concern. If Proton ever put a `,` in a URL, the comma-separated storage would break it. That risk already exists for every provider.

**(b) Is there a picker or SDK?** No usable one. Proton's Drive SDK (JS/C#) exists, but in January 2026 Proton said third-party integrations are not yet supported: no third-party authentication, and no picker component. So Proton support has to be a **paste-a-URL flow**, like the Dropbox folder tab.

**(c) Security: storing the decryption key**
- We would store the key as plain text in `dropbox_url`. Is that different from a public Dropbox or Drive URL? **Not really.** A public Dropbox `?rlkey=` link or an "anyone with the link" Drive URL is just as much a bearer secret. Whoever holds it gets the file, and we already store those in plain text. Proton's end-to-end encryption protects the file from Proton. Once the creator pastes the full link into Passdropit, the link itself is the secret, and that is the same for every provider. A creator who also sets a Proton link password gets a second factor we never see.
- **The real problem is existing and affects every provider:** `files[].url` is serialised into the page's RSC/HTML payload before the password is entered (see section 1). Anyone can read the original link from page source or devtools and skip the Passdropit password, download counter, expiry-by-count, IP tracking and ads. The pages also use `revalidate = 300`, so the CDN caches those payloads. For Proton this hands out the full decryption URL. Fixing this makes the "protected" promise true for all sources:
  - `getLinkDetail` should return only names/count for the public page;
  - `validateLink` should return the URLs on success, or we issue a short-lived server-side 302 via `/download/go/<slug>`.

---

## 3. Could we go generic ("any https URL")?

Technically it is *simpler*: the server already allows it, so it is mostly UI work. But it turns Passdropit into a **password-protected URL shortener**, which is a well-known abuse vector:
- **Phishing/malware cloaking:** a password gate stops scanners (Google Safe Browsing, email filters, platform link checkers) from seeing where the link goes. Attackers love this.
- **Domain reputation:** abuse reports could get `passdropit.com` flagged by Safe Browsing, blocked by YouTube, WhatsApp or Telegram link filters, or blacklisted in email. Our core acquisition channel is YouTube descriptions.
- **Ad policy:** the download pages carry Setupad/AdSense. Ad networks penalise inventory sitting in front of malicious or adult destinations, and AdSense can suspend the account.
- **Moderation load:** we would need report-abuse, takedown and admin tools.

Existing safeguards: only `isValidLinkUrl` (https plus SSRF denylist), email verification before save (`route.ts:~222-227`), and noindex on link pages. There is **no** reputation check, no domain blocklist, no abuse-report flow and no rate limit on `save-link`.

Note that because the API is already generic, a scripted user can do all of this today by POSTing to `/api/gateway/save-link`. Adding a **host allowlist on the server** is a hardening win in its own right.

Side bug: `isValidLinkUrl` rejects any hostname starting with `fc`, `fd` or `fe80` (`links.ts:71-76`). It is meant to catch IPv6 addresses, but it also blocks legitimate domains such as `fcbarcelona.com`. That is harmless for Proton.

---

## 4. Estimates and files

### (A) Proton-only: **S, ~4–6 h** (plus ~1 h to test a real link)
| File | Change |
|---|---|
| `src/utils/constants.ts` | `ServiceType.ProtonDrive = 4` |
| `src/views/create-new-link/blocks/ChooseLink/index.tsx` | 3rd card "Proton Drive", which opens a paste field (reuse the `ChooseFolder` pattern) |
| new `src/views/create-new-link/blocks/ChooseProtonLink/index.tsx` (or a generalised ChooseFolder) | regex `^https://drive\.proton\.me/urls/[A-Za-z0-9]+(#[A-Za-z0-9_-]+)?$`; warn if `#key` missing ("recipients will need your Proton link password") |
| `src/lib/db/links.ts` | server-side host allowlist per `service` (dropbox / google / proton) in `saveLink`/`updateLink` |
| `src/views/ManageLink/index.tsx` | Proton icon |
| `src/modals/EditLink/index.tsx` | `handleLinkAdd` branch for Proton (paste) |
| `src/views/Download/blocks/SharedFiles/index.tsx:120` | fallback label (`url.split('?')[1]` is `undefined` for Proton) |
| `src/views/create-new-link/ChooseFile/index.tsx:40` | heading copy |
| `src/utils/assets` + `public/` | Proton logo asset |
| optional: `src/app/layout.tsx`, Hero/Features/Footer copy, a blog post | marketing ("Proton Drive") |

### (A+) Close the pre-auth URL leak: **M, ~4–6 h** (recommended alongside A)
`src/lib/db/links.ts` (`getLinkDetail` strips URLs for non-owners; `validateLink` returns them, or a signed token for `/download/go/<slug>` that 302s), `src/app/api/gateway/[path]/route.ts`, `src/views/Download/index.tsx`, `SharedFiles/index.tsx`, `ValidationCheckForm/index.tsx`, `src/types`. Paid links: keep `requirePaid` gating server-side.

### (B) Generic any-https URL: **M–L, ~2–4 days**
All of A's UI work, plus:
- a Google Safe Browsing / Web Risk lookup on save and periodically;
- a domain blocklist;
- a "Report this link" flow and an admin takedown page;
- per-user save-rate limits;
- ToS update;
- possibly a "you are leaving Passdropit to <domain>" interstitial.

There is also ongoing moderation cost after launch.

---

## Recommendation
Build **(A) Proton-only** with a **server-side host allowlist**, and fix the **pre-auth URL leak (A+)** in the same or the preceding PR. Total ~1–1.5 days. Do **not** go generic now: the abuse and ad-policy risk is out of proportion to the gain, and it threatens the YouTube channel we depend on. Revisit generic support only behind Pro plus Safe Browsing checks if there is demand.

## Open questions for the user
1. Can the Marketing Agent or a creator supply 1–2 real Proton share links (file and folder, with and without a Proton password) for testing?
2. Should Proton be available on Free, or Pro-only?
3. Are you OK shipping the URL-leak fix first? It changes the download page's behaviour slightly, because URLs appear only after the password step.
4. Notion: the schema reserves `service = 3` and the marketing copy promises Notion, but this wizard has no Notion option. Is Notion intentionally handled only by Notions11? If not, the same paste flow could add Notion for ~1 h.
5. Should we update the marketing copy and SEO ("password protect Proton Drive link") at launch?

Sources: [Proton: How to create a shareable link](https://proton.me/support/drive-shareable-link), [Proton blog: file sharing in Proton Drive](https://proton.me/blog/file-sharing-proton-drive), [Proton blog: Drive SDK, January 2026](https://proton.me/vi/blog/drive-sdk-january-2026)
