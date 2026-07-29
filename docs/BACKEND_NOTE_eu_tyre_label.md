# Backend Note — EU Tyre Label (Regulation (EU) 2020/740)

**Status:** Frontend complete and shipped. Backend fields pending.
**Degrades to:** exactly today's rendering. Nothing appears until fields arrive.
**Date raised:** 2026-07-29

---

## Why this matters

Every tyre placed on the EU market must be accompanied by an EU tyre label. It
is the most recognised trust artifact in the tyre trade — buyers scan for the
fuel/wet-grip letters before they read anything else — and Okelcor, an
EU-established REX-registered distributor (DEREX76000242), currently displays
none of it anywhere on the catalogue.

Beyond compliance signalling, it is the single clearest way the storefront can
look like a real distributor rather than a product grid.

---

## Fields required

Add to the product payload returned by:

- `GET /api/v1/products`
- `GET /api/v1/products/{id}`

**Nested under `eu_label`, please** — matching the `tyre_batch` shape you chose
for the premium-UX §2 work, so the two read consistently. The frontend also
tolerates flat top-level columns (`readEuLabel()` in `lib/eu-tyre-label.ts`
reads both), but nested is the preferred shape.

Same null convention as `tyre_batch`: return `null` for the whole object until
something is populated, rather than an object of nulls. The label component
already skips rendering entirely on null.

```jsonc
{
  "eu_label": {
    "fuel_efficiency":     "B",     // enum A|B|C|D|E     — rolling resistance
    "wet_grip":            "A",     // enum A|B|C|D|E     — wet braking
    "rolling_noise_db":    70,      // integer, dB(A)
    "rolling_noise_class": "B",     // enum A|B|C
    "snow_grip":           true,    // bool — 3PMSF pictogram
    "ice_grip":            false,   // bool — C1 (passenger) tyres only
    "eprel_id":            "123456" // string — EPREL registration, drives the QR/link
  }
}
```

**All fields are individually optional.** The label renders whatever subset is
present; if all are null the component returns `null` and the product page is
byte-identical to today.

### Validation notes

- The frontend narrows every enum defensively (`toGrade`, `toNoiseClass`). A
  stray `"a"` is uppercased and accepted; an out-of-range `"F"` degrades to "no
  data" rather than rendering an invalid class. **No need to be strict
  server-side** — plain `string` columns are fine.
- On the ENUM question: you flagged that this codebase already has an ENUM that
  can't hold the values its own code uses, which is why `condition_grade` shipped
  as a plain string. Agreed, and the same default applies here. The one
  difference worth noting — and it is your call, not a request — is that
  `fuel_efficiency`/`wet_grip` (A–E) and `rolling_noise_class` (A–C) are fixed by
  regulation rather than by an internal scale, so they cannot drift the way a
  grading scale can. If you'd still rather use strings for consistency, the
  frontend does not care.
- `rolling_noise_db` must be a positive number. `0` / negative is treated as absent.
- `eprel_id` is used to build `https://eprel.ec.europa.eu/screen/product/tyres/{id}`.
  If EPREL ids are not held, omit the field — the "View EPREL registration" link
  simply does not render.
- Additive/guarded migration, same as #24–25.

### On "inert until the business acts"

You flagged that `estimated_dispatch_days` and `tyre_batch` will do nothing
visible on deploy day because both need ops to start entering data. Fair, and
the same caveat applies here — **but with one meaningful difference worth
weighing before scheduling this.**

Tyre-passport data can only come from a human inspecting a tyre. EU label data
cannot be invented, but it does not need inspection either: it is a published
property of the tyre model, held in the EU's own EPREL database and generally
supplied by manufacturers/suppliers in product feeds. So it is plausibly
**bulk-populatable per model** — via a supplier feed, or by matching brand +
size + pattern against EPREL — rather than needing per-unit data entry.

That is a genuine open question, not an assertion: whether the Rapid feed or
any current supplier feed carries these fields is something only you can check.
If it does, this feature is live on day one for a large slice of the catalogue,
which would make it a very different proposition from the other two. If it
doesn't, it is manual entry per product model and should be prioritised
accordingly.

### Admin side

The admin product form (`components/admin/product-form.tsx`) does **not** yet
have inputs for these. Once the columns exist, seven fields need adding there —
small, mechanical, not started (deliberately out of scope for this pass, which
was public-storefront only).

---

## Already shipped without backend work

Two related improvements needed no new fields and are **live now**, derived from
the existing `spec` string:

| Improvement | Derived from | Where |
|---|---|---|
| Load index → kg (incl. dual fitment `154/150`) | `product.spec` | product card, detail page, compare table |
| Speed symbol → km/h | `product.spec` | product card, detail page, compare table |

Implemented in `lib/tyre-specs.ts` using the ISO/ETRTO tables, which are fixed
by standard — no backend involvement is possible or needed.

---

## Related, still open

### `currency` on product payloads

`lib/price.ts` now formats prices in the visitor's locale (`1.234,56 €` in DE,
`€1,234.56` in EN) and honours a per-product `currency` field where present:

```jsonc
{ "currency": "EUR" }   // ISO 4217; defaults to EUR when absent
```

This is **formatting only — there is no FX conversion**, deliberately. Quoting a
converted number without a rate source and a rate timestamp would be misleading
on a B2B quote. If multi-currency selling is wanted, the backend needs to supply
either per-currency prices or dated FX rates; conversion then belongs in
`lib/price.ts` and nowhere else.

Admin orders already carry EUR/USD (see `docs/BACKEND_NOTE_order_currency.md`) —
this is the catalogue-side equivalent.

### Used-tyre traceability — resolved, thank you

Superseded by your premium-UX §2 work. `Product` now types `tyre_batch` in the
shape you shipped (`condition_grade`, `tread_depth_mm`, `dot_code`,
`inspection_date`, `inspection_photos`), replacing two flat fields that had been
speculatively typed frontend-side. Nothing renders it yet — the Tyre Passport
card is the next piece of frontend work, and returning `null` until populated is
exactly the right call for it.

### Also picked up from your §1 response

- `stock` is now typed on `Product`. Per your instruction it will be rendered
  **banded** (In stock / Low stock), not as a literal count — noted that it is
  never decremented on order and `products:sync-rapid` is unscheduled, so a
  printed number would be a claim we can't support.
- `estimated_dispatch_days` is typed and will be rendered **verbatim** when
  present, with no frontend default. Blank means nothing displays.
- `stock_locations[]` — agreed, dropped. One hardcoded entry pretending to be a
  multi-warehouse split would have been worse than the flat badge we have.
- §3 (saved fitments / one-click reorder) wasn't covered in your reply. Not
  chasing it — lowest priority of the three — just confirming it's parked rather
  than lost.
