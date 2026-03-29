# Session Handoff

## Project Summary

This project builds the **Okelco corporate website**.

Okelco is a **global tyre sourcing and supply company** specializing in:

* Used tyres
* PCR tyres
* TBR tyres
* Logistics tyre supply
* Wholesale tyre distribution

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

| Token | Value | CSS Variable |
|---|---|---|
| Okelco Orange | `#f4511e` | `--primary` |
| Orange Hover | `#df4618` | `--primary-hover` |
| Text Primary | `#171a20` | `--foreground` |
| Text Secondary | `#5c5e62` | `--muted` |
| Surface Grey | `#efefef` | — |
| Page Background | `#f5f5f5` | — |

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

### Remaining GSAP tasks (priority order)

1. ~~**Homepage sections — scroll reveal + stagger**~~ ✓ **COMPLETED**
   - `components/brands.tsx` — `<Reveal>` + `<StaggerParent>/<StaggerChild>` (GSAP-backed) ✓
   - `components/logistics.tsx` — `<Reveal delay={0.15}>` on both panels ✓
   - `components/why-okelcor.tsx` — `<StaggerParent>/<StaggerChild>` on 4-column grid ✓
   - `components/used-tyres-section.tsx` — `<Reveal>` on split card ✓ (added this session)
   - `components/tbr-feature-section.tsx` — `<Reveal>` on split card ✓ (added this session)
   - `components/rex-certified.tsx` — `<Reveal>` card + `useStagger` on 3-column interior ✓ (added this session)
   - `components/cta-section.tsx` — `useStagger` on card (4 text children cascade) ✓ (added this session)

2. ~~**Categories carousel — card stagger reveal**~~ ✓ **COMPLETED**
   - `components/categories.tsx` — `useReveal` on heading block + `useGSAP` stagger on `<article>` cards via `sliderRef` ✓

3. ~~**Route transition system — fail-safe hardening**~~ ✓ **COMPLETED**
   - `hooks/useReveal.ts` — wrapped `gsap.fromTo` in try/catch; on error `clearProps: "opacity,y"` snaps element to visible
   - `hooks/useStagger.ts` — same pattern; children never left at `opacity: 0` on GSAP error
   - `hooks/useParallax.ts` — same pattern; `clearProps: "yPercent"` resets transform on error
   - `components/hero.tsx` — entrance `useGSAP` block wrapped in try/catch; catch snaps first bg layer to `opacity: 1` and clears text element inline styles so hero is never a blank box
   - `components/navbar.tsx` — added `onInterrupt` callbacks (matching `onComplete`) to all close tweens for the mobile drawer and language panel; guarantees `autoAlpha: 0` is set even if a tween is killed mid-flight, preventing the full-screen backdrop from blocking pointer events after navigation

4. **Product/News cards — hover micro-interactions** ← NEXT STEP
   - `components/shop/product-card.tsx` — subtle scale/shadow on hover
   - `components/news/news-card.tsx` — subtle hover lift

5. **Product accordion — GSAP height animation**
   - `components/shop/product-accordion.tsx` — replace Framer Motion with GSAP `height` tween

6. **Cart drawer — GSAP slide panel**
   - Cart drawer component — slide-in from right via `expo.out`

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

#### Padding — `sm:` Steps Added
| File | Change |
|---|---|
| `components/tbr-feature-section.tsx` | `px-8 py-10` → `px-6 py-8 sm:px-8 sm:py-10 md:px-12 md:py-12` |
| `components/used-tyres-section.tsx` | Same pattern |
| `components/why-okelcor.tsx` | Card `p-6 md:p-10` → `p-6 sm:p-8 md:p-10` |
| `components/brands.tsx` | Left panel `p-8 md:p-12` → `p-6 sm:p-8 md:p-12` |
| `components/logistics.tsx` | Detail card `p-8 md:p-10` → `p-6 sm:p-8 md:p-10` |
| `components/rex-certified.tsx` | `px-8 py-8 md:px-12` → `px-5 py-6 sm:px-8 sm:py-8 md:px-12` |
| `components/about/services.tsx` | Card `p-8` → `p-6 sm:p-8` |
| `components/about/company-story.tsx` | Content panel `p-8 md:p-10 lg:p-12` → `p-6 sm:p-8 md:p-10 lg:p-12` |
| `app/contact/page.tsx` | Info + form cards `p-8 md:p-10` → `p-6 sm:p-8 md:p-10` |

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

## Completed in Previous Session — SEO, Legal Pages, Email API, i18n & UX Polish (now superseded above)

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

This resolves the previous HIGH priority item: "Contact/Quote form email wiring".

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

- **`lib/cookie-consent.ts`**: `getConsent()` / `setConsent()` helpers; reads/writes `okelcor-cookie-consent` in localStorage; dispatches `cookie-consent-update` event on change
- **`components/cookie-consent.tsx`**: GDPR banner fixed to bottom of screen
  - Delayed 600ms to avoid hydration flash
  - "Reject Non-Essential" (ghost pill) + "Accept All" (orange pill)
  - Links to `/privacy` policy
  - Only shown if no prior consent stored

### Step 9 — Back to top button
**File:** `components/back-to-top.tsx`

- Appears after scrolling 400px (passive scroll listener)
- Smooth scroll to top on click
- Dark circle by default, transitions to orange on hover
- Fade + slide-up transition for show/hide

### Step 10 — Newsletter strip
**File:** `components/newsletter-strip.tsx`

- Email input + submit button, inline validation
- i18n via `useLanguage()` — copy comes from `t.newsletter.*`
- Success state replaces form with a green confirmation message (no redirect)
- Styled to match page background (`#f5f5f5`), rounded-full inputs/buttons

### Step 11 — Motion primitives
**Files:** `lib/motion.ts`, `components/motion/reveal.tsx`, `components/motion/stagger.tsx`

- **`lib/motion.ts`**: Shared Framer Motion variant presets — `fadeUp`, `staggerContainer`, `staggerItem`, `viewportOnce`
- **`components/motion/reveal.tsx`**: `<Reveal>` — scroll-triggered fade+slide wrapper; accepts `delay` prop; safe to import from server components
- **`components/motion/stagger.tsx`**: `<StaggerParent>` + `<StaggerChild>` — coordinated stagger animation for grids/lists

### Step 12 — Page UI wrappers (i18n-driven)
**Files:** `components/about/about-page-ui.tsx`, `components/news/news-page-ui.tsx`, `components/news/article-ui.tsx`

- Each is a `"use client"` wrapper that reads `useLanguage()` and passes translated strings to the underlying server components
- `about-page-ui.tsx`: Renders `<PageHero>` with translated strings + `<CompanyStory>`, `<Services>`, `<LogisticsPartners>`
- `news-page-ui.tsx`: Renders `<PageHero>` + featured article + `<StaggerParent>` grid of remaining articles; uses `getLocalizedArticles(locale)` for locale-aware article data
- `article-ui.tsx`: Article detail page UI wrapper

---

## Completed in Previous Session — Repo Restructure & README

### Step 1 — Git repo moved to project root
- Moved `.git` from `Projects/` into `Projects/okelcor-website/`
- Project files now sit at repo root — `app/`, `components/`, etc. are top-level on GitHub

### Step 2 — README rewritten
**File:** `README.md`
- Full project README with stack, pages, setup, design system summary, status note, and company contact info

---

## Completed in Previous Session — Responsiveness, UI Fixes & GitHub

### Step 1 — Mobile & tablet responsiveness pass
- Hero buttons: `flex-wrap justify-center gap-3`; removed forced full-width
- CTA, REX, categories, brands, logistics, why-okelcor buttons: changed to `inline-flex`
- Footer legal links: `flex-wrap` to prevent narrow-screen overflow
- `globals.css`: `.tesla-hero-btn-*` min-width `160px`, height `46px`; mobile: only `height: 50px` applied

### Step 2 — GitHub repository setup
- Repo at `https://github.com/johnseyi/okelcor-website`, branch `main`

---

## Completed in Previous Session — Design System Audit & Fixes

- Color tokens normalized to `var(--primary)`, `var(--primary-hover)`, `var(--foreground)`, `var(--muted)` across all components
- Floating bar: redesigned to orange pill CTA, removed blue icon
- Navbar active state: `color: var(--primary)` in `.tesla-nav-link-active`
- Image replacements: tyre-focused imagery throughout (why-okelcor, categories, shop, used-tyres)
- Brands section copy: real B2B copy replacing scaffold placeholder
- TBR section: title case, solid background, cleaner subtitle
- Shop dead buttons: replaced with `<Link href="/contact">Request Supply</Link>`
- Button border-radius: all → `rounded-full` / `border-radius: 999px`
- Brand color: `--primary: #f4511e`, `--primary-hover: #df4618`

---

## Current UI Status

| Section | Status |
|---|---|
| Navbar | Complete — logo, 9px tagline, 44px icon buttons, mobile drawer, language switcher (EN/DE/FR), i18n |
| Hero slider | Complete — GSAP parallax + crossfade, autoplay, dots; i18n slide content; responsive min-height |
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
| Checkout page | Complete — wired to `/api/checkout`; orderRef + live/manual mode; payment provider feature flags |
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
| Self-hosted images | Complete — all Unsplash URLs replaced; 5 images in `public/images/` |
| Mobile responsiveness | Complete — all touch targets ≥ 48px, heading scales, responsive padding, map iframe |
| Motion primitives | Complete — Reveal, StaggerParent/Child (GSAP-backed) |
| README | Complete |
| Analytics (GA4) | Complete — consent-aware GA4 loader, typed event tracker, product/quote/contact tracking wired |
| Search | Complete — site-wide modal, products + articles, GSAP animation, keyboard nav, Cmd/Ctrl+K, i18n |

---

## Completed in Latest Session — Auth, Payment Config & Checkout API

### Authentication (NextAuth.js)

| File | Notes |
|---|---|
| `lib/auth.ts` | NextAuth config: Credentials provider, JWT strategy (30-day sessions), pages.signIn: "/auth". `authorize()` accepts valid-format email + password ≥8 chars — marked TODO for real DB |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth catch-all GET/POST handler |
| `components/auth/session-provider.tsx` | `"use client"` wrapper around NextAuth `SessionProvider` so the server root layout can import it |
| `middleware.ts` | `withAuth` from next-auth/middleware. Protects `/checkout` and `/account` only. All public routes never matched. |
| `app/auth/page.tsx` | `useSearchParams` reads `callbackUrl`; `signIn("credentials", { redirect: false })` used; redirects via `result.url` (same-origin validated by NextAuth, prevents open redirect). Error state shown on invalid credentials. |
| `app/checkout/page.tsx` | Added `getServerSession(authOptions)` + `redirect()` as defence-in-depth behind the middleware |
| `app/layout.tsx` | `<AuthSessionProvider>` wraps the tree above all other providers |
| `components/navbar.tsx` | Session-aware: when authenticated shows Account icon + Logout; when signed out shows Sign In icon. `justify-self-start` on logo link for equal left/right edge inset. |

### Payment Configuration

| File | Notes |
|---|---|
| `lib/payment-config.ts` | Feature flags driven by `NEXT_PUBLIC_` env vars. Exports `PAYMENT_PROVIDERS` record (enabled, label, description per method), `anyProviderEnabled`, `STRIPE_PUBLISHABLE_KEY`, `PAYPAL_CLIENT_ID`. |
| `components/checkout/payment-selector.tsx` | Per-method `disabled` + "Soon" badge when provider not configured. Amber info panel shown when no provider is live. |
| `components/checkout/express-checkout.tsx` | Returns `null` (hides entire section) when no express provider is configured. Individual buttons disabled + `opacity-40` when provider not enabled. |
| `app/api/checkout/route.ts` | Full order handler: validates body, generates `OKL-XXXXX` order ref, sends Resend notification email to team, returns `{ success, orderRef, mode: "live" \| "manual" }`. Integration stubs for Stripe, PayPal, and Klarna (via Stripe) with install/env/docs comments. |
| `components/checkout/checkout-flow.tsx` | `handleSubmit` now `async` — real `fetch("/api/checkout")` with delivery + paymentMethod + items. Reads `data.orderRef` and `data.mode`. `orderMode` state passed to `SuccessState`. `submitError` state shows red error banner on API/network failure. |
| `.env.example` | Documents all required env vars: app URL, GA4, Resend, NextAuth, Stripe, PayPal, Klarna. |
| `.gitignore` | Added `!.env.example` exception; added `.claude/` to ignore local IDE settings. |

### Manual Order Pattern (when no payment credentials set)
- API returns `mode: "manual"`
- Success screen shows amber "What happens next" panel explaining team will contact for payment
- Resend notification email always sent regardless of payment mode — no order ever silently lost
- Once credentials are added and SDK stubs implemented, `mode: "live"` flows through with no frontend changes

### GSAP Route Transition Hardening
- `lib/gsap.ts` — `beforeunload` handler kills all ScrollTriggers and clears the global timeline on full-page navigation
- `app/template.tsx` — `ScrollTrigger.refresh()` via `requestAnimationFrame` after each route mount, ensuring scroll positions recalculate after auth redirects
- `hooks/useReveal.ts`, `hooks/useStagger.ts`, `hooks/useParallax.ts` — `clearProps` in `useGSAP` cleanup prevents `opacity: 0` flash when navigating away

### Brands Section
- Grid changed to `grid-cols-2` (was `[1.25fr_1fr]`) for visual balance
- Pirelli logo: `style={{ width: "auto", height: "auto", maxWidth: "110px", maxHeight: "48px" }}` — resolves Next.js Image aspect-ratio warning

---

## Completed in Previous Session — Analytics + Search

### Analytics (GA4, GDPR-aware)
| File | Notes |
|---|---|
| `lib/analytics.ts` | Typed event wrappers: `trackProductView`, `trackAddToCart`, `trackQuoteSubmit`, `trackContactSubmit`, `trackEvent` |
| `components/analytics-script.tsx` | Consent-aware GA4 loader. Defaults to `analytics_storage: denied`. Upgrades on cookie accept. No-ops if `NEXT_PUBLIC_GA_ID` is unset. |
| `components/shop/product-view-tracker.tsx` | Headless client component — fires `view_item` on product detail page mount |
| `app/layout.tsx` | Added `<AnalyticsScript />` |
| `app/shop/[id]/page.tsx` | Added `<ProductViewTracker product={product} />` |
| `components/quote/quote-form.tsx` | `trackQuoteSubmit()` called on success |
| `app/contact/page.tsx` | `trackContactSubmit()` called on success |

**Env var required:** `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

### Search (site-wide, client-side)
| File | Notes |
|---|---|
| `lib/search.ts` | Token-based search engine. Scores products (brand/name/size/type/sku) + articles (title/category/summary). Returns grouped `SearchResults`. |
| `context/search-context.tsx` | Global state: `isOpen`, `query`, `results`. Provides `openSearch`, `closeSearch`, `setQuery`. Wraps root layout inside `LanguageProvider`. |
| `components/search/search-modal.tsx` | Full-screen overlay. GSAP backdrop fade + modal slide-up. Keyboard nav (↑↓ Enter Esc). Cmd/Ctrl+K global shortcut. i18n. |
| `lib/translations.ts` | Added `search` block (EN/DE/FR): `placeholder`, `noResults`, `noResultsHint`, `productsHeading`, `articlesHeading`, `close` |
| `components/navbar.tsx` | Search icon added — desktop (between Help and Language) + mobile drawer meta section |
| `app/layout.tsx` | Wrapped with `<SearchProvider>`, added `<SearchModal />` |

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
   ```
   Without `RESEND_API_KEY`, contact/quote/checkout routes return errors.
   Without `NEXT_PUBLIC_GA_ID`, analytics is a no-op silently.
   Without `NEXTAUTH_SECRET` + `NEXTAUTH_URL`, auth sessions will fail.

3. **Auth backend** — `lib/auth.ts` `authorize()` currently accepts any valid-format email + password ≥8 chars. Replace with real DB lookup before launch.

### Remaining — Medium Priority
4. **Unused public assets cleanup** — Old placeholder SVGs in `public/brands/` superseded by real logos in `public/brands/brand logo/`; safe to delete

5. **Payment provider credentials** — When ready, add to production env vars and implement the SDK call in `app/api/checkout/route.ts` at the clearly marked integration stubs:
   - **Stripe (card/Apple Pay/Google Pay):** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` + `STRIPE_SECRET_KEY`
   - **PayPal:** `NEXT_PUBLIC_PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`
   - **Klarna (via Stripe):** `NEXT_PUBLIC_KLARNA_ENABLED=true` (also needs Stripe keys)

### Remaining — Low Priority
6. **Newsletter backend** — `components/newsletter-strip.tsx` validates and shows success state but does not actually send/store emails; needs an endpoint

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
- Use `var(--primary)`, `var(--primary-hover)`, `var(--foreground)`, `var(--muted)` — never hardcode hex values that duplicate these tokens
- All buttons use `rounded-full` (pill shape) per DESIGN_SYSTEM.md
- Prefer server components; only use `"use client"` where hooks or browser APIs are required
- i18n: use `useLanguage()` in client wrappers; keep server components translation-free
- Analytics: use helpers from `lib/analytics.ts` — never call `window.gtag` directly in components
- Search: state lives in `context/search-context.tsx`; extend `lib/search.ts` if data sources change
- Translations: always add new string keys to the type in `lib/translations.ts` AND all 3 locales (en, de, fr)
