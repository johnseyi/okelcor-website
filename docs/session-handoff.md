# Session Handoff

## Project Summary

This project builds the **Okelco corporate website**.

Okelco is a **global tyre sourcing and supply company** specializing in:

* Used tyres
* PCR tyres
* TBR tyres
* Logistics tyre supply
* Wholesale tyre distribution
* **Fuel Echo Tech** (fuel efficiency device — second product line, previously called "FET Engine Treatment")

The design system follows a **Tesla-inspired layout structure**, adapted to the tyre industry.
The backend is a Laravel API at `https://api.okelcor.de/api/v1` — fully live.

---

## Technology Stack

* Next.js (App Router)
* React 19 / TypeScript 5
* Tailwind CSS v4
* GSAP 3.14 + @gsap/react 2.1 (sole animation library — Framer Motion fully removed)
* **Custom cookie-based customer auth** — `customer_token` httpOnly cookie, proxied Laravel API (NextAuth fully removed)
* Resend (email API — contact, quote, and checkout order notification routes)
* `tailwind-merge`, `clsx`, `eslint-plugin-jsx-a11y`, `prettier` (added in design audit)

Development environment: Windows 11, VS Code, Node.js / npm

---

## Brand Colors (Authoritative)

### Okelcor Main Site
| Token | Value | CSS Variable |
|---|---|---|
| Okelco Orange | `#f4511e` | `--primary` |
| Orange Hover | `#df4618` | `--primary-hover` |
| Text Primary | `#171a20` | `--foreground` |
| Text Secondary | `#5c5e62` | `--muted` |
| Surface Grey | `#efefef` | — |
| Page Background | `#f5f5f5` | — |

### Fuel Echo Tech Page (`/fet`) — separate design system
| Role | Value |
|---|---|
| Page background | `#f0f4f0` |
| Cards | `white`, border `#e2e8e2` |
| Text primary | `#111111` |
| Text secondary | `#6b7280` |
| Accent / buttons | `#22c55e` (bright green) |
| Badge bg | `#dcfce7`, text `#166534` |
| Results section bg | `#0d2b1a` (dark green) — white text |
| CTA hover | `#16a34a` |

**Rule:** The Fuel Echo Tech page uses its own green-based palette. Never apply `var(--primary)` (orange) to FET-specific UI. All other Okelcor pages remain completely unchanged.

---

## Completed in Latest Session — Auth Loading & Redirect Fixes (2026-04-18)

### Auth Loading Delay & Flash Fixed

**Problem:** On every page load the navbar briefly showed the login icon (unauthenticated state) before switching to the profile icon once the `/me` fetch resolved. The account page email/name also showed `—` or blank during that window.

**Root cause:** The navbar was not checking `isLoading` from `useCustomerAuth()` — it immediately showed the unauthenticated state while the `/me` request was in-flight.

**Changes:**

| File | Change |
|---|---|
| `components/navbar.tsx` | Destructures `isLoading: authLoading` from `useCustomerAuth()`. Desktop: shows a `h-9 w-9 animate-pulse rounded-full bg-black/[0.06]` skeleton while loading instead of the login icon or profile button. Mobile drawer: shows a pulse bar skeleton instead of the auth section while loading. |
| `app/login/page.tsx` | After a successful `login()` call, now calls `await refreshCustomer()` before `router.push()` so the auth context is fully populated before the account page renders. Reads the `redirect` param first, falls back to `callbackUrl` for backwards compatibility. |

---

### Middleware — `redirect` Param + Prefetch Skip

**File:** `middleware.ts`

Two changes:

1. **`callbackUrl` → `redirect`:** Login redirect URL param renamed from `callbackUrl` to `redirect` (e.g. `/login?redirect=/shop`). All server-side redirects across `account`, `orders`, `checkout`, and `account/orders/[ref]` pages updated to match. Login page reads `redirect` first, falls back to `callbackUrl`.

2. **Prefetch skip:** Next.js speculatively prefetches `<Link>` hrefs when a page loads. If middleware redirected a prefetch request (e.g. `/shop` prefetched before the cookie propagated), Next.js cached that redirect response and replayed it on the actual click — even after the user was logged in. Fix: middleware now returns `NextResponse.next()` immediately for requests with `Next-Router-Prefetch: 1` header. The actual navigation still hits the full cookie check.

```ts
// Skip prefetch requests — actual navigation will be checked
if (request.headers.get("Next-Router-Prefetch") === "1") {
  return NextResponse.next();
}
```

**Protected routes:** `/shop`, `/checkout`, `/account` (and all sub-paths). `/shop` is intentionally protected — unauthenticated users are redirected to `/login?redirect=/shop`.

---

## Completed in Previous Session — Customer Auth, Account Pages & Design Audit (2026-04-18)

### NextAuth Removed — Replaced with Direct Laravel Cookie Auth

`next-auth` has been **fully uninstalled**. The entire auth system now runs on a `customer_token` httpOnly cookie set by the Next.js API layer after proxying to Laravel.

**Deleted files:**
- `app/api/auth/[...nextauth]/route.ts`
- `lib/auth.ts`
- `components/auth/session-provider.tsx`

**New auth files:**

| File | Purpose |
|---|---|
| `lib/customer-auth.ts` | Client-side helpers: `loginCustomer`, `registerCustomer`, `logoutCustomer`, `forgotPassword`, `resetPassword`, `getCustomerProfile`, `updateCustomerProfile`. All call relative `/api/auth/customer/*` routes. |
| `lib/get-customer.ts` | Server-side helper: `getCustomerFromCookie()` reads `customer_token` cookie and calls `GET /api/v1/auth/me` with Bearer token. Used by server components (checkout, orders, account). |
| `context/CustomerAuthContext.tsx` | `CustomerAuthProvider` + `useCustomerAuth()` hook. State: `customer`, `isAuthenticated`, `isLoading`. Methods: `login(email, pw)` → returns `Customer`, `logout()`, `refreshCustomer()`. Fetches `/api/auth/customer/me` on mount. Wraps `app/layout.tsx`. |

**New API proxy routes (all under `app/api/auth/customer/`):**

| Route | Method | Behaviour |
|---|---|---|
| `login/route.ts` | POST | Proxies to Laravel `/auth/login`; sets httpOnly `customer_token` cookie (7-day); returns `{ customer, email_verified, must_reset }` |
| `register/route.ts` | POST | Proxies to Laravel `/auth/register` |
| `logout/route.ts` | POST | Calls Laravel `/auth/logout` with Bearer token; always clears cookie |
| `forgot-password/route.ts` | POST | Proxies to Laravel `/auth/forgot-password` |
| `reset-password/route.ts` | POST | Proxies to Laravel `/auth/reset-password` |
| `me/route.ts` | GET | Reads cookie; proxies to Laravel `/auth/me` |
| `profile/route.ts` | PUT | Reads cookie; proxies to Laravel `/auth/profile` |
| `change-password/route.ts` | PUT | Reads cookie; proxies to Laravel `/auth/change-password`; body: `{ current_password, password, password_confirmation }` |
| `addresses/route.ts` | GET + POST | List and create addresses via Laravel `/auth/addresses` |
| `addresses/[id]/route.ts` | PUT + DELETE | Edit and delete via Laravel `/auth/addresses/{id}` |

**`customer_type` values:** always lowercase — `"b2c"` and `"b2b"` (the API rejects uppercase).

**Cookie:** `customer_token` — `httpOnly: true`, `secure: true` (production), `sameSite: lax`, `maxAge: 7 days`.

---

### Updated Middleware

**File:** `middleware.ts` — rewritten. No longer uses `getToken` from `next-auth/jwt`.

Customer protected routes (`/shop`, `/checkout`, `/account`, `/account/*`) now check `request.cookies.get("customer_token")`. If missing → redirect to `/login?redirect={path}`. Admin routes unchanged (still check `admin_token` cookie). Prefetch requests are always passed through (see latest session notes).

---

### Updated Navbar

**File:** `components/navbar.tsx`

- Removed `useSession`, `signOut` from `next-auth/react`
- Now uses `useCustomerAuth()` — `{ customer, isAuthenticated: isAuthed, logout }`
- Logout: `logout().then(() => { window.location.href = "/" })`
- Sign-in link updated from `/auth` to `/login`
- **Desktop profile dropdown** now shows: Signed in as → **My Account** (`/account`) → My Orders (`/account/orders`) → Sign Out
- **Mobile drawer** authenticated section now shows: My Account → My Orders → Sign Out (was missing My Account)
- New import: `LayoutDashboard` icon from lucide-react

---

### New Auth Pages

| Page | Path | Notes |
|---|---|---|
| Login | `app/login/page.tsx` | Email + password; "Forgot password?" link; "Don't have an account?" → `/register`; redirects B2C → `/account`, B2B → `/account/orders` after login; handles `email_verified: false` (shows verify screen with resend button) and `must_reset: true` (redirects to `/forgot-password?email=`) |
| Register | `app/register/page.tsx` | Individual/Business toggle (sends `b2c`/`b2b`); base fields + B2B extra fields (company, VAT with validate button, industry dropdown); country dropdown; terms checkbox; success screen with resend verify button |
| Forgot Password | `app/forgot-password/page.tsx` | Email input; success "Check your email" screen; back to login link |
| Reset Password | `app/reset-password/page.tsx` | Reads `token` + `email` from URL params; new/confirm password fields; password strength indicator (4-segment bar); success screen; invalid-token guard |
| Verify Email | `app/verify-email/page.tsx` | Shows verify prompt + resend button; detects `?verified=true` param and shows success screen |
| Old `/auth` | `app/auth/page.tsx` | Now a simple redirect → `/login` (preserves `callbackUrl` query param for backwards compatibility) |

**VAT validation** (register page): Uses `${NEXT_PUBLIC_API_URL}/vat/validate` (same as `VatField` component on quote page). Checks `data.data?.valid === true`. Shows three states: valid (green ✓), invalid (red ✗ with "check country code" message), unavailable (amber ⚠). Hint text: "Include country code — e.g. DE123456789, GB123456789, FR12345678901".

---

### New Account Pages

#### `app/account/page.tsx` — Dashboard
Server component. Reads `customer_token` cookie → calls `getCustomerFromCookie()`. Redirects to `/login?callbackUrl=/account` if unauthenticated.

Shows customer avatar initial, name, email, company name + VAT (B2B only). Then a card grid:
- **B2C:** Order History, Saved Addresses, Profile Settings
- **B2B:** Order History, Quote Requests, Invoices, Company Details, VAT Status, Profile Settings

Quick action buttons: Browse Catalogue, Request a Quote, Contact Support.

#### `app/account/profile/page.tsx` — Profile Settings
Client component using `useCustomerAuth()`. Two cards:

1. **Personal Information** — First Name, Last Name (editable), Email (readonly with "Contact support to change" note), Phone, Country dropdown. Saves to `PUT /api/auth/customer/profile`. Calls `refreshCustomer()` on success.
2. **Change Password** — Current Password, New Password (with 4-segment strength indicator), Confirm New Password. Saves to `PUT /api/auth/customer/change-password`.

Both show bottom-right toast on success (`bg-green-600`) or error (`bg-red-500`), auto-clears after 3.5s.

#### `app/account/addresses/page.tsx` — Saved Addresses
Client component. Fetches `GET /api/auth/customer/addresses` on mount.

- Card grid: shows Full Name, address lines, city, postcode, country, phone. "Default" star badge on default address.
- Edit button: opens `AddressModal` pre-filled with existing data (PUT).
- Delete button: calls `DELETE /api/auth/customer/addresses/{id}` with loading state.
- "Add New Address" button: opens `AddressModal` with empty form (POST).
- Empty state with prompt.

`AddressModal` — sticky header with X, scrollable form body: Full Name\*, Line 1\*, Line 2, City\*, Postcode\*, Country dropdown\*, Phone, "Set as default" checkbox. Cancel + Save buttons.

---

### Design Quality Audit Fixes

Applied before the auth migration:

| File | Fix |
|---|---|
| `components/cta-section.tsx` | `py-5` → `py-10 md:py-12` (section padding) |
| `components/fet-verified-strip.tsx` | `py-5` → `py-8 md:py-10` |
| `components/footer.tsx` | Bottom bar `py-5` → `py-6` |
| `components/about/company-story.tsx` | Stat value `font-extrabold` → `font-bold` |
| `components/about/logistics-partners.tsx` | Partner name `font-extrabold` → `font-semibold` |

**Packages installed:** `eslint-plugin-jsx-a11y`, `prettier`, `eslint-config-prettier`, `tailwind-merge`, `clsx`

---

## Completed in Previous Session — Adyen, Car Finder, Shipment Tracker, Supplier Intel & Mobile (2026-04-18)

### Payment — Stripe replaced with Adyen Drop-in

Stripe (`@stripe/stripe-js`, `@stripe/react-stripe-js`) has been fully removed. Adyen Web v6 Drop-in is now the payment provider.

| File | Change |
|---|---|
| `lib/adyen-client.ts` | **NEW** — named export `export { AdyenCheckout } from "@adyen/adyen-web"` (v6 has no default export) |
| `lib/payment-config.ts` | `stripeConfigured` → `adyenConfigured = !!process.env.NEXT_PUBLIC_ADYEN_CLIENT_KEY`; exports `ADYEN_CLIENT_KEY`, `ADYEN_ENVIRONMENT` |
| `app/api/payments/create-session/route.ts` | **NEW** — proxies `POST ${API_URL}/payments/create-session`; unwraps Laravel `data` envelope; returns `{ session_id, session_data, client_key }` |
| `components/checkout/checkout-flow.tsx` | Removed Stripe `<Elements>` wrapper; `AdyenSession` type `{ id, sessionData, clientKey }`; Drop-in mounted via `useEffect`; on `Authorised` → clears cart + sets orderRef |
| `components/checkout/payment-selector.tsx` | Removed `CardElement`; removed Revolut placeholder |
| `components/admin/settings-panel.tsx` | `stripe_enabled` → `adyen_enabled`, `stripe_publishable_key` → `adyen_client_key` |

**Adyen Sessions flow:** Laravel creates a session → returns `{ session_id, session_data, client_key }` → frontend mounts Drop-in via `useEffect`. Manual payment fallback retained when `NEXT_PUBLIC_ADYEN_CLIENT_KEY` is not set.

---

### Shop — Wheel-Size Car Finder (4-step cascade)

Replaced the old RapidAPI-based car finder with a full Wheel-Size.com cascade: Make → Model → Year → Modification/Trim → Find Tyres.

#### New API proxy routes

| Route | Endpoint | Notes |
|---|---|---|
| `app/api/shop/makes/route.ts` | `GET /v2/makes/` | 24h cache; returns `{ makes: [{slug, name}] }` |
| `app/api/shop/models/route.ts` | `GET /v2/models/?make=` | 24h cache; returns `{ models: [{slug, name}] }` |
| `app/api/shop/years/route.ts` | `GET /v2/years/?make=&model=` | Normalises `{ slug: 2026, name: 2026 }` (numeric fields); returns `{ years: number[] }` sorted newest-first |
| `app/api/shop/modifications/route.ts` | `GET /v2/modifications/?make=&model=&year=` | Builds human-readable label from `trim_level · body · power · drive`; returns `{ modifications: [{slug, name}] }` |
| `app/api/shop/car-finder/route.ts` | `POST → GET /v2/search/by_model/?modification={slug}` | Requires all 4 fields; dual+triple shape size extractor; stock filter via `/products/specs` |

**Required env var:** `WHEEL_SIZE_API_KEY=your_key`

---

### Shipment Tracker — Three + Pending States with Auto-Polling

**File:** `components/account/shipment-tracker.tsx` — full rewrite. States: `loading`, `fetching` (auto-polls every 60s up to 5×), `no-data`, `error`, `ok`.

---

### Admin — Supplier Intelligence Page

New page at `/admin/supplier` — visible to `super_admin` and `admin` roles only.
Files: `app/admin/supplier/page.tsx`, `components/admin/supplier-intel.tsx`, `components/admin/admin-shell.tsx` (nav entry added).

---

## Completed in Previous Session — Shop Filter Bar, CSV Import/Export & Orders Admin (2026-04-16)

### Fuel Echo Tech — Brand Rename

All UI text "FET Engine Treatment" → **"Fuel Echo Tech"** across 6 files. Short name "FET" and route `/fet` unchanged.

---

### Shop Page — Professional Two-Row Filter Bar

**File:** `components/shop/shop-catalogue.tsx` — full rewrite. Two-row filter card: text search + price/brand/size/season/speed/load index dropdowns. Search-first UX. `AbortController` cancels in-flight requests.

---

### Admin — Products + Orders CSV Import/Export

**Files:** `components/admin/csv-actions.tsx`, `components/admin/orders-csv-actions.tsx`
- Export: fetch bearer token from `/api/admin/token`, POST directly to Laravel
- Import: idempotent, supports Wix CSV format for orders, success modal with imported/updated/skipped counts

---

## Completed in Previous Session — FET Nav, Hero Slider & ROI Strip (2026-04-15)

### Hero Slider

Slot-based FET slide insertion, per-slide autoplay duration (FET: 8000ms, others: 6000ms), `.tesla-hero-btn-fet` CSS class fixed.

### FET ROI Calculator Strip

**File:** `components/fet-roi-strip.tsx` — dark `#0a0f1e` two-column strip on homepage. Vehicle selector + live calculator (fuel savings 8–15% slider). Annual savings + payback period output.

---

## Completed in Previous Sessions — FET Page, Admin CMS, Auth, SEO, i18n, Mobile

See prior handoff entries for full detail on:
- FET Engine Treatment page (`/fet`) — light green design system, 7 sections, ROI calculator
- Admin CMS — Products, Articles, Orders, Brands, Hero Slides, Quotes, Settings, Supplier Intel
- GSAP animation system — `lib/gsap.ts`, hooks (`useReveal`, `useStagger`, `useParallax`), route transitions
- i18n — EN/DE/FR via `lib/translations.ts` + `context/language-context.tsx`
- SEO — sitemap, robots.txt, OG image, JSON-LD schema
- Legal pages — Privacy Policy, Terms & Conditions, Imprint
- Email API — Resend-powered `/api/contact` and `/api/quote`
- Mobile responsiveness — all touch targets ≥ 48px, responsive heading scales, card heights

---

## Current UI Status

| Section | Status |
|---|---|
| Navbar | Complete — logo, icon buttons, mobile drawer, language switcher, mega menus (Shop/FET/About), `useCustomerAuth` (NextAuth removed), My Account link in desktop + mobile, loading skeleton while auth resolves |
| Hero slider | Complete — GSAP parallax + crossfade, FET slot-based slide, per-slide duration, dots + play/pause |
| Categories carousel | Complete |
| Why Okelcor | Complete |
| Trusted Brands | Complete |
| Logistics | Complete |
| Used Tyres feature | Complete |
| TBR feature | Complete |
| REX Certified | Complete |
| CTA Section | Complete |
| Floating bar | Complete |
| Footer | Complete |
| Shop page | Complete — two-row filter bar, search-first UX, live API |
| Product detail page | Complete |
| About page | Complete |
| Contact page | Complete |
| News page | Complete |
| Article detail page | Complete |
| **Login page** | **Complete** — `/login`; email_verified + must_reset handling; B2C/B2B redirect |
| **Register page** | **Complete** — `/register`; Individual/Business toggle; VAT validation; country/industry dropdowns |
| **Forgot Password** | **Complete** — `/forgot-password` |
| **Reset Password** | **Complete** — `/reset-password`; password strength indicator |
| **Verify Email** | **Complete** — `/verify-email`; resend button; `?verified=true` success state |
| **Account dashboard** | **Complete** — `/account`; B2C (3 cards) / B2B (6 cards) conditional dashboard |
| **Account profile** | **Complete** — `/account/profile`; personal info + change password; toast feedback |
| **Account addresses** | **Complete** — `/account/addresses`; card grid; add/edit/delete modal; default badge |
| Order tracking | Complete — `/account/orders` list + `/account/orders/[ref]` detail + ShipmentTracker |
| Quote page | Complete |
| Cart drawer | Complete |
| Checkout page | Complete — Adyen Drop-in |
| Fuel Echo Tech page | Complete — `/fet`; light green theme; video hero; ROI calculator |
| FET teaser + verified strip | Complete |
| 404 / Error / Loading | Complete |
| Page transitions | Complete — GSAP fade |
| Privacy / Terms / Imprint | Complete |
| OG image | Complete |
| Sitemap + robots.txt | Complete |
| Cookie consent | Complete |
| Back to top | Complete |
| Newsletter strip | Complete |
| i18n (EN/DE/FR) | Complete |
| Schema.org JSON-LD | Complete |
| Analytics (GA4) | Complete |
| Search modal | Complete |
| Admin — all sections | Complete (Products, Articles, Orders, Brands, Hero Slides, Quotes, Settings, Supplier Intel) |
| Shop — Car Finder | Complete — Wheel-Size 4-step cascade |

---

## Known Issues / Pre-Launch Checklist

### Before going live — REQUIRED

1. **Imprint page** — Fill in 3 amber ⚠ placeholders in `app/imprint/page.tsx`:
   - HRB registration number (from Amtsgericht München)
   - Managing Director full name
   - VAT ID (format: `DE123456789`)

2. **All env vars** — Add to production environment:
   ```
   RESEND_API_KEY=re_xxxx
   FROM_EMAIL=Okelcor Website <noreply@okelcor.de>
   CONTACT_EMAIL=info@okelcor.de
   QUOTE_EMAIL=quotes@okelcor.de
   NEXT_PUBLIC_BASE_URL=https://okelcor.de
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   API_URL=https://api.okelcor.de/api/v1
   NEXT_PUBLIC_API_URL=https://api.okelcor.de/api/v1

   # Adyen
   NEXT_PUBLIC_ADYEN_CLIENT_KEY=test_xxxx
   NEXT_PUBLIC_ADYEN_ENVIRONMENT=test   # change to "live" for production

   # Wheel-Size car finder
   WHEEL_SIZE_API_KEY=your_key
   ```
   Note: `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are no longer required (NextAuth removed).

3. **FET video** — Place at `public/videos/fet-hero.mp4`. Fallback gradient displays until then.

### Medium Priority

4. **Adyen live credentials** — Switch `NEXT_PUBLIC_ADYEN_ENVIRONMENT=live` and update client key.

5. **FET sitemap entry** — Add `/fet` to `app/sitemap.ts` static routes (priority 0.8).

6. **Account pages — backend endpoints** — The following Laravel endpoints must exist for full account functionality:
   - `PUT /api/v1/auth/profile` — update customer profile
   - `PUT /api/v1/auth/change-password` — change password
   - `GET/POST /api/v1/auth/addresses` — list/create addresses
   - `PUT/DELETE /api/v1/auth/addresses/{id}` — update/delete address

### Low Priority

7. **Newsletter backend** — `components/newsletter-strip.tsx` shows success UI but does not POST to any endpoint.

8. **Unused public assets** — Old placeholder SVGs in `public/brands/` safe to delete.

---

## Auth Architecture (Current)

```
Browser                Next.js                    Laravel API
  │                      │                              │
  ├─ POST /api/auth/customer/login ──────────────────► POST /api/v1/auth/login
  │                      │  ◄── { token, user } ────────┤
  │  ◄── Set-Cookie: customer_token (httpOnly) ─────────┤
  │                      │                              │
  ├─ GET /api/auth/customer/me ─────────────── Bearer ► GET /api/v1/auth/me
  │  ◄── { data: Customer } ────────────────────────────┤
  │                      │                              │
  └─ POST /api/auth/customer/logout ── Bearer ────────► POST /api/v1/auth/logout
     ◄── cookie cleared ──────────────────────────────  │
```

**Middleware:** Reads `customer_token` cookie synchronously (no async JWT decode). Redirects to `/login?redirect={path}` for protected routes. Prefetch requests (`Next-Router-Prefetch: 1`) are always passed through to prevent Next.js caching stale redirects.

**Server components** (checkout, orders, account): Use `getCustomerFromCookie()` from `lib/get-customer.ts` which reads the cookie server-side and calls Laravel directly.

**Client components** (navbar, profile page): Use `useCustomerAuth()` from `context/CustomerAuthContext.tsx`.

---

## GSAP Implementation

### Files
```
lib/gsap.ts          ← single import for gsap, ScrollTrigger, ease, scrollDefaults
hooks/useReveal.ts   ← scroll-reveal (attach ref to any element)
hooks/useStagger.ts  ← stagger children (attach ref to container)
hooks/useParallax.ts ← scrubbed parallax (containerRef + targetRef)
components/motion/   ← Reveal, StaggerParent, StaggerChild (GSAP-backed, drop-in API)
app/template.tsx     ← GSAP page fade + ScrollTrigger.refresh() on every route change
```

Easing vocabulary — always import from `@/lib/gsap`:
```
ease.smooth    "power2.out"   — general transitions
ease.entrance  "power3.out"   — section reveals
ease.drawer    "expo.out"     — panels/menus/drawers
ease.subtle    "sine.inOut"   — micro-interactions
ease.sharp     "power2.inOut" — toggles/accordions
```

---

## Development Workflow

Before making UI changes, always read:

1. `docs/architecture.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/page-guidelines.md`
4. `docs/session-handoff.md`
5. `docs/visual-references.md`

Rules:
- Do not redesign components without discussion
- Preserve homepage layout order unless explicitly instructed
- Explain plans before large changes
- Use `var(--primary)`, `var(--primary-hover)`, `var(--foreground)`, `var(--muted)` — never hardcode hex values that duplicate these tokens **on Okelcor pages**
- The FET page (`/fet`) has its own green palette — do NOT apply `var(--primary)` orange there
- All buttons use `rounded-full` (pill shape) per DESIGN_SYSTEM.md
- Prefer server components; only use `"use client"` where hooks or browser APIs are required
- i18n: use `useLanguage()` in client wrappers; keep server components translation-free
- Analytics: use helpers from `lib/analytics.ts` — never call `window.gtag` directly in components
- Auth: use `useCustomerAuth()` in client components; use `getCustomerFromCookie()` in server components; never import from `next-auth`
- `customer_type` values are always lowercase: `"b2c"` or `"b2b"`
- Translations: always add new string keys to the type in `lib/translations.ts` AND all 3 locales (en, de, fr)
