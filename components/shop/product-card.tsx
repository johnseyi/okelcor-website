"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ChevronDown, ArrowRight, Gauge, Weight } from "lucide-react";
import { productPath, type Product } from "./data";
export type { Product } from "./data";
import { useLanguage } from "@/context/language-context";
import { usePrice } from "@/hooks/use-price";
import { useDepthTilt } from "@/hooks/useDepthTilt";
import { useCompare } from "@/context/compare-context";
import { readEuLabel } from "@/lib/eu-tyre-label";
import { parseServiceDescription } from "@/lib/tyre-specs";
import { EuLabelChips } from "./eu-tyre-label";
import { StockLine } from "./stock-badge";
import { stockBand } from "@/lib/stock";

const PLACEHOLDER = "/images/tyre-placeholder.svg";

type CustomerType = "b2b" | "b2c" | "guest";

// Resolve the best image for a product:
// 1. primary_image (processed full URL)
// 2. brand_image (brand-level fallback, full URL from backend)
// 3. neutral tyre placeholder
function resolveImage(product: import("./data").Product): string {
  if (product.primary_image) return product.image;
  if (product.brand_image) return product.brand_image;
  return PLACEHOLDER;
}

export type ActiveCampaign = {
  brand_name: string;
  discount_pct: number;
};

function resolvePrice(product: Product, customerType: CustomerType) {
  if (customerType === "b2b") {
    const wholesalePrice = product.price_b2b ?? product.price;
    return { displayPrice: wholesalePrice, badge: "wholesale" as const, showGuestNudge: false };
  }
  if (customerType === "b2c") {
    const retailPrice = product.price_b2c ?? product.price;
    return { displayPrice: retailPrice, badge: "retail" as const, showGuestNudge: false };
  }
  // Guest — show retail price, nudge if a wholesale price exists
  const retailPrice = product.price_b2c ?? product.price;
  const nudge = product.price_b2b != null;
  return { displayPrice: retailPrice, badge: null, showGuestNudge: nudge };
}

export default function ProductCard({
  product,
  priority = false,
  customerType = "guest",
  activeCampaign,
}: {
  product: Product;
  priority?: boolean;
  customerType?: CustomerType;
  activeCampaign?: ActiveCampaign | null;
}) {
  const { t } = useLanguage();
  const { price } = usePrice();
  const cardRef = useDepthTilt<HTMLDivElement>({ maxRotate: 4, maxShift: 6, scale: 1.008 });
  const { toggle, isComparing, isFull } = useCompare();
  const [showSpecs, setShowSpecs] = useState(false);

  const imageUrl = resolveImage(product);
  const { displayPrice, badge, showGuestNudge } = resolvePrice(product, customerType);
  const comparing = isComparing(product.id);

  // Both degrade to null when the backend has not supplied the data.
  const euLabel = readEuLabel(product as unknown as Record<string, unknown>);
  const service = parseServiceDescription(product.spec);
  // Band-derived, so a product reporting `stock: 0` is treated as out even if
  // the boolean flag was never set.
  const isOut = stockBand(product) === "out";

  return (
    // `@container` — every size decision below is made against the card's own
    // width, so this component is correct in the 4-up shop grid, the narrower
    // related-products rail and the compare modal without any viewport query.
    <div
      ref={cardRef}
      className="group @container flex flex-col overflow-hidden rounded-xl border border-hairline bg-card shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      {/* Image area — full tyre visible, no cropping */}
      <div className="relative flex h-40 items-center justify-center bg-card p-4 @card-md:h-52">
        <img
          src={imageUrl}
          alt={`${product.brand} ${product.name}`}
          loading={priority ? "eager" : "lazy"}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
          className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] ${isOut ? "opacity-50" : ""}`}
        />
        {isOut && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
            {t.stock.outOfStock}
          </span>
        )}
        {activeCampaign && product.brand.trim().toLowerCase() === activeCampaign.brand_name.trim().toLowerCase() && (
          <span className="absolute right-2 top-2 rounded-full bg-brand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
            {activeCampaign.discount_pct}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col border-t border-hairline p-4 pt-7">
        {/* Floating primary CTA — straddles the image/content boundary */}
        <Link
          href={productPath(product)}
          className="relative z-10 -mt-11 mb-3 flex h-[42px] w-full items-center justify-center gap-1.5 rounded-full bg-brand text-[0.83rem] font-bold text-white shadow-[0_10px_24px_rgba(244,81,30,0.32)] transition hover:bg-brand-hover hover:shadow-[0_12px_28px_rgba(244,81,30,0.4)]"
        >
          {t.shop.card.viewDetails}
          <ArrowRight size={14} strokeWidth={2.4} />
        </Link>

        {/* Brand + type badge */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">
            {product.brand}
          </p>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-semibold text-ink-muted">
            {product.type}
          </span>
        </div>

        {/* Product name — max 2 lines */}
        <h3 className="mt-1.5 line-clamp-2 text-[0.95rem] font-bold leading-snug text-ink">
          {product.name}
        </h3>

        {/* Size & spec */}
        <p className="mt-1 font-mono text-[0.78rem] text-ink-faint">
          {product.size}{product.spec ? ` · ${product.spec}` : ""}
        </p>

        {/* EU tyre label grades — the trust artifact buyers actually look for.
            Renders only when the product carries label data. */}
        <EuLabelChips label={euLabel} className="mt-2" />

        {/* Show specs disclosure + compare toggle */}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowSpecs((v) => !v)}
            aria-expanded={showSpecs}
            className="flex items-center gap-1 text-[0.72rem] font-semibold text-ink-muted transition hover:text-ink"
          >
            {t.shop.card.showSpecs}
            <ChevronDown size={12} strokeWidth={2.4} className={`transition-transform ${showSpecs ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => toggle(product)}
            disabled={!comparing && isFull}
            title={isFull && !comparing ? "Compare list full (max 4)" : undefined}
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.72rem] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              comparing
                ? "border-brand bg-brand text-white"
                : "border-hairline-strong bg-card text-ink-muted hover:border-brand/40 hover:text-brand"
            }`}
          >
            <ArrowLeftRight size={11} strokeWidth={2.4} />
            {comparing ? t.shop.card.comparing : t.shop.card.compare}
          </button>
        </div>
        {showSpecs && (
          <div className="mt-2 divide-y divide-hairline rounded-lg border border-hairline bg-page/60 px-3 text-[0.76rem]">
            {([
              // [label, value, isData] — `isData` picks the mono face. Season
              // and tyre type are words, not measurements, so they stay sans.
              [t.shop.accordion.season, product.season, false],
              [t.shop.accordion.tyreType, product.type, false],
              // Decoded from the existing `spec` string — no backend change.
              service?.loadKg
                ? [t.tyreSpecs.maxLoad, `${service.loadKg} kg (${service.loadIndex})`, true]
                : null,
              service?.speedKmh
                ? [t.tyreSpecs.maxSpeed, `${service.speedKmh} km/h (${service.speedSymbol})`, true]
                : null,
              ["SKU", product.sku, true],
            ] as ([string, string, boolean] | null)[])
              .filter((row): row is [string, string, boolean] => !!row && !!row[1])
              .map(([label, value, isData]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-ink-muted">{label}</span>
                  <span className={`text-right font-semibold text-ink ${isData ? "font-mono text-[0.73rem]" : ""}`}>{value}</span>
                </div>
              ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-3">
          {badge === "wholesale" && (
            <span className="mb-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[0.63rem] font-bold uppercase tracking-wide text-green-700">
              B2B Wholesale Price
            </span>
          )}
          {badge === "retail" && (
            <span className="mb-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[0.63rem] font-bold uppercase tracking-wide text-blue-700">
              Retail Price
            </span>
          )}
          <p className="text-[1.25rem] font-extrabold tabular-nums tracking-tight text-ink">
            {price(displayPrice, { currency: product.currency })}
          </p>

          {/* Load / speed at a glance — only when the spec decoded cleanly */}
          {(service?.loadKg || service?.speedKmh) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.7rem] font-medium text-ink-muted">
              {service.loadKg && (
                <span className="inline-flex items-center gap-1">
                  <Weight size={11} strokeWidth={2.2} aria-hidden="true" />
                  <span className="font-mono">{service.loadKg} kg</span>
                </span>
              )}
              {service.speedKmh && (
                <span className="inline-flex items-center gap-1">
                  <Gauge size={11} strokeWidth={2.2} aria-hidden="true" />
                  <span className="font-mono">{service.speedKmh} km/h</span>
                </span>
              )}
            </div>
          )}

          {/* Banded availability + order-manager-approved dispatch estimate.
              Never a literal count — see lib/stock.ts. */}
          <StockLine product={product} className="mt-0.5" />

          <p className="text-[0.72rem] text-ink-faint">{t.shop.card.shipping}</p>
          {showGuestNudge && (
            <Link
              href="/account/login"
              className="mt-0.5 block text-[0.7rem] font-medium text-brand hover:underline"
            >
              Sign in for wholesale pricing →
            </Link>
          )}
        </div>

        {/* Secondary action — primary CTA already floats above */}
        <Link
          href="/tyre-supply-quotation"
          className="mt-4 flex h-[38px] items-center justify-center rounded-full border border-hairline-strong bg-card text-[0.8rem] font-semibold text-ink transition hover:border-ink/20 hover:bg-page"
        >
          {t.shop.card.quote}
        </Link>
      </div>
    </div>
  );
}
