"use client";

/**
 * components/shop/stock-badge.tsx
 *
 * Availability + dispatch estimate, shown consistently on the card and the
 * detail page.
 *
 * Deliberately shows a *band*, never the raw count. Backend's own caveat is
 * that `stock` is not decremented on order and the supplier sync is
 * unscheduled — see lib/stock.ts for the reasoning. The dispatch line only
 * appears when the order manager has approved a number.
 */

import { CheckCircle2, AlertTriangle, XCircle, Truck } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { stockBand, dispatchDays, type StockBand } from "@/lib/stock";
import type { Product } from "./data";

const BAND_STYLE: Record<StockBand, { icon: typeof CheckCircle2; className: string }> = {
  in: { icon: CheckCircle2, className: "text-emerald-600" },
  low: { icon: AlertTriangle, className: "text-amber-600" },
  out: { icon: XCircle, className: "text-red-600" },
};

/** Compact single line — product card. */
export function StockLine({ product, className = "" }: { product: Product; className?: string }) {
  const { t } = useLanguage();
  const band = stockBand(product);
  const days = dispatchDays(product);

  if (!band) return null;

  const { icon: Icon, className: tone } = BAND_STYLE[band];
  // Reuse the existing card copy for the positive case rather than duplicating
  // the same string in a second i18n block.
  const label =
    band === "in" ? t.shop.card.inStock : band === "low" ? t.stock.lowStock : t.stock.outOfStock;

  return (
    <div className={className}>
      <p className={`flex items-center gap-1 text-[0.72rem] font-semibold ${tone}`}>
        <Icon size={12} strokeWidth={2.2} aria-hidden="true" />
        {label}
      </p>
      {/* Only when out-of-stock hasn't nulled it server-side */}
      {days != null && band !== "out" && (
        <p className="mt-0.5 flex items-center gap-1 text-[0.7rem] text-ink-faint">
          <Truck size={11} strokeWidth={2} aria-hidden="true" />
          <span className="tabular-nums">
            {t.stock.dispatchPre}
            {days} {t.stock.dispatchUnit}
          </span>
        </p>
      )}
    </div>
  );
}

/** Pill form — product detail page, sits where the old inline badge was. */
export function StockPill({ product, className = "" }: { product: Product; className?: string }) {
  const { t } = useLanguage();
  const band = stockBand(product);
  const days = dispatchDays(product);

  if (!band) return null;

  const { icon: Icon } = BAND_STYLE[band];
  // The detail page already had richer, translated copy for this case
  // ("In Stock — Ready to Order"); keep it.
  const label =
    band === "in" ? t.shop.info.inStock : band === "low" ? t.stock.lowStock : t.stock.outOfStock;

  const pill =
    band === "in"
      ? "bg-emerald-100 text-emerald-700"
      : band === "low"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-600";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[0.78rem] font-bold ${pill}`}
      >
        <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
        {label}
      </span>
      {days != null && band !== "out" && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-card px-3 py-1 text-[0.76rem] font-semibold text-ink-muted">
          <Truck size={13} strokeWidth={2} className="text-brand" aria-hidden="true" />
          <span className="tabular-nums">
            {t.stock.dispatchPre}
            {days} {t.stock.dispatchUnit}
          </span>
        </span>
      )}
    </div>
  );
}
