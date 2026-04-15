
# CLAUDE.md

## Project Overview

This project builds the **Okelco corporate website**, a premium modern web experience for a global tyre supplier.

The site presents Okelco’s tyre sourcing business including:

* Used tyres
* PCR tyres
* TBR tyres
* Global logistics supply
* Wholesale catalogue access
* Quote requests
* Industry certifications (REX)
* **FET Engine Treatment** — a second product line (fuel efficiency device) at `/fet`

The website must communicate **trust, professionalism, and global logistics capability**.

The design approach is **Tesla-inspired UI/UX structure**, but customized for Okelco’s brand identity and tyre industry focus.

The final result should feel:

* premium
* minimal
* modern
* industrial
* trustworthy
* globally oriented

This is **not a SaaS dashboard or startup landing page**.
It is a **corporate B2B supply website**.

---

# Tech Stack

* Next.js (App Router)
* React 19 / TypeScript 5
* Tailwind CSS v4
* **GSAP 3.14 + @gsap/react** (sole animation library — Framer Motion has been fully removed)
* NextAuth.js v4 (authentication)
* Resend (transactional email)

Avoid adding new frameworks unless necessary.

---

# Coding Rules

Always follow these engineering rules:

* Use **functional React components**
* Prefer **server components where possible**
* Keep components **small, modular, and reusable**
* Avoid unnecessary dependencies
* Prefer **composition over large monolithic files**
* Keep folder structure clean and predictable
* Do not introduce breaking changes to working features
* Preserve architecture unless explicitly instructed

Never refactor large parts of the codebase without explaining why.

---

# UI / UX Direction

The UI follows a **Tesla-inspired layout system**, adapted for the tyre industry.

Key principles:

* Clean layout structure
* Large imagery
* Strong whitespace
* Minimal visual clutter
* Clear content hierarchy
* Smooth subtle animations

Important:
This site must **look like a premium tyre supplier**, not a car brand or tech startup.

---

# Brand Identity

## Okelcor Main Site

Primary brand color:

```
Okelco Orange
#f4511e
```

Supporting colors:

```
Text Primary: #171a20
Text Secondary: #5c5e62
Surface Grey: #efefef
Page Background: #f5f5f5
```

Rules:

* Use orange primarily for **CTA buttons and highlights**
* Avoid overusing orange backgrounds
* Keep most sections **white or light grey**
* Maintain strong readability and contrast

## FET Engine Treatment Page (`/fet`) — Separate Design System

The `/fet` page and `components/fet/` use a distinct green-based palette. **Never apply Okelcor orange to FET-specific UI.**

```
Page background:  #f0f4f0
Cards:            white, border #e2e8e2
Text primary:     #111111
Text secondary:   #6b7280
Accent / buttons: #22c55e (bright green)
Badge bg:         #dcfce7, text #166534
Dark section bg:  #0d2b1a (Proven Results + CTA)
CTA hover:        #16a34a
```

---

# Visual Language

Imagery must focus on **tyres and logistics**, not cars.

Preferred imagery:

* tyre tread close-ups
* stacked tyres
* tyre warehouse scenes
* truck tyres
* logistics transport scenes
* tyre handling and distribution

Avoid:

* sports car glamour imagery
* automotive lifestyle photography
* generic stock business photos

This is a **tyre supply company website**.

---

# Layout System

Pages follow a Tesla-inspired structure:

1. Fixed Navbar
2. Full-width Hero Slider
3. Horizontal Product / Category Carousel
4. Promo Strip Sections
5. Split Image + Text Feature Sections
6. Certification / Trust Sections
7. Final CTA Section
8. Floating Utility Bar
9. Footer

Spacing should feel **balanced and premium**, not cramped.

---

# Components

Major components in this project include:

**Okelcor main site:**
* Navbar (GSAP-animated, i18n, Shop dropdown with JS state + close-delay)
* Hero Slider (GSAP parallax, video slide support)
* Categories Carousel
* Why Okelcor
* Trusted Brands
* Logistics Feature Section
* Used Tyres Feature Section
* TBR Tyres Feature Section
* REX Certification Section
* CTA Section
* Floating Utility Bar
* Footer
* FET Teaser strip (`components/fet-teaser.tsx`)

**FET Engine Treatment (`/fet`):**
* `app/fet/page.tsx` — full landing page (light green theme)
* `components/fet/amortization-calculator.tsx` — ROI calculator (light theme)

**Admin CMS (`/admin`):**
* Products, Articles, Orders, Brands, Hero Slides, Quote Requests, Settings

Components must stay **consistent with the design system**. FET components use the FET green palette, not Okelcor orange.

---

# Motion & Animation

Animations should be **subtle and smooth**.

**GSAP is the sole animation library** (Framer Motion has been fully removed). Import from `@/lib/gsap` only — never call `gsap.registerPlugin` elsewhere.

Use GSAP for:

* hero transitions and crossfades
* navbar panel open/close (autoAlpha + y)
* section scroll-reveal (`useReveal`, `useStagger`, `useParallax` hooks)
* hover micro-interactions

Use `components/motion/fade-up.tsx` (IntersectionObserver, CSS) for:

* lightweight scroll-reveal on static/server-rendered sections (e.g. FET page cards)

Avoid:

* exaggerated bounce effects
* flashy UI motion
* over-animation

The motion style should feel **premium and restrained**, similar to Tesla’s website.

---

# Responsiveness

The website must work smoothly across:

* mobile
* tablet
* laptop
* large desktop screens

Rules:

* Mobile layout should remain clean and readable
* Avoid overly complex mobile interactions
* Navigation should collapse to a mobile menu
* Carousel sections must remain usable on touch devices

---

# Implementation Behavior

Claude should follow these workflow rules:

* Explain the plan before making major edits
* Work in small safe steps
* Clearly show affected files
* Avoid breaking working sections
* Keep styling consistent with the design system
* Review changes after implementation

---

# Before Editing

Always review the following files before making UI changes:

1. `docs/architecture.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/page-guidelines.md`
4. `docs/session-handoff.md`
5. `docs/visual-references.md`


These documents define the visual direction and project continuity.

---

# Important Reminder

This project is building **Okelco’s tyre supply website**, not a generic template.

Every implementation decision should support:

* a premium corporate feel
* tyre-focused visuals
* clear B2B communication
* professional international brand perception

