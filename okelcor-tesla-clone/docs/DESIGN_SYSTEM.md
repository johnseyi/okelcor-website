# OKELCO DESIGN SYSTEM — TESLA-INSPIRED, TYRE-FOCUSED

Use this as the design foundation for the Okelco website.
The goal is **not** to copy Tesla literally.
The goal is to build a site with:

* Tesla’s **clean scaffold**
* Tesla’s **layout rhythm**
* Tesla’s **spacing discipline**
* Tesla’s **premium motion language**
* Okelco’s **brand color**
* Okelco’s **business content**
* Okelco’s **tyre-focused visual identity**

This is a **light-first corporate product site** for a tyre supplier, not a dark SaaS landing page.

---

## 1. Core Design Direction

### Brand Personality

Okelco should feel:

* premium
* industrial
* modern
* trustworthy
* global
* minimal
* automotive/logistics-oriented

### Reference Behavior

Use Tesla as inspiration for:

* full-width hero sections
* fixed minimal navbar
* horizontally scrollable product cards
* clean rounded panels
* restrained typography
* premium whitespace
* subtle motion
* floating bottom utility bar
* high-end commerce feel

Do **not** use Tesla’s blue accents, exact typography treatment, or car-first visual storytelling.

Okelco must look like:

* a serious **global tyre sourcing company**
* not a car manufacturer
* not a generic startup SaaS
* not a dark neon landing page

---

## 2. Visual Theme

### Design Mode

Use **light-first**, not dark-first.

### Color Tokens

```css
:root {
  --bg-page: #f5f5f5;
  --bg-surface: #efefef;
  --bg-card: #ffffff;
  --bg-navbar: rgba(255,255,255,0.96);

  --text-primary: #171a20;
  --text-secondary: #5c5e62;
  --text-muted: #8c8f94;

  --brand-primary: #f4511e;   /* Okelco orange */
  --brand-primary-hover: #df4618;
  --brand-soft: #fff3ee;

  --border-subtle: rgba(23,26,32,0.06);
  --border-default: rgba(23,26,32,0.10);
  --border-strong: rgba(23,26,32,0.16);

  --shadow-soft: 0 8px 24px rgba(0,0,0,0.06);
  --shadow-medium: 0 16px 40px rgba(0,0,0,0.08);
}
```

### Color Usage Rules

* Use **white / soft grey** for page surfaces
* Use **charcoal / black** for text and icons
* Use **Okelco orange** only for:

  * primary CTA
  * highlights
  * active states
  * key labels
* Never overuse orange as a background for whole sections
* Avoid Tesla blue entirely
* Avoid dark-mode-first UI for the main site

---

## 3. Typography

### Font Style

Use a premium sans serif stack similar to Tesla / Apple:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
             "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

### Font Smoothing

```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### Type Scale

```css
--display-xl: clamp(52px, 8vw, 96px);
--display-lg: clamp(40px, 6vw, 72px);
--display-md: clamp(32px, 5vw, 56px);
--heading-lg: clamp(28px, 4vw, 40px);
--heading-md: clamp(24px, 3vw, 32px);
--title: 21px;
--body-lg: 18px;
--body: 16px;
--body-sm: 14px;
--label: 13px;
```

### Font Weights

* 400: body
* 500: subtitles
* 600: nav links / buttons
* 700: section headings
* 800: hero titles

### Typography Rules

* Hero headings should be bold, clean, and minimal
* Avoid excessive gradient text
* Avoid futuristic SaaS lettering
* Keep section headings sharp and high-contrast
* Use italic serif-style emphasis sparingly only in editorial tyre sections if already part of Okelco tone

---

## 4. Layout System

### Page Width

```css
max-width: 1640px;
margin-inline: auto;
width: min(94%, 1640px);
```

### Section Rhythm

Use Tesla-style rhythm:

* Hero: full width
* Main content sections: inside shell
* Rounded panels: 22px radius
* Large visual cards alternating with clean text blocks
* Very little visual clutter

### Spacing

```css
--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 20px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 40px;
--space-4xl: 48px;
--space-5xl: 56px;
--space-6xl: 72px;
--space-7xl: 96px;
```

### Vertical Section Padding

* standard section: `py-5` to `py-6`
* hero: full viewport feel
* content-heavy sections: tighter vertical rhythm than hero

---

## 5. Navbar System

### Navbar Style

Use Tesla-inspired navbar behavior, but adapted for Okelco:

* fixed at top
* white background
* black text/icons
* subtle bottom border
* minimal nav links
* globe icon opens region/language panel
* mobile uses menu drawer
* active nav item uses:

  * soft grey background
  * orange text

### Navbar Rules

* Logo should be simple and clean
* Until final dark logo is ready, use a temporary black “O” mark with OKELCOR wordmark
* Hover state:

  * background: light grey
  * text/icon: orange
* Keep height around `80px`

---

## 6. Hero System

### Hero Style

Hero must be:

* full width
* minimal overlay
* tyre-focused imagery
* large headline
* short subtitle
* two CTA buttons
* autoplay slider with pause/play
* left/right arrow controls
* pagination dots

### Hero Visual Rules

* Use **tyre-focused images**, not car glamour shots
* Approved image themes:

  * tyre tread close-up
  * stacked tyres
  * truck tyres
  * warehouse tyre storage
  * logistics tyre handling
* Avoid hero slides that feel like a car brand commercial

### Hero Content Structure

```text
Eyebrow (optional)
Main headline
Short subtitle
Primary CTA
Secondary CTA
```

### Hero Buttons

* Primary: orange outline / orange filled on hover
* Secondary: white filled
* Pill shape
* Strong but minimal

---

## 7. Section Patterns

### A. Horizontal Carousel Section

Used for:

* PCR
* TBR
* Used Tyres

Rules:

* horizontal snapping carousel
* first card can be wider
* rounded corners
* big image background
* white text overlay
* orange + white button pair
* arrows on left/right

### B. Promo Strip Section

Used for:

* Why Choose Okelco
* Trusted Supply
* short supporting brand messages

Rules:

* light grey cards
* dark text
* image blocks between cards
* clean CTA

### C. Large Feature Split Section

Used for:

* Trusted Global Brands
* Global logistics
* Used tyres
* TBR feature

Rules:

* 2-column split
* one side visual
* one side text-heavy
* subtle background texture allowed
* buttons aligned vertically if content is long

### D. Trust / Certification Section

Used for:

* REX Certified

Rules:

* centered content
* large whitespace
* clean logo placement
* registration number emphasized
* trust-first, not flashy

---

## 8. Buttons

### Primary

```css
background: var(--brand-primary);
color: white;
border-radius: 999px;
padding: 14px 32px;
font-size: 14px;
font-weight: 600;
```

Hover:

```css
background: var(--brand-primary-hover);
```

### Secondary

```css
background: white;
color: var(--text-primary);
border: 1px solid var(--border-default);
border-radius: 999px;
padding: 14px 32px;
font-size: 14px;
font-weight: 600;
```

### Outline Accent

```css
background: transparent;
color: var(--brand-primary);
border: 2px solid var(--brand-primary);
border-radius: 999px;
padding: 14px 32px;
font-size: 14px;
font-weight: 600;
```

### Interaction Rules

* buttons should never feel bulky
* hover should be subtle
* use scale very lightly or not at all
* prioritize premium restraint over flashy motion

---

## 9. Cards and Surfaces

### Card Style

```css
background: var(--bg-card);
border-radius: 22px;
border: 1px solid var(--border-subtle);
box-shadow: var(--shadow-soft);
```

### Light Promo Panels

```css
background: var(--bg-surface);
border-radius: 22px;
```

### Image Panels

* large
* cinematic crop
* cover background
* subtle scale on hover
* soft overlay only where needed for legibility

---

## 10. Floating Utility Bar

### Behavior

Use Tesla-style floating bar on homepage only.

### Structure

* full-width grey strip
* centered content
* left side = input-style field
* right side = CTA button

### Rules

* slim height
* do not block footer
* sticky above footer zone
* clean border
* subtle shadow

### Content

* Left: “Ask anything” or “Ask about tyre supply”
* Right: “Request a Quote”

---

## 11. Motion System

### Motion Philosophy

Use Tesla-style motion:

* subtle
* smooth
* premium
* restrained

Never use:

* flashy bounce
* exaggerated spring
* neon glow effects
* startup-style overanimation

### Framer Motion Defaults

```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};
```

### Motion Use Cases

* hero text fade
* card reveal
* image scale transitions
* nav dropdown panel
* floating bar entrance
* page hero content reveal

---

## 12. Imagery Rules

### Image Direction

This site is for a **tyre company**, so visuals must focus on:

* tyre tread
* tyre stacks
* tyre warehouse scenes
* truck tyres
* PCR / TBR / used tyres
* logistics tyre handling
* industrial supply chain feel

Avoid overusing:

* glossy car interiors
* sports car glamour
* generic luxury car marketing images

### Visual Tone

* sharp
* realistic
* industrial-premium
* high contrast
* commercial
* practical

---

## 13. Page Blueprint

### Homepage

1. Navbar
2. Hero slider
3. Product/category carousel
4. Promo row
5. Trusted brands feature
6. Logistics feature
7. Used tyres feature
8. TBR feature
9. REX certified
10. Final CTA
11. Floating bar
12. Footer

### Shop

* page hero
* product category cards
* CTA

### News

* page hero
* article grid

### About

* page hero
* mission / approach panels

### Contact

* page hero
* contact info + inquiry form

---

## 14. Component Tone

Everything should feel:

* cleaner than the original Okelco site
* more premium than a standard B2B supplier site
* less futuristic than the uploaded universal design system
* more practical and trustworthy

---

## 15. Things Claude Code must avoid

Do not:

* make the site dark-mode-first
* use SaaS glassmorphism heavily
* use neon gradients
* use Tesla blue accents
* use oversized glowing UI
* use too many card borders
* use car-centric imagery when tyre-centric imagery is available
* write overly startup-like copy

Do:

* keep the page light, airy, and minimal
* use Okelco orange consistently
* preserve Tesla-like structure and spacing
* prioritize typography, imagery, and layout over visual effects
* make every section presentation-ready

---

## 16. Build Instruction for Claude Code

Use this exact instruction:

```text
Build the Okelco website using a Tesla-inspired layout system, but customize it fully for Okelco’s tyre business.

Important:
- Use a light-first design system, not dark-mode-first.
- Use Okelco orange (#f4511e) as the main accent color.
- Keep backgrounds white / soft grey and text black / charcoal.
- Use Tesla’s page rhythm: full-width hero, minimal fixed navbar, rounded content panels, horizontal product carousel, split feature sections, floating bottom utility bar.
- Do not make it look like Tesla’s brand. It should feel like a premium tyre sourcing company.
- Prioritize tyre-focused imagery: tyre tread, stacked tyres, warehouse tyre scenes, truck tyres, logistics tyre visuals.
- Avoid car-heavy imagery unless unavoidable.
- Use clean, premium typography with strong spacing discipline.
- Keep motion subtle and elegant with Framer Motion.
- Use rounded corners around 22px for major content panels.
- Use orange only for primary CTA, highlights, and active states.
- Homepage structure should include: hero, categories carousel, promo strip, brands, logistics, used tyres section, TBR section, REX certified section, CTA, footer, floating utility bar.
- Secondary pages should include: Shop, News, About, Contact.
- The result must feel presentation-ready, premium, minimal, and corporate.
```

