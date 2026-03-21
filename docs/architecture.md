# Okelcor — Project Architecture

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + global CSS classes |
| Animation | Framer Motion |
| Icons | Lucide React |
| Font | Arial / Helvetica (system stack) |

---

## Folder Structure

```
okelcor-tesla-clone/
│
├── app/                          # Next.js App Router — pages, layouts, global styles
│   ├── layout.tsx                # Root layout: html/body shell, global metadata
│   ├── globals.css               # CSS variables, Tailwind import, shared utility classes
│   ├── favicon.ico               # Auto-served by Next.js App Router (no <link> needed)
│   ├── page.tsx                  # Home page — composes all homepage section components
│   ├── shop/
│   │   └── page.tsx              # Shop page — product category cards
│   ├── news/
│   │   └── page.tsx              # News page — article listing
│   ├── about/
│   │   └── page.tsx              # About page — mission and approach
│   └── contact/
│       ├── layout.tsx            # Exports metadata for /contact (page is a client component)
│       └── page.tsx              # Contact page — client component with validated form
│
├── components/                   # Reusable UI components (flat, no subfolders)
│   │
│   ├── — Shared across pages —
│   ├── navbar.tsx                # Fixed top nav, mobile drawer, language panel
│   ├── page-hero.tsx             # Parameterised hero banner for inner pages
│   ├── footer.tsx                # Site footer with navigation links
│   ├── floating-bar.tsx          # Sticky bottom bar — inquiry input + CTA
│   │
│   └── — Homepage sections (rendered top-to-bottom in app/page.tsx) —
│       ├── hero.tsx              # Auto-playing image carousel with parallax
│       ├── categories.tsx        # Horizontal scroll card carousel
│       ├── why-okelcor.tsx       # 2-column value proposition grid
│       ├── brands.tsx            # Brand partner logos grid + image panel
│       ├── logistics.tsx         # Multi-card logistics feature layout
│       ├── used-tyres-section.tsx# Split text/image used tyres highlight
│       ├── tbr-feature-section.tsx # Split image/text TBR tyres feature
│       ├── rex-certified.tsx     # REX certification badge section
│       └── cta-section.tsx       # Centred call-to-action section
│
├── public/                       # Static assets — served at root URL path
│   ├── favicon.svg               # SVG favicon
│   ├── rex-logo.svg              # REX certification badge (SVG, created in-project)
│   ├── rex-logo.png              # REX certification badge (PNG alternative)
│   ├── logo/
│   │   └── okelcor-logo.png      # Okelcor company logo (available, not yet used in UI)
│   ├── brands/
│   │   ├── brand logo/           # Real brand partner logo files (active)
│   │   │   ├── michelin-logo-6.png
│   │   │   ├── Bridgestone-Logo.png
│   │   │   ├── goodyear-logo-01.jpg
│   │   │   ├── Continental_Logo.png
│   │   │   ├── Pirelli_-_logo_full_(Italy,_1997).svg.png
│   │   │   └── dunlop-3.svg
│   │   └── *.svg                 # SVG wordmark placeholders (unused, superseded by real logos)
│   └── sections/                 # Section background images (local assets)
│       ├── used-tyres.jpg
│       ├── tbr-tyres.jpg
│       └── tyre-bg-light.png
│
├── next.config.ts                # Next.js config (currently empty — extend as needed)
├── postcss.config.mjs            # PostCSS config for Tailwind v4
├── eslint.config.mjs             # ESLint with Next.js core-web-vitals + TypeScript rules
└── package.json
```

---

## Component Hierarchy

### Home page (`/`)

```
app/page.tsx  [Server Component]
│
├── Navbar          [Client]   — useState, usePathname, Framer Motion
├── Hero            [Client]   — useState, useScroll/useTransform, setInterval
├── Categories      [Client]   — useState, useRef, scroll tracking
├── WhyOkelcor      [Server]
├── Brands          [Server]
├── Logistics       [Server]
├── UsedTyresSection[Server]
├── TbrFeatureSection[Server]
├── RexCertified    [Server]
├── CTASection      [Server]
├── FloatingBar     [Client]   — useState, useRouter
└── Footer          [Server]
```

### Inner pages (`/shop`, `/news`, `/about`)

```
app/[page]/page.tsx  [Server Component]
│
├── Navbar      [Client]
├── PageHero    [Server]   — accepts: eyebrow, title, subtitle, image props
├── [content]   [Server]   — static cards/grids specific to each page
└── Footer      [Server]
```

### Contact page (`/contact`)

```
app/contact/layout.tsx   [Server]  — exports metadata (page is client, can't export metadata)
app/contact/page.tsx     [Client]  — useState for form state, validation, submission
│
├── Navbar      [Client]
├── PageHero    [Server]
├── [form]      [inline]   — controlled inputs, error states, success state
└── Footer      [Server]
```

---

## Data Flow

### Static data (current state)

All content is hardcoded as constants at the top of each component file. There is no CMS, database, or API.

| Component | Data location |
|---|---|
| `hero.tsx` | `const slides: Slide[]` — 3 slide objects with title, subtitle, image |
| `categories.tsx` | `const cards: Card[]` — 4 product category cards |
| `navbar.tsx` | `const navItems` + `const languageGroups` — nav links and region list |
| `footer.tsx` | `const links` — 8 nav link objects with label + href |
| `brands.tsx` | `const brands` — 6 brand objects with name + src path |
| `shop/page.tsx` | `const items` — 4 product category objects |
| `news/page.tsx` | `const posts` — 3 article preview objects |

### Client state

All state is local to its component — there is no global state manager (no Redux, Zustand, Context).

| Component | State | Purpose |
|---|---|---|
| `navbar.tsx` | `openMenu`, `openLang`, `openMobileLang`, `selectedRegion` | Drawer/panel open states + active region |
| `hero.tsx` | `index`, `isPaused` | Active slide + autoplay pause |
| `categories.tsx` | `activeIndex` | Active card dot indicator |
| `floating-bar.tsx` | `query` | Controlled inquiry input value |
| `contact/page.tsx` | `form`, `errors`, `submitted`, `submitting` | Full form lifecycle |

### Scroll-driven animation

`hero.tsx` uses Framer Motion's `useScroll` + `useTransform` to drive a parallax effect on the slide background. This is a MotionValue pipeline — the scroll position is never stored in React state and causes no re-renders.

```
window scroll → useScroll() MotionValue
                    ↓
             useTransform([0,600] → [0,60])
                    ↓
             motion.div style.y  (DOM update, no React render)
```

### Navigation / routing

All CTAs use Next.js `<Link>` for client-side navigation. No `<a href>` tags exist for internal routes. The floating bar uses `useRouter().push("/contact")` on form submit.

---

## Styling Architecture

### Two-layer system

**Layer 1 — CSS variables** (`app/globals.css` `:root`)

Design tokens. Change one value here to update the entire site.

```css
--foreground:    #171a20   /* primary text */
--muted:         #5c5e62   /* secondary/caption text */
--background:    #f4f4f4   /* page background */
--card:          #ffffff   /* card surface */
--primary:       #ff6b00   /* brand orange — CTAs, labels, accents */
--primary-hover: #e85f00   /* brand orange hover state */
--border:        rgba(23, 26, 32, 0.08)
```

**Layer 2 — Shared CSS classes** (`app/globals.css`)

Semantic classes for repeated UI patterns. Referenced by className in components.

| Class prefix | Usage |
|---|---|
| `.tesla-shell` | Max-width content wrapper (used on every section) |
| `.tesla-nav-link` | Desktop nav link with hover/active states |
| `.tesla-icon-btn` | Circular icon button (navbar actions) |
| `.tesla-mobile-link` | Mobile drawer nav link |
| `.tesla-mobile-meta-link` | Mobile drawer utility row (language, account, help) |
| `.tesla-btn-primary` | Standard filled CTA button |
| `.tesla-btn-secondary` | Standard ghost CTA button |
| `.tesla-hero-btn-*` | Full-width hero overlay buttons |
| `.tesla-card` | Rounded image card with hover lift |
| `.hero-title` | Responsive hero heading (`clamp`) |
| `.hero-subtitle` | Responsive hero subheading |
| `.section-heading` | Responsive section heading |
| `.footer-link` | Footer anchor with muted/hover colour |
| `.hide-scrollbar` | Hides scrollbar (used in mobile drawer + categories) |

**Layer 3 — Tailwind arbitrary values** (inline in JSX)

Used for one-off values not worth abstracting (e.g. `rounded-[22px]`, `min-h-[620px]`, `gap-x-10`).

---

## Naming Conventions

### Files

| Pattern | Convention | Example |
|---|---|---|
| Component files | `kebab-case.tsx` | `used-tyres-section.tsx` |
| Page files | `page.tsx` (fixed by Next.js) | `app/shop/page.tsx` |
| Layout files | `layout.tsx` (fixed by Next.js) | `app/contact/layout.tsx` |
| CSS | `globals.css` (single file) | `app/globals.css` |
| Public assets | `kebab-case.ext` | `rex-logo.svg` |

### Components and types

| Pattern | Convention | Example |
|---|---|---|
| Component functions | `PascalCase` | `export default function UsedTyresSection()` |
| TypeScript types | `PascalCase` inline | `type Slide = { title: string; ... }` |
| TypeScript props | `PascalCase` + `Props` suffix | `type PageHeroProps = { ... }` |
| Local constants | `camelCase` | `const navItems`, `const slides` |

### CSS

| Pattern | Convention | Example |
|---|---|---|
| Shared classes | `.tesla-[component]-[variant]` | `.tesla-nav-link-active` |
| CSS variables | `--kebab-case` | `--primary-hover` |
| Tailwind arbitrary | `[value]` inline | `text-[var(--muted)]`, `rounded-[22px]` |

### Routing

| Route | File | Type |
|---|---|---|
| `/` | `app/page.tsx` | Server Component |
| `/shop` | `app/shop/page.tsx` | Server Component |
| `/news` | `app/news/page.tsx` | Server Component |
| `/about` | `app/about/page.tsx` | Server Component |
| `/contact` | `app/contact/page.tsx` | Client Component |

---

## Key Patterns and Decisions

**Why `app/contact/layout.tsx` exists**
Next.js does not allow `export const metadata` inside a `"use client"` component. The contact page needs client-side state for form handling, so its metadata is exported from a co-located `layout.tsx` instead.

**Why brand logos use `<img>` not `<Image>`**
Next.js `<Image>` does not optimise SVG files and requires `remotePatterns` config for external URLs. The brand logo grid uses standard `<img>` tags to avoid this configuration overhead while the asset strategy is still being finalised.

**Why `"use client"` is absent from most components**
Only components that use browser APIs, React hooks, or event handlers require `"use client"`. Server Components reduce the client JS bundle and allow React to stream HTML immediately. The 5 client components are the minimum needed for the current feature set.

**Why inline data lives in component files**
The project has no CMS or data layer. All content constants sit at the top of the component that renders them — simple to find and edit for a site at this stage. When a CMS is added, these constants become the data-shape contract.
