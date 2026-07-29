/**
 * lib/stock.ts
 *
 * Stock availability banding.
 *
 * The backend now returns a `stock` integer, but flagged an important caveat
 * with it: the number is never decremented when an order is placed, and
 * `products:sync-rapid` is not scheduled. It therefore means "supplier
 * availability as of the last manual import", not "units we hold right now".
 *
 * Their explicit instruction — followed here — is to render it **banded**
 * rather than as a literal count. "24 in stock" would be a precise claim the
 * data cannot support; "Low stock" is a true statement about the same number.
 * If the sync is ever scheduled and stock is decremented on order, printing the
 * count becomes defensible and this module is the single place to change.
 */

export type StockBand = "out" | "low" | "in";

/**
 * Display threshold, not a business rule. Chosen for a wholesale tyre
 * catalogue where single-digit availability is worth flagging to a buyer
 * planning a container load. Adjust freely — nothing else depends on it.
 */
export const LOW_STOCK_THRESHOLD = 10;

type StockSource = {
  in_stock?: boolean | null;
  stock?: number | null;
};

/**
 * Resolve a product's availability band.
 *
 * Returns `null` when availability is genuinely unknown (neither field
 * present), so callers can render nothing rather than guessing "in stock".
 *
 * `in_stock === false` wins over any positive `stock`: the backend treats an
 * explicit flag as an override of the derived one, and a human marking
 * something unavailable is better information than a stale import.
 */
export function stockBand(product: StockSource): StockBand | null {
  if (product.in_stock === false) return "out";

  if (product.stock != null && Number.isFinite(product.stock)) {
    if (product.stock <= 0) return "out";
    return product.stock <= LOW_STOCK_THRESHOLD ? "low" : "in";
  }

  if (product.in_stock === true) return "in";

  return null;
}

/**
 * Dispatch estimate, only when the backend supplies one.
 *
 * This is an order-manager-approved number held in `site_settings`; it ships
 * blank and is nulled for out-of-stock products. Never substitute a default —
 * an invented figure here is an unapproved delivery promise.
 */
export function dispatchDays(product: { estimated_dispatch_days?: number | null }): number | null {
  const d = product.estimated_dispatch_days;
  if (d == null || !Number.isFinite(d) || d <= 0) return null;
  return d;
}
