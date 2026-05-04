# Okelcor Website

Corporate website for **Okelcor GmbH** — a global tyre sourcing and supply company headquartered in Munich, Germany. The site presents Okelcor's wholesale tyre catalogue, logistics capabilities, and B2B quote request workflow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |

---

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero slider, categories, brands, logistics, features, CTA |
| `/shop` | Tyre catalogue with filter sidebar and product grid |
| `/shop/[id]` | Product detail page with gallery and accordion specs |
| `/quote` | B2B quote request form with trust panel |
| `/about` | Company overview, services, logistics partners |
| `/contact` | Contact form and company information |
| `/news` | News and industry updates |
| `/auth` | Sign in / sign up (UI only) |
| `/checkout` | Checkout flow using Stripe Checkout redirect |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
okelcor-website/
├── app/                  # Next.js App Router — pages and layouts
├── components/           # Reusable UI components
│   ├── about/
│   ├── cart/
│   ├── checkout/
│   ├── motion/
│   ├── news/
│   ├── quote/
│   └── shop/
├── context/              # React context (cart)
├── docs/                 # Project documentation and design system
├── lib/                  # Shared utilities
└── public/               # Static assets
```

---

## Design System

The UI follows a **Tesla-inspired layout structure** adapted for the tyre industry — light-first, minimal, and premium.

- **Primary color:** Okelco Orange `#f4511e`
- **Background:** `#f5f5f5`
- **Text:** `#171a20`
- **Buttons:** pill-shaped (`border-radius: 999px`)
- **Panels:** `border-radius: 22px`
- **Fonts:** SF Pro / system sans-serif stack

Full design system documentation is in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

---

## Status

The frontend is integrated with the Laravel API. Checkout is Stripe-primary:
`components/checkout/checkout-flow.tsx` posts to `/api/checkout/stripe-session`,
which proxies Laravel `/api/v1/payments/create-session` and redirects to the
returned Stripe Checkout URL. Legacy Adyen/Mollie frontend code is retained but
inactive until Okelcor account/API credentials are approved.

---

## Contact

**Okelcor GmbH**
Landsberger Str. 155, 80687 Munich, Germany
info@okelcor.de | +49 (0) 89 / 545 583 60
