# Session Handoff

## Project Summary

This project builds the **Okelco corporate website**.

Okelco is a **global tyre sourcing and supply company** specializing in:

* Used tyres
* PCR tyres
* TBR tyres
* Logistics tyre supply
* Wholesale tyre distribution
* **FET Engine Treatment** (fuel efficiency device — second product line)

The design system follows a **Tesla-inspired layout structure**, adapted to the tyre industry.
No backend currently exists. This is a **frontend-only implementation** with real email via Resend.

---

## Technology Stack

* Next.js (App Router)
* React 19 / TypeScript 5
* Tailwind CSS v4
* GSAP 3.14 + @gsap/react 2.1 (sole animation library — Framer Motion fully removed)
* NextAuth.js v4.24 — Credentials provider, JWT sessions, middleware route protection
* Resend (email API — contact, quote, and checkout order notification routes)

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

### FET Engine Treatment Page (`/fet`) — separate design system
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

**Rule:** The FET page uses its own green-based palette. Never apply `var(--primary)` (orange) to FET-specific UI. All other Okelcor pages remain completely unchanged.

---

## GSAP Implementation — Merged to Main ✓

### Overview

GSAP has been fully merged into the main branch. The animation architecture is live.
**Packages installed:** `gsap ^3.14.2`, `@gsap/react ^2.1.2`

i18n (Option B) applied — both `hero.tsx` and `navbar.tsx` use GSAP animations while fully preserving:
- Hero: slide titles/subtitles from `t.hero.slides[index]`, CTA labels from `t.hero.ctaPrimary/ctaSecondary`
- Navbar: nav labels from `t.nav.*`, language names from `t.lang[locale]`, EN/DE/FR switcher via `setLocale(code)`

---

### Files in main

| File | Status | Notes |
|---|---|---|
| `package.json` | Updated | `gsap ^3.14.2` + `@gsap/react ^2.1.2` added |
| `lib/gsap.ts` | **NEW** | Central GSAP config — plugin registration, easing presets, `scrollDefaults`, `prefersReducedMotion()` |
| `hooks/useReveal.ts` | **NEW** | Scroll-triggered fade+slide hook |
| `hooks/useStagger.ts` | **NEW** | Scroll-triggered stagger hook |
| `hooks/useParallax.ts` | **NEW** | Scroll-scrubbed parallax hook (`containerRef` + `targetRef`) |
| `components/motion/reveal.tsx` | Updated | GSAP drop-in, same API as previous Framer Motion version |
| `components/motion/stagger.tsx` | Updated | GSAP drop-in, `StaggerParent` / `StaggerChild` same API |
| `app/template.tsx` | Updated | GSAP page fade-in + `ScrollTrigger.refresh()` on every route change |
| `components/hero.tsx` | Updated | GSAP entrance timeline + slide crossfade + scroll parallax; i18n via `useLanguage()` |
| `components/navbar.tsx` | Updated | GSAP entrance + lang dropdown (autoAlpha) + mobile drawer (expo.out); EN/DE/FR via `useLanguage()` |

---

### Animation architecture

```
lib/gsap.ts          ← single import for gsap, ScrollTrigger, ease, scrollDefaults
hooks/useReveal.ts   ← scroll-reveal (attach ref to any element)
hooks/useStagger.ts  ← stagger children (attach ref to container)
hooks/useParallax.ts ← scrubbed parallax (containerRef + targetRef)
components/motion/   ← Reveal, StaggerParent, StaggerChild (GSAP-backed, drop-in API)
app/template.tsx     ← GSAP page fade + ScrollTrigger.refresh() on every route change
```

Easing vocabulary — always import from `@/lib/gsap`, never use raw strings:
```
ease.smooth    "power2.out"   — general transitions
ease.entrance  "power3.out"   — section reveals
ease.drawer    "expo.out"     — panels/menus/drawers
ease.subtle    "sine.inOut"   — micro-interactions
ease.sharp     "power2.inOut" — toggles/accordions
```

---

## Completed in Latest Session — FET Nav, Hero Slider & ROI Strip (2026-04-15)

### Navbar — Shop Dropdown Removed, FET Standalone Link Added

**File:** `components/navbar.tsx`

The Shop dropdown/submenu has been removed entirely in favour of a flat navigation structure.

| Change | Detail |
|---|---|
| Shop → direct link | `href="/shop"` — no dropdown, no children |
| FET standalone link | Added `{ label: "FET", href: "/fet" }` as its own nav item |
| Nav order | Home / Shop / FET / News / About / Contact / Quote |
| Mobile drawer | Same flat structure — no sub-labels or indented links |

**Removed from navbar:**
- `openShop` state, `shopPanelRef`, `shopTimerRef`, `isShopFirstRender` refs
- `openShopMenu()` / `closeShopMenu()` helpers
- Shop dropdown GSAP `useEffect`
- `ChevronDown` import (was only used by the dropdown)
- `NavChild` type and `children?` field from `NavItem`

---

### Hero Slider — Hardcoded FET Slide + Per-Slide Duration

**File:** `components/hero.tsx`  
**File:** `app/globals.css`

#### Slot-based slide ordering

Replaced the single `FET_INDEX = apiCount` approach with a `DisplaySlot[]` array built by `buildDisplaySlots(apiCount)`:

| API slide count | Display sequence |
|---|---|
| 0 | `[FET]` |
| 1 | `[api[0], FET]` |
| 2+ | `[api[0], FET, api[1], …, api[n-1], FET]` |

FET appears at **index 1** (users see it early) and again as the **last slide** (users see it before the loop restarts). All slide count, pagination dots, and arrow navigation derive from `displaySlots.length` automatically.

#### FET slide content

```ts
const FET_SLIDE = {
  label:    "Also Available",
  title:    "FET Engine Treatment",
  subtitle: "Save fuel, improve performance and reduce emissions for any vehicle or fleet.",
  videoSrc: "/videos/fet-hero.mp4",
}
```

- Green pill badge (`#22c55e`) replaces the orange dot on the FET slide
- CTAs: **"Learn More"** → `/fet` (green outlined) · **"Request a Quote"** → `/quote` (orange filled)

#### Per-slide autoplay duration

Switched from `setInterval` (fixed 5 000 ms) to `setTimeout` re-created on every `index` change:
- **FET slides:** 8 000 ms (more copy to read)
- **All other slides:** 6 000 ms

#### `.tesla-hero-btn-fet` CSS class (fixed)

Added to `globals.css`. Was previously missing from three shared selectors, causing it to render without proper sizing:

| Selector | Fix |
|---|---|
| Base `.tesla-hero-btn-primary, .tesla-hero-btn-secondary` | Added `.tesla-hero-btn-fet` |
| `@media (min-width: 640px)` responsive block | Added `.tesla-hero-btn-fet` |
| `@media (max-width: 768px)` mobile block | Added `.tesla-hero-btn-fet` |
| `:focus-visible` white-ring group | Added `.tesla-hero-btn-fet:focus-visible` |

Unique styles kept in a separate block: `background: transparent`, `color: #22c55e`, `border: 2px solid #22c55e`; hover fills green.

---

### FET ROI Calculator Strip — New Homepage Section

**File:** `components/fet-roi-strip.tsx` (new — `"use client"`)  
**File:** `app/page.tsx` (added `<FetRoiStrip />` after `<FetTeaser />`)

Two-column dark section placed between `<FetTeaser />` and `<Logistics />` on the homepage.

#### Left column — copy
- Green pill badge: "FET Engine Treatment"
- Heading: "How much could you save?"
- Subtext paragraph
- "See full details →" link to `/fet`

#### Right column — live calculator

| Input | Detail |
|---|---|
| Vehicle type | 4-button grid: Passenger Car (€299) / Van SUV (€399) / Truck 18t (€499) / Truck 40t (€599) |
| Annual km | Number input; default pre-filled per vehicle (15 000 / 30 000 / 80 000 / 100 000) |
| Fuel price | Number input, default €1.65/L |
| FET device cost | Read-only, auto-populated from selected vehicle |
| Fuel savings | Slider 8–15%, default 10% |

**Calculation formula** (same as `/fet` amortization calculator):
```
annualLitres   = (consumption / 100) × km
annualFuelCost = annualLitres × fuelPrice
annualSavings  = annualFuelCost × (savingsPct / 100)
paybackMonths  = (fetCost / annualSavings) × 12
```

Live results panel: **Annual Savings** (large green number, `#10b981`) + **Payback Period** (white).  
CTA: "Request a Quote →" solid green button → `/quote`.

**Theme:** `#0a0f1e` background, `#10b981` accent, white text — visually separates from the Okelcor orange sections above and below it.

---

## Completed in Previous Session — FET Engine Treatment Product Line (2026-04-14 → 2026-04-15)

### New Product Line: FET Engine Treatment

FET Engine Treatment is a fuel-efficiency device sold alongside tyres. It has its own page (`/fet`), homepage teaser, and a fully separate light-green design system.

#### Navbar — Shop Dropdown (Fixed + Rebranded)

**File:** `components/navbar.tsx`

| Change | Detail |
|---|---|
| Dropdown gap bug fixed | Replaced CSS `group-hover` (had a 6px gap that broke hover state mid-movement) with JS `openShop` state + 130ms close-delay timer (`shopTimerRef`) so the panel stays open as cursor moves from button to dropdown |
| Seamless hover bridge | Dropdown wrapper has `pt-3` so the hover area extends over the invisible gap — no gap-flicker |
| GSAP animation | `useEffect([openShop])` animates `shopPanelRef` with `autoAlpha` + `y` slide — matches the existing lang/profile panel pattern |
| Brand styling | Orange → green gradient accent bar at top of dropdown; icon circles with per-item accent color (`#f4511e` for Tyres, `#10b981` for FET) |
| Active state | ChevronDown rotates 180° when open; Shop nav button highlights while dropdown is open |
| Mobile drawer | Shop renders as a label + two indented sub-links with coloured dots — same as before, no change |

**New state/refs added to navbar:**
- `openShop: boolean`
- `shopPanelRef: useRef<HTMLDivElement>`
- `shopTimerRef: useRef<ReturnType<typeof setTimeout>>`
- `isShopFirstRender: useRef<boolean>`
- `openShopMenu()` / `closeShopMenu()` helpers

---

#### FET Page — `/fet` (`app/fet/page.tsx`)

Full product landing page for FET Engine Treatment. **Uses its own light green design system — not the main Okelcor orange theme.**

**Sections:**

| Section | Notes |
|---|---|
| Hero | Fullscreen video (`/videos/fet-hero.mp4`). `autoPlay muted loop playsInline`. Fallback: dark green gradient `from-[#0d2b1a] to-[#166534]` via `poster="/images/fet-hero-poster.jpg"`. `bg-black/50` overlay for legibility. Badge, pills, CTAs all use white/glass style over video. |
| Scroll indicator | Animated bouncing `ChevronDown` + "SCROLL" label at bottom of hero |
| How It Works | 3 white cards, stagger `FadeUp` reveal (0/110/220ms delays), green hover glow |
| Proven Results | **Dark green `#0d2b1a` band** — white stat numbers, green ring cards |
| Key Benefits | 6 white cards, stagger `FadeUp` (75ms steps), `#dcfce7` icon circles |
| Applications | 6 white icon tiles, stagger `FadeUp` (60ms steps), green hover |
| ROI Calculator | `<AmortizationCalculator />` in light theme |
| Bottom CTA | Dark `#0d2b1a` banner, `#22c55e` CTA button |

**Video fallback chain:**
1. `poster` attribute on `<video>` = `/images/fet-hero-poster.jpg` — native browser fallback image shown before video plays or if file missing
2. Gradient `from-[#0d2b1a] to-[#166534]` layer always rendered below the video as additional fallback

**To activate video:** place MP4 at `public/videos/fet-hero.mp4`. Directory already committed to repo. Poster image at `public/images/fet-hero-poster.jpg` also recommended.

---

#### FET Amortization Calculator — Light Theme

**File:** `components/fet/amortization-calculator.tsx`

Fully restyled from dark (`bg-white/[0.04]`, white text) to light:
- Card: white, `#e2e8e2` border, `shadow-sm`
- Active vehicle pill: `#dcfce7` bg, `#166534` text, `#22c55e` border
- Inputs: white bg, `#e2e8e2` border, `#22c55e` focus ring
- Slider accent: `#22c55e`
- Savings result tile: `#dcfce7` bg, `#16a34a` number
- Other result tiles: `#f9fafb` bg

**6 vehicle presets:** Passenger Car (€299), Van (€399), Heavy Truck (€599), Agricultural (€699), Construction (€699), Marine (€599). KM and hours modes.

---

#### FET Teaser (Homepage) — Light Theme

**File:** `components/fet-teaser.tsx`

Changed from dark `#1a1a1a` banner to light `#f0f4f0` with `border-y border-[#e2e8e2]`:
- Badge: `#dcfce7` pill with green dot, `#166534` text
- Heading accent: `#22c55e`
- CTA: solid `#22c55e` pill button with shadow (was outlined dark)

Placed in `app/page.tsx` after `<BrandsSection />`.

---

#### Card Animations (FadeUp stagger)

FET page sections use `components/motion/fade-up.tsx` (IntersectionObserver, CSS transition) for scroll reveal:
- Section headings: `<FadeUp>` wrapper
- Card grids: each card individually wrapped with staggered `delay` props
- All cards have CSS hover effects: `-translate-y-1`, colored ring glow, box shadow

---

## Completed in Latest Session — Frontend Audit (#6–#11) + Full Mobile Responsiveness Pass

### Audit #6 — Cart drawer i18n
**File:** `components/cart/cart-drawer.tsx`
- Added `useLanguage()` + typed `CartT = Translations["cart"]`
- All 14 hardcoded EN strings replaced with `ct.*` keys (empty state, totals, CTA labels, aria-labels)
- `loading="lazy"` added to thumbnail images
- `lib/translations.ts`: Added `cart` block with 15 keys × 3 locales (EN/DE/FR)

### Audit #7 — `loading="lazy"` on product/news images
- `components/shop/product-card.tsx` — card image
- `components/news/news-card.tsx` — featured + regular card images
- `components/shop/related-products.tsx` — related product images
- `components/shop/product-gallery.tsx` — thumbnail strip (main image intentionally eager — above fold)
- `components/about/logistics-partners.tsx` — partner logos
- `components/rex-certified.tsx` — REX logo
- `components/checkout/order-summary.tsx` — cart thumbnail

### Audit #8 — Self-host hero images (Unsplash removed)
**New directory:** `public/images/`
- `tyre-primary.jpg` — hero slide 3, about hero, quote hero, news article 1
- `tyre-stack.jpg` — categories card 1, auth page
- `tyre-truck.jpg` — categories card 3, company story, why-okelcor card 2, contact hero, news article 2
- `tyre-warehouse.jpg` — categories card 4, news article 3
- `logistics.jpg` — brands right panel, logistics section, logistics-partners, news page, imprint/privacy/terms heroes
- Mass-replaced all Unsplash CDN URLs via `sed` across 14+ files
- `next.config.ts`: removed `images.unsplash.com` from `remotePatterns`

### Audit #9 — Schema.org JSON-LD structured data
**Files:** `app/shop/[id]/page.tsx`, `app/news/[slug]/page.tsx`
- Product pages: `@type: "Product"` with brand, sku, image (absolute URL via `SITE_URL`), offers (price, currency, availability)
- Article pages: `@type: "NewsArticle"` with headline, description, image, `datePublished` (ISO 8601 via `toISODate()` helper), author, publisher with logo, `mainEntityOfPage`
- `toISODate()` converts "DD Month YYYY" → `YYYY-MM-DD` using a `MONTHS` record lookup (avoids timezone issues)

### Audit #10 — Company constants consolidated
**New file:** `lib/constants.ts`
```ts
SITE_URL, COMPANY_NAME, COMPANY_LEGAL_NAME, COMPANY_EMAIL,
COMPANY_NOREPLY_EMAIL, COMPANY_PHONE, COMPANY_FAX,
COMPANY_ADDRESS_STREET, COMPANY_ADDRESS_CITY, COMPANY_ADDRESS_COUNTRY, COMPANY_ADDRESS_FULL
```
**Updated to import from constants:** `app/layout.tsx`, `app/sitemap.ts`, `app/api/contact/route.ts`, `app/api/quote/route.ts`, `components/footer.tsx`, `app/contact/page.tsx`, `components/shop/product-accordion.tsx`, `components/quote/quote-summary.tsx`, `app/imprint/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`

### Audit #11 — Auth + Checkout i18n
**`lib/translations.ts`:** Added `auth` (31 keys) and `checkout` (53 keys) blocks × 3 locales

**`app/auth/page.tsx`:** Full rewrite — all strings via `t.auth.*`; `PasswordInput` accepts `showLabel`/`hideLabel` props; validation errors, success states, placeholders all i18n'd

**`components/checkout/checkout-flow.tsx`:** Wired `useLanguage()`; all delivery form labels/placeholders, validation errors, breadcrumb, section titles, submit button, legal note via `t.checkout.*`; Terms link fixed to `/terms`

**`components/checkout/payment-selector.tsx`:** `METHODS` array built dynamically from `t.checkout.*`; card form labels, placeholders, info paragraphs all i18n'd

**`components/checkout/express-checkout.tsx`:** Added `"use client"` + `useLanguage()`; `expressCheckout` title from `t.checkout.expressCheckout`

---

### Mobile Responsiveness — Full Site Pass

Applied across 20+ components and pages. All fixes categorized below.

#### Touch Targets (all interactive elements ≥ 48px)
| File | Change |
|---|---|
| `app/globals.css` | `tesla-icon-btn` 38→44px, `tesla-mobile-link` min-height 46→48px, hero btn `min-width: 140px` on mobile |
| `components/categories.tsx` | Card buttons `h-[46px]` → `h-[48px]` |
| `components/tbr-feature-section.tsx` | Button `h-[42px]` → `h-[48px]` |
| `components/used-tyres-section.tsx` | Both buttons `h-[42px]` → `h-[48px]` |
| `components/why-okelcor.tsx` | Buttons `h-[44px]` → `h-[48px]` |
| `components/floating-bar.tsx` | Form + CTA link `h-[44px]` → `h-[48px]` |
| `components/shop/shop-catalogue.tsx` | Filter toggle `h-[38px]` → `h-[48px]`, close button `h-8 w-8` → `h-10 w-10` |
| `components/shop/product-card.tsx` | Both buttons `h-[44px]` → `h-[48px]` |
| `components/rex-certified.tsx` | Verify button `h-[44px]` → `h-[48px]` |
| `components/brands.tsx` | View catalogue + all panel buttons → `h-[48px]` |
| `components/logistics.tsx` | All `py-3` buttons → `h-[48px]` |
| `components/newsletter-strip.tsx` | Input + subscribe button → explicit `h-[48px]` |
| `components/about/company-story.tsx` | Work with us button `h-[46px]` → `h-[48px]` |
| `app/contact/page.tsx` | Map enable button `h-[42px]` → `h-[48px]` |

#### Typography / Heading Scale
| File | Change |
|---|---|
| `components/navbar.tsx` | Tagline `text-[7.5px]` → `text-[9px]` (was unreadable) |
| `components/footer.tsx` | Tagline `text-[8px]` → `text-[9px]` |
| `components/shop/shop-hero.tsx` | h1 `text-4xl` → `text-3xl sm:text-4xl` |
| `components/brands.tsx` | Right panel h3 `text-4xl` → `text-3xl sm:text-4xl` |
| `components/categories.tsx` | Card h2 `text-[2.4rem]` → `text-[1.9rem] sm:text-[2.4rem] md:text-[3.5rem]` |

#### Layout / Card Heights
| File | Change |
|---|---|
| `components/hero.tsx` | `min-h-[560px]` → `min-h-[460px] sm:min-h-[520px] md:min-h-[560px]` |
| `components/categories.tsx` | Card `h-[420px]` → `h-[360px] sm:h-[420px] md:h-[580px]` |
| `app/contact/page.tsx` | Map iframe + consent placeholder — responsive height `h-[300px] sm:h-[380px] md:h-[480px]`; iframe uses `height="100%"` inside sized container |

---

## Completed in Previous Session — Route Transition Fail-Safe Hardening

### GSAP Animation Safety — All Hooks + Hero + Navbar

**Problem solved:** Three classes of failure that could leave the page in a broken state after navigation or on GSAP error:

1. **Invisible content** — `useReveal`, `useStagger`, and `useParallax` all set DOM elements to `opacity: 0` (or `yPercent`) as GSAP's initial "from" state before the animation runs. If GSAP threw or the ScrollTrigger never fired, elements stayed permanently hidden. Fixed with try/catch in all three hooks; the catch uses `clearProps` to remove the GSAP-set inline style and restore the element's natural CSS state.

2. **Blank hero** — `hero.tsx` entrance `useGSAP` set all background layers to `opacity: 0` unconditionally before building the timeline. A timeline error left the hero as a blank dark box. Fixed by wrapping the timeline + parallax setup in try/catch; the catch snaps `bgRefs[0]` to `opacity: 1` and clears inline styles on title/subtitle/buttons.

3. **Persistent pointer-blocking overlay** — The navbar mobile drawer and language panel used `onComplete` as the sole mechanism to call `gsap.set(el, { autoAlpha: 0 })` after the close animation. The effect cleanup calls `gsap.killTweensOf(...)` before each new tween; if this kill fired mid-close, `onComplete` never ran and the full-screen backdrop (`z-40, position: fixed, inset: 0`) remained interactive, blocking all clicks on the page. Fixed by adding `onInterrupt` callbacks identical to `onComplete` on every close tween.

**Files changed:**
| File | Change |
|---|---|
| `hooks/useReveal.ts` | try/catch + `clearProps` fallback |
| `hooks/useStagger.ts` | try/catch + `clearProps` fallback |
| `hooks/useParallax.ts` | try/catch + `clearProps` fallback |
| `components/hero.tsx` | try/catch on entrance timeline; snap-to-visible catch block |
| `components/navbar.tsx` | `onInterrupt` on all close tweens (drawer + lang panel + both backdrops) |

---

## Completed in Previous Session — SEO, Legal Pages, Email API, i18n & UX Polish

### Step 1 — Custom Next.js App Shell pages
**Files:** `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`, `app/template.tsx`

- `not-found.tsx`: Custom 404 page — Navbar + Footer, orange "Back to Home" CTA, secondary "Browse Catalogue" button; on-brand design using design system tokens
- `error.tsx`: Global error boundary (`"use client"`) — "Try Again" (calls `reset()`) + "Back to Home" buttons; logs error to console
- `loading.tsx`: Route-level loading state — orange spinning ring with "LOADING" label; shown automatically by Next.js App Router during page transitions
- `template.tsx`: Page transition wrapper (`"use client"`) — now GSAP-powered (replaced Framer Motion); opacity fade + `ScrollTrigger.refresh()` on every route change

### Step 2 — OpenGraph social image
**File:** `app/opengraph-image.tsx`

- Edge runtime, 1200×630 PNG via `next/og` ImageResponse
- Dark `#171a20` background, orange `#f4511e` accent bar at top, decorative tyre-circle outlines (top-right)
- "Growing Together" eyebrow, "Okelcor" headline, subtitle, four category tags (PCR / TBR / Used / Logistics), domain watermark
- Used automatically by Next.js for all `og:image` meta tags site-wide

### Step 3 — XML Sitemap
**File:** `app/sitemap.ts`

- Next.js `MetadataRoute.Sitemap` — auto-generates `/sitemap.xml`
- Static routes: `/` (priority 1.0), `/shop` (0.9), `/quote` (0.9), `/about` (0.7), `/news` (0.7), `/contact` (0.6)
- Dynamic product routes from `ALL_PRODUCTS` (priority 0.6)
- Dynamic article routes from `ALL_ARTICLES` (priority 0.5)
- Base URL via `NEXT_PUBLIC_BASE_URL` env var (fallback: `https://okelcor.de`)

### Step 4 — robots.txt
**File:** `public/robots.txt`

- `Allow: /` for all agents
- `Disallow:` for `/privacy`, `/terms`, `/imprint`, `/auth`, `/checkout`
- Points to `https://okelcor.de/sitemap.xml`

### Step 5 — Legal pages (Privacy Policy, Terms & Conditions, Imprint)
**Files:** `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/imprint/page.tsx`

All three pages:
- Use `<PageHero>` + Navbar + Footer
- `robots: { index: false, follow: false }` — excluded from search indexing
- White card panel, max-width 3xl, rounded-[22px], shadow
- Consistent `H2_CLS` / `P_CLS` / `LI_CLS` styling

Specific content:
- **Privacy Policy** — 9 GDPR-compliant sections (Controller, Data Collected, Legal Basis, Retention, Third Parties, Your Rights, Cookies, Changes, Contact). Dated March 2026.
- **Terms & Conditions** — 10 sections under German law / BGB (Scope, Offers, Prices, Delivery, Quality, Liability, Retention of Title, Governing Law, Severability, Contact). B2B-only scope.
- **Imprint** — §5 TMG legal disclosure. Contains amber ⚠ placeholder notices for three fields that need real legal data before going live:
  - HRB registration number (Amtsgericht München)
  - Managing Director full name
  - VAT ID (e.g. DE123456789)

### Step 6 — Real email API routes (Resend)
**Files:** `app/api/contact/route.ts`, `app/api/quote/route.ts`

**`/api/contact` (POST)**
- Server-side validation: `name`, `email`, `subject`, `inquiry` all required; email regex checked
- Builds branded HTML email (dark header, orange accents, field rows, CET timestamp)
- Sends to `CONTACT_EMAIL` env var (fallback: `info@okelcor.de`) via Resend
- `replyTo` set to sender's email so team can reply directly
- Returns 503 if `RESEND_API_KEY` is missing with a fallback message

**`/api/quote` (POST)**
- 7 required fields: `fullName`, `email`, `country`, `tyreCategory`, `quantity`, `deliveryLocation`, `notes`
- Generates unique reference: `OKL-QR-{6-digit-ts}-{3-char-rand}` (e.g. `OKL-QR-123456-A7B`)
- Sends **two emails**:
  1. Internal to sales team (all fields, structured by section: Business Info / Product / Logistics / Notes)
  2. Confirmation to requester (reference number box, response time promise, contact fallback)
- Returns `{ success: true, refNumber }` on success

**Required env vars** (add to `.env.local`):
```
RESEND_API_KEY=re_xxxx
FROM_EMAIL=Okelcor Website <noreply@okelcor.de>
CONTACT_EMAIL=info@okelcor.de
QUOTE_EMAIL=info@okelcor.de        # optional — falls back to CONTACT_EMAIL
NEXT_PUBLIC_BASE_URL=https://okelcor.de
OPENROUTER_API_KEY=sk-or-xxxx      # AI chat widget — get key at openrouter.ai
```

### Step 7 — i18n system (EN / DE / FR)
**Files:** `lib/translations.ts`, `context/language-context.tsx`

- **`lib/translations.ts`**: Full translation map for three locales (`en`, `de`, `fr`). Covers all site sections: nav, hero slides, categories, why-okelcor, logistics, used tyres, TBR, REX, brands, footer, shop, about, news, contact, quote, newsletter.
- **`context/language-context.tsx`**: `LanguageProvider` + `useLanguage()` hook
  - Restores saved locale from `localStorage` on mount (key: `okelcor_locale`)
  - Keeps `<html lang="...">` attribute in sync with selected locale
  - Wraps the root layout — all client components can call `useLanguage()` for `{ locale, setLocale, t }`

### Step 8 — Cookie consent
**Files:** `components/cookie-consent.tsx`, `lib/cookie-consent.ts`

### Step 9 — Back to top button
**File:** `components/back-to-top.tsx`

### Step 10 — Newsletter strip
**File:** `components/newsletter-strip.tsx`

### Step 11 — Motion primitives
**Files:** `lib/motion.ts`, `components/motion/reveal.tsx`, `components/motion/stagger.tsx`

### Step 12 — Page UI wrappers (i18n-driven)
**Files:** `components/about/about-page-ui.tsx`, `components/news/news-page-ui.tsx`, `components/news/article-ui.tsx`

---

## Completed in Previous Session — Admin CMS

### Admin CMS sections complete

| Section | Key files |
|---|---|
| Products | `app/admin/products/`, `components/admin/products-table.tsx` |
| Articles | `app/admin/articles/`, `components/admin/articles-table.tsx` |
| Orders | `app/admin/orders/`, `components/admin/orders-table.tsx`, `order-detail.tsx` |
| Brands | `app/admin/brands/`, `components/admin/brands-manager.tsx` |
| Hero Slides | `app/admin/hero-slides/`, `components/admin/hero-slides-manager.tsx`, `app/api/admin/hero-slides-upload/route.ts` |
| Quote Requests | `app/admin/quotes/`, `components/admin/quotes-table.tsx`, `quote-detail.tsx` |
| Settings | `app/admin/settings/`, `components/admin/settings-panel.tsx` |

**Video upload architecture note:** Server Action body size limit applies globally. Video uploads (up to 300 MB) use a Route Handler at `/api/admin/hero-slides-upload` — browser POSTs directly to this handler which proxies to Laravel.

### Frontend Settings Reflection
Settings saved in admin reflect on live site via `lib/site-settings.ts` (ISR, `revalidate: 60`), `context/site-settings-context.tsx`, and `app/layout.tsx`. Footer, contact page, email routes, and payment selector all read from `useSiteSettings()`.

---

## Completed in Previous Session — Auth, Payment Config & Checkout API

See previous handoff entries for full detail. Summary:

- **NextAuth:** Credentials provider, JWT sessions (30 days), middleware protects `/checkout` + `/account`
- **Stripe:** `@stripe/react-stripe-js`, `Elements` wrapper, `CardElement`, `stripe.confirmCardPayment(clientSecret)`
- **Checkout route:** `app/api/checkout/route.ts` — validates, generates `OKL-XXXXX` ref, sends Resend email, returns `{ success, orderRef, mode }`
- **Order tracking:** `app/account/orders/page.tsx` + `app/account/orders/[ref]/page.tsx` — server components, protected, fetches from `API_URL`

**API_URL env var pattern (important):**
```
process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
```
Server-side routes must use `API_URL` (no NEXT_PUBLIC_ prefix). Add `API_URL` to Vercel env vars.

---

## Current UI Status

| Section | Status |
|---|---|
| Navbar | Complete — logo, tagline, 44px icon buttons, mobile drawer, language switcher (EN/DE/FR), i18n, Shop dropdown with GSAP animation + hover bridge fix |
| Hero slider | Complete — GSAP parallax + crossfade, autoplay, dots; i18n; responsive min-height; video slide support |
| Categories carousel | Complete — i18n, 48px buttons, responsive card height + heading scale |
| Why Okelcor | Complete — orange CTAs, tyre imagery, 48px buttons, sm: padding |
| Trusted Brands | Complete — real logos, 48px buttons, sm: padding step |
| Logistics | Complete — 48px buttons, sm: padding step on detail card |
| Used Tyres feature | Complete — sm: padding step, 48px buttons |
| TBR feature | Complete — sm: padding step, 48px button |
| REX Certified | Complete — 48px verify button, sm: padding step |
| CTA Section | Complete |
| Floating bar | Complete — 48px form + CTA link |
| Footer | Complete — 4-column B2B layout, flex-wrap legal links, 9px tagline |
| Shop page | Complete — filter sidebar, product grid, 48px filter toggle + buttons |
| Product detail page | Complete — gallery, accordion, related products |
| About page | Complete — i18n via AboutPageUI wrapper |
| Contact page | Complete — form wired to `/api/contact` (Resend), responsive map, sm: padding |
| News page | Complete — i18n, featured + stagger grid |
| Article detail page | Complete — ArticleUI wrapper |
| Auth page | Complete — NextAuth Credentials provider, JWT sessions, callbackUrl redirect, i18n |
| Quote page | Complete — form wired to `/api/quote` (Resend), reference number shown on success |
| Cart drawer | Complete — fully i18n'd (all strings via t.cart.*) |
| Checkout page | Complete — wired to `/api/checkout`; orderRef + live/manual mode; Stripe CardElement |
| Order tracking | Complete — `/account/orders` list + `/account/orders/[ref]` detail with timeline |
| **FET page** | **Complete** — light theme, video hero, ROI calculator, 5 sections, stagger animations |
| **FET teaser** | **Complete** — light green `#f0f4f0` strip on homepage |
| 404 page | Complete — on-brand, Navbar + Footer |
| Error page | Complete — Try Again + Back to Home |
| Loading state | Complete — orange spinner |
| Page transitions | Complete — GSAP fade via `app/template.tsx` |
| Privacy Policy | Complete — 9 GDPR sections |
| Terms & Conditions | Complete — 10 sections, German law |
| Imprint | Complete (structure) — 3 fields need real legal data before go-live |
| OG social image | Complete — 1200×630, dark/orange brand |
| Sitemap | Complete — static + dynamic routes |
| robots.txt | Complete |
| Cookie consent | Complete — GDPR banner, localStorage persistence |
| Back to top button | Complete |
| Newsletter strip | Complete — i18n, validation, success state, 48px inputs |
| i18n system | Complete — EN / DE / FR; covers nav, hero, shop, cart, auth, checkout, all pages |
| Schema.org JSON-LD | Complete — Product schema on /shop/[id], NewsArticle schema on /news/[slug] |
| Company constants | Complete — `lib/constants.ts` single source of truth; used across 11 files |
| Self-hosted images | Complete — all Unsplash URLs replaced; images in `public/images/` |
| Mobile responsiveness | Complete — all touch targets ≥ 48px, heading scales, responsive padding, map iframe |
| Motion primitives | Complete — Reveal, StaggerParent/Child (GSAP-backed) + FadeUp (IntersectionObserver) |
| README | Complete |
| Analytics (GA4) | Complete — consent-aware GA4 loader, typed event tracker, product/quote/contact tracking wired |
| Search | Complete — site-wide modal, products + articles, GSAP animation, keyboard nav, Cmd/Ctrl+K, i18n |
| Admin — Products | Complete — list, create, edit, delete (soft), deactivate/reactivate, trash/restore, gallery images |
| Admin — Articles | Complete — list, create, edit, delete (soft), publish/unpublish, trash/restore, slug auto-gen |
| Admin — Orders | Complete — list with status filter + search + pagination, detail view, status update |
| Admin — Brands | Complete — grid management, add/edit name inline, logo upload, delete with confirmation overlay |
| Admin — Hero Slides | Complete — list ordered by position, add/edit form, image + video support, Route Handler upload |
| Admin — Quote Requests | Complete — list with status filter + search + pagination, detail view, status update |
| Admin — Settings | Complete — grouped cards, per-group save, toggle fields, empty state, normalises array/map API response |

---

## Known Issues / Pre-Launch Checklist

### Before going live — REQUIRED
1. **Imprint page** — Fill in 3 amber ⚠ placeholders in `app/imprint/page.tsx`:
   - HRB registration number (from Amtsgericht München)
   - Managing Director full name
   - VAT ID (format: `DE123456789`)

2. **All env vars** — Add to production environment (copy `.env.example` → Vercel Environment Variables):
   ```
   RESEND_API_KEY=re_xxxx
   FROM_EMAIL=Okelcor Website <noreply@okelcor.de>
   CONTACT_EMAIL=info@okelcor.de
   QUOTE_EMAIL=quotes@okelcor.de
   NEXT_PUBLIC_BASE_URL=https://okelcor.de
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXTAUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=https://okelcor.de
   API_URL=https://api.takeovercreatives.com/api/v1
   ```
   Without `RESEND_API_KEY`, contact/quote/checkout routes return errors.
   Without `NEXT_PUBLIC_GA_ID`, analytics is a no-op silently.
   Without `NEXTAUTH_SECRET` + `NEXTAUTH_URL`, auth sessions will fail.
   Without `API_URL`, order tracking and checkout proxy routes fall back to localhost.

3. **Auth backend** — `lib/auth.ts` `authorize()` currently accepts any valid-format email + password ≥8 chars. Replace with real DB lookup before launch.

4. **FET video** — Place the hero video at `public/videos/fet-hero.mp4`. The fallback gradient + poster image display until then. Optional poster: `public/images/fet-hero-poster.jpg`.

### Remaining — Medium Priority
5. **Payment provider credentials** — When ready, add to production env vars and implement the SDK call in `app/api/checkout/route.ts`:
   - **Stripe (card/Apple Pay/Google Pay):** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_SECRET_KEY`
   - **PayPal:** `NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`
   - **Klarna (via Stripe):** `NEXT_PUBLIC_KLARNA_ENABLED=true` (also needs Stripe keys)

6. **FET sitemap entry** — Add `/fet` to `app/sitemap.ts` static routes (priority 0.8)

### Remaining — Low Priority
7. **Newsletter backend** — `components/newsletter-strip.tsx` validates and shows success state but does not actually send/store emails; needs an endpoint

8. **Unused public assets cleanup** — Old placeholder SVGs in `public/brands/` superseded by real logos in `public/brands/brand logo/`; safe to delete

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
- Search: state lives in `context/search-context.tsx`; extend `lib/search.ts` if data sources change
- Translations: always add new string keys to the type in `lib/translations.ts` AND all 3 locales (en, de, fr)
- Navbar Shop dropdown: uses JS state (`openShop`) + GSAP + close-delay timer — do NOT revert to CSS `group-hover`
