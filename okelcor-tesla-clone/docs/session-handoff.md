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
No backend currently exists. This is a **frontend-only implementation**.

---

## Technology Stack

* Next.js (App Router)
* React 19 / TypeScript 5
* Tailwind CSS v4
* Framer Motion

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

## Completed in This Session — Design System Audit & Fixes

### Step 1 — Color token fixes
**Files:** `page-hero.tsx`, `tbr-feature-section.tsx`, `used-tyres-section.tsx`, `rex-certified.tsx`

- `page-hero.tsx`: eyebrow color `#FF6B00` → `var(--primary)`
- `tbr-feature-section.tsx`: hardcoded hex → `var(--primary)` / `var(--primary-hover)`
- `used-tyres-section.tsx`: `#5c5e62` → `var(--muted)`, `#30343a` → `var(--foreground)` / `var(--muted)`
- `rex-certified.tsx`: `#3f3f46` → `var(--muted)`, blue `#2f4ea1` → `var(--foreground)`

### Step 2 — Floating bar redesign
**File:** `floating-bar.tsx`

- Removed `text-blue-500` icon (brand violation)
- "Request a Quote" button restyled to orange pill CTA
- All Tailwind grey tokens replaced with design system values
- Input placeholder updated to "Ask about tyre supply"

### Step 3 — Navbar active state
**File:** `globals.css`

- Added `color: var(--primary)` to `.tesla-nav-link-active`
- Active page now shows orange text, matching DESIGN_SYSTEM.md spec

### Step 4 — Image replacements
**Files:** `why-okelcor.tsx`, `categories.tsx`, `app/shop/page.tsx`, `used-tyres-section.tsx`

- `why-okelcor` Image 1: car wheel → tyre tread close-up
- `why-okelcor` Image 2: red sports car → industrial/logistics scene
- `categories` Used Tires card: car interior → tyre pile
- `shop/page.tsx` hero: red Ferrari → tyre row warehouse
- `used-tyres-section.tsx`: removed duplicate of logistics image, replaced with distinct tyre image

### Step 5 — Brands section copy
**File:** `brands.tsx`

- Replaced developer scaffold heading: "Brand partners you can showcase visually" → "Sourcing from brands buyers already trust."
- Replaced developer placeholder paragraph with real B2B copy about Okelco's sourcing reach

### Step 6 — TBR section cleanup
**File:** `tbr-feature-section.tsx`

- Heading: `BRAND NEW TBR TYRES` → `Brand New TBR Tyres` (title case)
- Subtitle: removed italic style, reduced size, changed to `var(--muted)` text
- Button: `GET YOUR QUOTE NOW` → `Get Your Quote`
- Text column: `bg-white/78` glassmorphism overlay → solid `bg-[#efefef]`

### Step 7 — Shop page dead buttons
**File:** `app/shop/page.tsx`

- All four `<button type="button">Learn More</button>` → `<Link href="/contact">Request Supply</Link>` with orange pill styling
- Added `import Link from "next/link"`

### Step 8 — Why Okelcor CTA buttons
**File:** `why-okelcor.tsx`

- Both "Learn More" buttons: `bg-white text-foreground` → orange pill CTA style
- Both images replaced with tyre/logistics imagery

### Step 9 — Button border-radius standardisation
**Files:** `globals.css`, `categories.tsx`, `logistics.tsx`, `brands.tsx`, `cta-section.tsx`, `rex-certified.tsx`, `used-tyres-section.tsx`, `app/contact/page.tsx`

- All `.tesla-btn-*` and `.tesla-hero-btn-*` in globals.css: `border-radius: 4px` → `999px`
- All inline `rounded-md` / `rounded-[4px]` / `rounded-lg` on standalone buttons → `rounded-full`

### Step 10 — Background colour normalisation
**Files:** `categories.tsx`, `used-tyres-section.tsx`

- `bg-[#f4f4f4]` → `bg-[#f5f5f5]` in both files to match `--bg-page`

### Step 11 — Brand colour and font update (earlier session)
**File:** `globals.css`

- `--primary: #ff6b00` → `#f4511e` (correct Okelco Orange per CLAUDE.md)
- `--primary-hover: #e85f00` → `#df4618`
- Font family: `Arial, Helvetica` → SF Pro / Apple system stack

---

## Current UI Status

| Section | Status |
|---|---|
| Navbar | Complete — active state shows orange, mobile drawer works |
| Hero slider | Complete — Framer Motion parallax, autoplay, arrows, dots |
| Categories carousel | Complete — pill buttons; **"Learn More" text color unresolved (see below)** |
| Why Okelcor | Complete — orange CTAs, tyre imagery |
| Trusted Brands | Complete — real logos, production copy |
| Logistics | Complete — pill buttons |
| Used Tyres feature | Complete — distinct image, pill buttons |
| TBR feature | Complete — title case, solid background |
| REX Certified | Complete — design tokens, pill button |
| CTA Section | Complete — pill button |
| Floating bar | Complete — orange CTA, brand-correct styling |
| Footer | Complete |
| Shop page | Complete — tyre hero image, working CTAs |
| About page | Complete |
| Contact page | Complete — form validation, success state |
| News page | Placeholder only — no articles |

---

## Known Issue — Categories "Learn More" button text color

**Problem:** The "Learn More" button in the categories carousel cards shows white text on a white/light background, making it unreadable.

**Root cause:** Tailwind v4's preflight sets `a { color: inherit }` inside `@layer base`. The parent card container has `text-white` applied, and the inherited white color is winning over the Tailwind utility text colour class applied to the `<Link>` element.

**Attempts made:**
1. Changed `text-[var(--foreground)]` → `text-black` — did not fix
2. Removed `color: inherit` from custom `a {}` rule in globals.css — did not fix
3. Applied inline `style={{ color: '#171a20' }}` directly on the `<Link>` — latest attempt, should be definitive as inline styles bypass all CSS cascade

**If inline style still does not work**, the issue is likely a browser/dev server cache. Try: hard refresh (`Ctrl+Shift+R`), or stop and restart `npm run dev`.

---

## Remaining Priorities

### High
1. **Confirm categories "Learn More" button fix** — verify inline style resolved the text visibility issue
2. **Contact form email wiring** — `handleSubmit` in `app/contact/page.tsx` uses a fake `setTimeout`; needs a real email service (e.g. Resend, EmailJS, or a `/api/contact` route)
3. **Hero slide 1 and slide 3 images** — still hotlinking from third-party domains (`dannymaharajtyres.com`, `wixstatic.com`); fragile and may break; should be replaced with owned or Unsplash URLs

### Medium
4. **Shop page content** — currently 4 static placeholder cards; needs real product category structure per `page-guidelines.md` (filter panel + product grid)
5. **News page content** — currently a static placeholder; needs article cards per `page-guidelines.md`
6. **Logo** — `public/logo/okelcor-logo.png` exists but is not used anywhere; evaluate whether to place in navbar instead of the current "O" lettermark

### Low
7. **About page content** — only Mission and Approach panels; `page-guidelines.md` specifies three service blocks (Consultation, Logistics Handling, After Sales Support) and a fuller company description
8. **Unused SVG placeholders** — `public/brands/michelin.svg` etc. are superseded by real logos; can be deleted
9. **`architecture.md`** — exists at project root; CLAUDE.md expects it at `docs/architecture.md`; should be moved or the path updated

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
