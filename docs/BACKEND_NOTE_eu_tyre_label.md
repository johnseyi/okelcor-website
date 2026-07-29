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

Either **nested** under `eu_label`, or as **flat top-level columns** — the
frontend reads both shapes (`readEuLabel()` in `lib/eu-tyre-label.ts`), so
whichever is cheaper server-side is fine.

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
  data" rather than rendering an invalid class. No need to be strict server-side,
  but a DB-level enum is preferable.
- `rolling_noise_db` must be a positive number. `0` / negative is treated as absent.
- `eprel_id` is used to build `https://eprel.ec.europa.eu/screen/product/tyres/{id}`.
  If EPREL ids are not held, omit the field — the "View EPREL registration" link
  simply does not render.

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

### Used-tyre traceability

`Product` now accepts `dot_code` (DOT week/year stamp) and `tread_depth_mm`.
Nothing renders them yet — they are typed and ready, and remain the gap flagged
in `docs/BACKEND_NOTE_premium_ux.md`.
