# Okelcor Website — Progress Tracker

**Last updated:** 2026-08-14 (session 87 — eBay in the report, report export, fulfilment queue)  
**Branch:** `main` — latest `d2c9886` (session 86, pushed). **Session 87 is uncommitted** — see the session note at the bottom.

| Commit | What |
|---|---|
| `c22499b` | Sent-campaign viewer moved into an iframe; preview width stated in the UI |
| `0e46cd1` | Customer behaviour analytics page |
| `cdec44f` | Design preview seeded from the server's HTML; stale renders cleared |
| `6cfecb2` | Note specifying the campaign blocks an imported design needs |
| `148e0ea` | Campaign `theme` sent as an object, not a bare preset string |
| `2920e90` | InDesign design import |
| `6a39435` | Manual orders can be marked paid; EU certificate unblocked |

Earlier: `cfd4498` campaign editor autosave + in-place image upload · `7a7344f` typography system — deployed and confirmed live on Vercel  

**⚠️ Deploy dependencies — most of the above is inert until the API ships.** Backend `05f359e` + migration #32 (behaviour analytics), `d7b63a7` (responsive email CSS), `73dc368` (`preview_html` on templates), `4546cbe` (InDesign import), `4d050d0` + migration #31 (payment milestones). Each degrades cleanly on its own; none breaks anything by arriving late.  
**Repo location:** `~/okelcor-website` — **the move off iCloud is done.** (Not `~/dev/okelcor-website` as planned, and not the `~/Documents/project/okelcor-website` this file claimed until 2026-08-11; the earlier `mv` failure notes below are history, kept for the copy-then-verify lesson.) **The first observable payoff: `eslint` and scoped `tsc` both complete in seconds again**, after failing to finish for two sessions.  
**Build status (2026-08-12):** **Full `npm run build` passes — exit 0, compiled in 7.0s.** Every route added this session registered (`/admin/analytics/behaviour`, `/api/admin/analytics/behaviour`, `/api/admin/campaign-templates/import`, `/api/admin/orders/[id]/payment-milestones/request-deposit`, `/api/admin/trade-documents/upload-options`). TypeScript 0 errors · **ESLint 0 errors / 0 warnings on the changed files — and ESLint completes again**, which it had not done for two sessions. The `~/Documents`/iCloud tooling collapse is over; the figures below it are historical. The stale "11 errors / 45 warnings" repo-wide count has **not** been re-measured — worth one full-repo run now that it is possible.

**Working tree — two deliberate leftovers, and the pre-existing clutter:**

| Item | Status |
|---|---|
| `app/viz-check/page.tsx` | **Uncommitted on purpose** — a mock-data harness for eyeballing the behaviour-analytics layout. `npm run dev -- --port 3939`, open `/viz-check`, then delete it. See the backlog row |
| A `next dev` on port **3939** | Was left running for that check. Kill it when done |
| `.claude/settings.local.json` | Modified — accumulated permission allowlist from past sessions, unrelated to any feature. Never committed with feature work |
| `contacts.csv` | **Still the real 188-row marketing list, untracked, in the repo root, with no `csv` rule in `.gitignore`** — one `git add -A` from being published permanently. Unchanged backlog item |
| `email marketing image template.jpg` | The InDesign reference. Sent to backend directly rather than committed |
| 15 screenshots + a `.webp` | July leftovers, referenced nowhere |

<details><summary>Previous build status (historical — iCloud era)</summary>

TypeScript 0 errors (scoped run — the full `tsc` still times out, see below) · ESLint **not verified this session** — it produced no output in ~25 min on six files and was killed to free the directory for the move; a "completed, exit 0" from the runner reflected `tail`, not `eslint`. Previously recorded as **11 errors / 45 warnings — all pre-existing** (mostly `react-hooks/set-state-in-effect` on the fetch-on-mount pattern in `navbar.tsx`, `cart-context.tsx`, `language-context.tsx`, `product-form.tsx`, `two-factor-status.tsx`, `crisp-notifier.tsx`, `use-admin-permissions.ts`, `checkout/return`). The "ESLint clean" claim above this line was inaccurate as of 2026-07-29 — corrected rather than left standing.

</details>

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI | React 19 · TypeScript 5 · Tailwind CSS v4 |
| Animation | GSAP 3.14 + @gsap/react (sole animation library) |
| Auth (customer) | Custom cookie-based — `customer_token` httpOnly, proxied Laravel API |
| Auth (admin) | Cookie-based — `admin_token`, mandatory 2FA, 5h session TTL |
| Email | Resend (contact + checkout; quote emails owned by backend) |
| Backend | Laravel API — `https://api.okelcor.com/api/v1` |

---

## Module Status

### ✅ Core Website

| Feature | Status | Notes |
|---|---|---|
| Site layout (Navbar, Hero, Footer) | ✅ Complete | GSAP animations |
| Hero Slider | ✅ Complete | GSAP parallax, video slide support |
| Categories Carousel | ✅ Complete | |
| Why Okelcor section | ✅ Complete | |
| Trusted Brands panel | ✅ Complete | |
| Logistics Feature section | ✅ Complete | |
| REX Certification section | ✅ Complete | |
| CTA section | ✅ Complete | |
| Floating Utility Bar | ✅ Complete | |
| FET Engine Treatment page (`/fet`) | ✅ Complete | Green design system, ROI calculator |
| FET Teaser strip | ✅ Complete | |

---

### ✅ Internationalisation (LANG)

| Feature | Commit | Notes |
|---|---|---|
| LANG-1 — i18n foundation + `html lang` server attr | `37578cb` | EN/DE/FR/ES |
| LANG-1B — FET teaser, hero, navbar mega-menu, footer | `d90b54e` | |
| LANG-1C — FET calculator, proof, verified-strip | `5bc76f8` | |
| LANG-2 — locale-aware metadata (all public pages) | `17149ab` | |
| LANG-3 prep — `uiLabels` in CatalogueLanding | `d7f33c2` | |
| Spanish locale in admin article form | `49386cc` | |
| LANG-4 — first-visit geo locale auto-detection | `3a67c29` | `/api/i18n/detect` proxy reads CDN geo header (`x-vercel-ip-country`/`cf-ipcountry`) + cached backend country→locale map (`/i18n/locales`, revalidate 1h); `LanguageProvider` auto-switches on first visit only, stored choice/manual override always wins; graceful default-only fallback until backend live |

---

### ✅ Shop / Catalogue

| Feature | Commit | Notes |
|---|---|---|
| Shop page with filters + pagination | early | |
| Product detail page | early | |
| Rapid Specials campaign banner | `bfa332f` | |
| VAT number validation (EU) | `51ef0e6` | |
| Incoterms / FOB default | `bfa332f` | |
| Tyre comparison tool | 2026-07-17 | Competitive research pass vs. Tire Rack / SimpleTire / ATD (ATDOnline). Select up to 4 products anywhere in the catalogue (`context/compare-context.tsx`, localStorage-persisted) → floating `CompareBar` → `CompareModal` side-by-side spec table (brand/size/spec/season/type/price/availability). Confirmed existing Cmd+K search (`components/search/search-modal.tsx`) already matches/beats SimpleTire's typeahead — untouched |
| Trust signal upgrade | 2026-07-17 | Product card + detail page now show a real "✓ In Stock" line instead of only flagging the negative case; detail page surfaces the site's actual certifications (ISO 9001:2015, REX · DEREX76000242 — same facts as the footer) at the decision point via a new `trust` i18n block (EN/DE/FR/ES). Both features are backend-independent; `docs/BACKEND_NOTE_premium_ux.md` covers what would make them richer (real per-warehouse stock/ETA, used-tyre batch/condition traceability, saved fitments + one-click reorder) |
| SimpleTire screenshot pass — product card + search + cart | 2026-07-17 | User supplied real SimpleTire screenshots (homepage, login, cart, product listing). Reviewed against Okelcor's existing pages first — login page (split-screen + trust bullets) and homepage (hero-showcase/platform-showcase/etc.) were already stronger than SimpleTire's equivalents, left untouched. Confirmed gaps closed: (1) `ProductCard` — floating primary CTA pill straddling the image/content boundary (SimpleTire's "Confirm your size" pattern), expandable "Show specs" disclosure surfacing season/type/SKU (data already existed, wasn't shown), no fabricated SimpleScore/rating since Okelcor has no real quality-score data; (2) navbar search — icon-only trigger upgraded to a visible pill ("Search tyres, brands, articles…") at `xl:` and up, same Cmd+K modal underneath; (3) cart drawer empty state — added "Or shop by category" quick chips (Used/PCR/TBR, real `/shop?type=` params). All copy routed through i18n (EN/DE/FR/ES) |
| SimpleTire pass — bugfix + follow-up | 2026-07-18 | **Fix:** the floating CTA pill on `ProductCard` was overlapping the Compare toggle (both anchored bottom-left of the same card zone) — moved Compare out of the absolute-positioned image overlay entirely into normal document flow next to the type badge, eliminating the collision at its root instead of nudging pixel offsets. **New:** `components/home/how-it-works.tsx` — a 4-step "From inquiry to delivery" section (Request a Quote → Review Proposal → Confirm & Pay → Track Shipment) inspired by SimpleTire's numbered-steps section, placed before the final homepage CTA; describes Okelcor's actual, already-built process (CRM-7 proposals, DOC-7 payment milestones, carrier tracking) rather than invented steps. i18n'd (EN/DE/FR/ES) via a new `howItWorks` block. **Investigated, not caused by this work:** reported "customer email showing as −" after login — `git diff` confirms zero changes this session to `lib/customer-auth.ts`, the `/me` proxy, or `CustomerAuthContext.tsx`; likely a backend response or stale-session issue, flagged back rather than blind-fixed |

---

### ✅ SEO

| Feature | Commit | Notes |
|---|---|---|
| SEO Phase 1 — Quote & About page optimisation | `933d89d` | Meta, H1, alt text, outbound links |
| SEO Phase 2 — SEO-friendly URL aliases + 301 redirects | `da147c8` | `/tyre-supply-quotation`, `/wholesale-tire-distributors-europe` |
| SEO Phase 3 — Sitemap, robots.txt, structured data | `e9ab6f4` | Organization + WebSite JSON-LD |
| SEO Phase 4A — 12 catalogue landing pages | `d58b7da` | Static pre-rendered |
| SEO Phase 4B — Content depth for all 12 pages | `5019e5d` | FAQPage JSON-LD, popular sizes, internal links |
| SEO Phase 5A — Season/category copy sync (5 pages) | `ce827c9` | Approved copy applied |
| SEO Phase 5B — Brand copy sync (7 pages) | `83a0ac1` | Approved copy applied |
| Internal links on all 12 catalogue pages | `8eac305` | |
| `/tyre-wholesaler` ads/SEO landing refresh | `d012cea` | Dedicated minimal header + footer, darker inventory overlays, SEO-manager lead form → `POST /api/leads/tyre-wholesaler` (proxy to backend `/leads/tyre-wholesaler`, forwards client IP for throttle), raw interest/volume + flat UTM/gclid/fbclid/referrer attribution, CRM-2 preserved, `/tyre-wholesaler/thank-you` conversion page |

---

### ✅ Customer Auth & Account

| Feature | Commit | Notes |
|---|---|---|
| Customer login / register / forgot-password | early | |
| Email verification flow | early | |
| Account dashboard (orders, invoices, profile) | early | |
| Order detail page | `90721f7` | Two-stage auth fallback, inline 404 state |
| Stripe card payments | `ca4ef63` | |
| Order tracking page | `7169151` | |
| Checkout flow | early | |
| Trade documents card (customer-facing) | `d7caa08`+ | View/download generated + shipment docs |
| Delivery confirmation card | `4255f03` | |
| Payment milestone progress (customer) | `a1ef863` | 5-step timeline |
| Order Confirmation acceptance (customer) | `c52ac1b` | Accept + Decline with reason |
| **Portal premium pass + notification inbox** | pending | Dashboard uplift (recent-activity widget + account-status card) and a full customer notification system — navbar bell (30s unread poll), inbox center `/account/notifications` (filters, pagination, "Emailed" tag), email preferences. ✅ Frontend complete · ⏳ backend — see contract block below |

---

### ✅ Admin Panel — Core

| Feature | Commit | Notes |
|---|---|---|
| Admin login + 2FA challenge | `4577470` | |
| Mandatory 2FA setup flow | `4577470` | QR code, recovery codes |
| 5-hour session TTL | `4577470` | |
| Admin profile + password change | `fed0b38` | |
| Role-based access control (RBAC) | `c41a5d3` | super_admin / admin / order_manager / sales_manager / support |
| Admin shell (nav, layout) | early | |
| System Health dashboard | `8ae5911` | Grouped checks, error log, graceful unavailable state |

---

### ✅ Admin Panel — Products & Content

| Feature | Commit | Notes |
|---|---|---|
| Products table + CRUD | early | |
| CSV import / bulk delete | early | |
| Hero slides CMS | early | Video upload support |
| Article CMS | `928a6bc` | TipTap rich text editor |
| Brands management | early | |
| Promotions management | early | |
| Settings page | early | |
| **Media Library** | `fd43ca2` | Standalone `/admin/media` screen — thumbnail grid (collection tabs, search, pagination, upload, delete, copy URL); article editor gets "Browse Media Library" button in image dialog; `MediaPickerModal` overlay for insert-from-library in TipTap; `editor` + `content_manager` roles have access |

---

### ✅ Admin Panel — Marketing

| Feature | Commit | Notes |
|---|---|---|
| Marketing Contacts — list, stats, delete | `a731c86` | `/admin/marketing/contacts` · paginated table with filter (status/company/country/search) · stats cards · unsubscribed rows dimmed |
| Marketing Contacts — CSV import | `dc57662` | Drag-drop + file picker; proxy normalises UTF-8 BOM, trims header whitespace, remaps column names (snake_case) before forwarding to backend import endpoint |
| Bulk Email Campaigns — compose & send | `a731c86` | `/admin/marketing/campaigns` · TipTap HTML composer · debounced recipient-count preview · company/country/status/search filters · send |
| Bulk Email Campaigns — history & progress | `a731c86` | Paginated history table · 3-second poller while status is `queued`/`sending` · progress bar · body-preview modal |
| RBAC — `marketing` section | `a731c86` | `super_admin`, `admin`, `order_manager`; `marketing.manage` permission |
| **Campaign builder — block-based authoring, no HTML** | 2026-07-30 | The marketers can't hand-write HTML; backend (`faa31bd`, migration #27) now renders the Wix house style from structured blocks. `body_html` is untouched and still works — this is a **second authoring path**, selected by a Design/HTML toggle in the composer, defaulting to Design. **Nothing about block types is hardcoded:** the entire editor is generated from `GET /admin/campaign-design`, so a block type added server-side appears on its own. `lib/campaign-design.ts` normalises that schema tolerantly (accepts `blocks`/`block_types`/`types`, array *or* keyed-object collections, `options` as `string[]` or `{value,label}[]`) and degrades to an explicit "switch to Write HTML" notice rather than a dead canvas — **the exact JSON key spellings were not verifiable from this side, so the normaliser is deliberately permissive; worth a 60-second check against a live response.** Eight field types render generated inputs (`text`, `textarea`, `select`, `number` honouring min/max, `url`, `image_url`, `text_list`, `link_list`). **Never opens blank** — a start-from-design step shows the 3 starters + saved designs first. **Live preview** is a debounced (700ms) `POST /bulk-emails/preview` rendering `html_personalized` in a `sandbox=""` `<iframe srcDoc>` (the email is a full document with its own styles — injecting it into the admin DOM would let it restyle the page, and the empty sandbox also stops any script in pasted content reaching the admin session), with a desktop/mobile toggle at 380px. **Test-send is the most prominent control in the composer**, defaulting to the logged-in admin's address fetched server-side in `page.tsx` — for a non-technical author it's the only verification step that builds real confidence. Media Library picker (reused `MediaPickerModal`) on every `image_url` field, so a URL is never typed. **Merge-tag inserter always inserts the fallback form** (`[[FIRST_NAME|there]]`, per-tag defaults in `DEFAULT_FALLBACKS`) — a bare tag would send "Hi ," to most of the imported list, which has an email and nothing else; `UNSUBSCRIBE_URL` is excluded since a fallback there is nonsense. `unknown_merge_tags` surfaces as an amber banner above the preview naming each one — a typo'd `[[FIRSTNAME]]` is otherwise only discovered after 1,700 blank sends. **422 `invalid_blocks` is parsed, not dumped:** `groupBlockErrors()` reads the leading `Block N` and attaches each message to that block's card (1-based → index), leaving unprefixed messages as general — a 12-block campaign is unfixable from one list at the top. Save-as-design + **Reopen/Duplicate** on past campaigns where `designed: true`. Starter placeholder images render as "Replace this image", not a broken thumbnail. Theme picker exposes the presets only — per-colour overrides deliberately not surfaced, since the point is that marketers don't make design decisions. Blocks whose type isn't in the current schema render a "can't edit here, will still send" notice rather than being silently mangled. New: `lib/campaign-design.ts`, `components/admin/campaign/{campaign-designer,block-editor,block-field,campaign-preview,template-picker,test-send,save-template-modal}.tsx`, 6 proxy routes |
| **Campaign editor — in-place image upload + autosave** | 2026-08-07 | Answers backend's note: a marketer lost a half-composed campaign by leaving the Mail Campaign tab for the Media Library. **Backend's own advice was "if you build only one of the two, build the picker" — the picker already existed** (`MediaPickerModal`, shipped 2026-07-30, wired to every `image_url` block field and to the HTML-mode TipTap image dialog). The residual trigger was narrower and had been missed: the picker could only *browse*. If the image wasn't already in the library she still had to leave for `/admin/media` to upload it. **Fixed client-only** against the existing `POST /admin/media` — Upload button, drag-and-drop onto the grid, and an upload prompt in the empty state; the uploaded file is inserted immediately (she opened the modal to use it, not to file it) and also lands in the library. Because both authoring modes share this one modal, the fix lands in both at once. **Autosave** (the safety net) built to backend's four rules: no pre-validation — half-built work is exactly what needs saving, and block rules still run at preview and send; PUT is a **full replace**, whole document every time, so deleting the last block stays expressible; the restore offer is gated on a genuinely non-empty draft (`isDraftEmpty()` mirrors backend's `/latest` `data: null` rule client-side, so the prompt always means something); and `draft_id` goes on the send so the draft is retired **only after** the campaign is queued. Debounce is 4s idle **plus blur, `visibilitychange` and `pagehide`** — the last three use `keepalive` so a save started as the tab hides still completes, which is the part that actually fixes her complaint. Failure is never blocking: a small status chip, never a modal or a frozen editor. **`unavailable` is a deliberately distinct, quiet grey state** rather than a red error — until migration #29 every save fails, and an alarm she can't act on is one she learns to ignore; it still *says* autosave is off, since silence would let her assume work is being saved when it isn't. Draft is created on **first edit**, not on open — creating on open manufactures empty drafts against backend's 20-per-author cap. Contract confirmed against `docs/FRONTEND_NOTE_campaign-autosave.md` (see the callouts below for the three assumptions it corrected). New: `hooks/use-campaign-autosave.ts`, `lib/campaign-draft-proxy.ts`, `components/admin/campaign/autosave.tsx`, 3 proxy route files (6 endpoints), `CampaignDraft` + `CampaignThemeValue` types |
| **Banner block (`hero`) — the 3×3 position control, and the editor that fought text selection** | 2026-08-13 | Backend session 81 adds one block type (`hero`), no migration and no endpoint change. It arrives through `GET /admin/campaign-design` like every other block, so the generated editor picks it up on its own — **seven of its nine fields needed no work at all**, and the eighth (`position`) already worked as a plain nine-value dropdown. The only build was the `control: "position_grid"` hint. **`control` is typed as a bare `string`, deliberately not a union:** it is advice about how to *draw* a control, never what it means or sends, so an unrecognised value falls back to the plain control for the field's `type` and the server can ship a new hint without a frontend deploy. The grid additionally verifies the *shape* before drawing — it maps the served options onto `top/middle/bottom` × `left/center/right` and returns to a dropdown unless all nine are present, so `position_grid` on a four-option field yields a working four-option select rather than a broken grid. Drawn **over the block's own picture** with the real headline in the chosen cell, so the marketer clicks where the words go and watches them land; sibling field names (`image`, `heading`, `text_color`, `overlay`) are read softly and each degrades on its own — a renamed field costs preview fidelity, never the ability to choose a position. Backend's images-off point is stated **in the control**, where the banner is being composed, not in a note read at send time. **A real `<img>`, not a CSS `background-image`:** building `url("…")` from a value lets a stray quote close the string and inject declarations into the admin page, where an `src` needs no escaping. **The drag bug was entirely ours and the symptom named it exactly** — "the whole box moves *sideways*" is a drag ghost, not a layout shift. `draggable` sat on the whole block card, and the HTML5 DnD spec suppresses native text selection inside a `draggable="true"` subtree, so a press-and-move starting in a text field was claimed as a block drag before a selection could begin. Dragging is now armed by the grip handle alone (the card still carries `draggable` while the grip is held, so the drag image stays the whole block), with a second guard refusing a drag that starts inside an editable element. No library is involved — this repo uses native DnD, so dnd-kit's activation-distance advice doesn't apply; the browser's own threshold does that job. **Stable row keys, held beside the blocks rather than on them:** `blocks` is serialised verbatim to preview/test-send/the real send/the draft **and feeds autosave's dirty hash**, so an `id` written onto a block object would travel as an unknown field and mark a pristine campaign dirty. **Correcting backend's stated mechanism:** index keys don't drop the caret here — the inputs are controlled, so typing re-renders without remounting. What they actually cost is that each row's local UI state (the image field's broken/picking flags, an open merge-tag menu) binds to a *position*: delete block 2 of 5 and those flags stay behind on the wrong block. Same fix, different failure. New: `positionCells()` + `PositionGrid` in `block-field.tsx`, `control` on `CampaignFieldSpec` |
| **`group_list` — the cards block becomes authorable, not just importable** | 2026-08-13 | Backend served the contract this was waiting on (session 81, second pass), and the shape is the whole story: `item_fields` is now flattened **exactly like a block's own `fields`** — a list of objects each carrying `name` — and recursively. So `normaliseField()` calls itself and `BlockField` renders itself, and a container field costs **one renderer instead of a parallel vocabulary**: every field type already supported works inside a group, at any depth, with no new code. A group nested in a group was verified rendering two levels deep. **The payload is plain** — an array of plain objects keyed by sub-field name, no wrapper and no index key — and the entry keys are held **beside** the entries for the same reason the block rows are: backend confirmed a stray `id` inside an entry would be ignored, but it would still travel in the payload and churn autosave's dirty hash for nothing. Entries are labelled **"Entry N"** deliberately: validation reads `Block 3 (Cards): entry 2 needs "Title".`, so the label a marketer is told to look for is the label on screen — verified end-to-end, since `groupBlockErrors()` routes that message to block 3's card with the "entry 2" wording intact. `max_items` (24) disables Add and says why; **no `minItems` is invented** — no field declares one and nothing enforces one server-side, so a floor here would block in the editor what the send accepts. A blank entry is added freely because the server now drops an entirely empty row (backend's third fix: validation refusing what rendering accepts is a disagreement the marketer experiences as a broken editor). A group whose `item_fields` the server didn't describe gets the same "can't be edited here, will still send" notice an unknown *block* type gets, rather than a guess. **Also fixed in passing:** `max` on prose fields was being ignored, so the only way to find the 120/300-character limits backend enforces was a 422 after writing — now `maxLength` plus a count that appears at 80% and stays out of the way until then |
| **FIX — the sent-campaign viewer stripped every media query (and could restyle the admin)** | 2026-08-12 | Found by taking backend's "don't inject the HTML into a div" warning seriously and checking **every** place email HTML is rendered, rather than only the pane they pointed at. The campaign-history "view what we sent" modal used `dangerouslySetInnerHTML` into a `<div>` — and for a block-designed campaign `body_html` **is the whole rendered email document**: the backend renders blocks at send time and stores the result there (`AdminBulkEmailController:186`, `render()` at `:40`). Injecting a full document into a div drops the `<head>`, and with it the single `<style>` block that carries every media query, so a sent campaign rendered there unstyled — the exact symptom that would later be reported as "the email we sent is broken". It also let a sent document restyle the admin page around it, which is the reason the live preview has used an iframe since day one. Now a `sandbox=""` `srcDoc` iframe, same as everywhere else. **Neither side was looking here** — backend's report was about the mobile toggle |
| **Mobile preview verified as a real width, not a scaled render** | 2026-08-12 | Backend `d7b63a7` fixed five responsive bugs server-side and asked us to check two things that would each reproduce all the symptoms. **Both were already correct, and verified by reading rather than assumed:** (1) no `transform: scale()` exists anywhere in the preview path — the only match for "transform" in either file is a comment about InDesign's own CSS — and both panes set a **real** iframe width, so the email's media queries genuinely fire; (2) both use `srcDoc` on an `<iframe>`, so the document renders *as a document* and its `<head>`/`<style>` survives. **Declined one suggestion, with reason:** `sandbox=""` is kept rather than relaxed to `sandbox="allow-same-origin"` — sandbox has no effect on CSS parsing or media-query evaluation, so the relaxation buys nothing and would hand a framed email document our own origin. **Changed:** the mobile width 380 → **375**, so both sides test the number backend's checks are written against, hoisted into a shared `PREVIEW_WIDTH` in `lib/campaign-design.ts` so the two panes can't drift. **And the process fix, made structural rather than a promise:** each preview header now prints its active mode and pixel width (`Mobile · 375px`), so any screenshot of the pane carries the one fact whose absence cost three rounds of diagnosis |
| **Template preview now seeded from the server's `preview_html`** | 2026-08-12 | Backend `73dc368` adds `preview_html` + `preview_text` to `GET /admin/campaign-templates/{id}` and to each starter, byte-identical to what the import returned, asking the preview to stop deriving anything from blocks. **Their diagnosis of the mechanism was wrong for this codebase and worth recording:** there is **no client-side block renderer here** and never has been. The only three HTML surfaces are two iframes fed by server HTML (`campaign-preview.tsx:89` from `POST /admin/bulk-emails/preview`, `indesign-import.tsx:552` from the import response) and one `dangerouslySetInnerHTML` for `body_html` in the campaign-history modal, which is HTML-mode authoring, not blocks. So their item 2 ("live editing → use the preview endpoint") has been the behaviour since the block editor shipped, and no client renderer existed to fall back to stacked images. **What they most likely saw is the theme bug fixed hours earlier in `148e0ea`:** "Use this design" set `theme` from the import, the composer posted it as a bare string, the endpoint 422'd, the preview swallowed it — and `setPreview` was never called, so **the previous render stayed on screen**. A refused refresh displaying a stale render is indistinguishable from a successful render of the wrong layout. **That retention was the real remaining defect and is now fixed:** a request-level failure clears the preview, while a 422 carrying block errors still keeps the last good render (half-built work shouldn't blank the pane). **Their prescription is implemented anyway because it is genuinely better:** `seedPreview()` paints the server's HTML the instant a design is applied — instant instead of a 700ms round trip, byte-identical to what was approved on upload, and still correct if the preview endpoint is unreachable; the debounced fetch then replaces it with the personalised version. Seeded as `html` with `html_personalized` empty so merge tags show as literal tokens for that one beat rather than the pane sitting blank. `applyTemplate` also now fetches `/{id}` when the card lacks `preview_html`, not just when it lacks blocks. **`fet_green` needs no change** — `themeToKey()` has no preset allowlist, it reads `preset` and passes it through, so a third value survives |
| **FIX — choosing a colour scheme silently broke preview, test-send, save-as-design and send** | 2026-08-12 | Found while diagnosing the reported "imported design saved, 20 blocks listed, preview pane empty". **Root cause is not the import.** Every campaign endpoint validates `theme` as `['nullable', 'array']` — `bulk-emails/preview` (`:79`), `test-send` (`:131`), `bulk-emails` **the real send** (`:197`), and both `campaign-templates` writes (`:124`, `:156`) — and `CampaignBlockRenderer::resolveTheme()` reads `$theme['preset']` with the remaining keys as overrides. The composer was sending the **bare preset string** in all four places. A string is a 422 there. **Why nobody reported it:** the theme state starts `""`, which `theme || undefined` omits, so the request is valid and the backend applies its own default — and because `""` matches no `<option>`, the picker *displays* a scheme while sending none. Everything worked right up until someone actively changed the dropdown. An import always sets a theme, so it was broken 100% of the time and looked like an import bug. **Why it stayed invisible for two weeks:** the preview treated *every* 422 as "normal while half-finished" and set no error, so a rejected request rendered as the empty-canvas state next to a full block list, with nothing logged. That silence is now narrowed to 422s that actually carry block errors; a 422 rejecting the request itself surfaces. **Fixed** with `themeToWire(preset, overrides)` + `themeOverridesOf()` in `lib/campaign-design.ts`, used by all four call sites. **Two more latent bugs in the same area, fixed in passing:** (1) Reopen/Duplicate assigned the campaigns endpoint's `theme` **object** straight into the string state, putting an object in the colour `<select>` — now `themeToKey()` + overrides; (2) `applyTemplate` read `blocks` off the **list** payload, which carries `block_count` and no `blocks` (deliberate, to keep the list light) — so picking any saved design applied an empty canvas. Now fetches `/{id}` when the card has none, starters skipping it since they carry blocks inline. **Also corrected: my own earlier claim.** PROGRESS.md said "the composer, the design schema and the send endpoint all use a bare preset key" — wrong for every endpoint. Only the *draft* proxy had it right (`themeToWire` in `use-campaign-autosave.ts` wrote `{ preset }`), which is the one place a past session transcribed the documented shape instead of copying the composer. **Known gap left open:** draft autosave still persists `{ preset }` only, so restoring a draft of an imported design falls back to the house preset — legible and sendable, just not the recovered palette. Threading overrides through the autosave snapshot touches its dirty-tracking hash; deliberately not done in the same pass as a production fix |
| **InDesign design import** | 2026-08-12 | Backend session 77 (`4546cbe`, no migration) — marketers export from InDesign and get back a saved, editable campaign template, instead of handing the export to a developer to rebuild by hand. New multipart proxy `app/api/admin/campaign-templates/import/route.ts` + `components/admin/campaign/indesign-import.tsx`, entered from the template picker (`onImport`) because that is where a marketer chooses what to start from; once saved it is an ordinary template and appears under "Your saved designs". **Built as backend's 3-step flow:** upload → `dry_run: true` (reads and saves nothing, which is what makes "review before sending" real rather than a slogan) → same call with a name to save. **The framing is deliberate and load-bearing:** every label says *imported, review it*, never *converted*. An InDesign HTML5 export is an iframe on a fixed print canvas where each word is its own absolutely-positioned span; email has no mechanism for that, so what crosses is imagery, copy, order and colour. Someone will hold this next to InDesign on a second monitor within a week — framed as a conversion, that comparison becomes a bug report instead of the starting point it is. **The CTA warning is promoted out of the warnings list into its own panel:** InDesign carries no links so there is *never* a button, meaning this fires on every single import and is the one action someone must take. **Nothing here touches colour** — the importer already replaces an illegible recovered palette with the house theme (InDesign sets type white to sit on a photo that can't come across; copying it faithfully sends white text on a white page, an email that arrives blank and passes every check that isn't a human looking at it), so reapplying the export's colours client-side would reinstate exactly that bug. Imported `theme` arrives as an object, not the bare preset key the composer uses — routed through the existing `themeToKey()`. Both 422s handled: `import_failed` messages are shown **verbatim** (they are already written for the uploader), `invalid_blocks` also lists `errors.blocks`. Media thumbnails shown so the "reusable next time" half of the ask is visible. **Repeat reviews are cheap** — backend keys each conversion on the archive's content hash (cached 2h), so reviewing the same export five times produces one conversion and one set of media rows. **Upload ceiling:** Vercel caps this route's body at 4.5 MB against the API's 50 MB, which in practice does not bite — images are reduced to 2000px/JPEG 90 during import, so Medium/150 ppi is lossless for email and a real export is ~1.6 MB. The UI says exactly that, and 413 is still handled. See the backlog row |
| **Wix source market surfaced on the import result** | 2026-08-14 | Backend session 85 (`444` tests, no migration, no new route, no response-shape change). **Almost nothing to build, and that was the finding worth confirming rather than assuming:** the market selector is populated from `GET /admin/marketing-contacts/markets` (`useMarketOptions` in `market-select.tsx`), and markets are discovered from membership rather than registered, so `wix` appears with **no frontend deploy** — verified by reading, not taken on trust. The import proxy spreads `json.data`, so the two new optional fields arrive untouched; no proxy change either. **The one real build:** the import result screen said "1,720 contacts imported" while a market nobody asked for appeared in the list, which reads as something having gone wrong. It now says which markets were applied, and says the two things that stop the obvious wrong conclusions — **the contacts did not move** (`markets_applied[0]` is the chosen market and stays primary, so a row showing only the primary looks unchanged, which is correct), and **a source is not a place** (a campaign addressed to `wix` reaches people in every country). Keyed on `markets_applied.length > 1` rather than on the literal string `wix`, so a second source recognised server-side surfaces on its own; `source_detected` is typed as a widened string for the same reason. Silent on an ordinary import, where nothing surprising happened |
| **Multi-market contacts** (supersedes the move-only pass below) | 2026-07-30 | Backend went further than the move-only contract: a contact can now genuinely belong to **several markets at once** (`b8757c7`, migration #26) — which is what the marketer actually asked for ("she said *add*"). **Payload:** every contact now carries both `market` (primary, single string, unchanged contract) and `markets[]` (all of them, oldest first). `MarketingContact` types both; `contactMarkets()` reads `markets` and falls back to `[market]`, so the UI is correct whether or not migration #26 has run. **Three endpoints, one selector shape** (`contact_ids` / `emails` / `from_market`, OR'd) — `add-to-market` (idempotent, reports `already_in_place`), `move-market` (relocates; with `from_market` it leaves just that market), `remove-from-market` (leaves a market without deleting the contact). Proxied via one colocated `app/api/admin/marketing-contacts/market-op.ts` factory rather than three near-identical route files; all three keep the deliberate no-graceful-degradation stance (404/405 → 501, never a fake success). **UI:** (1) markets render as **chips on every row** — `✕` per chip → `remove-from-market` with the market pre-filled, `+` → `add-to-market`; (2) the add-form 422 now offers **both** real next steps, gated on `can_add_market` / `can_move` ("already in test — [Add to germany too] [Move to germany]"); (3) bulk toolbar gained Add / Move / **Remove**, with the remove picker limited to markets actually present in the selection; (4) new **Manage markets** view (`MarketManager`) — per-row *Add all to… / Move all to… / Clear*, the cleanup path for the leftover TEST market; (5) campaign audience picker is now **multi-select** (`MarketMultiSelect`) sending `filters.markets[]`, with the recipient-count proxy forwarding repeated `markets` params as Laravel `markets[]`. **`skipped_last_market` is surfaced as its own outcome, not an error:** a contact always keeps at least one market, so `removed: 0` + a non-empty list renders as an amber "Nothing changed — this was their only market" panel naming the fix (move it elsewhere, or delete the contact), rather than a green success or a red failure. **Counts caveat honoured:** `/markets` and `/stats` count distinct contacts *per market*, so the sum can exceed the contact total once contacts overlap — nothing sums them, and the Manage-markets header states "N memberships across M contacts" only when they genuinely diverge. **Edit modal no longer sends `market`:** a single-value field can't represent a contact in three markets and PATCHing from it would silently drop the rest, so edit shows read-only chips and market membership is managed only from the row. **Import copy corrected** — a re-import no longer relocates contacts (behaviour change backend called out); it now adds the market alongside, and the card says so, replacing the warning added hours earlier that said the opposite |
| ~~Move contacts between markets~~ (superseded same-day by the row above; single-market assumption no longer holds) | 2026-07-30 | Answers the digital marketer's report: *"if my email is already in TEST I can't add it to Germany — I have to remove it first."* A marketing contact belongs to exactly **one** market (single `market` column, UNIQUE email), so re-adding an existing address under a second market was never an add — it's a move, and the panel had no move action. Backend shipped `POST /admin/marketing-contacts/move-market` (`marketing.manage`, no migration); selectors `contact_ids` / `emails` / `from_market` are OR'd against a required `to_market`. New proxy `app/api/admin/marketing-contacts/move-market/route.ts` — unlike the read proxies it deliberately **does not** degrade a 404/405 to a fake success (reporting "moved" when nothing moved is worse than an honest error); returns 501 with a plain message instead. Frontend (`marketing-contacts-panel.tsx`): (1) **add-form conflict recovery** — a 422 carrying `code: "contact_exists"` + `can_move: true` now replaces the bare field error with "…is already in *test*. Move it to *germany*?" and a one-click confirm hitting `move-market` with the existing contact's id; `can_move: false` (already in the target) still shows the plain field error, and the untouched `errors.email` means generic 422 handling elsewhere is unaffected; (2) **row-level** "Move to market…" action; (3) **multi-select checkboxes + bulk move bar**, picker reusing `MarketSelect mode="create"` so a **free-typed new name** works — markets are auto-discovered from data, so "Germany" can't appear until a contact is already in it and an existing-options-only picker could never create the first one; (4) **"empty this market"** control on the *active* market pill only (`from_market`), which doubles as a market rename and is the cleanup path for the leftover TEST market — no delete-market endpoint exists or is needed, since `/markets` is derived from live data; (5) `/markets` + `/stats` + the table all refresh together after any move via one `refreshAll`, and the market tab resets when the market it points at has just been emptied out of existence. Result panel reports `moved` / `already_in_place` / `not_found[]`, stating plainly that an unmatched address was **not** created. Also added the missing import-time warning: a CSV import requires a market and **overwrites** an existing contact's market, so importing a Germany list containing an Asia contact silently moves them — now said in the import card copy rather than discovered afterwards |
| Market segmentation — contacts + campaigns | `0948daa` | Market filter/picker (`components/admin/market-select.tsx`) auto-discovered via `GET /admin/marketing-contacts/markets` — not hardcoded — used as tabs-with-counts on the contacts list and the primary audience filter on the campaign composer; new manual add/edit contact modal (no CSV needed for a single lead); import now requires and sends a market. **Fixed a live bug in the same pass:** the CSV-import proxy never sent `market` to the backend, which had just made it required server-side — every import was 422ing until this landed |

> **CSV import status:** Frontend normalisation ships (`dc57662`). Import still returns `skipped_no_email: 188` — root cause is a column-name mismatch between the normalised CSV and what the Laravel importer expects. Backend team has been notified with full reproduction details; awaiting the exact expected header name.

> **Not built (in scope terms, flagged not forgotten):** the `emails` selector is a paste-a-list path
> with no UI yet — all three market endpoints accept it, and it's the natural next step for a marketer
> holding a list of addresses rather than a checkbox selection. Small addition if wanted.

> **Where to look for all of this:** every marketing change below is **admin-only** —
> `/admin/marketing/contacts` and `/admin/marketing/campaigns`. Nothing on the public site changed,
> so "it's not reflecting on the website" is expected. After a deploy, the two things to check are
> whether contact rows show market **chips**, and whether the campaign composer opens the **block
> editor** or the "switch to Write HTML" fallback — the latter means the design schema isn't
> reachable (see the two top backlog rows).

> **Campaign autosave — contract now confirmed against `docs/FRONTEND_NOTE_campaign-autosave.md`**
> (the note was missing from the repo during the first pass and has since been added; §7 is the
> frontend reply). Three assumptions the note corrected, all fixed: **`theme` is documented as
> `{ preset }`, not the bare string** the composer/design-schema/send endpoint use — now written in
> the object form and read tolerantly either way, since a theme silently dropped on restore wouldn't
> surface until the send; the response carries **`label` / `block_count` / `is_empty`**, so the restore
> gate now defers to backend's own `is_empty` instead of only the local heuristic; and **`/latest`
> returns the full record**, so the defensive re-read of `/{id}` is now conditional (blocks absent
> while `block_count > 0`) rather than on every restore. Also caught from the note's 512 KB body cap:
> **browsers reject `keepalive` bodies over 64 KB**, which would have made the hidden-tab flush — the
> save that fixes the actual complaint — the one that throws on a large campaign; over
> `KEEPALIVE_MAX_BYTES` it falls back to a normal request. One deliberate deviation: the draft is
> created **on first edit**, not on editor open (§4 step 2, not §2's endpoint comment) — creating on
> open manufactures empty drafts against the 20-per-author cap and prunes real ones.

> **Campaign autosave — one item for backend.** The endpoints 500 until migration #29, so the proxies
> map 404/405/**500** alike to a 501 `draft_storage_unavailable` and the composer switches autosave off
> quietly. **That over-reads a genuine server fault as "unavailable", and the trade is time-boxed on
> purpose** — once #29 is applied, drop 500 from `isDraftStorageUnavailable()` in
> `lib/campaign-draft-proxy.ts` so real faults surface again.

> **Answering backend's "anything else in the editor that requires leaving the tab?"** — one left, and
> it needs them. The composer shows a recipient **count** but never *who*; to check the audience she
> goes to `/admin/marketing/contacts` and re-applies the filters by hand. **Deliberately not built
> against the existing contacts list endpoint:** that proxy accepts a single `market`, not `markets[]`,
> and the campaign recipient query matches *any* market (fixed backend-side, noted below) — so a
> preview built on it could confidently show a list that isn't who gets emailed. Needs a small
> `recipient-preview` returning a sample from the **same** query the send uses. Everything else is
> already in place: images (browse + upload + drag-drop, no navigation), test send, starters and saved
> designs, merge tags, theme, live preview, reopen/duplicate. Creating a *new* market from the composer
> is not a gap — a market only exists once a contact is in it, so a market with no contacts has no
> recipients and nothing campaign-side could usefully create.

> **Campaign builder — open item for backend:** the frontend could not verify the exact JSON shape of
> `GET /admin/campaign-design` (no live response available from this side). `lib/campaign-design.ts`
> normalises the plausible spellings rather than guessing one, so a mismatch degrades to "editor
> unavailable, use Write HTML" instead of rendering wrong. **Worth one check against a real response
> before the marketers touch it.** Same for the block-instance field names (`{ type, ...fields }` is
> assumed from the example payload) and the `test-send` body key for the recipient (`email`).

> **Campaign builder — not built (scope, flagged not forgotten):** per-colour theme overrides (backend
> supports them; deliberately not exposed — the point is that marketers don't make design decisions),
> and template *rename/edit* (`PATCH /campaign-templates/{id}` is proxied and ready, only delete and
> create are wired to UI). Social links render as text links, not icons, per backend's note — icons
> need hosted images and a broken footer image is worse than a word.

> **Deploy order:** frontend is not blocked on migration #26 or #27. Without #27, block-designed
> campaigns still render and send; only Reopen/Duplicate and saved templates need the columns, and
> both degrade cleanly (the saved-designs row simply doesn't appear; saving returns an explicit 501
> rather than a false success).

> **Deploy order (multi-market):** frontend is not blocked on migration #26. If backend code lands before the
> migration, every endpoint still returns 200 and `markets` comes back as a one-element array
> (covered by a backend test); `contactMarkets()` falls back to `[market]`, so chips render as a
> single chip and the ✕/+ actions simply have nothing useful to do until the migration runs.

> **Fixed backend-side in the same pass (would have looked like a frontend bug):** the campaign filter
> only matched the *primary* market, so a contact added to `germany` alongside `test` would have been
> silently left out of a `germany` send — visibly selected in the UI, quietly not emailed. Now matches
> any market.

> **Market normalisation gap (backend, not papered over here):** the backend slugifies (lowercase) a market value supplied directly (manual add/edit, the import selector), but **not** a market value embedded inside an imported CSV's own market/region/segment column — confirmed via an existing backend test. Filter queries (`BulkEmailService::recipientQuery`) don't normalise either. A CSV-embedded `"Asia"` and a manually-entered `"asia"` will show up as separate, non-matching markets. Flagged back to backend; frontend intentionally shows whatever `/markets` returns at face value rather than guessing a client-side fix for a server-side data-integrity issue.

---

### ✅ Admin Panel — eBay in the Report, Report Export, Fulfilment Queue (2026-08-14)

Backend session 87 (`f25ca2a`, no migration, one new route). **One number
already on screen changed meaning**, which is the part worth reading.

| Feature | Notes |
|---|---|
| **Website vs eBay in the report** | Each metric now has three datasets (`all`/`normal`/`ebay`), so datasets are selected by **metric first, then channel** — `toRows()` takes `{metric, channel}` pairs rather than bare metric names. A **Combined / Website vs eBay** toggle appears only when the server actually split the channels: `channel_split` is false when one channel was requested, and offering the comparison then would draw a legend full of lines that aren't there. In split view each metric gets its own chart of website vs eBay — **still exactly two series per chart**, so money and counts never share an axis and every chart stays inside the validated two-colour pair |
| **Report export** — `orders.export`, not `orders.view` | A real `<a href>`, not a fetch: the response is a streamed attachment. Carries the current filter state so the file matches the screen it was taken from. **Hidden for `support`**, who can read the report and cannot export it — verified by rendering the page under both roles rather than reasoned about. Gated with the hook's own `can()` rather than `canDo(role, …)`, because `can()` also returns false while the role cookie is still being read, which is the documented guard against a flash of a control the user turns out not to have |
| **"In transit" changed meaning — and the board keeps the old figure readable** | It meant `shipped`; it now covers the whole fulfilment window. The count jumped on deploy **by design** — documents get issued before a container leaves as often as after, so a queue that only appeared after dispatch showed the work after the moment to do it had passed. The board gained **Ready to ship** and **Shipped** columns beside it, so the pre-change number is still there; `DEFINITIONS` was rewritten server-side and these render as tooltips, so the column explains its own new meaning with **no copy change on this side** |
| **The queue is two sections, not one list** | `/admin/orders/in-transit` (nav: "Fulfilment Queue") now fetches `?fulfilment_stage=ready_to_ship` and `?fulfilment_stage=in_transit` separately. They are different jobs — *raise the paperwork and move the status* against *this is on the water, chase the carrier* — and one list containing both gets worked in the wrong order. Ready-to-ship is first and accented: it is the half that used not to appear at all. Rebuilt as a lean `FulfilmentQueue` rather than reusing `OrdersTable`, because a work list is not a browsable index — no search, and no status/payment filters, since `fulfilment_stage` is already defined in terms of both and a second filter on top can only produce empty lists that look like bugs |

> **A false claim caught before it shipped.** The queue was written with
> `sort: "oldest"` and copy reading "Oldest first, because the queue is worked
> from the back" — which is how a queue *should* be ordered. The orders list has
> no `sort` parameter at all: it is `orderByDesc('created_at')`, hardcoded
> (`AdminOrderController:45`). The parameter was silently ignored and the
> sentence was simply untrue. Corrected to say newest first, which is what it
> does. **Deliberately not sorted client-side** — that would reorder the 25 rows
> already fetched and label the result "oldest" while the genuinely oldest orders
> sat on page two, which is a worse lie than the one being fixed.
> **Asked of backend: a `sort` parameter on the orders list**, so a queue can be
> worked from the end that matters.

---

### ✅ Admin Panel — Clients Drill-down, Transaction Report, Invoice Register (2026-08-14)

Backend session 86 (`54c508b`, one additive migration, five endpoints). Extends
what session 83 built; the board and reconciliation needed no change.

| Feature | Notes |
|---|---|
| **The board's Clients figure opens** — `/admin/operations/clients` | Every client figure is now a link, including the All-channels one. `meta.total` is guaranteed equal to the board's figure by a backend test, so this page is the *check* on that number rather than a second opinion about it — which is why nothing is filtered or counted client-side beyond what the query asked for. **`has_account: false` is rendered as a labelled state, not a missing link:** plenty of confirmed orders belong to buyers who never registered, `customer_id` is null for those, and a customer link would 404 — so the e-mail is shown as the identity and the link is simply absent. Per-client drawer shows their orders, with `totals.in_transit` given its own accented tile since it is the only actionable figure there (those are the orders needing documents). A 404 `no_orders_in_period` is rendered as the real state it is — "they exist, just not in this window" — rather than an empty table |
| **Transaction report** — `/admin/operations/report` | `series` is fed in **as served** and never rebuilt from `periods`: two places that aggregate are two places that can disagree about a number the business is reading. `change` renders as stat tiles above the charts, `periods` as a table below (behind a "Show table" toggle, so no value is reachable only by hovering). **`percent: null` off a zero baseline renders "new", never "+100%"** — a change from nothing is undefined, not large. Empty periods are plotted **as zeros**, because a dropped bucket makes "we sold nothing in June" and "June is missing" look identical. `totals.clients` is labelled as counted across the whole range, so its being smaller than the column sum reads as intended rather than as a bug |
| **Charts: one unit per chart, never a shared axis** | `amount` is money and the rest are counts. A dual axis is the single most misleading thing a chart can do — two lines crossing implies a relationship that exists only because of how the two scales were chosen. Drawn as small multiples instead: orders sent vs confirmed together (same unit, the comparison that matters, and **exactly the two-series pair the palette was validated for**), amount alone, clients alone. Palette re-validated rather than assumed: `#E85C1A,#2a78d6` on `#ffffff` — lightness PASS · chroma PASS · CVD ΔE 26.3 · normal-vision ΔE 34.2 · contrast PASS. Legend only when there is more than one series |
| **Finance can attach the sevDesk PDF** | File input is on the **create form**, not only the row: finance has the PDF in front of them while typing the number, and a separate "now attach it" step is one that gets skipped. Multipart when a file rides along, JSON otherwise. **A 201 that still carries a message is not shown as a plain success** — the record saved and the file didn't, which is a different outcome. `has_file=no` is a one-click "Missing document" queue, deliberately outside the system tabs so it survives a server that doesn't serve `meta.systems`. No download control when `has_file` is false, since that endpoint 404s and a button that always fails teaches people to distrust the ones that work |
| **Both sides of the comparison in one register** | Rows now carry `system` and `auto_registered`. **Auto-registered rows render read-only** — the edit and delete controls are absent rather than present-and-failing, and a 409 that arrives anyway shows the server's message verbatim, because it explains that the row follows the document and deleting it would only mean it reappears. The create dropdown is driven off **`meta.manual_systems`**, so `okelcor` is never offered (sending it is a deliberate 422 — it would put a number on our side that nothing on our side issued). System tabs are driven off `meta.systems`, so a new system needs no frontend deploy; `okelcor` is labelled **"Ours"** rather than "Okelcor", since beside "sevDesk" the brand name reads as a second vendor rather than as us |

> **Two chart defects found by rendering the page, both invisible to every check.**
> **(1) The lines were not drawn at all.** Recharts animates a line in from
> `stroke-dasharray: 0`, and the paths sat at frame zero — correct geometry,
> nothing visible. In a real browser rAF finishes it, so this is *mostly* a
> screenshot artefact, but not only: a chart in a background tab renders empty
> until it is focused. `isAnimationActive={false}` on a reporting surface costs
> nothing and makes the figures present the moment the panel is.
> **⚠️ `components/admin/behaviour-analytics.tsx` has the same latent issue** and
> was deliberately not changed in this pass — it is outside this session's scope
> — but it is worth one line when that page is next touched, and it compounds the
> standing backlog item that the page has never been looked at with data in it.
> **(2) Smoothed curves were asserting values that don't exist.** `type="monotone"`
> through discrete monthly buckets draws a shape between them; around the zero
> month it turned "4 orders, then none, then 4" into a gentle decline that never
> happened. Now `type="linear"`.

---

### ✅ Admin Panel — Operations Board, Dual Sign-off, eBay Split (2026-08-13)

Backend session 83 (`657049d`, four migrations, nine endpoints, one new role).
Everything additive — no existing endpoint changed shape. Built in backend's
stated priority order.

| Feature | Notes |
|---|---|
| **Operations board** — `/admin/operations` | The finance director's grid: one row per channel, seven columns, served `total` row. **Nothing is summed, converted or recomputed here** — the three things most likely to be reported as bugs are all deliberate and each is labelled *in place* rather than left to be rediscovered: `total.clients` is not the sum of the rows (one buyer on two channels is one client), `amount` is EUR with other currencies listed beneath and never converted, and `invoice_variance` is rendered as the finding it is — non-zero gets a colour **and** a sign **and** an icon, and links through to the reconciliation carrying the period it was showing. `definitions` render verbatim as header tooltips plus a disclosure; paraphrasing them would reintroduce exactly the ambiguity they were written to end. `finance_recording_available: false` prints "not switched on yet", never `0` — a structural zero and a real one start different arguments |
| **In-transit queue** — `/admin/orders/in-transit` | `orders?in_transit=1`. Status and payment filters deliberately not offered: `in_transit` is already defined as a payment-and-dispatch state server-side, so a second status filter on top can only produce empty lists that look like bugs. **The "documents sent?" column backend suggested is not built, because the data isn't there** — see the finding below |
| **Dual sign-off panel** — order detail, Documents tab | All four `status` values render distinctly; `not_required` says the order predates the rule, since an empty panel would read as "nobody has signed yet" — a different and more alarming statement. One button or none, never two disabled ones. 403 and 409 are told apart in the UI ("Not your signature to give" vs "Not right now") because entitlement is checked per slot in the service rather than by route middleware. History behind a disclosure. Sits on the Documents tab rather than its own: the thing it gates is a document |
| **eBay split** | Orders page now asks for `channel=normal`; new `/admin/orders/ebay` asks for `channel=ebay`. Built on `/admin/orders`, **not** the existing `/admin/ebay/orders`, which sits behind `ebay.manage` and would 403 every order manager who works these orders. `meta.channel_counts.ebay` drives a banner on the Orders page — a filter the user didn't set and can't see is worse than the mixed list it replaced, so the count travels with the split and says where the orders went |
| **Finance invoices** — `/admin/finance-invoices` | Table, entry form, edit/delete, and the reconciliation behind a tab. `amount_mismatch` gets **its own section**, not just a count: two systems holding the same invoice at different money is a worse finding than one holding it alone, and it is invisible from the board. `order_known_here: false` is labelled "not an order here" rather than hidden — that row is exactly the one worth recording. Duplicate `external_number` lands as a field error, where it belongs |
| **Role picker — all nine roles** | Was a hardcoded four-value subset, which matched reality rather than intent: `admin_users.role` was a MySQL ENUM that could store only those four, so offering the rest would have produced a save that failed. The column is now a plain string, so the five it had been silently refusing are assignable. Driven off `ALL_ROLES` so the list cannot drift from the permission map again |
| **Documents: gates became overridable, not dead ends** | The three payment-stage gates rendered a disabled `<span>` — a refusal with no way forward. They are now pressable, the **server** decides, and a 409 carrying `overridable: true` opens a confirm dialog with a required reason (`override_gate` + `override_reason`). The gates exist for a real reason — session 76, a buyer e-mailed about a deposit nobody asked for — but a refusal the accountable person cannot override just moves the work outside the system, where nothing is recorded at all. Sending an `order_confirmation` now also handles `409 signoff_incomplete` as its own state: nothing is broken, two people simply have to sign first |
| **`signoffs_withdrawn` toast** | Any edit that moves the order total revokes both signatures server-side whether or not anything is shown. Amber, dismissible, does **not** auto-hide — it reports something that already happened and needs redoing |
| New: `lib/admin-proxy.ts` | Shared base URL / token / pass-through for the six new proxies. **Forwards the upstream status untouched**, which the whole session depends on: a proxy that flattens 403 and 409 into 500 makes "role problem" and "state problem" indistinguishable |

> **Two contract findings, both from reading `~/dev/okelcor-api` rather than the note.**
>
> **1. `you_may_sign` is not on the order detail payload.** The note says the block is
> embedded "so the order page needs no second request" *and* "drive the button off
> `you_may_sign`" — but that field is added only in `AdminOrderSignoffController:39`;
> the shared `state()` the order detail calls (`AdminOrderController:820`) does not
> include it. **Nor can it be derived client-side:** `canSign()` compares
> `admin_user_id` to enforce the two-different-people rule, and the slots carry a
> display *name*. So the panel paints from the embedded block (instant, all four
> states, no spinner) and fetches `/signoffs` for the single question of which button
> to offer. **Asked of backend: add `you_may_sign` to `state()` and the second request
> disappears.** Withdrawal is different and *is* decided here — `OrderSignoffService:291`
> checks the slot permission or `orders.signoff_bypass` and nothing else, and the slot
> carries its `permission`, so the same check can be made from the same facts.
>
> **2. The order *list* row carries no document state.** The note suggests the
> in-transit queue take a "documents sent?" column "from the existing `trade_documents`
> payload" — but `formatOrderList()` (`AdminOrderController:785`) returns no such
> field; documents are on the *detail* payload only. Building it would mean one request
> per row. **Not faked, and not silently dropped:** the queue says plainly that the list
> doesn't carry document state. **Asked of backend: one field on the list row** — a
> count, or `last_document_sent_at` — would make the column real.

> **`orders.view` diverges from the backend, in both directions.** Backend grants it to
> `super_admin, admin, order_manager, sales_manager, **finance**`; this repo had
> `… **support**` and no finance. **`finance` was added — the sign-off feature depends
> on it**, since a finance admin must reach the order page to sign. **`support` was
> left**: removing it takes Orders away from a role that has it in the UI today, which
> is a product decision rather than a typo, and it is *already* a live divergence
> (support is shown orders the server would 403). Same shape as the `analytics.view`
> finding still open below. Worth settling both in one pass.

---

### ✅ Admin Panel — Orders & Documents (DOC series)

| Feature | Commit | Notes |
|---|---|---|
| Orders table + detail | early | |
| DOC-1 — Order Confirmation (AB) stage | `3d7ed95` | Before Proforma Invoice |
| DOC-4 — Public document verification page | `85b7aee` | Token-based, no auth |
| DOC-5 — Financial lock + approval/revision | `a5651f3` | |
| DOC-6 — Customer order confirmation acceptance | `c52ac1b` | Accept + Decline (customer + admin) |
| DOC-7 — Payment milestone workflow | `a1ef863` | 6-stage: pending_proforma → shipment_released |
| DOC-8 — Payment milestone email notifications | `8c8acd4` | Per-stage email status + Resend |
| DOC-9 — Admin order workflow command center | `89f4cb5` | 12-rule priority chain, 6-tab nav, attention badges |
| Trade documents — Packing List | `d7caa08` | Generate + view |
| Trade documents — Delivery Note | `4255f03` | Generate + view |
| Trade documents — Commercial Invoice | `2abc6ec` | Generate + view |
| Trade documents — Shipment doc uploads | `0c681cf` | Upload / delete / view inline |
| Trade documents — Send by email | `2abc6ec` | Modal + backend proxy |
| Superseded / void document handling | `56891e9` | Admin sees dimmed; customer filtered |
| Logistics dashboard v2 | `af5038c` | 9 summary cards, eBay + payment stage filters |
| Signed Proforma Invoice return | 2026-07-03 | Legal paper-trail: Proforma PDF now has a Date/Signature/Stamp block. Customer order page — once a `proforma_invoice` doc exists and no `proforma_signed` one does, shows a prompt + file upload (pdf/jpg/jpeg/png, max 20MB) → `POST /api/account/orders/{ref}/proforma/signed-copy`; swaps to a "✓ Signed copy received" confirmation once uploaded (optimistic local state, no page reload). Uploaded copy appears as a normal entry in `trade_documents` (downloads via the existing generic document-download proxy — no new download route). Admin side: "Signed" badge on the Proforma Invoice row when a signed copy exists |
| Signed Proposal return | 2026-07-03 | Same paper-trail pattern, one stage earlier: Proposal PDF also has a Date/Signature/Stamp block. `QuoteAcceptanceActions` (`/account/quotes/[ref]`) gets an "Upload signed copy instead" file picker next to Accept/Decline → `POST /api/account/quotes/{ref}/proposal/signed-copy` (new proxy); **this is itself an acceptance** — 201 sets local status to `accepted`, same as clicking Accept (no separate state to handle). 422/410 (no active proposal / expired) surfaced as inline errors. Admin: `AdminQuoteFull.proposal_signed_copy_download_url` + a "Signed" badge and download row in the accepted-state block of `ProposalCard` |
| Payment-gated documents — expanded | 2026-07-03 | Packing List, Delivery Note, and Shipment Documents now follow the same full-payment gate as the Commercial Invoice (hidden from `trade_documents` until `balance_paid`/`shipment_released`/`paid`). Server-side only — confirmed no client-side logic assumed pre-payment visibility, so no FE change needed |
| **Payments session 76 — mark-paid, deliberate deposit requests, free-text document filing, EU certificate unblocked** | 2026-08-11 | Answers backend's session-76 note (migration #31), all four actionable items. **(1) Manual orders can be marked paid.** `mark-paid` demanded `payment_method === "bank_transfer"`, which no admin-created order has (`payment_method` is null on those), so it 422'd on every one — leaving "tick paid on the creation form" as the only route to a paid order, i.e. declaring receipt before the money arrived. That is the order manager's "the order marked itself paid". Gate is now `payment_method !== "stripe"` (the sole backend refusal, `gateway_managed_payment`) **plus `payments.mark_paid`**, which the button never checked before despite the route requiring it. The Add Historical Order form now **defaults `payment_status` to `pending`**, with copy stating that `paid` records receipt nobody verified — still correct for a genuinely settled backfill, but now a choice rather than the default. `getNextAction` no longer misses these orders ("Awaiting payment"). **(2) Deposit requests are a deliberate act.** Generating a proforma used to call `setDepositMilestones()`, advancing the stage and e-mailing the customer — issuing a document asked for money. New `request-deposit` proxy + a form on the milestones card in the `pending_proforma` resting state: percentage **or** an agreed round amount (which wins, percent derived), a **visible, unticked "Also e-mail the customer"** checkbox (never a hidden default — the common case is recording a deposit already agreed by phone, where a duplicate request is worse than silence), and a 500-char audit note. All three documented failures are mapped to operator-language messages by `code`, not dumped: `invalid_payment_stage` (409), `deposit_exceeds_total`, `order_total_missing`. Also added **"Deposit already received"** — `deposit-paid` now accepts `pending_proforma` and backfills the split, so money that simply arrived can be recorded without pressing "request" first; the deposit/balance figures moved from props to state so the backfilled numbers render immediately. **The unsent-notification state is no longer amber.** With silence now a legitimate choice, "⚠ Email not sent / Resend" cried failure on a deliberate decision; it reads "Customer not notified / Send now" in neutral grey. It was already restricted to reached stages — the screenshot's five Resend controls could not be reproduced from this component. **(3) Nothing is unfileable.** "File as" (`type_label`) has always been free text server-side (max 100, no allowlist) — the closed dropdown was purely frontend. Now a combo box (`<datalist>`) seeded from `file_as_suggestions` (labels this Okelcor actually used) with local starters appended, never displacing real history. "Document type" stays controlled since it drives supersede/payment-gating/customer visibility, but is **rendered from `GET /admin/trade-documents/upload-options`**, so a type added server-side needs no frontend deploy; it ends in `other`, whose `custom_label_required` is enforced client-side. Falls back to a built-in list on 404/405 so the dialog still works un-deployed. **(4) The EU entry certificate was refused to exactly the customers who need it.** The Sign gate read `payment_status === "paid"`, but a milestone order settles through `payment_stage` and never writes `payment_status` — it stays `pending` for life, so every reverse-charge EU B2B order on deposit-and-balance terms was permanently blocked: paid in full, delivered, told to complete payment first. Without the certificate the zero-rating is unsupported in a tax audit. Now driven by backend's `declaration_can_sign`; the legacy fallback (for a payload predating the field) checks `payment_stage` as well as `payment_status` so it cannot reproduce the bug either. Customer milestone panel gated on **`payment_milestones_active`** per backend's instruction. **Verified:** scoped `tsc` 0 errors · **ESLint 0 errors 0 warnings — and ESLint now runs, for the first time in three sessions** (the repo is off iCloud) |
| Order currency (EUR/USD) | 2026-07-17 | A manually-entered order had been paid in USD; the whole order model implicitly assumed EUR (hardcoded `€` everywhere, no `currency` field). Added `AdminOrder.currency`, a Currency dropdown (EUR/USD) in the order edit tab's "Order Status & Shipment" panel saved through the existing `PATCH /admin/orders/{id}/status` call, and switched order total/items/orders-table/Payment Milestones amounts to a shared `formatMoney()` (`lib/currency.ts`) keyed off the order's currency. Relabel only, no FX conversion. ⏳ Backend: add `currency` column + accept/return it — `docs/BACKEND_NOTE_order_currency.md` |
| **FIX** — Payment milestone routes were 404ing in production | `6b82e3a` | Frontend was calling `orders/{id}/payments/mark-*` — a path confirmed to not exist anywhere on the backend (no legacy route registered). All five payment-milestone action buttons (deposit paid, balance due, balance paid, release shipment, resend email) were non-functional. Corrected to the real backend routes, `orders/{id}/payment-milestones/{deposit-paid,balance-due,balance-paid,release-shipment,resend-email}`, in both the 5 Next.js proxy routes (moved, not just edited — Next.js ties URL to folder structure) and `payment-milestones-card.tsx` |
| Mark Balance Paid — also gated on `deposit_paid` | `6b82e3a` | Previously only showed at `balance_due`. Backend's `markBalancePaid` explicitly accepts the transition directly from `deposit_paid` too — lets an order manager record "customer already paid in full" without a forced intermediate step |
| "Processing" order status | `6b82e3a` | Added to the order edit dropdown (already a valid, already-used backend value). Caught and fixed a second, separately-duplicated `OrderStatus` type (`app/admin/orders/actions.ts`) that would have silently rejected it even after the dropdown was fixed |
| Trade document upload — "File as" type selector | `6b82e3a` | New dropdown (order_confirmation / proforma / commercial_invoice / packing_list / delivery_note / shipment_document), defaults to `shipment_document` so existing uploads are unaffected — lets an order manager file an externally-produced document (e.g. from an accountant) as its real type instead of always landing in the generic bucket |
| Order line-item editing (correcting wrong figures) | 2026-07-15 | Fixes "no way to fix a wrong price/quantity/product name on a manual order" — previously only the delivery fee was correctable. **Unlocked orders** (`financials_locked` false, `source !== "ebay"`): inline Edit/Delete per row + "Add Item" on the Order Items table → `POST/PATCH/DELETE /admin/orders/{id}/items[/{itemId}]`, `reason` required and shown as a visible field on every mutation (writes to the order audit log), disabled Delete when only one item remains (`cannot_delete_last_item`). **Locked orders**: existing Request Financial Revision modal (DOC-5, `a5651f3`) extended with per-item correction rows, a repeatable "New Items" section, and remove checkboxes → `changes.items`/`changes.new_items`/`changes.remove_item_ids` alongside the existing `delivery_fee`; client-side guard mirrors `revision_would_empty_order` before submit. eBay orders (`source === "ebay"`) get neither path — banner only, matching the backend's 403 `ebay_order_not_editable` enforcement. All mutations `router.refresh()` to pull corrected totals |
| Historical order backfill (admin) | 2026-07-14 | For customers Okelcor already had a relationship with before being onboarded to the system. New `POST /admin/orders` (`orders.update`) — "Add Historical Order" button on the customer detail page's Order History card (`components/admin/add-historical-order-modal.tsx`) opens a 2-step flow: **step 1** order details (ref optional, order date, shipping details, status incl. `processing`, payment status `pending/paid/failed/refunded`, explicit payment-stage picker — `paid` alone defaults server-side to `balance_paid`, so mid-flight orders must set `deposit_paid`/`balance_due` themselves —, carrier/carrier type/tracking number/container number, admin notes, itemized line items or flat total); **step 2** repeatable document-upload rows (type label incl. free-text "Other", notes, file — reuses the existing `POST /admin/orders/{id}/trade-documents/upload` proxy, one call per file) so real invoices/BOLs get attached in the same flow rather than regenerated — per backend, "Generate…" endpoints must never be used for historical orders. 409 `document_generation_blocked_payment_stage` and the payment-gated visibility rule (uploads accepted but hidden from the customer's portal until fully paid) surfaced inline. "Skip for now" / "Done" both proceed to the new order's detail page, where Documents (`TradeDocumentsCard`) and Shipment tracking (Logistics tab, `ShipmentEventManager` + Track Shipment) already existed — no new UI needed there. Customer portal visibility needed no changes — orders match a customer purely by e-mail, already live. **Open item:** `/account/orders` (list page) fetches `GET {API}/orders?email=` directly in a Server Component rather than the `GET /auth/orders` bearer-scoped route the backend note names — pre-dates the API-proxy convention, confirmed working today, left unchanged pending a decision (see chat) |

---

### ✅ Admin Panel — eBay Integration (EB series)

| Feature | Commit | Notes |
|---|---|---|
| EB-1 — OAuth connection UI + token stability | `175ab23` | Connect/disconnect flow |
| EB-2 — Listing status tracking, RBAC gates, sync logs | `0f57e91` | |
| EB-3 — Price/title update sync + bulk update | `a48de19` | Stale indicator |
| EB-4 — Setup & readiness checklist | `29490c7` | Test connection |
| EB-5 — eBay order status sync | `d516c68` | eBay Orders tab in admin |
| Business policies fetch + display | `533e3af` | Copy policy IDs from panel |
| eBay error 932 fix — quarantine `lib/ebay.ts` | `1a03d1b` | All actions via Laravel backend |
| eBay 502 errors — surface real backend messages | `a4cb50a` | |

---

### ✅ Admin Panel — Supplier Intel

| Feature | Commit | Notes |
|---|---|---|
| Supplier Intel — eBay market search + Alibaba link | early | `components/admin/supplier-intel.tsx` — direct-to-Laravel client calls (pre-existing pattern, preserved as-is rather than retrofitted to the API-proxy convention) |
| Type-aware search + for-product flow | 2026-07-17 | Backend fixed the query builder: TBR's decimal rim sizes (`295/80R22.5`) and OTR sizes (`23.5R25`/`20.5-25`) weren't recognised by the old passenger-tyre-only regex, so those two categories returned poor/empty results; OTR isn't a real eBay category at all, so the eBay call is now skipped for it server-side with an explanatory `note`. Frontend: added PCR/TBR/Used/OTR type tabs wired to the new optional `type` param on `GET /admin/supplier/search` (omitting it still works exactly as before — additive only); new "Check market for this product" button calls `GET /admin/supplier/for-product/{id}` to search straight from a catalogue product instead of copy-pasting brand/size by hand; results now show a summary stats strip (count/avg/range) and an OTR-aware empty state instead of a generic "no results" one. `PriceStrip` gained a `price_vs_market_pct` cell, explicitly labelled "Resale-price benchmark only — not a wholesale-cost analysis" per backend's own caveat (eBay listings are retail, not Okelcor's wholesale cost) |
| Made-in-China marketplace link | 2026-07-17 | New `GET /admin/supplier/made-in-china-link` (same shape as the existing `alibaba-link`) — second "Search on Made-in-China.com" button alongside the Alibaba one; both buttons now prefer the `marketplace_links` returned inline on the search response, falling back to the dedicated link endpoints only when that's absent |

---

### ✅ Admin Panel — Customer Behaviour Analytics (2026-08-12)

Backend session 79 (`05f359e`, migration #32) records every catalogue search the
site already makes — **no instrumentation, no events, no SDK on this side.** New
page `/admin/analytics/behaviour` answers "what are customers looking for, and
what can't we give them".

| Feature | Notes |
|---|---|
| `components/admin/behaviour-analytics.tsx` + `lib/behaviour-analytics.ts` + one proxy | Built in backend's stated priority order, which is deliberately **not** volume-first: unmet demand → demand-vs-stock → no-result rate → breakdowns. Everything is plotted as served; nothing is recomputed client-side |
| **Unmet demand is the top card**, styled as the only accented panel | Every row is a product to stock or a term the catalogue doesn't recognise. It's the one list that changes a purchasing decision, so it outranks the charts — a volume chart at the top would bury it |
| Demand-vs-stock filtered to `status !== "available"` | `all_out_of_stock` (red, "Restock") and `not_stocked` (amber, "Range decision") are **different actions**, so they carry different labels, and each ships a dot **and** a word — never colour alone. Rendered as tinted badges with dark text rather than raw status hues, which keeps text clear of contrast limits (`#fab219` measures 1.83:1 on white) |
| `meta.not_covered` printed under the title | A screen called "customer behaviour" that silently omits page views invites the reader to conclude they aren't happening. Turned into navigation rather than a disclaimer: it links to `/admin/analytics`, the GA/PostHog page that **does** cover them |
| **The funnel is three figures side by side, never a narrowing graphic** | Searches are anonymous, orders are not, nothing is joined. A funnel with arrows would assert individual journeys the data can't support. Per-visitor figures are labelled "Proportion, not a conversion path", and `funnel.note` is printed verbatim |
| `available: false` shows the reason, not an empty chart | An empty chart asserts "customers aren't searching". The panel says nothing has been *collected* yet, names the collecting-since date, and adds that a week is when the lists start to mean something |
| Charts | Two-series day chart (searches vs found-nothing) with a **"Show table" twin** so no value is reachable only by hovering; zero days plotted **as zeros** since `daily` is gap-free on purpose and a gap would read as missing data. Rim size as the lead bar chart. Single-series bars use **one hue for every bar** — colouring bars by their own value would re-encode what bar length already shows |
| Palette **validated, not eyeballed** | `#E85C1A` (admin accent) + `#2a78d6`, run through the dataviz validator against the real `#ffffff` card surface: lightness band PASS · chroma PASS · CVD ΔE 26.3 (≥8) · normal-vision ΔE 34.2 (≥15) · contrast 3.51:1 / 4.42:1 (≥3:1). **No dark mode invented** — the admin has zero `dark:` utilities, so a second palette would have been fiction |
| Refetch holds the previous render at 60% opacity | No skeleton flash, no layout jump when the range changes |
| RBAC — **its own `behaviour` section** | Roles copied verbatim from the backend (`super_admin, admin, order_manager, editor`). Deliberately **not** folded into the existing `analytics` section: see the divergence note below |
| AI insights `behaviour` category | **Confirmed needing no change, not assumed:** `AdminInsightCategory` is `… | string` and `categoryLabel()` falls back to a capitalised label, so a `behaviour` insight renders as "Behaviour" on its own |

> **RBAC divergence found while wiring this (worth telling backend).** The backend
> grants `analytics.view` to **`super_admin, admin, order_manager, editor`**
> (`AdminPermissions.php:96`); this repo's map grants it to
> **`super_admin, admin, sales_manager`**. Both directions are wrong: `order_manager`
> and `editor` are authorised server-side but hidden client-side, and `sales_manager`
> is shown a page the server would 403 — and `sales_manager` **cannot even be stored**,
> since `admin_users.role` is a DB ENUM missing it (same finding as the partner-sales
> pass). **Deliberately not "fixed" in this pass:** `analytics.view` is defined but
> **never consumed** anywhere in the frontend, so the divergence has no live effect
> today, and the `analytics` *section* it sits beside also gates the Google
> Analytics page — widening that would hand GA data to two more roles, which is a
> business decision, not a typo. The new page sidesteps it entirely with its own
> section. Flagged for a joint decision on which list is canonical.

> **`X-Okelcor-Visitor` — not implemented, and it needs a decision.** Backend's
> optional header would make unique-visitor counts accurate (every request reaches
> them via our proxy, so they currently see the proxy's IP). **We do have the
> consent mechanism it requires** — `lib/cookie-consent.ts` (`getConsent()` →
> `accepted | rejected | null`), already gating GA and PostHog — so gating on
> `accepted` is a small change. Not done unilaterally because it stores a new
> identifier in public visitors' browsers and may need a line in the privacy
> policy; backend called it "a consent decision, not a technical one" and that
> decision isn't ours. Everything on the page works without it; only unique-visitor
> precision is affected.

---

### ✅ Admin Panel — AI Insights

Idea: a Gemini-powered scheduled job (backend, every 15 min) summarizes the
same aggregate numbers already behind the dashboard into a handful of short
natural-language observations, surfaced as a topbar bell + popup toasts —
"what's going on" without an admin having to piece it together from six cards.

| Feature | Notes |
|---|---|
| `components/admin/insights-bell.tsx` | 2026-07-18 · Topbar sparkle-icon bell (own identity, distinct from the plain notifications bell) — badge + dropdown of current insights (severity-tinted chip, category, headline, deep link, dismiss/clear-all) plus up to 2 popup toasts (top-right, ~9s auto-dismiss) for anything not already seen in that browser, tracked client-side via `localStorage` (no dismiss endpoint exists or is needed) |
| `lib/admin-insights.ts` + `lib/admin-api.ts` | Severity styles, category labels (`revenue`\|`orders`\|`inventory`\|`security`\|`quotes`), bold-span renderer (currently unused — backend's `detail` ships as plain text, kept as a harmless no-op passthrough in case that changes), `AdminInsight` types |
| `/api/admin/insights` proxy | Degrades to `{ data: [], generated_at: null }` — which is also the exact real state today: backend's pipeline (scheduled job, DB table, endpoint) is live, but **`GEMINI_API_KEY` isn't set in production yet**, so it silently no-ops every cycle. Nothing left to do on either side — it activates the moment that key is added |
| Traffic category | Proposed, not built — no PostHog integration exists on the Laravel side to summarize. Would need a separate proposal (PostHog personal API key + new backend query layer); not blocking |

Full proposal history + backend's confirmed contract: `docs/BACKEND_NOTE_ai_insights.md`.

---

### ✅ Shipment Tracking — Carrier-based (GLS/DHL/ocean freight) — frontend

**Traccar/GPS own-fleet tracking was removed backend-side (2026-07-03; live, verified against
real orders) in favour of real carrier tracking, which is simpler and doesn't need a fleet at
all.** All fleet-only frontend was removed to match: admin fleet dashboard (`/admin/tracking`,
map/device-list/route-trip playback/geofences), the "Assign tracking device" + "Set destination"
controls on the admin order page, and `gps_live` mode (live map, ETA countdown/progress bar) on
the customer side — none of those backend endpoints exist anymore (404). `mode` on the customer
tracking payload is now always `"carrier"`.

| Feature | Notes |
|---|---|
| Admin order page — Overview tab | **Carrier / Carrier Type / Tracking Number** editable fields (`order-detail.tsx:992-1029`) — the one field admin needs to fill in for tracking to work at all. `carrier_type`: `sea`, `air`, `dhl`, `road`, `truck` (`bus` retired). eBay orders auto-backfill carrier/tracking from eBay's own fulfillment record hourly, never overriding a manual entry — same fields, no separate eBay UI |
| Admin order page — Logistics tab | Manual shipment-event log (`ShipmentEventManager` — `POST/PUT/DELETE /admin/orders/{id}/shipment-events`, predates this series, commit `9465e6e`) — optional, for hand-adding/annotating events on top of the carrier sync |
| Admin order page — Order Summary | **Track Shipment** button (`components/admin/tracking/track-shipment-control.tsx`, gated on `canDo(adminRole,"tracking.view")`) — on-demand modal calling `GET /api/admin/orders/{id}/shipment-tracking` (live carrier-API call + persists new events, confirmed working for GLS/DHL/ocean; always returns a usable response incl. `tracking_url` even if the live call fails — only errors when there's no carrier/tracking at all); 3-node stage stepper + shipping overview + "Track on {carrier}'s site ↗" link + newest-first event list (empty state when none synced/entered yet) |
| Customer order page | Unified `OrderTracking` component (`components/account/order-tracking.tsx`) — status hero, 4-step stepper, shipment details incl. "Track on {carrier}'s site ↗" deep link (`tracking_url`, works even with zero events), event timeline with empty state. Polls `/api/account/orders/[ref]/tracking` 30s while shipped, stops on delivered |
| `CustomerTracking` type (`lib/tracking.ts`) | Single shape now: `available:false` (`reason`) or `available:true, mode:"carrier"` with `carrier`/`tracking_number`/`stage`/`tracking_url`/`events`. Trimmed of all GPS-only types (`Device`, `Trip`, `Geofence`, `Position`, `DeliveryEta`) and helpers (`formatCountdown`, `statusStyle`, `parseWkt`, `centroid`, `formatSpeed`, `formatDuration`, `lastSeen`) |
| eBay tracking | eBay's Sell API never exposes the detailed event history to sellers (carrier code + tracking number + ship date only) — not a gap to fix, our own carrier sync covers it since a GLS-carried eBay order reads from the same GLS feed eBay does |
| Removed | `app/admin/tracking/`, `components/admin/tracking/{fleet-dashboard,assign-device-control,set-destination-control}.tsx`, `components/tracking/{fleet-map,delivery-map,location-picker-map}.tsx`, `app/api/admin/tracking/**` (7 routes), `tracking` RBAC section/nav entry, `tracking_device_id`/`dest_lat`/`dest_lon` on `AdminOrderFull`. `tracking.view` permission kept (still gates the Track Shipment refresh) |
| DPD added as recognized carrier | 2026-07-06 | `tracking_url` now resolves for DPD (alongside GLS/DHL/Maersk) — no frontend code change required, the existing "render `tracking_url` if present" logic just starts working for DPD orders. DPD lacks live event auto-sync (no API credentials yet), so `events` stays empty for DPD orders — only the tracking link works for now. See `docs/FRONTEND_NOTE_tracking.md` |

---

### ✅ Admin Panel — Security (SEC series)

| Feature | Commit | Notes |
|---|---|---|
| Security dashboard (2FA adoption, login history) | `213502c` | |
| SEC-3A — In-memory rate limiting (10 routes) | `213502c` | IP-based token bucket |
| Admin upload size cap (50 MB) | `213502c` | |
| `deleteAllProducts` confirmation token | `213502c` | Server-side enforcement |
| Mollie webhook secret check | `213502c` | Env-gated |

---

### ✅ CRM Suite (CRM-1 → CRM-7)

| Feature | Commit | Status |
|---|---|---|
| CRM-1 — Controlled B2B customer onboarding | `39fc8bc` | ✅ Complete |
| CRM-2 — Inquiry quality filtering | `61ddac4` | ✅ Complete |
| CRM-3 — Lead qualification & sales pipeline | `d283e74` | ✅ Complete |
| CRM-3 — Admin notifications bell (lead assignment) | `972859b` | ✅ Frontend complete |
| CRM-3B — Notification center & assignment work queue | `6d3ca6d` | ✅ Frontend complete |
| CRM-4 — Customer segmentation & access control | `cc2cab5` | ✅ Complete |
| CRM-5 — Customer data quality & deduplication | `62850bc` | ✅ Complete |
| CRM-6 — Communication timeline & follow-up automation | `6fd6f58` | ✅ Complete |
| CRM-6B — Rich e-mail compose/reply, signature, customer messaging portal | 2026-07-14 | ✅ Complete (backend confirmed built + tested) |
| CRM-6C — WhatsApp Business integration | 2026-07-15 | ✅ Complete (backend confirmed built + tested; depends on account-side Meta setup before real sends work) |
| CRM-7 — Proposal management & customer acceptance | `224ab1c` | ✅ Frontend complete |
| CRM-8 — Buyer approval & customer lifecycle | `8c85cc0` | ✅ Frontend complete |

#### CRM-6C Detail — WhatsApp Business Integration

WhatsApp as a second channel on the same `customer_communications` log CRM-6B built for e-mail (`type: "whatsapp"`, same `channel`/`attachments`/`staff_read_at`/`customer_read_at` fields). Two things genuinely new vs. e-mail: replies are **live** (webhook-driven, no portal-only workaround needed), and a first-time WhatsApp contact with no matching customer/quote auto-creates a lead — nothing to build for that specifically, it already surfaces in the existing quote-request inbox with `lead_source: "whatsapp"`.

| Sub-feature | Status |
|---|---|
| `Communication` type extended (`phone_number`, `whatsapp_message_id`, `whatsapp_status`, `whatsapp_template_name`); `LeadSource` gains `"whatsapp"`; `CustomerNotificationPreferences` gains `whatsapp_enabled` | ✅ |
| `components/admin/whatsapp-composer-modal.tsx` — plain textarea (not rich HTML — WhatsApp is plain text), no CC/subject/attachments (v1 scope). 24-hour-window failure (`502 whatsapp_send_failed`) surfaced as an amber "customer needs to message first" notice, not a generic error; `422 missing_recipient_phone` handled | ✅ |
| `CommunicationTimeline` — "WhatsApp" compose button (gated on `recipientPhone`), phone number + delivery ticks on outbound rows (✓ sent / ✓✓ delivered / ✓✓ blue read, matching WhatsApp's own visual language), template-name badge, auto-mark-read extended to inbound WhatsApp | ✅ |
| Wired into customer detail (`customer.phone`) and quote detail (`quote.phone`) pages | ✅ |
| Proxy routes: `customers/{id}` + `quote-requests/{id}` `communications/send-whatsapp` (JSON, no multipart needed) | ✅ |
| `lib/lead-source.ts` — `isSyntheticWhatsappEmail()`; quotes table + detail page render the `whatsapp+{phone}@no-email.okelcor.internal` placeholder as "No e-mail (WhatsApp lead)" instead of the raw address, and disable the (separate, pre-existing) template follow-up e-mail action for such leads | ✅ |
| `LeadSourceBadge` on the quotes table — small badge per `lead_source`, WhatsApp gets its own green icon variant | ✅ |
| Customer portal — `whatsapp_enabled` toggle in notification preferences (`components/account/notifications-center.tsx`), **defaults off** (unlike e-mail groups) per Meta's opt-in requirement, with a link to add a phone number if missing | ✅ |
| Not built (scope-flagged, not an oversight): admin document-send via WhatsApp (`WhatsAppService::sendDocument` exists service-side, no endpoint wired) — small addition if wanted; no "Lead Funnel Analytics" dashboard exists in this frontend at all yet, so there was nothing to add a WhatsApp entry to there | — |

#### CRM-6B Detail — Rich E-mail Compose/Reply, Signature, Customer Messaging

Extends the existing CRM-6 communication log with a **real send** path (manual "I called them" / "I emailed them" logging is untouched).

| Sub-feature | Status |
|---|---|
| `Communication` type extended (`channel`, `cc`, `attachments`, `message_id`, `in_reply_to`, `staff_read_at`, `customer_read_at`) | ✅ |
| Admin — `components/admin/signature-editor.tsx`: uncontrolled `contenteditable` (loaded once on mount, read only on Save) + `updateSignature` server action, `PUT /admin/profile/signature`, wired into `/admin/profile` | ✅ |
| Admin — `components/admin/email-composer-modal.tsx`: uncontrolled `contenteditable` body, CC chips (max 5), drag-drop attachments (max 5, 10MB each), reply threading (`in_reply_to_id`), inline 422/502 handling (`missing_recipient_email`, `email_send_failed` — failed sends still logged, not data loss) | ✅ |
| `CommunicationTimeline` — "Compose E-mail" button (gated on `recipientEmail`), per-row "Reply", cc/attachment/failed/unread rendering, auto-mark-read (`POST /admin/communications/{id}/read`) on load for inbound unread e-mails | ✅ |
| Wired into customer detail page (`customer.email`) and quote detail page (`quote.email`) | ✅ |
| Proxy routes: `customers/{id}` + `quote-requests/{id}` `communications/send-email` (multipart), `communications/{id}/read`, `communications/{id}/attachments/{index}/download` (binary passthrough) | ✅ |
| Customer portal — `/account/messages` (`components/account/messages-center.tsx`): expandable thread rows, reply (plain body + attachments — see 2026-07-16 below), attachment download, mark-read-on-open | ✅ |
| `components/account/messages-bell.tsx` — unread badge in navbar (polls list `meta.unread_count`, no dropdown — messages need the full reply flow) + "Messages" dashboard tile | ✅ |
| Proxy routes: `account/communications` (list), `communications/{id}/reply`, `communications/{id}/read`, `communications/{id}/attachments/{index}/download` | ✅ |
| **True inbound e-mail capture** (2026-07-16) — the gap flagged above is closed: a customer's actual e-mail reply now lands back in this same thread automatically (`direction: "inbound"`, `channel: "email"`), no new endpoint. Confirmed the existing generic rendering already needed zero changes: direction icon + label + orange unread highlight already distinguish inbound rows, and `NotifIcon`/`notifBody`/`notifLink` (`lib/admin-notifications.ts`) already fall back generically for unrecognized types, so the new `email_reply_received` admin notification type (added to `AdminNotificationType`, given its own `Mail` icon — cosmetic only) needed no allow-list change. Added the one genuinely new thing: `CommunicationTimeline` now polls every 30s while the panel is open and shows a dismissible "New reply received" banner when a live reply arrives with no admin action | ✅ |
| **Unified Inbox** (2026-07-16) — new `/admin/inbox` nav item (`components/admin/communications-inbox.tsx`, top-level nav group, gated on the new `crm.view` permission + `crm` section) against `GET /admin/communications/inbox` — every new customer reply across e-mail/WhatsApp in one paginated, unread-filterable list, without opening each customer profile. Rows show customer name (or "New inquiry" + amber badge when `customer_id` is null — an unmatched lead), channel icon, subject/preview, and link to `action_url` (`/admin/customers/{id}` or `/admin/quotes/{id}`); mark-read reuses the existing `communications/{id}/read` endpoint since it's the same underlying row as the per-customer thread. Added `crm.view` to the permission map (roles: super_admin/admin/order_manager/sales_manager, matching the existing `crm` section) since it wasn't previously defined | ✅ |
| **Customer portal reply attachments** (2026-07-16) — `/account/messages` reply box now supports file uploads (max 5, 10MB each, same allowed types as the admin composer); reply proxy switched from JSON to multipart passthrough | ✅ |

#### CRM-8 Detail

| Sub-feature | Commit | Status |
|---|---|---|
| `lib/crm8.ts` — tiers, verification, risk, approval-profile matrix, timeline labels | `8c85cc0` | ✅ |
| Admin nav + RBAC entry (`/admin/customer-approvals`, section `customers`) | `8c85cc0` | ✅ |
| Customer Approvals page — queues, summary cards, table, Access Requests tab | `8c85cc0` | ✅ |
| Buyer Lifecycle card (tier/risk/health, apply profile, approve, restrict, block) | `8c85cc0` | ✅ |
| Access Profile modal (before→after change preview) | `8c85cc0` | ✅ |
| Verification card (add / mark verified / reject) | `8c85cc0` | ✅ |
| Lifecycle Timeline card | `8c85cc0` | ✅ |
| Access Requests table (admin approve/reject) | `8c85cc0` | ✅ |
| Customer portal Request-Access panel (account dashboard, B2B) | `8c85cc0` | ✅ |
| 14 proxy routes (graceful 404/405 degradation) | `8c85cc0` | ✅ |
| FIX — "Check approval status" (retry-login) on pending screen | `2b15758` | ✅ |
| FIX — register verify→review messaging | `2b15758` | ✅ |
| FIX — approval-email status feedback (admin approve success message) | `2b15758` | ✅ |
| Customer profile correction — Edit modal (`components/admin/edit-customer-modal.tsx`) | 2026-07-14 | ✅ Name/email/company/type/VAT (+ "I've confirmed this" checkbox, only sent on change to avoid backend's auto-reset-to-unverified)/industry/phone/country/admin_notes via `PATCH /admin/customers/{id}`, diff-only body; inline 422 email-uniqueness error; success re-syncs `CustomerTimelineCard` |
| Removed — "Platform Migration Email" test-block (leftover, no backend dependency) | 2026-07-14 | ✅ Deleted from `/admin/customers`; `app/api/admin/customers/migration-email` route removed |
| Buyer tier / risk level badges on customers list | 2026-07-14 | ✅ Small coloured badges next to access/segment badges, reusing `lib/crm8` style maps |
| Backend endpoints | — | ⏳ Backend team |

#### CRM-7 Detail

| Sub-feature | Commit | Status |
|---|---|---|
| Proposal lifecycle proxy routes (draft/mark-ready/send/void) | `224ab1c` | ✅ |
| Public proposal acceptance page `/proposals/accept/[token]` | `224ab1c` | ✅ |
| ProposalCard admin component (full state machine) | `224ab1c` | ✅ |
| ProposalBadge in quotes table | `224ab1c` | ✅ |
| Convert-to-Order gated on proposal_status=accepted | `224ab1c` | ✅ |
| Super admin override confirmation | `224ab1c` | ✅ |
| Quote items editor (QuoteItemsCard) | `c93f1c7` | ✅ |
| Import from inquiry button | `c93f1c7` | ✅ |
| ProposalCard gated on itemCount > 0 | `c93f1c7` | ✅ |
| FIX — proposal draft built from persisted quote items (not `tyre_items`) | `3a2941b` | ✅ |
| FIX — send required `name` field in proposal draft items payload | `4a7fa05` | ✅ |
| Signed Proposal return — customer upload (alt. to digital Accept) + admin badge/download | `24ee49b` | ✅ (see Admin Panel — Orders & Documents table) |
| Backend endpoints (7 routes) | — | ⏳ Backend team |
| Quote items backend (5 routes) | — | ⏳ Backend team |

#### CRM-3B Detail — Notification Center & Work Queue

| Sub-feature | Status |
|---|---|
| `AdminNotification` type extended to CRM-3B contract (`severity`, `body`, `action_url`, `related_type`/`related_id`, `dismissed_at`, `metadata`) + legacy `message`/`link` fallbacks | ✅ |
| `MyWorkItem` type (`lib/admin-api.ts`) | ✅ |
| `lib/admin-notifications.ts` — severity styles, type→icon (`NotifIcon`), body/link accessors, `timeAgo` | ✅ |
| Notifications bell — lightweight unread-count poll (30s), list-on-open, severity icons, dismiss, "View all" | ✅ |
| Notifications center page `/admin/notifications` — unread/type/severity filters, mark-all-read, dismiss, pagination | ✅ |
| Work queue page `/admin/my-work` — sectioned (Assigned Leads, Due Follow-ups, Proposal Accepted, Customer Approvals, Access Requests) | ✅ |
| Sidebar nav entries (My Work, Notifications) — visible to all admin roles | ✅ |
| Assignment UX — "Pipeline updated. {name} has been notified." on quote assign | ✅ |
| Follow-ups "Assigned to me" filter tab (`mine=1`) | ✅ |
| Proxy routes: `notifications` (filters), `notifications/unread-count`, `notifications/{id}/dismiss`, `my-work` (graceful 200/empty degradation) | ✅ |
| Backend endpoints (table, service, triggers, dedupe, scheduler) | ⏳ Backend team |

---

## Pending — Backend Contracts

### Proposal → Proforma Gating — Needs `proposal_accepted_at` Surfaced on Order Payload

Backend note: for orders from an accepted CRM-7 proposal, admin should be able to generate/send the
Proforma Invoice right after proposal acceptance, without requiring a separate Order Confirmation
acceptance step. The gate that currently blocks "Generate Proforma" is `customerAcceptancePending`
(`components/admin/order-detail.tsx:544`, `order.customer_acceptance_status === "pending"`), consumed
by `TradeDocumentsCard`. **`AdminOrderFull` (`lib/admin-api.ts`) does not currently expose the
originating quote's `proposal_status`/`proposal_accepted_at`** — there's no field to check. Backend's
own note says to ask if this needs surfacing. **Not implemented — waiting on backend to add e.g.
`order.proposal_accepted_at` (or similar) to the admin order detail response** so the gate can also
pass when it's set. Direct/manual orders with no proposal history are unaffected (still need explicit
Order Confirmation acceptance).

### Marketing Contacts CSV Import — Column Name Clarification

Frontend normalises the CSV (BOM stripped, headers trimmed, mapped to snake_case) but all 188 rows are still `skipped_no_email`. The backend importer's expected header string for the email column is unknown. **Waiting on backend team to confirm the exact header name** (e.g. `email`, `Email`, `email_address`).

### Media Library (3 endpoints — backend confirmed built)

```
GET    /api/v1/admin/media?collection=&search=&per_page=
POST   /api/v1/admin/media        multipart: file, collection?, alt_text?
DELETE /api/v1/admin/media/{id}
```

Item shape: `{ id, filename, original_name, path, url, mime_type, size_bytes, width, height, alt_text, collection, created_at }`
Backend confirmed two bugs fixed (image-processing library API mismatch + `created_at` formatting 500). Frontend proxy routes and UI are live.

---

## Pending — Backend Contracts (legacy)

These frontend flows are complete. Backend endpoints are required to activate them.

### Customer Portal Notifications ("Email = Inbox")

Frontend complete (navbar bell + `/account/notifications` inbox + dashboard
recent-activity widget + email preferences). **Core principle: every transactional
email the backend sends a customer must also write a `customer_notifications` row
with the same subject/body** (set `email_sent_at`). Degrades to empty/0 until live.
**Full contract + table + triggers + dedupe: `docs/BACKEND-CUSTOMER-NOTIFICATIONS.md`.**

```
GET  /api/v1/auth/customer/notifications                filters: unread=1, type, severity, page, per_page
       returns: { data: CustomerNotification[], unread_count, meta }
GET  /api/v1/auth/customer/notifications/unread-count   returns: { unread_count }   (polled 30s — keep cheap)
POST /api/v1/auth/customer/notifications/{id}/read
POST /api/v1/auth/customer/notifications/{id}/dismiss
POST /api/v1/auth/customer/notifications/read-all

GET  /api/v1/auth/customer/notification-preferences     returns: { data: CustomerNotificationPreferences }
PUT  /api/v1/auth/customer/notification-preferences     body:    CustomerNotificationPreferences
```

Notification types: `order_placed`, `order_confirmation`, `order_confirmed`,
`payment_milestone`, `order_shipped`, `order_delivered`, `quote_received`,
`quote_ready`, `proposal_reminder`, `document_ready`, `account_approved`,
`access_request_update`, `verification_update`, `security_alert`, `welcome`,
`announcement`. Severities: `info`, `success`, `warning`, `urgent`. `action_url`
must be a relative portal path. Dedupe on `customer_id + type + related_type +
related_id + metadata->stage`; never duplicate an existing **unread** row.
`email_orders` + `security_alert` always email; `email_marketing` is opt-in.

### CRM-7 Proposal

```
POST /api/v1/admin/quote-requests/{id}/proposal/draft
POST /api/v1/admin/quote-requests/{id}/proposal/mark-ready
POST /api/v1/admin/quote-requests/{id}/proposal/send
POST /api/v1/admin/quote-requests/{id}/proposal/void       body: { reason? }

GET  /api/v1/proposals/{token}                             public — no auth
POST /api/v1/proposals/{token}/accept                      public
POST /api/v1/proposals/{token}/reject                      body: { reason? }
```

### CRM-7 Quote Items

```
GET    /api/v1/admin/quote-requests/{id}/items
POST   /api/v1/admin/quote-requests/{id}/items
PATCH  /api/v1/admin/quote-requests/{id}/items/{itemId}
DELETE /api/v1/admin/quote-requests/{id}/items/{itemId}
POST   /api/v1/admin/quote-requests/{id}/items/import-from-inquiry
```

### CRM-3B Admin Notifications & Work Queue

Frontend complete (bell + `/admin/notifications` + `/admin/my-work`). The bell polls
`unread-count` every 30s and fetches the list on open. Notification fields follow the
CRM-3B contract (`severity`, `body`, `action_url`, `related_type`/`related_id`); the
frontend also accepts the legacy `message`/`link` fields as fallbacks.

```
GET  /api/v1/admin/notifications              filters: unread=1, type, severity, page
       returns: { data: [{ id, type, title, body?, severity?, action_url?, related_type?,
                  related_id?, read_at?, dismissed_at?, metadata?, created_at }],
                  unread_count, meta }
GET  /api/v1/admin/notifications/unread-count returns: { unread_count }
POST /api/v1/admin/notifications/{id}/read
POST /api/v1/admin/notifications/{id}/dismiss
POST /api/v1/admin/notifications/read-all

GET  /api/v1/admin/my-work                    returns: { data: [{ type, title, subtitle?,
                  priority?, due_at?, action_url?, status? }] }
```

Notification types: `lead_assigned`, `follow_up_due`, `proposal_accepted`,
`customer_access_requested`, `customer_approval_needed`, `quote_needs_review`,
`order_payment_milestone`, `document_action_needed`. Severities: `info`, `success`,
`warning`, `urgent`.

Triggers (backend): lead assigned (on `POST /admin/quote-requests/{id}/assign`),
follow-up due (`admin:notifications:due-followups` scheduler), proposal accepted,
customer access requested, customer approval needed, quote needs review. Dedupe on
`type + related_type + related_id + date/stage`; never duplicate an existing **unread**
notification. The follow-ups list should honour a `mine=1` filter (used by the
"Assigned to me" tab).

### CRM-8 Buyer Lifecycle

```
GET  /api/v1/admin/customer-approvals          filters: status, verification_status, risk_level, buyer_tier, market_region, q
GET  /api/v1/admin/customers/{id}/timeline
POST /api/v1/admin/customers/{id}/approval-profile   body: { profile, notes? }
POST /api/v1/admin/customers/{id}/approve            body: { profile, buyer_tier?, notes? }
POST /api/v1/admin/customers/{id}/reject             body: { reason? }
POST /api/v1/admin/customers/{id}/set-tier           body: { buyer_tier, notes? }
POST /api/v1/admin/customers/{id}/risk               body: { risk_level, notes? }
GET  /api/v1/admin/customers/{id}/verifications
POST /api/v1/admin/customers/{id}/verifications      body: { type, value?, notes? }
PATCH /api/v1/admin/customers/{id}/verifications/{verificationId}   body: { status, notes? }
POST /api/v1/admin/customers/{id}/health/recalculate

GET  /api/v1/admin/customer-access-requests          filters: status, requested_access
POST /api/v1/admin/customer-access-requests/{id}/approve
POST /api/v1/admin/customer-access-requests/{id}/reject

GET  /api/v1/auth/customer/access-requests           customer — own requests
POST /api/v1/auth/customer/access-requests           customer — body: { requested_access, reason? }
```

### LANG-4 i18n Locale Resolution (geo auto-detection)

Frontend complete (`/api/i18n/detect` proxy + `LanguageProvider` first-visit detection).
The proxy reads the visitor country from CDN geo headers and resolves it via the backend
country→locale map. **No frontend blocker** — degrades to default-only (everyone `en`,
no auto-switch) until the routes go live.

```
GET /api/v1/i18n/locales              returns: { supported, default, country_locale }   🔧 built, needs deploy
GET /api/v1/i18n/resolve?country=XX   returns: { locale, country, source, is_default, supported }  (not used by FE — FE resolves from the cached map)
```

Frontend uses the **cached-map** style: fetches `/i18n/locales` once (server-side,
revalidate 1h, shared across visitors) and resolves `map[country] ?? default` itself,
so there is no per-request backend round trip and country geo stays server-side.
Wiring `LocaleResolver` into the content controllers is **not required** for this
integration (FE always sends `?locale=`); it's optional backend cleanup.

### CRM-6 Communications

```
GET  /api/v1/admin/crm/follow-ups
POST /api/v1/admin/crm/follow-ups/{id}/complete
POST /api/v1/admin/crm/follow-ups/{id}/reschedule
GET  /api/v1/admin/crm/email-templates
POST /api/v1/admin/quote-requests/{id}/send-follow-up-email
GET  /api/v1/admin/customers/{id}/communications
POST /api/v1/admin/customers/{id}/communications
GET  /api/v1/admin/quote-requests/{id}/communications
POST /api/v1/admin/quote-requests/{id}/communications
```

### DOC-6 Acceptance

```
POST /api/v1/admin/orders/{id}/acceptance/send
POST /api/v1/auth/orders/{ref}/reject-order-confirmation    body: { reason? }
```

### EB-1 eBay OAuth

```
GET  /api/v1/admin/ebay/auth-url
GET  /api/v1/admin/ebay/status
POST /api/v1/admin/ebay/disconnect
GET  /api/v1/admin/ebay/callback    → redirect to /admin/ebay?connected=1
```

### System Health

```
GET /api/v1/admin/system/health
GET /api/v1/admin/system/errors?limit=N
```

---

## Frontend Architecture Notes

- **GSAP only** — Framer Motion fully removed. All animations via `@/lib/gsap`.
- **No NextAuth** — custom cookie-based auth (`customer_token`, `admin_token`).
- **API proxy pattern** — all backend calls go through Next.js route handlers; browser never calls the Laravel API directly.
- **Server env var rule** — proxy routes use `process.env.API_URL` (private) first, then `NEXT_PUBLIC_API_URL` as fallback. Never use `NEXT_PUBLIC_API_URL` alone in server-side code.
- **Graceful degradation** — all features handle backend-not-deployed (404/405) with an inline message rather than a hard error.
- **TypeScript strict** — 0 errors enforced on every commit.

---

### ✅ UI Polish — Quick Wins (Phase 1)

| Feature | Commit | Notes |
|---|---|---|
| Global focus ring opacity bump | `0dd05c0` | `globals.css` override sets `--tw-ring-color` to 25% opacity for all inputs — covers all 63 files at once |
| Admin breadcrumbs on nested routes | `0dd05c0` | `getAdminBreadcrumb()` in admin-shell renders `Parent › Current` in topbar for any sub-route (e.g. Products › New, Orders › Detail) |
| Shared `EmptyState` component | `0dd05c0` | `components/ui/empty-state.tsx` — icon + heading + description + optional CTA; applied to admin orders & products tables |
| Filter sidebar chevron rotation | `0dd05c0` | Single `ChevronDown` rotates 180° on open (`transition-transform duration-200`) instead of swapping two icons |
| Form button heights standardised to 44px | `0dd05c0` | Customer account profile & addresses pages: `h-[46px]`/`py-3` → `h-11` |

---

### ✅ UI Polish — Homepage Redesign & Premium Pass (Phase 2)

A full senior-level UI/UX pass on the public homepage + admin shell, plus a
reusable polish layer. Light, blended, premium; Linear-inspired restraint.
All visual/motion only — no SEO meta/copy/alt/images disturbed; new visible
text routed through i18n (EN/DE/FR/ES, type-enforced).

| Feature | Commit | Notes |
|---|---|---|
| Admin sidebar — grouped sections + premium active state | `9372948` | Flat 25-item nav → 7 role-aware groups (Overview, Commerce, Customers & CRM, Content, Sales Channels, Insights, System); empty groups auto-hide; orange accent-bar active state; dropped redundant Profile row |
| Homepage spacing rhythm + card depth + dark REX band | `7385346` | `py-6` → `py-12 md:py-16`; flat `#efefef` cards get border + soft shadow + hover; REX converted to dark cinematic trust band |
| Platform Showcase — order-tracking UI mock | `db4b750`, `f81986d` | Rendered (non-screenshot) mock: floating app window, payment-milestone timeline (mirrors admin `PaymentMilestonesCard`), trade-doc rows; `t.platform` i18n; flex timeline (no dot/label overlap) |
| Hero redesign — "living" floating-UI cluster | `b2a6825`, `9e36027` | Replaced image slider with headline + CTAs + trust chips + floating product/search/shipment cards; **light blended** theme; section reorder (Hero → Brands → Categories → Who-We-Serve → Platform → Logistics → Tyre Highlights → Why → REX → FET → CTA). Old `Hero`/Hero-Slides CMS left intact (reversible) |
| Consolidated FET section | `9e36027` | 4 FET strips (teaser/ROI/verified/proof) → one premium `fet-showcase` with interactive Before/After video toggle (FET green system); homepage sections 14 → 11 |
| Interactive hero cards + global flag strip | `cc254bf`, `6b9b113` | Product card → `/shop?type=…`, working size search → `/shop?size=…` (normalised) with `?q=` fallback; featured search has typewriter placeholder + quick-pick chips; `GlobalReach` marquee of markets with Twemoji SVG flags (Windows-safe); `t.heroShowcase` + `t.globalReach` i18n |
| Hero ambient + tyre visuals | `7f6fbf9`, `230c98d` | Low-opacity animated background (counter-rotating tyre rings, flowing shipping-route arc, drifting glows, cursor-follow light); real spinning tyre (`mix-blend-multiply`) in product card + hero corner; tightened mobile hero |
| Ambient uniformity (platform section) | `6b9b113` | Platform section shares hero's rings/grid/glows; shared `TyreRing` component |
| FET promo card | `230c98d`, `6e6e042` | Appears on scroll-down, auto-dismisses (~6.5s, pauses on hover), once per session; FET green, bottom-left, `/fet` CTA |
| Interactive milestone timeline | `38d28e0` | Connectors "draw" downward on scroll, current step pulsing ring, hover-highlight rows (motion-safe) |
| Scroll-aware navbar | `77b843d` | Header gains subtle border + shadow + tighter bg once scrolled (no layout shift) |
| CTA micro-interaction system | `9a63f6a` | Hover-lift + tactile active-press on canonical buttons; reusable `.btn-cta` + behaviour-only `.cta-press` (applied to CTA section, platform, FET); animated footer-link underlines; hover-only + reduced-motion safe |
| Footer elevation | `9a63f6a` | Accent hairline + factual trust badges (ISO 9001:2015 · REX DEREX76000242) |
| `<SectionHeading>` system | `8e6d308` | One eyebrow + heading rhythm/type scale; adopted in Who-We-Serve & Categories |
| Scroll-progress bar | `8e6d308` | Thin top reading-progress indicator (rAF, transform-only, homepage) |
| Unified reveal cadence | `8e6d308` | CSS `FadeUp` aligned to GSAP `Reveal` (0.7s, ~`power3.out`) |

**New homepage components:** `home/hero-showcase`, `home/platform-showcase`, `home/fet-showcase`, `home/global-reach`, `home/fet-promo`, `home/scroll-progress`, `home/tyre-ring`, `ui/section-heading`.

**Open polish (optional):** roll `.cta-press` across remaining body CTAs · adopt `<SectionHeading>` in remaining sections · lighten REX band for full-light consistency · trim/merge WhyOkelcor · self-host flag SVGs (currently jsDelivr Twemoji) · wire flag strip to a live aggregated top-countries endpoint.

---

### ✅ Admin Dashboard — Premium UI/UX Pass

Researched Linear + Stripe Dashboard (chosen: Linear is this codebase's existing
"restraint" touchstone, Stripe Dashboard's home screen — revenue/orders/customers/AOV/
conversion — is the canonical reference for exactly this screen) and adapted their
patterns to `/admin` and its 16 components in `components/admin/dashboard/`.

| Feature | Notes |
|---|---|
| Color discipline fix | `hero-metrics.tsx` was the one file with arbitrary decorative per-card icon colors (blue/violet/emerald/amber/cyan, no semantic meaning) — replaced with a neutral `bg-[#f5f5f7]` icon chip everywhere except the Revenue card, which keeps the single `#E85C1A` accent chip. Every other card's color use (status badges, danger/warning/success chips, Sentry's brand purple, the multi-series traffic-sources pie chart) was already legitimate semantic/categorical signal and was left untouched |
| Card chrome | `rounded-2xl bg-white shadow-sm` → `rounded-2xl border border-black/[0.06] bg-white` across all ~14 dashboard cards + the error boundary fallback — hairline border instead of a drop shadow reads as considered rather than templated |
| Typography | Card titles `font-extrabold` → `font-bold`; `tabular-nums` added to every numeric value/delta/table cell across the folder (metric values, order totals, stock counts, view counts, funnel counts, Sentry stat pills, security counts, status-bar counts) |
| Sparklines | New `components/admin/dashboard/sparkline.tsx` (minimal Recharts `AreaChart`, no axes/tooltip) wired into the Revenue, Orders, and Avg Order Value hero-metric cards, fed by 7-day series. `/api/admin/dashboard/stats` gained `ordersChart` + `aovChart` (additive fields, derived from the orders array it already fetches — no new backend call) alongside the existing `revenueChart` |
| Chart polish (`revenue-chart.tsx`) | Dashed gridline → faint solid; gradient fade tightened from 95%→60% stop; tooltip shadow softened to match the hairline-border language used everywhere else |
| Lint cleanup | Fixed a pre-existing `react-hooks/set-state-in-effect` violation present in ~11 of these files (fetch-on-mount pattern) with the same targeted disable-comment convention already used in `cart-context.tsx`/`compare-context.tsx`, while touching each file anyway for the visual pass |
| Deferred (flagged, not built) | A functional Today/7D/30D time-range switcher (needs backend date-range support beyond today/yesterday) and a Cmd+K command bar (belongs at the `admin-shell.tsx` topbar level, spanning every admin page, not this page alone) |

---

### ✅ Tailwind v4 Token Foundation + Tyre-Industry Storefront Pass (2026-07-29)

Audit finding that drove this: Tailwind **v4.2.2** was installed but the codebase
was written entirely in v3 idiom — **zero** `@theme`, `@utility`, `@custom-variant`,
container queries, `bg-linear-*`, `mask-*`, `text-shadow-*` or 3D transforms, and
~1,000 arbitrary hex literals in client code (`[#5c5e62]`×81, `[#f5f5f5]`×124).
The design system existed only as prose in `DESIGN_SYSTEM.md`, so nothing enforced it.

| Feature | Notes |
|---|---|
| `@theme` token layer (`app/globals.css`) | Brand/ink/surface/hairline/FET/EU-grade colours, `--radius-panel` (22px per DESIGN_SYSTEM §9), shadow scale, the type scale, `--ease-premium`, and `--container-card-*` container-query breakpoints — all now real utilities (`bg-brand`, `text-ink-muted`, `border-hairline`, `rounded-panel`, `ease-premium`, `@card-md:`). **Purely additive**: the original `:root` block is retained verbatim so every existing `var(--primary)` reference still resolves and nothing rendering today changed. Verified by compiling the sheet standalone and grepping the output — every new utility emits |
| Design rules encoded as tokens | CLAUDE.md's "never apply Okelcor orange to FET UI" is now structural: orange is `brand-*`, FET green is `fet-*`. Mixing them is visible in the class name instead of invisible in a hex literal |
| `@custom-variant motion` + `@utility panel` / `panel-float` | Opt-in `motion:` variant (applies only when the visitor has *not* requested reduced motion); `panel`/`panel-float` replace the `rounded-2xl border border-black/[0.06] bg-white` triplet repeated across dozens of components |
| Brand-drift fix (10 public files) | `#E85C1A` had leaked into `not-found`, `global-error`, `imprint`, `checkout/cancel`, the public document verify/accept pages, proposal acceptance and the custom cursor. **Correction to an earlier read:** `#E85C1A` is the *admin panel's* deliberate accent (~100 files, left untouched) — the drift was public-facing pages picking it up. Those 10 now use `brand`/`brand-hover` |
| Container queries on `ProductCard` | The card renders in the shop grid, related-products rail, compare modal and specials list at four different widths; it sized off the **viewport**. Now `@container` + `@card-md:` — correct in every context, no breakpoint guessing |
| v4 syntax modernisation | 28 × `bg-gradient-to-*` → `bg-linear-to-*`; `global-reach` marquee's hand-rolled `[mask-image:linear-gradient(…)]` → `mask-x-from-93% mask-x-to-100%` |
| **EU Tyre Label — Regulation (EU) 2020/740** | Was **entirely absent** (zero `fuel_efficiency`/`wet_grip`/`rolling_noise` anywhere) despite being legally mandatory for tyres on the EU market and the trade's most recognised trust artifact. New `lib/eu-tyre-label.ts` + `components/shop/eu-tyre-label.tsx`: compact grade pills on the card/compare table, full graded A→E ladder panel on the detail page (regulated colour ramp, noise dB + class bars, 3PMSF/ice pictograms, EPREL deep link). Defensive enum narrowing; reads either a nested `eu_label` object or flat columns. **Renders nothing when the backend supplies nothing** — pages are byte-identical to before until fields land. Contract: `docs/BACKEND_NOTE_eu_tyre_label.md` |
| Service-description decoding (**no backend needed**) | `lib/tyre-specs.ts` — ISO/ETRTO load-index→kg and speed-symbol→km/h tables, incl. dual-fitment (`154/150 K`). `"91V"` rendered as a raw string everywhere; now surfaces "615 kg / 240 km/h" on the card, detail page and compare table, derived from the `spec` field that already existed |
| Locale-correct pricing | The storefront hardcoded `€{n.toFixed(2)}` — wrong notation in 3 of the 4 shipped locales. New `lib/price.ts` + `hooks/use-price.ts` (Intl-based): `€1,234.56` (en) · `1.234,56 €` (de) · `1 234,56 €` (fr/es), honouring an optional per-product `currency`. Applied across product card, detail page, related products, compare modal, search modal, cart drawer, checkout summary, specials list and the shop price filters. **Formatting only — no FX conversion**, deliberately: quoting a converted number with no rate source or timestamp would be misleading on a B2B quote |
| `Product` type extended | Optional `currency`, `eu_label`, `dot_code`, `tread_depth_mm` — the last two typed and ready but not yet rendered (still the gap in `BACKEND_NOTE_premium_ux.md`) |
| i18n | New `tyreLabel` + `tyreSpecs` blocks, type-enforced across EN/DE/FR/ES |

**Not done (scope):** the admin product form has no inputs for the seven EU-label
fields yet — mechanical, needed once the columns exist. Container-load calculator
and interactive lead-time map were explicitly out of the agreed scope.

---

### ✅ Premium-UX §1/§2 — backend shipped, frontend consuming (2026-07-29)

Backend built, tested (19 tests / 54 assertions, executed not just written),
migrated and deployed the first two asks from `docs/BACKEND_NOTE_premium_ux.md`.
Frontend now consumes all of it.

**What backend found that the note missed:** `stock` was already on the public
payload but had **no write path at all** — absent from `UpdateProductRequest`,
and `AdminProductController::formatProduct()` didn't return it, so the panel
couldn't display the number it was publishing publicly. Fixed server-side, plus
`POST /admin/products/bulk-stock` now accepts `stock` and/or `in_stock`
(boolean-only callers unaffected), and setting `stock` without an explicit
`in_stock` derives the flag so "✓ In Stock" can't sit on a zero.

| Feature | Notes |
|---|---|
| **Banded stock** (`lib/stock.ts`, `components/shop/stock-badge.tsx`) | Backend's explicit instruction, followed: render a band, never the count. Their caveat is that `stock` is never decremented on order and `products:sync-rapid` is unscheduled, so it means "supplier availability as of the last manual import" — "24 in stock" would be a precise claim the data can't support. `StockLine` (card) / `StockPill` (detail) show In stock · Low stock · Out of stock, `LOW_STOCK_THRESHOLD = 10` as a display heuristic. Returns `null` on genuinely unknown availability rather than guessing. `in_stock === false` overrides a positive `stock` — a human marking something unavailable beats a stale import |
| Card out-of-stock state is now band-derived + i18n'd | Previously keyed off the boolean only and had a hardcoded English "Out of Stock" string; a product reporting `stock: 0` now reads as out, and the label is translated |
| **`estimated_dispatch_days`** | Order-manager-approved `site_settings` value, surfaced on both product endpoints. Ships blank and is nulled for out-of-stock; rendered **verbatim** with no frontend default — an invented figure here would be an unapproved delivery promise. Backend created it via migration rather than `SiteSettingsSeeder`, because that seeder's `updateOrCreate()` would reset the order manager's number on any re-run |
| **Tyre Passport** (`components/shop/tyre-passport.tsx`) | The §2 differentiator — none of Tire Rack / SimpleTire / ATD sell graded used tyres, so none of them solve this. Renders `condition_grade`, `tread_depth_mm`, `dot_code`, `inspection_date` and an inspection-photo strip. `tyre_batch` is null until ops captures an inspection, so the card is skipped entirely rather than rendering blanks; individual fields are independently optional. `condition_grade` displayed verbatim — backend deliberately kept it a plain string, not an ENUM, since no grading scale is fixed yet (and this codebase already has an ENUM that can't hold the values its own code uses) |
| DOT code decoding (`parseDotCode`) | `"2419"` → week 24, 2019. Post-2000 WWYY only; 3-digit pre-2000 codes return null rather than guessing a decade. Century inferred so a future-dated year falls back to 19xx |
| **FIX** — `Product` type mismatch | The previous commit speculatively typed flat `dot_code`/`tread_depth_mm`. Backend nested them under `tyre_batch` — which is what `BACKEND_NOTE_premium_ux.md` §2 originally proposed and the frontend type failed to follow. Would have silently rendered nothing. Corrected before deploy |
| `stock_locations[]` — **dropped by agreement** | No multi-warehouse concept exists; the only location signal is a Rapid import filename (stock held by a third party in Solnhofen). An array would have been one hardcoded entry pretending to be a split |
| i18n | New `stock` + `passport` blocks (EN/DE/FR/ES). Reuses the existing, richer `shop.info.inStock` ("In Stock — Ready to Order") for the positive band rather than duplicating the string |

**Still open:** premium-UX §3 (saved fitments / one-click reorder) wasn't
addressed in backend's reply — parked, lowest priority of the three. Both new
features are inert until ops starts entering data; that's expected, not
incomplete.

---

### ✅ Typography System — Swiss Grotesque + Technical Mono (`7a7344f`, deployed)

Research-led premium pass on the public site. Scope agreed as a **refined pass**:
same structure, same section order, same DOM — new skin. **SEO-invariant by
construction**: no URL, heading text/level, metadata, JSON-LD or alt changes, and
nothing moved into client-only rendering. Redesign traffic loss comes from URLs,
deleted content and broken redirects; none of that is touched here.

Audit finding: the site had **no `next/font` at all** — it ran on the raw system
stack, rendering as SF Pro on macOS, Segoe UI on Windows and Roboto on Android.
No typographic identity, and a different brand on every OS.

| Change | Notes |
|---|---|
| **Geist + Geist Mono, vendored** (`app/fonts/`, 29 KB + 23 KB) | Loaded via `next/font/local`, not `next/font/google`. Nothing is fetched from Google at build time **or** runtime — the Munich Regional Court has held that serving Google Fonts from Google's servers breaches GDPR by transmitting visitor IPs, and Okelcor is Munich-based. Vendoring also removes a network dependency from CI |
| Zero-CLS loading | Variable fonts (one file, weights 100–900), `display: swap`, explicit metric-matched `fallback` chain + `adjustFontFallback: "Arial"`. Protects CLS rather than risking it |
| `--font-sans` / `--font-mono` theme tokens | Composed from the raw `--font-geist-*` vars in `@theme`, with the **previous system stack retained verbatim as the fallback** — if the files ever fail to load the site degrades to exactly what it rendered before |
| **Mono for data, not prose** | Tyre sizes, service descriptions, decoded load/speed, SKUs, DOT codes and the REX number (`DEREX76000242`) now set in mono across product card, detail page, compare table, related products, specials list, hero, tyre passport, EU label, REX band and footer. Figures align down a column instead of drifting. In the card's specs disclosure a per-row `isData` flag keeps Season/Type in the sans — monospacing a word like "Summer" reads as a bug. **Prices deliberately stay sans + `tabular-nums`**: mono prices read as a spreadsheet, and money is a commercial figure, not a measurement |
| Typographic refinement | `text-wrap: balance` on h1–h4 (no orphaned words), `text-wrap: pretty` on paragraphs, `-0.02em` tracking on headings (grotesques need it at display sizes), `kern`/`calt` features |
| **Native scroll-driven reveals** | `.fade-up` gains `animation-timeline: view()` behind `@supports`, running on the compositor with no main-thread JS — an INP win. CSS animations beat normal declarations, so the timeline drives opacity/transform whether or not the IntersectionObserver has added `.is-visible`; the two cannot fight. Firefox still has this behind a flag (~16% of traffic) and simply keeps today's IO behaviour. Reduced-motion honoured. **Overlay, not replacement** — the observer stays |

**Research basis:** 2026 premium direction is distinctive type + mono for technical
metadata, bento/editorial grids, and native motion replacing JS. Closest
business-model references are Flexport (Drum B2B website award — clean type, heavy
whitespace, real product UI over abstract shipping imagery) and project44 (leads
with live data, not a static hero). `platform-showcase` already follows that
instinct.

**Runtime verification** (production build served locally, then confirmed on Vercel):

| Check | Result |
|---|---|
| Font CSS vars on `<html>` | `class="w-full sans_…__variable mono_…__variable"` ✅ |
| Font files served from our origin | `/_next/static/media/Geist_Variable-….woff2` + `GeistMono_Variable-….woff2` ✅ |
| Requests to Google Fonts | **0** — fully self-hosted, GDPR-safe ✅ |
| `body` resolves to Geist | `font-family: var(--font-sans)` → `var(--font-geist-sans), -apple-system, …` ✅ |
| Mono on data | `REX · <span class="font-mono">DEREX76000242</span>` ✅ |
| Native scroll reveals in shipped CSS | `animation-timeline` present ✅ |
| Full production build | Compiled ✅ · TypeScript passed ✅ · all pages generated ✅ |
| ESLint | ⚠️ **Could not run** — times out past 8 min on this machine (see environment note below). Changes were almost entirely `className` edits; the one structural edit (per-row `isData` flag) was covered by the build's type-check |

**Outcome, stated plainly:** this was the *refined* option — same layout, same
section order, new skin. It reads more expensive up close but **does not look like
a different website**, which is the expected result and was flagged before starting.
If visible structural change is wanted, that is the **editorial restructure** option
(bento/broken-grid homepage recomposition, redesigned product detail page, reworked
shop catalogue) — still SEO-invariant, since DOM content and heading hierarchy are
preserved. Not started; see backlog.

> **Build environment warning.** Builds appeared to hang for hours; the actual cause
> was Next 16's **build lock** — `⨯ Another next build process is already running`.
> A force-killed build orphaned workers that kept holding it, and every later build
> silently queued behind them, freezing after "Creating an optimized production
> build …" with no further output. **Never run two builds concurrently, and never
> `kill -9` a build** — it orphans `webpack-loaders.js`/`postcss.js` children. A
> single clean build completes in ~4 min cold.
>
> Separately: **the repo lives in `~/Documents`, which macOS iCloud Drive syncs.**
> That produced 17 duplicate source files (`route 2.ts`, `page 2.tsx`, …, since
> deleted) and `.next/types/routes.d 3.ts` duplicates causing `Duplicate identifier`
> errors. It also makes the filesystem slow enough that `eslint` and standalone
> `tsc` now time out past 8 min. **Recommend moving the repo out of `~/Documents`**
> and adding `".next"` to `tsconfig.json`'s `exclude` (it currently includes
> `**/*.ts` with only `node_modules` excluded, so tsc walks the whole build output).
>
> **⚠️ It has now reached `.git`.** After the push, `git fetch` failed with
> `fatal: bad object refs/remotes/origin/main 2`. iCloud had duplicated six files
> inside `.git`: four copies of the index (`index 2`–`index 5`), `ORIG_HEAD 2`, and
> `refs/remotes/origin/main 2` — and git *does* read that duplicated ref during ref
> iteration, which is what broke fetch. Deleted; fetch is clean and `HEAD` matches
> `origin/main`. **This will recur.** Repository corruption is a different order of
> risk from slow builds, so moving the repo off iCloud is now the top tooling item.

**Verification the deploy is live:** no Okelcor server was running locally during
review (the only Next dev server on the machine belongs to an unrelated project on
port 3000, and a stale Okelcor `next start` on 3737 was Next **15.5.22**, predating
this work) — worth knowing before concluding "nothing changed" from a local tab.

---

### ✅ Partner Sales Log — admin screens (2026-08-07)

Companion to the separate partner app (`okelcor-gmbh/okelcor-partner`,
`partners.okelcor.com`) where overseas distributors record daily sales. Backend
is deployed; this is the Okelcor-side window onto it, and the reason the system
exists — head office could not get numbers out of paper reports.

| Screen | Notes |
|---|---|
| `/admin/partners` | Create a partner organisation + its first user. **Replaces onboarding by curl** — which meant an admin-chosen PIN typed into a shell, landing in shell history. PIN field mirrors the server policy (6–10 digits, no all-same, no runs, no repeating blocks) so an admin is told before submitting, and the form states that the partner is forced to replace it on first sign-in. Expand a partner for its people: reset PIN, deactivate, unlock |
| `/admin/partner-sales` | Filter by partner / status / date range · verify · dispute with a required note · **Export CSV**. Totals render **per currency in separate cards, never summed** — nothing converts, so a combined figure would be meaningless while looking authoritative |
| Export proxy | The one route that does not parse JSON: the upstream streams CSV via `streamDownload`, so the body is piped through with `Content-Disposition` preserved. Proxied rather than linked directly because a token-protected download cannot be driven by a plain `<a href>` |
| RBAC | New `partners` section → `super_admin`, `admin`, `order_manager`. Deliberately **not** `sales_manager`: that role appears throughout the permission map but cannot be stored, since `admin_users.role` is a DB ENUM missing it — granting it would create a permission nobody could hold |
| Degradation | If migration #28 is not applied the sales screen shows an amber banner explaining the API is unreachable and that partners' entries stay queued on their phones — rather than an empty table that reads as "no sales" |

**Verified:** the new files typecheck clean against the real project config
(scoped `tsc`). ⚠️ **The full production build could not be run** — see the
environment note above; `next build` on this machine now sits at 0% CPU with no
output. The same code in the partner repo (`~/dev`, off iCloud) builds in 5
seconds. Worth a `npm run build` from a clean checkout before relying on this.

---

### ✅ Partner Sales Log — live, first partners onboarded (2026-08-10)

Backend deployed (migration #28 applied), `partners.okelcor.com` live on its own
Vercel project, real partner accounts created for **Ghana** and **Nigeria**
through `/admin/partners` rather than curl. Sales are being entered.

Everything below is in `okelcor-gmbh/okelcor-partner` (now at
`~/dev/okelcor-partner`, off iCloud — it builds in ~5s there). Recorded here
because it is the same system and this is the company tracker.

**Four bugs found by real use, all frontend, all fixed.** Worth reading as a
set: every one of them presented as something other than what it was.

| Bug | Presented as | Actually |
|---|---|---|
| **PIN truncated to 6 digits on login** | "That phone number and PIN do not match" | The login screen capped input at 6 while the admin form issues up to 10 and the server accepts 6–10. A 7-digit PIN could never match its own hash |
| **Login proxy misread the success response** | 502 "Could not sign you in" | Upstream returns `{ data: { token, user } }`; the proxy looked for `token` at the top level and rejected its own success. The contract note we were given documented the flatter shape — corrected with backend |
| **Every login failure collapsed into one message** | "wrong PIN" for locked *and* suspended accounts | The server distinguishes `invalid_credentials` / `account_locked` (423) / `user_inactive` / `org_suspended`; the proxy discarded three of four. Fixing this is what made the others findable |
| **Local sales not scoped to the signed-in partner** | A 6 Aug test entry appearing inside a newly created partner's account | IndexedDB is per-browser and rows carried no owner, so a second partner on the same handset saw the first one's book. A privacy leak on exactly the shared devices this tool targets — and there was already a comment in `sign-out.tsx` warning about it |

Also shipped 2026-08-10: **removal available on every row** (the 24h window was
blocking partners from clearing junk that never reached Okelcor — labelled
"Remove", since anything Okelcor holds returns on the next sync), locked rows now
say *why*, and a **mobile pass** — chiefly `interactiveWidget: "resizes-content"`
so the on-screen keyboard stops burying the running total and Save button.

> **Method note, worth keeping.** The first three bugs were diagnosed by guessing
> and cost a deploy cycle each. They were all answerable by reading
> `~/dev/okelcor-api`, which had been on this machine the whole time. The client
> was built against a *documented* contract and never checked against the running
> implementation — and the mock returned the shape we had assumed, so nothing
> disagreed until production. **Check the source before theorising.**

**Open with backend** (`docs/BACKEND_REQUEST_3_editability.md` in the partner repo):
`AdminPartnerSaleController` has verify/dispute but **no update path**, so a sale
past the 24h window can be flagged wrong by an admin and corrected by nobody —
the wrong figure stays in the CSV export. Requested `PATCH
/admin/partner-sales/{id}` with a required `reason` writing to the existing audit
trail, mirroring the DOC-5 order line-item revision pattern. Also asked what
`PARTNER_EDIT_WINDOW_HOURS` should be (config only, business decision).

---

## Upcoming / Backlog

| Item | Priority | Notes |
|---|---|---|
| **Behaviour analytics — visual layout check not completed** | Medium | The page is built, typechecks, lints and builds, and its palette is validated — but it has **never been looked at with data in it**, so label collisions, bar geometry and overflow are unverified — exactly what the colour validator does not check. Re-run: `npm run dev -- --port 3939`, open `/viz-check`, look at the rim bar chart's Y labels and the day chart's x-axis band, then delete `app/viz-check/page.tsx`. **The blocker recorded here is gone — "no headless browser is installed" was wrong** (2026-08-13). The Chrome extension still refuses localhost with "Frame with ID 0 is showing error page" on both hostnames, and only the user can grant it that permission — but **Chrome itself screenshots headlessly with no extension involved**, which is how the `hero` position grid was checked this session: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --window-size=1400,900 --screenshot=out.png http://localhost:3939/viz-check`. Adding `--enable-logging=stderr --v=0 --virtual-time-budget=6000 --dump-dom` prints the page's console too, which is how a hydration warning was traced (it was an HMR artifact from editing a component while the page was live, not a defect — worth knowing before it's reported as one). **This closes the standing "I could not verify it visually" caveat for anything in this repo** |
| ~~**`group_list` field control**~~ — **DONE**, spec supplied and built | ✅ Resolved 2026-08-13 | Deferred earlier the same day for want of a contract, then built once backend served one. **Stopping was the right call and the reason is now on the record: the field was being served in two shapes.** `item_fields` came back as an object keyed by field name while a block's own `fields` were a list of objects carrying `name` — the same concept twice, so a renderer for one could not be reused for the other, which is the opposite of what a container field should cost. Backend flattened them to one shape, recursively. A guess at the item-field key would have had nothing to disagree with it until production |
| **`analytics.view` role list diverges from the backend** | Medium | Backend: `super_admin, admin, order_manager, editor`. This repo: `super_admin, admin, sales_manager`. No live effect — the permission is defined but never consumed here — but the neighbouring `analytics` *section* gates the Google Analytics page, so aligning it would grant GA to two more roles. Needs a joint call on which list is canonical; the behaviour page uses its own `behaviour` section meanwhile |
| **Imported designs stack where the source has columns — needs 4 new block types (backend)** | **High — backend, nothing frontend can do** | Reported after the first real import: the three industry photographs sit side by side in the source deck and stack vertically after import. **Not an importer bug.** `CampaignBlockRenderer::BLOCKS` is `heading · text · image · button · list · divider · spacer · footer` — every one a single full-width element concatenated into one column (`image` renders at `width="552"; display:block; width:100%`), so **no block can place two things beside each other** and three stacked `image` blocks was the only available output. The same gap kills the green section bands (`heading` has no background colour) and the 12 three-across benefit cards (no card, no columns). **No frontend fix exists:** blocks are rendered server-side, and inventing a columns block client-side would fail `validateBlocks()` as `invalid_blocks` and stop the campaign sending. Asked for, most-value-first: **`image_row`** (fixes the report; fixed `image_url` slots need **zero frontend work** since that field type already carries the Media Library picker), **`section_header`** (named `tone` rather than a colour picker, so no new field type), **`cards`** (recommended as a `group_list` field type — the one item with a frontend cost, one new renderer in `block-field.tsx`, which we'd build), and a **`fet_green` preset** (both existing presets are teal+gold; FET is a documented separate design system in CLAUDE.md). Full contract, field shapes and the Outlook/mobile requirements: **`docs/BACKEND_NOTE_campaign_layout_blocks.md`**. The hero band is explicitly out of reach by any method — recommended there: flatten that region to one image with strong alt text |
| **InDesign import — 4.5 MB upload ceiling (understood, not currently binding)** | Low — watch, don't build | The endpoint accepts 50 MB but the upload crosses a Next.js route handler, and **Vercel caps a Function's request body at 4.5 MB**, answering `413 FUNCTION_PAYLOAD_TOO_LARGE` *before* our code runs ([limits](https://vercel.com/docs/functions/limitations), [error ref](https://vercel.com/docs/errors/FUNCTION_PAYLOAD_TOO_LARGE)). Not raisable from application code: `experimental.serverActions.bodySizeLimit: "300mb"` in `next.config.ts` covers **Server Actions only**. **Downgraded from High on backend's reply, which supplied the two facts that settle it:** the importer already reduces every image to **2000px longest side, JPEG 90**, discarding anything above that on the way in — so past that threshold a larger export produces a **byte-identical email**, and InDesign's Publish Online at **Medium / 150 ppi** is at or above what survives. The real Fuel Eco Tech export is **1.6 MB, about a third of the ceiling**. My earlier claim that photographic exports would "exceed 4.5 MB routinely" was wrong in the direction that matters — corrected rather than left standing. Exporting smaller is therefore not a quality compromise, and the UI now says exactly that (naming Medium/150 ppi and the 2000px cap) instead of vaguely asking for "a lower resolution". The 413 branch stays, caught on status alone since the body is Vercel's HTML error page rather than our JSON. **Still never blocked client-side** — a self-hosted or direct upload genuinely takes the full 50 MB, which is why the API keeps its 50. **If a real export ever does exceed it, backend prefers the image-splitting route over my upload-ticket idea, and is right:** strip images client-side, send the tiny HTML+CSS through the proxy, push each image through the existing `POST /admin/media` (each far under 4.5 MB), and pass a `filename → media_id` map to a new optional `media_map` parameter. That reuses an endpoint live since session 51 and **adds no new way to authenticate**, where a short-lived upload ticket means a bearer-equivalent credential outside the normal token path — single-use, short TTL, bound to the admin and to this one action, header not query string so it stays out of access logs. Neither is built |
| **Milestone audit trail is gone for every existing order** | High (data, backend) | Backend found it while doing session 76: `order_logs.action` is a MySQL ENUM that never contained the milestone actions, and those writes sit behind a `try/catch` that logs a warning and continues — so MySQL has silently rejected every one since DOC-7 shipped. **The payment-milestone history does not exist on production for any order and those rows are unrecoverable.** Migration #31 adds the eleven values. Nothing to do frontend-side, but the admin order log will read as though nothing ever happened before #31 — worth knowing before someone concludes the log is broken |
| **Session 76 needs deploying (migration #31)** | High | Frontend for all four items is in and degrades cleanly, but until backend deploys: `request-deposit` 404s (the button reports "Could not request the deposit"), `upload-options` 404s (the type dropdown silently uses its built-in fallback list — correct, just not server-driven), and `declaration_can_sign` / `payment_milestones_active` come back undefined so both gates fall back to the legacy recomputation. The one behaviour that changes **only** on deploy is proformas no longer e-mailing a deposit request on their own |
| **Verify `GET /admin/campaign-design` response shape** | High | The one unverified assumption in the campaign builder — no live response was available from this side, so `lib/campaign-design.ts` normalises several plausible key spellings rather than guessing one. If the block editor comes up on the "not available on this server yet" fallback after deploy, **this is the first thing to check**. Also unverified: block-instance field names (`{ type, ...fields }`, inferred from the example payload) and the `test-send` recipient key (`email` assumed) |
| **Migration #29 not yet applied (campaign drafts)** | High | Autosave endpoints 500 until it lands; the composer shows a quiet "Autosave unavailable — don't leave this tab" chip and stops retrying for the session. Once applied: remove 500 from `isDraftStorageUnavailable()` (`lib/campaign-draft-proxy.ts`) so genuine faults stop reading as "not deployed", and confirm `/latest` returns blocks (the client re-reads `/{id}` on restore rather than trusting the light shape) |
| Campaign audience — "who exactly gets this?" preview | Medium | The one remaining reason to leave the composer. Needs a backend `recipient-preview` (a sample from the same query the send uses); building it on the contacts list endpoint would risk showing a different set than the one emailed — see the callout under Admin Panel — Marketing |
| **Migrations #26 + #27 not yet applied** | High | Frontend ships ahead of both by design and degrades cleanly. Until **#26**, `markets[]` returns a one-element array — chips render but ✕/+ have nothing useful to do. Until **#27**, block-designed campaigns still render and send, but Reopen/Duplicate and saved templates don't (saving returns an explicit 501, never a false success). Nothing to fix frontend-side; this is a "why does it look inert" note |
| Campaign colour picker displays a scheme it isn't sending | Low | The theme `<select>` starts at `""`, which matches no `<option>`, so the browser paints the first one (Okelcor Dark) while the composer sends no theme at all and the backend applies its own default. Currently harmless — and *accidentally* correct as long as the schema's first option is the backend default — but the fix is to seed the state from the schema rather than to keep relying on that. Deliberately not changed alongside the theme-payload fix: it alters which theme every campaign sends, which is a behaviour change and wants its own verification |
| Campaign draft autosave loses an imported palette on restore | Low | Drafts persist `theme: { preset }` only, so restoring a draft of an imported design comes back in house colours rather than its recovered palette — legible and sendable, just not what was imported. Needs `themeOverrides` threaded through the autosave snapshot, which feeds its dirty-tracking hash |
| Campaign builder — template rename/edit | Low | `PATCH /campaign-templates/{id}` is proxied and ready; only create + delete are wired to UI |
| Market ops — `emails` paste-a-list selector | Low | All three market endpoints accept it; no UI yet. Natural next step for a marketer holding a list of addresses rather than a checkbox selection |
| **Rotate + scrub leaked Crisp credentials** | High (security) | Found while investigating live chat: `docs/session-handoff.md` has what look like real, plaintext `CRISP_IDENTIFIER`/`CRISP_KEY`/`NEXT_PUBLIC_CRISP_WEBSITE_ID` values committed (debug output from a past `X-Crisp-Tier` header issue). Rotate in the Crisp dashboard and scrub from git history. Not yet confirmed done |
| Market normalisation gap | Medium | See callout under Admin Panel — Marketing — CSV-embedded market values bypass the slugify step manual entries get; filter queries don't normalise either |
| Marketing CSV import fix | High | Backend to clarify expected email column header name |
| Media Library backend activation | High | 3 endpoints confirmed built; two bugs fixed — ready to test |
| CRM-7 backend activation | High | 12 endpoints pending |
| CRM-8 backend activation | High | 14 endpoints + approve must flip `onboarding_status`/`is_active` & send approval email (see CRM-8 contract block) |
| CRM-3B notifications backend activation | High | `admin_notifications` table + service + 6 endpoints + `my-work` + triggers + dedupe + `due-followups` scheduler (see CRM-3B contract block) |
| **EU tyre label backend fields** | High | 7 optional fields on the product payload — see `docs/BACKEND_NOTE_eu_tyre_label.md`. Frontend is live and degrades silently; legally the most significant catalogue gap. Open question raised with backend: whether the Rapid/supplier feed already carries these, which would make it bulk-populatable per model rather than manual entry |
| Admin product form — EU label inputs | Medium | Seven fields in `components/admin/product-form.tsx`, once the columns exist |
| Admin product form — stock field | Medium | Backend now accepts `stock` on POST/PUT and returns it from `formatProduct()`; the admin form has no input for it yet |
| Ops data capture — tyre passport | Medium | `tyre_batch` stays null until inspections are recorded; the frontend card is built and waiting |
| `estimated_dispatch_days` value | Low | Ships blank by design — needs an order-manager-approved number in `site_settings` before anything displays |
| Premium-UX §3 — saved fitments / reorder | Low | Not addressed in backend's §1/§2 reply; parked, not lost |
| **Admin correction of partner sales** | High | `AdminPartnerSaleController` has no update path — a sale past the 24h window can be disputed but never corrected, and the wrong figure ships in the CSV export. Requested: `PATCH /admin/partner-sales/{id}` + required `reason` → audit trail. See `okelcor-partner/docs/BACKEND_REQUEST_3_editability.md` |
| `PARTNER_EDIT_WINDOW_HOURS` | Medium | Currently 24, env-driven, no code change. Business call — 24h locks most of a weekend paper-backlog entry session |
| Partner app — pull-and-merge under real load | Medium | Shipped, but only exercised against one partner. Worth watching once two people in one organisation report from different phones |
| ~~**Move repo out of `~/Documents` (iCloud)**~~ — **DONE**, repo now at `~/okelcor-website` | ✅ Resolved 2026-08-11 | Confirmed by the payoff, not just the path: `npm run build` completes in 11s (it previously sat at 0% CPU indefinitely) and `eslint` finishes in seconds after two sessions of never completing. The failure history below is kept for its lesson — an atomic `rename()` across the iCloud file provider is neither resumable nor inspectable, so copy-then-verify-then-delete was the right shape. Remaining follow-on: the `".next"`-in-`tsconfig.exclude` row, and a full-repo lint to replace the stale "11 errors" figure |
| ~~Verify ESLint once the repo is off iCloud~~ — **DONE** | ✅ Resolved 2026-08-11 | It runs. 0 errors / 0 warnings on this session's eight files. The repo-wide count is still unmeasured — see the build-status note at the top |
| <details><summary>Move-off-iCloud failure history (2026-08-07)</summary> | — | **`mv` does not work here. Don't just retry it.** `mv ~/Documents/project/okelcor-website ~/dev/okelcor-website` ran ~25 min and died with `mv: rename …: Operation timed out` — a single `rename()` syscall the iCloud file provider never serviced. **That failure mode is the safe one:** `rename()` is atomic, so the destination was never created and there is no half-copied tree. Source verified intact after: `HEAD` = `cfd4498`, 726 tracked files, `contacts.csv` md5 `1dc6b168…` and `docs/FRONTEND_NOTE_tracking.md` md5 `075918eb…` both unchanged from the pre-move manifest. (`git fsck` could not be used as evidence either way — it times out past 5 min on this filesystem.) **What the attempt revealed:** macOS materialises every evicted placeholder before it will move the folder — the source **grew 398 MB → 434 MB → 621 MB** while the destination still didn't exist. Those were dataless files, which is exactly the corruption risk that makes this move worth doing. **Recommended approach instead:** `rsync -a` the repo excluding `node_modules` and `.next` (both regenerable, and together the bulk of the 621 MB — leaving ~100 MB, mostly `.git`), verify at the destination, `npm install` there, and **only then** delete the original. A copy-then-verify-then-delete is resumable and inspectable where an atomic rename is neither. Everything tracked is already pushed (`cfd4498`), so a `git clone` into `~/dev` plus copying the four untracked files across is an equally valid, even simpler route. Prior history: iCloud had duplicated files **inside `.git`** (four stray index copies + `refs/remotes/origin/main 2`, breaking `git fetch` with `bad object`), duplicated source files (`route 2.ts`), and makes `eslint`/`tsc` time out. `.git` was verified free of duplicates immediately before the attempt </details> |
| **UI — editorial restructure** | Medium | The visible-change follow-on to the shipped typography pass: bento/broken-grid homepage recomposition, redesigned product detail page, reworked shop catalogue. DOM content + heading hierarchy preserved, so still SEO-invariant. Researched and scoped, not started |
| Never `kill -9` a Next build | — (process) | Orphans `webpack-loaders.js`/`postcss.js` children that keep holding Next 16's build lock; every later build then queues silently. One build at a time; ~4 min cold |
| Add `".next"` to `tsconfig.json` exclude | Medium | `include` is `**/*.ts` with only `node_modules` excluded, so tsc walks the entire build output |
| Homepage `<title>` says "The Cheapest Tyres on the Internet" | Medium | Directly contradicts the premium positioning in CLAUDE.md, but it's a live SEO asset — business decision, deliberately not changed |
| Product `currency` field | Medium | Catalogue-side equivalent of the admin order currency already shipped |
| Pre-existing ESLint errors (11) | Medium | `react-hooks/set-state-in-effect` on the fetch-on-mount pattern; same targeted-disable convention already used in `cart-context.tsx` would clear them |
| Customer proposal view (account portal) | Medium | Show proposal status on account quotes |
| Proposal PDF document (AN number) | Medium | Backend to generate; frontend to display |
| **`contacts.csv` sitting in the repo root** | **High (data)** | The real 188-row marketing list — company names and e-mail addresses. Untracked and **deliberately not committed**: pushing it publishes real contact data to GitHub permanently, and a later scrub can't fully undo that. Add it to `.gitignore` (there is currently no `csv` rule) and keep the file outside the repo |
| Repo-root junk — 15 screenshots + a `.webp` | Low | Untracked leftovers from a July session, referenced nowhere. Delete or ignore |
| **Verify ESLint once the repo is off iCloud** | Medium | It has not completed on this machine for two sessions. The move is the fix; until it runs, the "11 pre-existing errors" figure is a stale claim, and this session's changes are unlinted |

---

## Session note — 2026-08-14 (session 87)

**Shipped, uncommitted:** the channel split in the report, the CSV export, the
two new board columns, and the fulfilment queue rebuilt as two sections. One new
proxy. **Verified:** build exit 0 (7.2s, 104 pages) · TypeScript 0 errors ·
ESLint 0/0 · board, report (both channel views) and queue rendered and
screenshotted, and the export button checked under **two roles** — present for
`order_manager`, absent for `support`.

**The most useful thing this session was a sentence I nearly shipped.** The queue
said "Oldest first, because the queue is worked from the back" and passed
`sort: "oldest"`. The orders list has no sort parameter — it is
`orderByDesc('created_at')`, hardcoded — so the parameter did nothing and the
sentence was false. It would have read as a considered decision rather than a
mistake, which is what makes that class of error expensive: nobody checks a claim
the UI states confidently. Fixed by saying what it actually does, and by *not*
sorting the fetched page client-side, which would have produced a more
convincing version of the same lie.

**Two design constraints from the note held under pressure and are worth keeping
stated.** Branching on `channel_split` rather than assuming `channels` exists is
what stops an empty legend when one channel is requested. And keeping every chart
to two series — one metric per chart in split view — is what stopped the obvious
"plot all three channels of everything" from turning into a dual-axis chart.

**Rendering found two smaller things.** The granularity and channel toggles sat
adjacent and read as one row of five buttons with two apparently-active pills; a
hairline divider now separates them. And the export button could only be
confirmed by setting the role cookie in the harness and looking twice — which is
also how the `support` exclusion got verified rather than assumed.

---

## Session note — 2026-08-14 (session 86)

**Shipped:** the clients drill-down, the transaction report and its charts, the
invoice register changes, and file attachment on finance invoices. Seven new
routes (two pages, five proxies). **Verified:** build exit 0 (6.8s, 104 pages,
all seven routes registered) · TypeScript 0 errors · ESLint 0/0 · the board,
report and clients list rendered and screenshotted against backend's payloads,
including a zero period and a null-percent change.

**The new rule earned itself again, twice, in the same screenshot.** The charts
rendered with axes, gridlines, legend and correctly-scaled domains — and no
lines. The paths were in the DOM with correct geometry and
`stroke-dasharray="0px 703.55px"`: recharts' entry animation, frozen at frame
zero. Types, lint and build were all green. Fixing it also removed a real
user-facing case, not just a screenshot one — a chart in a background tab renders
empty until focused. Looking again at the fixed version showed the second defect:
smoothing through discrete monthly buckets, which around the empty month drew a
decline that never happened.

**Checked before building, not after.** `?system=` takes a single value
(`AdminFinanceInvoiceController:34`, a plain string used in a `where`), which
decided the tabs; and **both** `meta.systems` and `meta.manual_systems` are
served, which meant the tabs and the create dropdown could each be driven off the
server rather than hardcoded. Neither was in the note.

**One judgement worth recording, because it overrode the obvious reading of the
ask.** The report's `series` carries four datasets and the natural thing is to
plot them together. `amount` is money and the rest are counts, so that means a
second y-axis — and two lines crossing on a dual axis implies a relationship that
exists only because of how the scales were picked. They are small multiples
instead: the two order counts share a chart because they share a unit and a
meaning, and are also exactly the two-series pair the palette was validated for.

---

## Session note — 2026-08-14 (session 85)

**Shipped, uncommitted:** two files — the two new import-result fields on
`MarketingContactImportResult`, and the panel that surfaces them. **Verified:**
build exit 0 (6.7s, 104 pages) · TypeScript 0 errors · ESLint 0/0 · the panel
rendered and screenshotted in all three cases (Wix detected, ordinary import,
three markets).

**Backend was right that there was almost nothing to build — and the part worth
doing was checking *why*.** Both claims were verified against source rather than
accepted: the market selector really is fed from `/markets` (`useMarketOptions`),
so `wix` appears with no deploy; and the import proxy really does spread
`json.data`, so the new fields pass through untouched. Two claims, two greps,
both true — which is worth recording precisely because the last three sessions
each found a note claim that wasn't.

**Looking at it caught a bug that types, lint and build could not.** The panel
rendered `Croatiais still each contact's primary market` — JSX had stripped the
space between an expression and the text following it, which the build cannot
see and no test would catch. Confirmed in the rendered HTML
(`Croatia<!-- -->is still`) rather than guessed at, and fixed with an explicit
`{" …"}` — the same form used two lines above, which is exactly why that line
rendered correctly and this one didn't. **Third session running that
screenshotting found something green checks missed** — which backend has asked be
kept permanently rather than treated as a per-session extra. **It now is:
`CLAUDE.md` gained a "Look at the UI before calling it done" rule**, with the
headless-Chrome invocation, the console-capture flags, the throwaway-harness
convention (including deleting it and reverting any temporary `export`), and the
reason it exists — verify against rendered output, because JSX whitespace and
conditional rendering both differ from what the file appears to say.

**Backend found a duplicate in `markets_applied` from this report** (`cd595d9`):
`array_unique` was applied to the per-row markets but not to the reported list, so
importing the Wix export *into* the `wix` market returned `["wix","wix"]` — length
> 1, so the panel would have fired and said "Imported into wix — still their market
— and also added to Wix." Both the uniqueness and the first-position ordering the
panel depends on are now asserted by test rather than emergent. **The `length > 1`
key needed no change and was kept.** A `Set` was added at the render anyway: this
is not a guess about data the way a client-side fix for the market-normalisation
gap would have been — rendering the same market twice produces a sentence that is
false on its face, and one `Set` makes it unsayable rather than unlikely. Deduping
before the length check also means a duplicate now makes the panel fall silent,
which is the right outcome.

**Expect the panel to say nothing on the real import, and don't report it.**
The production run of the original export will most likely pick `wix` as the
chosen market — that list spans the UK, Germany and Canada, so no geographic
market fits — giving `markets_applied: ["wix"]`, length 1, and a silent panel.
Correct: a contact in one market has nothing to explain.

**Method note: the harness needed a component that wasn't exported.** `ImportCard`
is internal, and its result is internal state. Rather than test a copy of the JSX
— which would have proved nothing about the real component — it was temporarily
exported with a seeded-result prop, screenshotted, and both edits reverted before
committing. The diff is two files; the temporary scaffolding left no trace.

---

## Session note — 2026-08-13 (session 83)

**Shipped, uncommitted:** all six screens from backend's note, in their stated
priority order — operations board, in-transit queue, sign-off panel, eBay page,
finance invoices + reconciliation, and the nine-role picker — plus the two document
changes (overridable generation gates, `signoff_incomplete` on send) and the
`signoffs_withdrawn` toast. Ten new routes (four pages, six proxies). **Verified:**
build exit 0, compiled in 7.5s, 104 pages, all ten routes registered · TypeScript 0
errors · ESLint 0/0 · the board and all four sign-off states rendered and
screenshotted against backend's payloads verbatim.

**The note was in the API repo, not this one.** It said "in the repo root" and meant
its own — the same shape as the campaign-autosave note in session 74. Worth
remembering as the default: when a note is missing here, look in `~/dev/okelcor-api`
before asking for it.

**Reading the source found two things the note had wrong, and one it didn't mention.**
Both findings are in the module section above. The one it didn't mention was the most
consequential for this build: `orders.view` now includes `finance` server-side, which
the note never says — and without it a finance admin could not have reached the order
page to give the signature the whole feature exists to collect. **Three sessions
running, the standing rule has paid: check the source before theorising.**

**Where I declined to build what was asked, and why.** The in-transit queue was to
carry a "documents sent?" column. The field isn't on the list row — only on the order
detail — so the honest options were one request per row, or a column that asserts
something it hasn't been told. It says instead that the list doesn't carry document
state, and backend has been asked for one field. This is the same call as the
behaviour-analytics funnel: **a screen may show less than was asked for, but it may
not claim more than it knows.**

**Looking at it again earned its place.** The board and the sign-off panel were
screenshotted against backend's payloads before being called done, and the screenshot
showed **Withdraw offered on every signed slot regardless of role** — a permissions
puzzle of exactly the kind the `you_may_sign` instruction exists to prevent, in the
one control that instruction doesn't cover. Types, lint and build were all green with
it. Now gated on the slot's own `permission`, which the payload already carries.

---

## Session note — 2026-08-13 (session 81)

**Shipped:** the `position_grid` control for backend's new `hero` block, the `group_list`
control for `cards`, the editor drag-selection fix, and stable block keys. Four files:
`components/admin/campaign/{block-field,block-editor}.tsx`, `lib/campaign-design.ts`,
`lib/admin-api.ts`. **Verified:** full `npm run build` exit 0, compiled in 6.1s, 104
pages · TypeScript 0 errors · ESLint 0 errors 0 warnings on all four · both new controls
rendered and screenshotted against backend's specs verbatim, including a group nested two
levels deep and all four degradation paths.

**Most of this block needed no frontend work, which is the design working.** `hero`
has nine fields; seven render from field types the generated editor already had, and
`position` worked as an ordinary dropdown from the moment the schema shipped. Only the
`position_grid` hint was built. Backend shipping it as "works without you, better with
you" is why nothing was blocked on this side.

**The drag bug was ours, and the report named the cause precisely.** "The whole box
moves *sideways* when I highlight" is a drag ghost following the pointer, not a layout
shift — `draggable` on the whole card, and the DnD spec suppresses text selection
inside a draggable subtree. Worth noting **the report was more diagnostic than three
rounds of screenshots have been on other bugs**, because it recorded the direction of
the movement. That detail is the whole diagnosis.

**One correction to backend's note, and one to my own tooling claim.**

1. *Their* stated mechanism for index keys — "editing text can remount the input and
   drop the caret to the end" — doesn't happen here: the inputs are controlled, so a
   keystroke re-renders without remounting. The real cost is that each row's local UI
   state binds to a *position*, so deleting block 2 of 5 leaves the image field's
   broken/picking flags on the wrong block. Fixed, same shape, different failure. The
   ids are held **beside** the blocks: `blocks` goes verbatim to the wire and into
   autosave's dirty hash, so an id on the block object would send an unknown field and
   mark a pristine campaign dirty.
2. *Mine*: PROGRESS.md has said since 2026-08-12 that the behaviour-analytics page
   couldn't be looked at because "no headless browser is installed". **That was wrong.**
   The Chrome extension genuinely can't reach localhost — it fails identically on both
   hostnames and only the user can grant it that permission — but Chrome's own
   `--headless --screenshot` needs no extension and was on this machine the whole time.
   The exact invocation is now in the backlog row. **The standing "check the source
   before theorising" rule has a sibling: check what's actually installed before
   declaring something unverifiable.**

**Looking at it found a bug the checks couldn't.** A harness mounting the real spec
showed the "No picture chosen yet" notice sitting at the top edge *inside* the 3×3 box —
so choosing `top_center` dropped the headline straight on top of it. Types, lint and
build were all green with that in place. It is now below the box, where no cell can
collide with it. The same pass also killed a CSS-injection surface: the picture was
being interpolated into `url("…")`, where a stray quote closes the string and injects
declarations into the admin page; it is a real `<img src>` now, which needs no escaping.
The harness was deleted after use.

**`group_list` was deferred at midday and built by evening, and the gap is the point.**
It was held back for want of a contract; backend then found *why* one couldn't be written
confidently — the field was being **served in two shapes**, `item_fields` as an object
keyed by field name against a block's own `fields` as a list of objects carrying `name`.
Same concept, two shapes, so a renderer for one couldn't be reused for the other. Once
flattened (recursively — a shape that only holds one level deep breaks the first time it
nests), the frontend cost collapsed to almost nothing: `normaliseField()` calls itself,
`BlockField` renders itself, and every existing field type works inside a group at any
depth. **A guess at the item-field key would have produced working code against the
wrong half of a contract that disagreed with itself** — and nothing would have said so
until production.

**Backend found a `url()` injection in `hero` by taking this session's CSS finding
seriously against their own code**, which is the better half of that exchange: `e()`
isn't sufficient there because the HTML parser decodes `&#039;` back to `'` before the
CSS parser sees it, and `FILTER_VALIDATE_URL` accepts apostrophes, brackets and
semicolons in a path. They percent-encode rather than reject, so `tyre_(winter).png`
still works. Frontend needed no change — the preview had already moved to an `<img src>`,
which needs no escaping at all. **Worth keeping as a pattern: a finding about one side's
handling of a value is worth re-running against the other side's, because the value
crosses.**

**Answering backend's open question — yes to a server-side `min_items` on `cards`.** A
cards block with no cards renders an empty band: it is a block that occupies space and
says nothing, and the marketer should be told at validation rather than discovering it in
the preview. Declared server-side it costs the editor nothing, since the message routes
to the block card like every other. **Nothing was imposed client-side in the meantime** —
a floor the editor enforces and the send doesn't is exactly the disagreement backend's
empty-row fix just removed.

**A stale dev server cost twenty minutes and is worth naming.** The `next dev` left
running on 3939 since session 79 served **stale renders of a new route** — the source had
an edit, the served HTML didn't, and no error appeared anywhere. It also produced a
one-off hydration warning that vanished on a fresh server. Killed and restarted, both
symptoms went. **A dev server that has survived several sessions of edits is a suspect
before the code is**, and Next refuses a second one, so the stale process also silently
captures any attempt to start a clean one on another port.

---

## Session note — 2026-08-12

**Shipped, in order:** the InDesign design import (backend session 77), the campaign
`theme` payload fix, the block-vocabulary note, the server-rendered preview seed, the
customer behaviour analytics page (session 79), and the sent-campaign viewer fix. Seven
commits, `9ce6116..c22499b`, all pushed. Detail in the tables above.

**The through-line of the day: four separate bug reports, none of which was where it
looked.** Worth reading as a set, because the pattern repeated and the fixes for it are
now structural rather than resolutions to be more careful.

| Reported as | Actually |
|---|---|
| "the order marked itself paid" | `mark-paid` demanded `payment_method === 'bank_transfer'`, which no admin-created order has, so ticking paid on the creation form was the only route to a paid order |
| "the imported design's images are in the wrong layout" | The renderer has no multi-column block at all — three stacked `image` blocks was the only output available. Entirely backend's; **no code changed on our side** |
| "the preview shows the old layout" | The composer sent `theme` as a bare string, every endpoint validates it as an array, the 422 was swallowed as "normal while half-finished", and **the previous render stayed on screen** |
| "the mobile preview isn't responsive" | Backend's own CSS, five bugs, fixed server-side. Both hypotheses about our side were already correct — but auditing every HTML surface found the sent-campaign viewer injecting a whole email document into a `<div>`, stripping every media query |

**Three things made structurally impossible rather than promised against:**

1. **A silenced error class hides things outside the class.** The preview swallowed *all*
   422s to avoid nagging on every keystroke; that silence cost two weeks on the theme bug.
   Now scoped to 422s that actually carry block errors, and a request-level rejection
   clears the stale render instead of leaving it up looking like a successful one.
2. **A report that omits the reader's screen state costs rounds.** The preview toggle was
   in the UI the whole time. Each preview header now prints `Mobile · 375px`, so the fact
   travels with any screenshot whether anyone thinks to include it or not.
3. **Reading the source beats reading the note.** Four contract corrections this session
   came from `~/dev/okelcor-api` rather than from the notes: `invalid_blocks` (undocumented),
   `document_label`/`type_label` (the note named the wrong field; the controller accepts
   both), the 20 MB upload cap (we rejected at 10), and the `analytics.view` role list.
   Backend has acknowledged the notes being written from memory. Keep the API repo local.

**One thing I could not verify, stated plainly:** the behaviour analytics page has never
been *looked at* with data in it. Build, types, lint and the colour validator all pass, but
the validator checks colour, not geometry. Three screenshot attempts failed —
the Chrome extension appears to lack localhost permission — and no headless browser is
installed. The harness is left in place for it. See the backlog row.

**Both findings raised with backend were confirmed, and both are now closed.**

**Media duplication — fixed backend-side, no frontend change.** Conversions are keyed on
the archive's own **content hash**, cached 2h: same bytes → same conversion and the same
media rows, whoever uploads them and however often they review; edited bytes → converts
again, so an edit is never served a stale design; media deleted in the meantime → the reuse
is dropped rather than handing back blocks pointing at dead URLs. Three tests cover exactly
those cases. Keyed by content rather than uploader or filename on purpose, so two marketers
reviewing the same export share the work. A `checksum` column on `media` would generalise
better but is a migration on a live table for a problem confined to this flow. Invisible
from here except duplicates stop and every call after the first is faster — the comment in
`indesign-import.tsx` that warned about accumulation has been rewritten accordingly.

**The 4.5 MB ceiling is real but not currently binding — I overstated it.** I claimed
photographic exports would exceed it "routinely". Backend supplied the two facts that
settle it: the importer already caps images at **2000px / JPEG 90**, so above that a larger
export yields a **byte-identical email**, and the real Fuel Eco Tech export is **1.6 MB**.
My own instinct about server-side downscaling making a smaller export lossless turned out
to already be true — it simply wasn't written down anywhere. **The consequence for the UI is
the part that matters:** the advice changed from "re-export at a lower resolution", which
sounds like accepting worse quality, to naming **Medium / 150 ppi** and stating that images
are reduced to 2000px anyway. Same instruction, and now a marketer has no reason to resist
it. Backlog row downgraded High → Low.

**If it ever does bind, backend's route beats mine and the reasoning is worth keeping:**
split the archive client-side and push images through the existing `POST /admin/media` with
a `filename → media_id` map, rather than my short-lived upload ticket. Both work; only mine
introduces a bearer-equivalent credential outside the normal token path, and that is a
surface to get exactly right (single-use, short TTL, bound to the admin and the action,
header not query string). Preferring the option that adds **no new way to authenticate** is
the right instinct. Neither is built.

**The empty-preview report was a real bug, and it was ours — but not in the import.**
Backend offered two hypotheses. Both named real defects in this codebase, and **neither was
the cause**, which is worth recording because guessing from the symptom would have missed it
a third time:

- *"the list endpoint carries no blocks"* — genuinely true of `applyTemplate`, and fixed.
  But it yields **zero** blocks in the editor, and the report said twenty.
- *"`themeToKey()` may return undefined for a whole theme object"* — it doesn't; it reads
  `preset` and returns `"okelcor_dark"` correctly. Extraction was never the problem.

The cause was one step later: the composer **re-serialised** that key as a bare string, and
every campaign endpoint validates `theme` as an array. A string is a 422, and the preview
swallowed all 422s as "normal while half-finished". So `theme: "okelcor_dark"` → 422 → no
error set → the empty-canvas state beside a full block list. Details and the three related
fixes are in the Marketing table. **The generalisable lesson isn't "check the source" this
time — it's that a deliberately silenced error class will eventually hide something that
isn't in the class.** The silence is now scoped to 422s that actually carry block errors.

**First real import surfaced a layout gap, and it is entirely backend's.** The deck's
three-across photo row and its twelve three-across benefit cards stack vertically, because
the renderer's whole vocabulary is eight single-column blocks. Worth recording the reasoning
as well as the conclusion: **the temptation was to "fix the layout" frontend-side, and doing
so would have broken sending** — blocks render server-side and an invented columns type
fails `validateBlocks()`. So no code changed for it; the deliverable was a note
(`docs/BACKEND_NOTE_campaign_layout_blocks.md`) specifying four blocks, ordered by value per
unit of work, and deliberately shaped so three of the four need **no frontend deploy at all**
(they reuse field types the generated editor already renders). The reference image went to
backend directly and is not committed.

**A process point aimed at us, and it lands.** Three rounds went into "the preview
shows the old layout" — a stale deploy, a supposed client-side renderer, a saved
template — and the real condition was screen-size dependence, which only surfaced on
the fourth report. The preview has a desktop/mobile toggle **right there in the UI**,
and naming which one was active would have gone straight to it. **Fixed structurally
rather than by resolving to remember:** each preview header now prints its mode and
pixel width, so the fact travels with every screenshot whether anyone thinks of it or
not. The general lesson is the same shape as the swallowed-422 one — when a report
keeps missing, ask what state the reporter's screen was in that the report doesn't
carry, and then make the screen say it.

**The process point, now twice.** `invalid_blocks` was missing from the note; I found it by
reading `AdminCampaignImportController` instead. Backend owns it and has noted that the same
failure produced the Session 75 partner-login bug — a note written from memory rather than
transcribed from source. **The standing rule from 2026-08-10 keeps earning its place: check
the source before theorising.** Two sessions, three contract corrections caught this way
(`invalid_blocks`, `type_label`/`document_label`, the 20 MB upload cap).

---

## Session note — 2026-08-11

**Shipped:** the frontend half of backend's session-76 note — four items, detail in the
Orders & Documents table. Not committed yet.

**The method note from 2026-08-10 paid off immediately.** Every contract was checked
against `~/dev/okelcor-api` rather than the note alone, and the source disagreed with
the note twice in ways that would have cost a deploy cycle each:

1. The note names the upload field **`type_label`**; this frontend has always sent
   `document_label`. Reading `AdminTradeDocumentController` showed the controller
   explicitly merges one into the other, so **nothing was broken and no migration of the
   field name was needed** — a guess either way would have been a coin flip.
2. The server's upload cap is **`max:20480` (20 MB)**; this frontend rejected at 10 MB
   before the request left the browser. A 12 MB scanned bill of lading was being refused
   by our own validator against a server that would have taken it. Raised to 20 MB.

Also read from source rather than assumed: `UPLOADABLE_TYPES`/`OFFICIAL_TYPES` (so
`supersedes` copy is accurate), that `request-deposit` sits behind `payments.mark_paid`
(so the button is gated on the same permission the route requires), and that
`declaration_can_sign` additionally requires the declaration to still be `pending`.

**One deliberate deviation from the note.** It says "default `payment_status` to pending
on the create form", while also saying `paid` at creation stays correct for historical
backfill. The only admin create form in this repo **is** the historical-backfill one
(`add-historical-order-modal.tsx`), so those two instructions point opposite ways here.
Defaulted to `pending` anyway: now that mark-paid works on manual orders, the cost of the
wrong default is asymmetric — recording money that hasn't arrived is worse than one extra
click on an order that is genuinely settled — and the form states which case is which.

**Could not reproduce one reported symptom.** The note describes a screenshot with all
five stages showing Resend on a stage-one order. `payment-milestones-card.tsx` already
restricted that control to reached stages, and on `pending_proforma` it rendered no ladder
at all, so this component does not appear able to produce that. Fixed what is defensible
instead: the control is still reached-only, and the unsent state is no longer styled as a
failure now that not e-mailing is a legitimate choice. **If the screenshot was of the
customer portal or of `logistics-dashboard.tsx`, it is still unfixed** — worth asking
which screen it was.

---

## Session note — 2026-08-07

**Shipped:** campaign editor autosave + in-place image upload (`cfd4498`, pushed). Full
detail in the Marketing table and `docs/FRONTEND_NOTE_campaign-autosave.md`.

**Two things a reader should not have to rediscover:**

**The partner-sales module vanished from the working tree during this session.**
`app/admin/partners/`, `app/admin/partner-sales/`, `app/api/admin/{partners,partner-sales,partner-users}/`,
`components/admin/{partners-manager,partner-sales-review}.tsx`, `lib/partner-proxy.ts` and
`docs/PROPOSAL_partner_sales_app.md` were all untracked-present at session start; by the
time of the commit they were gone and `admin-shell.tsx` / `admin-permissions.ts` had
reverted to unmodified. **None of it was ever committed, so if that removal wasn't
deliberate, it is not recoverable from git.** Nothing in this session touched those
files. Flagged rather than acted on.

**The repo move failed and the repo is still in `~/Documents`.** Details and the
recommended alternative are in the backlog row above. Nothing was lost — the attempt
died on an atomic `rename()` that never took effect.

**When the move is retried, in this order:**

1. `rsync -a --exclude node_modules --exclude .next` into `~/dev/okelcor-website`
   (or simply `git clone` there — everything tracked is pushed at `cfd4498` — then copy
   the untracked files across: `contacts.csv`, `.claude/settings.local.json`,
   `docs/FRONTEND_NOTE_tracking.md`, and the repo-root screenshots if they're wanted).
2. Verify at the destination — `git log -1` = `cfd4498`, `git status` matches, the
   untracked checksums match — **before** deleting anything in `~/Documents`.
3. `npm install` in the new location (`node_modules` is deliberately not copied).
4. Restart the editor/CLI there — a session opened against the old path keeps a working
   directory that no longer exists.
5. Re-run `tsc` and `eslint`; both should now complete. If `tsc` is still slow, the
   `".next"`-in-`exclude` backlog item is the remaining cause, not iCloud.
6. Per the build-environment warning below, **one build at a time, and never `kill -9`
   a build.**
