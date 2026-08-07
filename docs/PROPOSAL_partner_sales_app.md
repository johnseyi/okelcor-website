# Proposal — Okelcor Partner Sales Log

**Working name:** Okelcor Partner (from the brief: "Okelcor Partner Sales Update")
**Status:** Proposal for review — nothing built
**Date:** 2026-08-07 · rev 2

> **Rev 2 changes:** use is mandated (partners in Ghana already submit paper
> reports), so the adoption argument in rev 1 is withdrawn — see §2. WhatsApp is
> dropped from v1 as an intake channel, with reasoning in §3. Confirmed as a **web
> application**, not a native app. No copy of the existing paper form was available,
> so the field list in §5 is derived from the brief itself and is expected to be
> adjusted once a real report is seen.

---

## 1. What was asked for

A tool for the people selling Okelcor products in other markets to report what they
sold — product, quantity, amount — so head office has sales data instead of chasing it.

Two lines from the brief shape everything:

- **"It's always hard for me to get data on book-related stuff."** Read as
  *bookkeeping*. The pain is not that partners lack a tool — it is that head office
  has no reliable numbers for the books. The real deliverable is **trustworthy,
  exportable data at the Okelcor end**; the partner screen is just the intake.
- **"We sold tyre 315-70 rim 22.5, X pieces, at this amount."** That single sentence
  is the entire data model, and §5 takes it literally.

**Context that arrived after rev 1:** partners in Ghana already submit reports on
paper, and reviewing them takes significant time. So the tool replaces an existing
mandatory process — it is not asking people to adopt a new habit.

---

## 2. Where the risk actually sits

Rev 1 argued adoption was the main risk. **That is withdrawn.** Reporting is already
required and already happens; this changes the medium, not the obligation.

The risk relocates rather than disappearing. With a mandate, the failure mode is not
"nobody logs in" — it is:

- **Entry is slower than the paper form**, so partners resent it and fill it carelessly
- **It fails on bad signal**, so they fall back to paper — and now there is neither a
  clean digital record nor a complete paper one
- **Data is entered badly**, and unstructured or wrong numbers reach the books

So the design priorities are, in order: **speed of entry**, **reliability offline**,
**structure that prevents garbage**. Not incentives, not gamification.

---

## 3. Shape of the solution

A **mobile-first web application** at `partners.okelcor.com`. Partners open a URL and
log in — no App Store, no Play Store, no native build, no install required.

It also ships a **manifest and a service worker** (two files). These add two things and
nothing else: partners *can* add it to their home screen so it opens full-screen, and
**it keeps working when the connection drops**, queueing entries until signal returns.
That is the only reason they are included — connectivity in these markets is not
reliable, and a mandated tool that fails offline pushes people straight back to paper.

**WhatsApp is not an intake channel in v1.** Rev 1 proposed it as an adoption lever;
that rationale is gone. There is also a reason against it that deserved more weight:
the boss's stated pain is that **reviewing free-form paper reports takes too long**.
Free-text WhatsApp replies would recreate exactly that problem — unstructured input a
human has to read and interpret. Structured entry is the point.

WhatsApp remains useful as a **nudge** — "submit today's sales: [link]" — using the
CRM-6C integration already live. That is cheap and can come any time.

---

## 4. Repo and directory structure

**A separate repository and separate Vercel project**, on its own subdomain
`partners.okelcor.com`.

Reasons, strongest first:

1. **Blast radius.** okelcor.com is the commercial storefront with live SEO. A bad
   deploy on a partner tool must not be able to touch it.
2. **Conflicting caching strategy.** The partner app wants an aggressive offline
   service worker; the public site wants SEO-friendly server rendering and fresh
   content. Those philosophies fight inside one app.
3. **Different users and threat model.** External partners, shared devices, weak
   credentials — a separate auth surface from both customer and admin auth.
4. **Different release cadence.** This will iterate weekly at first; the marketing
   site should not be redeployed for that.
5. **The main repo is already large** — 103 routes plus the full admin panel.

```
okelcor-partner/                     ← new repo
├── app/
│   ├── (auth)/login/                # phone + PIN
│   ├── (app)/
│   │   ├── page.tsx                 # today: quick-add + today's entries
│   │   ├── log/                     # the entry flow
│   │   ├── history/                 # my sales, filterable, backdated entry
│   │   ├── summary/                 # my week / month totals
│   │   └── profile/
│   ├── api/                         # proxy routes → Laravel (same pattern as main site)
│   └── manifest.ts
├── components/
│   ├── sale-entry/                  # size picker, qty stepper, money input
│   └── ui/
├── lib/
│   ├── api.ts
│   ├── outbox.ts                    # IndexedDB queue + sync
│   ├── tyre-specs.ts                # copied from main repo
│   └── money.ts                     # copied from main repo (lib/price.ts)
├── public/sw.js
└── ...
```

**Shared code:** copy `tyre-specs` and the price formatting rather than building a
monorepo. A few hundred lines that change rarely; a monorepo is a real tax in tooling,
versioning and CI, and should only be paid once duplication actually hurts.

**Design system:** the Tailwind v4 `@theme` token layer from okelcor.com
(`--color-brand`, `--font-sans`/`--font-mono`, the `panel` utility) lifts across
almost verbatim, so it looks like Okelcor on day one. The mono face is well suited to
sizes and quantities.

---

## 5. The entry form

No copy of the Ghana paper report was available, so this is derived directly from the
brief's own example — *"we sold tyre 315-70 rim 22.5, X pieces, at this amount"* —
plus the minimum needed for the books. **Expected to be adjusted** once a real report
is seen; the schema is designed so adding fields later is additive.

| Field | Behaviour |
|---|---|
| **Date sold** | Defaults to today. Backdating allowed — there will be a paper backlog |
| **Size** | The primary field, e.g. `315/70 R22.5`. Picker over Okelcor's real catalogue sizes, free-text fallback for anything unlisted |
| **Brand** | Dropdown from the catalogue, free-text fallback |
| **Type** | PCR / TBR / OTR / Used |
| **Quantity** | Pieces. Stepper plus keypad |
| **Unit price** | Amount per tyre; total computed live as `qty × unit price` and shown large, so the partner confirms a number they recognise |
| **Currency** | Per entry. Defaults to the partner's home currency |
| **Customer** | Optional |
| **Notes** | Optional |

Everything below Quantity should fit on one screen without scrolling on a mid-range
Android phone. Target: **under 30 seconds per line**, faster than writing it on paper.

---

## 6. Scope

### v1

| Area | What |
|---|---|
| Auth | Phone + 4–6 digit PIN. Partners pre-created by Okelcor admin; no self-signup |
| Log a sale | The §5 form |
| Backdated / bulk entry | For the existing paper backlog |
| Edit window | Own entries editable ~24h, then locked. Every change written to an audit trail |
| Today / history | What I logged, running totals, filter by month |
| My summary | Week and month totals — cheap, and makes the mandate less resented |
| Offline | Full offline entry, queued in IndexedDB, auto-sync on reconnect |
| Admin (existing panel) | Partner list, submissions feed, verify/dispute, per-market and per-partner totals, **CSV/Excel export for the books** |

The export is the feature the brief is actually about. It should be built early, not last.

### Explicitly not v1

Inventory management · invoicing · commission calculation · payments and settlement ·
POS · customer receipts · targets and leaderboards.

---

## 7. Two engineering decisions that matter

**Offline idempotency.** Every entry gets a `client_generated_id` (UUID minted on the
device) before it is ever sent; the server uses it as the dedupe key. Without this, a
flaky connection produces duplicate sales — worse than missing data, because it
silently corrupts the books. This is the most important detail in the build.

**Currency recorded, never converted in the app.** Partners sell in NGN, GHS, KES,
AED, EUR, USD. Store the amount and currency **as entered**, with the date. Conversion
is a finance decision at the Okelcor end against a dated rate. The app must not invent
an FX rate — the same discipline already applied on the storefront (`lib/price.ts`).

```
partner_sale
  id, partner_id, client_generated_id (unique)
  sold_at (date)
  brand, size, tyre_type, product_id (nullable — linked when matched to catalogue)
  quantity, unit_price, currency
  customer_name?, notes?
  source: app | admin
  status: submitted | verified | disputed
  verified_by, verified_at
  created_at, updated_at
```

---

## 8. Backend

New endpoints on the existing Laravel API under `/partner/*`, with a new auth guard
separate from customer and admin:

```
POST   /partner/auth/login              phone + PIN
GET    /partner/me
POST   /partner/sales                   idempotent on client_generated_id
GET    /partner/sales?from=&to=
PATCH  /partner/sales/{id}              within the edit window
DELETE /partner/sales/{id}
GET    /partner/summary?period=week|month

# Admin side (existing panel)
GET  /admin/partners
POST /admin/partners
GET  /admin/partner-sales?partner=&market=&from=&to=&status=
POST /admin/partner-sales/{id}/verify
GET  /admin/partner-sales/export
```

The frontend is buildable against a mocked layer before any of this exists, following
the graceful-degradation convention used across this project.

---

## 9. Open questions

**Gating — answer before the schema is fixed:**

1. **Consignment or outright purchase?** Do partners hold Okelcor stock and remit, or
   buy and resell as their own? Under consignment we should also capture opening
   stock, which yields stock-on-hand per market for free and makes the tool
   considerably more valuable than what was asked for.

**Non-gating — can be settled during the build:**

2. **Cadence — daily or weekly?** The brief says daily; paper reporting is usually
   weekly or monthly. Worth confirming what is actually expected.
3. How many partners, in which markets?
4. Should partners' prices be private from each other? (Assumed yes.)
5. Who verifies at Okelcor, and do unverified sales count toward the books or sit
   pending?
6. How far back does the paper backlog go?

---

## 10. Suggested sequence

1. **Confirm consignment vs. resale** (§9.1) — the one answer that changes the schema.
2. **Build the entry flow first**, against mocked data, and put it in front of one
   partner. Not for adoption — to confirm it is genuinely faster than their paper form.
3. **v1 build** — entry, offline, admin review, export.
4. **Pilot in Ghana**, since the paper process there is the one being replaced.
5. Roll out to remaining markets; add the WhatsApp nudge if useful.

---

## 11. Assessment

The engineering is not difficult: a form, an offline queue, an admin table, an export.
The value is concentrated in three details — **entry faster than paper**, **reliable
offline**, and **a clean export**. Everything else is secondary.

Because no paper form was available, §5's field list is an informed reading of the
brief rather than a match to what partners fill today. It is deliberately minimal and
additive, so adjusting it later is cheap. Getting sight of one real report at any
point before launch remains the single cheapest way to de-risk the design.
