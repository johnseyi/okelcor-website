"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "./data";
export type { Product } from "./data";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-[22px] bg-[#efefef]"
      whileHover={{ scale: 1.016, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e0e0e0]">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--foreground)] shadow-sm backdrop-blur-sm">
          {product.type}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
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
            Excl. tax · Free shipping
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/shop/${product.id}`}
              className="flex h-[44px] flex-1 items-center justify-center rounded-full bg-[var(--primary)] text-[0.88rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              View Details
            </Link>
            <Link
              href="/quote"
              className="flex h-[44px] min-w-[80px] items-center justify-center rounded-full border border-black/10 bg-white px-4 text-[0.88rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
            >
              Quote
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
