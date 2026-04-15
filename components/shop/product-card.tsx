"use client";

import Link from "next/link";
import type { Product } from "./data";
export type { Product } from "./data";
import { useLanguage } from "@/context/language-context";
import { useDepthTilt } from "@/hooks/useDepthTilt";

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useLanguage();
  const cardRef = useDepthTilt<HTMLDivElement>({ maxRotate: 6, maxShift: 9, scale: 1.012 });

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-black/[0.05] bg-[#efefef] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
    >
      <div
        data-depth-glare
        className="pointer-events-none absolute inset-[-18%] z-[1] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.20),transparent_56%)]"
        aria-hidden="true"
      />

      <div className="relative aspect-[4/3] overflow-hidden bg-[#e0e0e0]">
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition-transform duration-700 ease-in-out group-hover:scale-[1.08] lg:group-hover:scale-[1.1]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#d8d8d8] text-[0.65rem] font-bold uppercase tracking-widest text-[#aaa]">
            No image
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-[14%] top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground)] shadow-sm backdrop-blur-sm">
          {product.type}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
          {product.brand}
        </p>
        <h3 className="mt-1.5 text-[0.97rem] font-semibold leading-snug text-[var(--foreground)]">
          {product.name}
        </h3>
        <p className="mt-1 text-[0.85rem] text-[var(--muted)]">
          {product.size} · {product.spec}
        </p>
        <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">{product.season}</p>

        <div className="mt-auto pt-4">
          <p className="text-[1.4rem] font-extrabold tracking-tight text-[var(--foreground)]">
            €{product.price.toFixed(2)}
          </p>
          <p className="mt-0.5 text-[0.78rem] text-[var(--muted)]">
            {t.shop.card.shipping}
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/shop/${product.id}`}
              className="flex h-[48px] flex-1 items-center justify-center rounded-full bg-[var(--primary)] text-[0.88rem] font-semibold text-white shadow-[0_16px_32px_rgba(244,81,30,0.22)] transition hover:bg-[var(--primary-hover)]"
            >
              {t.shop.card.viewDetails}
            </Link>
            <Link
              href="/quote"
              className="flex h-[48px] min-w-[80px] items-center justify-center rounded-full border border-black/10 bg-white px-4 text-[0.88rem] font-semibold text-[var(--foreground)] shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition hover:bg-[#f0f0f0]"
            >
              {t.shop.card.quote}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
