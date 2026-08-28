# Frontend Note — Carrier Shipment Tracking

Backend-owned contract note for `CustomerTracking` (`lib/tracking.ts`) and the
admin "Track Shipment" control (`components/admin/tracking/track-shipment-control.tsx`).
All browser calls go through the Next.js proxy with the bearer token — the
frontend never calls the Laravel API directly.

## Recognized carriers (`tracking_url`)

The frontend renders a **"Track on {carrier}'s site ↗"** button whenever
`tracking_url` is present on the tracking payload — no carrier-name allowlist
exists client-side. `tracking_url` is `null` for any carrier the backend
doesn't recognize.

As of this note, the backend resolves `tracking_url` for:

- **GLS**
- **DHL**
- **Maersk** (ocean freight)

## `CustomerTracking` shape (customer-facing)

```ts
{ available: false; reason?: TrackingUnavailableReason }
| {
    available: true;
    mode: "carrier";
    order_ref: string;
    order_status?: string | null;
    delivered?: boolean;
    carrier: string;
    tracking_number: string;
    stage: CarrierShipmentStage;   // "preparing" | "in_transit" | "delivered" | string
    tracking_url?: string | null;  // deep link to carrier's own tracking page; null if unrecognized
    events: CarrierShipmentEvent[];
  }
```

`events` populates from the backend's live carrier-API sync (or manually via
the admin Logistics tab's shipment-event log). An empty `events` array with a
non-null `tracking_url` is a valid, expected state — the link still works even
with zero synced events.

---

## Addendum — 2026-07-06: DPD added

**DPD** is now a recognized carrier for `tracking_url` resolution.

- **No frontend code change is required.** The existing "render `tracking_url`
  if present" logic (`components/account/order-tracking.tsx`,
  `components/admin/tracking/track-shipment-control.tsx`) already handles any
  carrier the backend resolves a link for — DPD orders will start showing the
  "Track on DPD's site ↗" button automatically once this deploys.
- **DPD does not yet have live event auto-sync** — no API credentials are
  configured for DPD yet, so `events` will stay empty (`[]`) for DPD orders.
  Only the tracking link works for now; the timeline will populate once
  credentials are in place (or via manual entries through the admin
  Logistics tab's shipment-event log in the meantime).
