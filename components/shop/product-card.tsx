"use client";

import Link from "next/link";
import type { Product } from "./data";
export type { Product } from "./data";
import { useLanguage } from "@/context/language-context";
import { useDepthTilt } from "@/hooks/useDepthTilt";
import { getProductImageUrl } from "@/lib/utils";

const PLACEHOLDER = "/images/tyre-placeholder.png";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t } = useLanguage();
  const cardRef = useDepthTilt<HTMLDivElement>({ maxRotate: 6, maxShift: 9, scale: 1.012 });

  const imageUrl = getProductImageUrl(product.image);

  // DEBUG — remove after confirming images load correctly
  if (typeof window !== "undefined") {
    console.log("[ProductCard] product.id:", product.id, "| raw image field:", product.image, "| constructed URL:", imageUrl);
  }

  return (
    <div
      ref={cardRef}
      className="group relative flex min-h-[360px] flex-col overflow-hidden rounded-[22px] border border-black/[0.05] bg-[#e8e8e8] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
    >
      {/* Full-card background image */}
      <img
        src={imageUrl}
        alt={`${product.brand} ${product.name}`}
        loading={priority ? "eager" : "lazy"}
        onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-in-out group-hover:scale-[1.05]"
      />

      {/* Glare overlay */}
      <div
        data-depth-glare
        className="pointer-events-none absolute inset-[-18%] z-[1] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_56%)]"
        aria-hidden="true"
      />

      {/* Top shimmer line */}
      <div className="pointer-events-none absolute inset-x-[14%] top-0 z-[2] h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />

      {/* Type badge */}
      <span className="absolute right-3 top-3 z-[3] rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground)] shadow-sm backdrop-blur-sm">
        {product.type}
      </span>

      {/* Info panel pinned to bottom with frosted background */}
      <div className="relative z-[3] mt-auto border-t border-white/20 bg-white/88 p-5 backdrop-blur-md">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
          {product.brand}
        </p>
        <h3 className="mt-1 text-[0.97rem] font-semibold leading-snug text-[var(--foreground)]">
          {product.name}
        </h3>
        <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">
          {product.size} · {product.spec}
        </p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[1.3rem] font-extrabold tracking-tight text-[var(--foreground)]">
              €{product.price.toFixed(2)}
            </p>
            <p className="text-[0.75rem] text-[var(--muted)]">{t.shop.card.shipping}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/shop/${product.id}`}
              className="flex h-[42px] items-center justify-center rounded-full bg-[var(--primary)] px-5 text-[0.85rem] font-semibold text-white shadow-[0_10px_24px_rgba(244,81,30,0.22)] transition hover:bg-[var(--primary-hover)]"
            >
              {t.shop.card.viewDetails}
            </Link>
            <Link
              href="/quote"
              className="flex h-[42px] items-center justify-center rounded-full border border-black/10 bg-white/80 px-4 text-[0.85rem] font-semibold text-[var(--foreground)] shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition hover:bg-white"
            >
              {t.shop.card.quote}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
