# Okelcor Website

Production web platform for **Okelcor GmbH** — a global tyre sourcing and supply company headquartered in Munich, Germany — live at [www.okelcor.com](https://www.okelcor.com).

What started as a corporate site has grown into the company's full front end: a wholesale tyre storefront with Stripe checkout, a customer account area with order tracking and trade documents, and a complete back-office admin application — all in one Next.js App Router codebase, backed by the Okelcor Laravel API.

## Features

### Storefront
- Tyre catalogue (`/shop`) with filter sidebar, product detail pages, product comparison, and site-wide search
- B2B quote request flow with dedicated landing pages (`/quote`, `/tyre-wholesaler`, `/tyre-supply-quotation`)
- Cart and checkout via **Stripe Checkout** redirect (with return/cancel pages); legacy Adyen/Mollie code retained but inactive
- Multi-language UI (language context, translated metadata, locale detection endpoint) and currency-aware pricing
- SEO landing pages per brand (Michelin, Continental, Bridgestone, Pirelli, Goodyear, Dunlop, Falken) and per season/segment (summer, winter, all-season, passenger, light-truck), plus news/articles, about, contact, imprint, privacy, and terms
- GSAP-driven animation system (reveal, parallax, stagger, depth-tilt hooks), cookie consent, and Crisp live chat

### Customer account
- Registration, login, email verification, account activation, and password reset
- Order history and order detail with shipment tracking and **payment milestone** visibility
- Invoice and trade document downloads, plus public document verification and acceptance pages (`/documents/verify`, `/documents/accept`)
- Quote management and online quote/proposal acceptance
- Company profile, VAT details, address book, messages, and notification preferences

### Admin application (`/admin`)
- ~50 back-office sections: orders, quotes, customers, customer approvals, products, brands, promotions, hero slides, media library, articles, partners and partner sales, suppliers, eBay listings and audit, logistics, operations, todos, and staff messaging
- Marketing suite: campaign builder with autosave, campaign scoring, CRM and inbox, marketing contacts
- Finance: invoices, EC invoices, EU declarations, finance snapshot, profitability
- Analytics dashboards (Recharts + Google Analytics Data API + PostHog) and system health
- Rich text editing with TipTap (articles/campaigns)
- Role-based access enforced in Next.js middleware — per-section permissions with per-user overrides, a super-admin role, and 2FA self-management

### Platform
- Next.js route handlers under `app/api/*` proxy the Laravel API (customer, admin, partner, checkout, tracking, VAT, documents, i18n) with rate limiting
- Error monitoring with Sentry (client, server, and edge configs) and product analytics with PostHog

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, Lucide icons |
| Animation | GSAP (@gsap/react) |
| Rich text | TipTap 3 |
| Charts | Recharts |
| Payments | Stripe Checkout (via API proxy); Mollie client retained inactive |
| Observability | Sentry, PostHog, Google Analytics Data API |
| Support | Crisp chat SDK |
| Email | Resend |

## Architecture highlights

- **BFF proxy layer** — the browser never talks to the Laravel API directly; Next.js route handlers (`lib/admin-proxy.ts`, `lib/partner-proxy.ts`, `app/api/*`) forward requests, keeping API credentials server-side and adding rate limiting.
- **Middleware-enforced RBAC** — admin routes are gated in `middleware.ts` against a canonical path→section permission map, with per-user permission overrides falling back to role defaults.
- **Design system as code** — a documented Tesla-inspired visual language (light-first, pill buttons, 22px-radius panels, Okelcor orange `#f4511e`) lives in `docs/DESIGN_SYSTEM.md` and is applied consistently across storefront and admin.
- **SEO-first catalogue** — dedicated statically-routable landing pages per brand and tyre segment with i18n-aware metadata.

## Getting started

Requires Node.js 18+.

```bash
npm install
cp .env.example .env.local   # fill in API URL and service credentials
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Project structure

```
app/                 # App Router pages: storefront, account, admin, api proxies
components/          # UI components (shop, checkout, account, admin, home, …)
context/             # Auth, cart, compare, language, search, site-settings contexts
hooks/               # Animation + admin permission hooks
lib/                 # API clients, proxies, pricing, i18n, VAT, tracking, RBAC
docs/                # Design system, architecture, and feature notes
middleware.ts        # Admin RBAC + auth gating
public/              # Static assets
```

## Contact

**Okelcor GmbH** — Landsberger Str. 155, 80687 Munich, Germany
info@okelcor.de | +49 (0) 89 / 545 583 60

## License

Proprietary — © Okelcor GmbH. All rights reserved.
