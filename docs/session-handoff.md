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
* `tailwind-merge`, `clsx`, `eslint-plugin-jsx-a11y`, `prettier`

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

**Rule:** The Fuel Echo Tech page uses its own green-based palette. Never apply `var(--primary)` (orange) to FET-specific UI.

---

## Completed in Latest Session — Admin RBAC, Product Card & Bug Fixes (2026-04-19/20)

### Product Card — Full-Bleed Image

**File:** `components/shop/product-card.tsx`

The product card was redesigned so the tyre image fills the entire card instead of being confined to a top `aspect-[4/3]` section.

**Changes:**
- Image is now `position: fill` covering the full card (no separate image container)
- `object-contain` keeps the full tyre visible with no cropping
- Card has `min-h-[360px]` so the `fill` image has a concrete height reference
- Info panel (brand, name, size, price, buttons) is pinned to the bottom with a **frosted-glass** treatment (`backdrop-blur-md` + `bg-white/88`) so text stays readable over any image
- Hover zoom reduced to `scale-[1.05]` (was 1.08/1.1) since the image is now larger
- Type badge and glare overlay kept, moved to correct `z-index` layers above the image

---

### Admin Panel — Auth UX & `must_change_password` Flow

#### New: `/admin/change-password` page
**File:** `app/admin/change-password/page.tsx`

- Standalone page within AdminShell for forced password changes
- Amber warning banner: "Your account is using a temporary password"
- Current password, new password (with 4-level strength bar), confirm fields
- Calls existing `changePassword` server action (`PUT /api/v1/admin/profile/password`)
- On success: clears `admin_must_change` cookie, redirects to `/admin`

#### Updated: `app/admin/actions.ts`
- **Key fix:** Was reading `json.data?.admin` from login response — backend confirmed the correct key is `json.data?.user`. This caused all admin cookies (role, display name, must_change_password) to be `undefined` on every login, silently breaking RBAC.
- Now reads `json.data?.user` correctly
- Stores `admin_must_change` cookie (`"1"` or `"0"`) on login based on `must_change_password` flag
- Stores `admin_role_label` cookie (human-readable label from API, e.g. `"Super Admin"`)
- Stores `admin_display_name` cookie (prefers `display_name` → `first_name` → `name`)
- If `must_change_password === true` → redirects to `/admin/change-password` instead of dashboard
- `logoutAdmin` now also deletes `admin_role_label` and `admin_must_change` cookies

#### Updated: `app/admin/profile/actions.ts`
- `updateProfile` now accepts `{ first_name, last_name, display_name, name }` instead of `(name, email)` — email is read-only
- On success: refreshes `admin_display_name` and `admin_name` cookies
- `changePassword`: on success reads `res.data?.user?.must_change_password` from response and sets `admin_must_change=0` cookie to dismiss the persistent banner

#### Updated: `components/admin/admin-shell.tsx`
- **Top-bar dropdown** on avatar button: My Profile → `/admin/profile`, Change Password → `/admin/change-password`, Sign Out (form action `logoutAdmin`)
- **`must_change_password` banner**: persistent amber bar shown on all pages (except `/admin/change-password`) when `admin_must_change=1` cookie is set — "Your account is using a temporary password. [Change password →]"
- **Role badge colors**: `super_admin` = dark (`bg-gray-900 text-white`), `admin` = blue, `editor` = green, `order_manager` = amber
- **Display name**: reads `admin_display_name` cookie for name display; falls back to `admin_name`
- **Role label**: reads `admin_role_label` cookie (set from API `role_label` field) instead of a client-side map

#### Updated: `components/admin/profile-ui.tsx`
- Edit form now has: **First Name**, **Last Name**, **Display Name** fields (split from single `name`)
- Email shown as read-only in edit mode
- Role badge uses `profile.role_label ?? ROLE_LABELS[profile.role]` (API label preferred)
- Cancel resets all three name fields to original profile values

#### Updated: `components/admin/users-manager.tsx`
- **Password field removed from create modal** — backend auto-generates and emails a temporary password
- Create modal shows blue info notice: "A temporary password will be sent to the user's email address."
- After successful user creation: shows green banner "User created. Login details sent to {email}" for 6 seconds
- Role badge display uses `user.role_label ?? ROLE_LABELS[user.role]` (API label preferred)

#### Updated: `app/admin/users/actions.ts`
- `createUser` no longer requires or sends `password` in the request body

---

### Admin RBAC — Permissions Map & Route Guard

#### New: `lib/admin-permissions.ts`

```typescript
export const ROLE_ACCESS: Record<string, string[]> = {
  super_admin:   ["dashboard", "products", "orders", "quotes", "articles", "hero_slides", "brands", "settings", "users", "supplier"],
  admin:         ["dashboard", "products", "orders", "quotes", "articles", "hero_slides", "brands", "settings", "supplier"],
  editor:        ["dashboard", "articles", "hero_slides"],
  order_manager: ["dashboard", "orders", "quotes"],
};

export function canAccess(role: string, section: string): boolean { ... }
export const PATH_SECTION: Record<string, string> = { ... }; // path prefix → section key
```

Mirrors backend ENUM exactly. Role strings confirmed by backend: `super_admin`, `admin`, `editor`, `order_manager` only.

#### Shell nav filtering
```typescript
// Shows all items when role not yet loaded (!role fallback prevents
// blank nav for users whose admin_role cookie pre-dates this feature)
const visibleNav = NAV.filter(({ section }) =>
  section === null || !role || canAccess(role, section)
);
```

NAV items replaced hardcoded `roles` arrays with a `section` key. Profile always visible (`section: null`).

Result:
- `editor` → sees Dashboard, Articles, Hero Slides only
- `order_manager` → sees Dashboard, Orders, Quote Requests only
- `admin` → sees all except Users
- `super_admin` → sees everything

#### Client-side route guard (in `AdminShell`)
```typescript
useEffect(() => {
  if (!role) return;
  const section = Object.entries(PATH_SECTION).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];
  if (section && !canAccess(role, section)) {
    router.replace("/admin/unauthorized");
  }
}, [pathname, role, router]);
```

Redirects to existing `/admin/unauthorized` page if a user navigates directly to a restricted section.

#### Updated: `lib/admin-api.ts`
Added to `AdminUser` and `AdminProfile` types:
- `role_label?: string` — human-readable label from API (e.g. `"Super Admin"`)
- `must_change_password?: boolean` — on `AdminProfile` only

---

### Bug Fix — `admin_role` Cookie Missing for Existing Sessions

**Problem:** After RBAC was added, users who had logged in before the `admin_role` cookie was introduced showed only the Profile nav item.

**Root cause:** The nav filter `section === null || canAccess(role, section)` — when `role = ""` (cookie absent), `canAccess` returns `false` for all sections. Only `section: null` (Profile) survived.

**Fix:** Added `|| !role` fallback so that when role is empty (not loaded or cookie not yet set), all nav items show. The route guard already had `if (!role) return` so it was not affected.

---

## Completed in Previous Session — Account Sub-pages & Shop Auth Fixes (2026-04-19)

### New Account Pages

All four pages below were missing (404) and have been created:

#### `app/account/quotes/page.tsx` — Quote Requests
Server component. Reads `customer_token` cookie; redirects if unauthenticated. Fetches `GET /api/v1/auth/quotes` with Bearer token.
- Status types: `pending | reviewed | approved | rejected` with colored badges
- Empty state with "Request a Quote" CTA linking to `/quote`
- Each quote shows: ref, product details, quantity, date, status badge, notes

#### `app/account/invoices/page.tsx` — Invoices
Server component. Fetches `GET /api/v1/auth/invoices` with Bearer token.
- Table: Invoice #, issued date, due date, amount (€), status badge, PDF download button
- Statuses: `paid` (green), `unpaid` (amber), `overdue` (red)
- Empty state with "Contact support" link

#### `app/account/company/page.tsx` — Company Details
Client component using `useCustomerAuth()`.
- Editable: Company Name, Industry (dropdown of 10 options)
- Read-only: VAT Number (with "Contact support to update" link), Email
- Saves via `updateCustomerProfile({ company_name, industry })`
- Success/error feedback inline

#### `app/account/vat/page.tsx` — VAT Status
Client component using `useCustomerAuth()`.
- If VAT on file: shows number, "VAT number on file" badge (green), "Verification pending" notice (amber), EU VIES portal link
- If no VAT: amber alert + "Contact support to add VAT" button
- Info card explaining B2B tax-exempt eligibility
- Link to `/account/company` for managing company details

#### `lib/customer-auth.ts`
Added `industry?: string` to `ProfileData` type (was missing, caused TypeScript error in company page).

---

### Shop — Proxy Routes with Auth Forwarding

Three Next.js API proxy routes forward `customer_token` cookie as `Authorization: Bearer` to the Laravel API, bypassing CORS:

| Route | Proxies to |
|---|---|
| `app/api/shop/products/route.ts` | `GET /api/v1/products?...` |
| `app/api/shop/brands/route.ts` | `GET /api/v1/products/brands` |
| `app/api/shop/specs/route.ts` | `GET /api/v1/products/specs` |

`shop-catalogue.tsx` updated to call these proxy routes (`/api/shop/products`, `/api/shop/brands`, `/api/shop/specs`) instead of calling the external API directly.

### Shop — Product Detail Page Auth
`app/shop/[id]/page.tsx`: reads `customer_token` cookie server-side, passes it to `apiFetch` as Bearer token. Previously returned 404 because unauthenticated requests got 401 from the API.

### Shop — Image Performance
- `product-card.tsx`: replaced `<img>` with Next.js `<Image fill>` + `sizes` prop
- `product-gallery.tsx`: replaced both main image and thumbnails with `<Image>`
- `product-grid.tsx`: passes `priority={i < 3}` to first 3 cards

### Login — Router Cache Fix
`app/login/page.tsx`: changed `router.push(destination)` to `window.location.href = destination` after successful login. Prevents Next.js router cache from replaying a stale `/shop → /login` redirect after the user had just authenticated.

---

## Completed in Previous Session — Auth Loading & Redirect Fixes (2026-04-18)

### Auth Loading Delay & Flash Fixed

**Problem:** Navbar briefly showed login icon (unauthenticated state) before switching to profile icon once `/me` fetch resolved.

**Changes:**

| File | Change |
|---|---|
| `components/navbar.tsx` | Checks `isLoading` from `useCustomerAuth()`. Shows animated skeleton while loading instead of the login/profile button. |
| `app/login/page.tsx` | Calls `await refreshCustomer()` before `router.push()` so auth context is fully populated before the account page renders. |

### Middleware — `redirect` Param + Prefetch Skip

**File:** `middleware.ts`

1. **`callbackUrl` → `redirect`:** Login redirect URL param renamed. All server-side redirects updated to match. Login page reads `redirect` first, falls back to `callbackUrl`.

2. **Prefetch skip:** Middleware returns `NextResponse.next()` for requests with `Next-Router-Prefetch: 1` header to prevent Next.js caching stale redirects.

**Protected routes:** `/shop`, `/checkout`, `/account` (and all sub-paths).

---

## Completed in Previous Session — Customer Auth, Account Pages & Design Audit (2026-04-18)

### NextAuth Removed — Replaced with Direct Laravel Cookie Auth

`next-auth` has been **fully uninstalled**. The entire auth system now runs on a `customer_token` httpOnly cookie set by the Next.js API layer after proxying to Laravel.

**New auth files:**

| File | Purpose |
|---|---|
| `lib/customer-auth.ts` | Client-side helpers: `loginCustomer`, `registerCustomer`, `logoutCustomer`, `forgotPassword`, `resetPassword`, `getCustomerProfile`, `updateCustomerProfile`. All call relative `/api/auth/customer/*` routes. |
| `lib/get-customer.ts` | Server-side helper: `getCustomerFromCookie()` reads `customer_token` cookie and calls `GET /api/v1/auth/me` with Bearer token. |
| `context/CustomerAuthContext.tsx` | `CustomerAuthProvider` + `useCustomerAuth()` hook. State: `customer`, `isAuthenticated`, `isLoading`. Methods: `login()`, `logout()`, `refreshCustomer()`. |

**New API proxy routes (all under `app/api/auth/customer/`):**

| Route | Method | Behaviour |
|---|---|---|
| `login/route.ts` | POST | Proxies to Laravel `/auth/login`; sets httpOnly `customer_token` cookie (7-day) |
| `register/route.ts` | POST | Proxies to Laravel `/auth/register` |
| `logout/route.ts` | POST | Calls Laravel `/auth/logout`; always clears cookie |
| `forgot-password/route.ts` | POST | Proxies to Laravel `/auth/forgot-password` |
| `reset-password/route.ts` | POST | Proxies to Laravel `/auth/reset-password` |
| `me/route.ts` | GET | Reads cookie; proxies to Laravel `/auth/me` |
| `profile/route.ts` | PUT | Reads cookie; proxies to Laravel `/auth/profile` |
| `change-password/route.ts` | PUT | Proxies to Laravel `/auth/change-password` |
| `addresses/route.ts` | GET + POST | List and create addresses |
| `addresses/[id]/route.ts` | PUT + DELETE | Edit and delete addresses |

**`customer_type` values:** always lowercase — `"b2c"` and `"b2b"`.

---

### New Auth Pages

| Page | Path | Notes |
|---|---|---|
| Login | `app/login/page.tsx` | Email + password; handles `email_verified: false` and `must_reset: true` |
| Register | `app/register/page.tsx` | Individual/Business toggle; VAT validation; country/industry dropdowns |
| Forgot Password | `app/forgot-password/page.tsx` | Email input; success screen |
| Reset Password | `app/reset-password/page.tsx` | Token + email from URL; password strength indicator |
| Verify Email | `app/verify-email/page.tsx` | Resend button; `?verified=true` success state |

---

### Account Pages

| Page | Notes |
|---|---|
| `app/account/page.tsx` | B2C (3 cards) / B2B (6 cards) conditional dashboard |
| `app/account/profile/page.tsx` | Personal info + change password; toast feedback |
| `app/account/addresses/page.tsx` | Card grid; add/edit/delete modal; default badge |
| `app/account/orders/page.tsx` | Order list |
| `app/account/orders/[ref]/page.tsx` | Order detail + ShipmentTracker |
| `app/account/quotes/page.tsx` | Quote requests list with status badges |
| `app/account/invoices/page.tsx` | Invoices table with PDF download |
| `app/account/company/page.tsx` | Company name + industry edit; VAT read-only |
| `app/account/vat/page.tsx` | VAT status + VIES portal link |

---

## Completed in Previous Session — Adyen, Car Finder, Shipment Tracker & Supplier Intel (2026-04-18)

### Payment — Stripe replaced with Adyen Drop-in

Stripe fully removed. Adyen Web v6 Drop-in is now the payment provider. Adyen Sessions flow: Laravel creates session → returns `{ session_id, session_data, client_key }` → frontend mounts Drop-in via `useEffect`.

### Shop — Wheel-Size Car Finder (4-step cascade)

Make → Model → Year → Modification/Trim → Find Tyres.
Proxy routes: `app/api/shop/makes`, `models`, `years`, `modifications`, `car-finder`.
**Required env var:** `WHEEL_SIZE_API_KEY=your_key`

### Shipment Tracker
**File:** `components/account/shipment-tracker.tsx` — States: `loading`, `fetching` (auto-polls every 60s up to 5×), `no-data`, `error`, `ok`.

### Admin — Supplier Intelligence Page
New page `/admin/supplier` — visible to `super_admin` and `admin` only.

---

## Completed in Previous Sessions — FET Page, Shop, Admin CMS, SEO, i18n

See prior entries for:
- FET Engine Treatment page (`/fet`) — light green design system, 7 sections, ROI calculator
- Shop page — two-row filter bar, live API, Car Finder
- Admin CMS — Products, Articles, Orders, Brands, Hero Slides, Quotes, Settings, Supplier Intel, Users
- GSAP animation system — `lib/gsap.ts`, hooks, route transitions
- i18n — EN/DE/FR via `lib/translations.ts` + `context/language-context.tsx`
- SEO — sitemap, robots.txt, OG image, JSON-LD schema
- Email API — Resend-powered `/api/contact` and `/api/quote`
- Mobile responsiveness

---

## Current UI Status

| Section | Status |
|---|---|
| Navbar | Complete — logo, icon buttons, mobile drawer, language switcher, mega menus, `useCustomerAuth`, loading skeleton |
| Hero slider | Complete — GSAP parallax + crossfade, per-slide duration |
| Homepage sections | Complete — Categories, Why Okelcor, Brands, Logistics, TBR, REX, CTA |
| Floating bar + Footer | Complete |
| Shop page | Complete — filter bar, search-first UX, live API, Car Finder |
| **Product card** | **Updated** — full-bleed image fills entire card, frosted info panel at bottom |
| Product detail page | Complete |
| Login page | Complete — `/login`; verified + must_reset handling; B2C/B2B redirect |
| Register page | Complete — `/register`; Individual/Business toggle; VAT validation |
| Forgot / Reset Password | Complete |
| Verify Email | Complete |
| Account dashboard | Complete — `/account`; B2C / B2B conditional |
| Account profile | Complete — personal info + change password |
| Account addresses | Complete — add/edit/delete modal |
| Account orders | Complete — list + detail + ShipmentTracker |
| **Account quotes** | **Complete** — `/account/quotes`; status badges; empty state |
| **Account invoices** | **Complete** — `/account/invoices`; table + PDF download |
| **Account company** | **Complete** — `/account/company`; editable company name + industry |
| **Account VAT** | **Complete** — `/account/vat`; VAT status + VIES link |
| Quote page | Complete |
| Cart drawer | Complete |
| Checkout page | Complete — Adyen Drop-in |
| Fuel Echo Tech page | Complete — `/fet`; green theme; ROI calculator |
| About / Contact / News | Complete |
| 404 / Error / Loading | Complete |
| Privacy / Terms / Imprint | Complete |
| i18n (EN/DE/FR) | Complete |
| Analytics (GA4) | Complete |
| **Admin login** | **Updated** — `must_change_password` redirects to change-password page |
| **Admin change-password** | **New** — `/admin/change-password`; forced change with strength bar |
| **Admin shell** | **Updated** — top-bar dropdown, must_change banner, role badge colors, RBAC nav |
| **Admin RBAC** | **Complete** — `lib/admin-permissions.ts`; canAccess(); route guard; nav filtering by role |
| Admin profile | Complete — first/last/display name fields; role label from API |
| Admin users | Complete — create without password; temp password notice; role_label display |
| Admin products / articles / orders / quotes / brands / hero-slides / settings / supplier | Complete |

---

## Admin Architecture

### Cookie Set on Login (`POST /api/v1/admin/login`)

Response shape: `{ data: { token: "...", user: { role, role_label, name, first_name, display_name, must_change_password, last_login_at, ... } } }`

| Cookie | httpOnly | Purpose |
|---|---|---|
| `admin_token` | ✅ | Auth bearer token — sent on every admin API call |
| `admin_role` | ❌ | Role string (`super_admin`, `admin`, `editor`, `order_manager`) — used for RBAC |
| `admin_role_label` | ❌ | Human-readable label from API (e.g. `"Super Admin"`) — shown in UI |
| `admin_name` | ❌ | Full name from API |
| `admin_display_name` | ❌ | Display name (prefers `display_name` → `first_name` → `name`) — shown in shell avatar |
| `admin_must_change` | ❌ | `"1"` if password change required — drives persistent amber banner |

### RBAC Permission Map (`lib/admin-permissions.ts`)

```
super_admin   → all sections
admin         → all except users
editor        → dashboard, articles, hero_slides
order_manager → dashboard, orders, quotes
```

`canAccess(role, section)` is the single source of truth. Used by:
- Shell sidebar nav filter
- Client-side route guard (redirects to `/admin/unauthorized`)

### Profile Endpoints
- `GET /api/v1/admin/profile` → `{ data: { role, role_label, ... } }` (user object directly under `data`)
- `PUT /api/v1/admin/profile` → accepts `{ first_name, last_name, display_name, name }`
- `PUT /api/v1/admin/profile/password` → accepts `{ current_password, password, password_confirmation }`; returns `{ data: { user: { must_change_password: false, ... } } }`

---

## Auth Architecture (Customer)

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

**Middleware:** Reads `customer_token` cookie synchronously. Redirects to `/login?redirect={path}` for protected routes. Prefetch requests (`Next-Router-Prefetch: 1`) always pass through.

**Server components:** Use `getCustomerFromCookie()` from `lib/get-customer.ts`.
**Client components:** Use `useCustomerAuth()` from `context/CustomerAuthContext.tsx`.

---

## GSAP Implementation

```
lib/gsap.ts          ← single import for gsap, ScrollTrigger, ease, scrollDefaults
hooks/useReveal.ts   ← scroll-reveal
hooks/useStagger.ts  ← stagger children
hooks/useParallax.ts ← scrubbed parallax
app/template.tsx     ← GSAP page fade + ScrollTrigger.refresh() on every route change
```

---

## Known Issues / Pre-Launch Checklist

### Required Before Go-Live

1. **Imprint page** — Fill 3 amber ⚠ placeholders in `app/imprint/page.tsx`: HRB number, Managing Director name, VAT ID.

2. **Production env vars:**
   ```
   RESEND_API_KEY=re_xxxx
   FROM_EMAIL=Okelcor Website <noreply@okelcor.de>
   CONTACT_EMAIL=info@okelcor.de
   QUOTE_EMAIL=quotes@okelcor.de
   NEXT_PUBLIC_BASE_URL=https://okelcor.de
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   API_URL=https://api.okelcor.de/api/v1
   NEXT_PUBLIC_API_URL=https://api.okelcor.de/api/v1
   NEXT_PUBLIC_ADYEN_CLIENT_KEY=test_xxxx
   NEXT_PUBLIC_ADYEN_ENVIRONMENT=test   # → "live" for production
   WHEEL_SIZE_API_KEY=your_key
   ```
   Note: `NEXTAUTH_SECRET` and `NEXTAUTH_URL` no longer required.

3. **FET video** — Place at `public/videos/fet-hero.mp4`. Fallback gradient shows until then.

### Medium Priority

4. **Adyen live credentials** — Switch `NEXT_PUBLIC_ADYEN_ENVIRONMENT=live` and update client key.

5. **FET sitemap entry** — Add `/fet` to `app/sitemap.ts` static routes (priority 0.8).

6. **Admin existing sessions after RBAC** — Users who logged in before the `admin_role` cookie was introduced will see all nav items (the `!role` fallback). They need to log out and back in once to get their role cookie populated and RBAC to take effect.

### Low Priority

7. **Newsletter backend** — `components/newsletter-strip.tsx` shows success UI but does not POST to any endpoint.

8. **Unused public assets** — Old placeholder SVGs in `public/brands/` safe to delete.

---

## Development Workflow

Before making UI changes, always read:
1. `docs/architecture.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/page-guidelines.md`
4. `docs/session-handoff.md`
5. `docs/visual-references.md`

Rules:
- Use `var(--primary)`, `var(--primary-hover)`, `var(--foreground)`, `var(--muted)` — never hardcode duplicates
- The FET page (`/fet`) uses its own green palette — do NOT apply `var(--primary)` orange there
- All buttons use `rounded-full` (pill shape)
- Prefer server components; only use `"use client"` where hooks or browser APIs are required
- i18n: use `useLanguage()` in client wrappers
- Auth (customer): use `useCustomerAuth()` in client components; `getCustomerFromCookie()` in server components; never import from `next-auth`
- Auth (admin): use `adminApiFetch()` from `lib/admin-api.ts`; permissions via `canAccess()` from `lib/admin-permissions.ts`
- `customer_type` values are always lowercase: `"b2c"` or `"b2b"`
- Admin login response shape: `json.data.user` (not `json.data.admin`)
- Admin profile/me response shape: `json.data` directly (no `.user` wrapper)
