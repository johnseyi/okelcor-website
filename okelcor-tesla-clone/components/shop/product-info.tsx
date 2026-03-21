"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import type { Product } from "./data";
import { useCart } from "@/context/cart-context";

export default function ProductInfo({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCart();

  const handleAddToCart = () => {
    addItem(product, qty);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hi, I would like to request a quote for: ${product.brand} ${product.name} ${product.size} (SKU: ${product.sku}) — Qty: ${qty}`
  )}`;

  return (
    <div className="flex flex-col">
      {/* Brand + badges */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] font-bold uppercase tracking-[0.24em] text-[var(--primary)]">
          {product.brand}
        </p>
        <span className="rounded-full bg-[#efefef] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
          {product.season}
        </span>
        <span className="rounded-full bg-[#efefef] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]">
          {product.type}
        </span>
      </div>

      {/* Name */}
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl">
        {product.name}
      </h1>

      {/* Size + spec */}
      <p className="mt-1.5 text-[1rem] text-[var(--muted)]">
        {product.size} · {product.spec}
      </p>

      {/* SKU */}
      <p className="mt-1 text-[0.82rem] text-[var(--muted)]">
        SKU: <span className="font-medium text-[var(--foreground)]">{product.sku}</span>
      </p>

      {/* Price */}
      <div className="mt-5 border-t border-black/[0.07] pt-5">
        <p className="text-[2rem] font-extrabold tracking-tight text-[var(--foreground)]">
          €{product.price.toFixed(2)}
        </p>
        <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">
          Excluding sales tax · Free shipping
        </p>
      </div>

      {/* Quantity */}
      <div className="mt-5">
        <p className="mb-2 text-[0.88rem] font-semibold text-[var(--foreground)]">
          Quantity
        </p>
        <div className="inline-flex items-center gap-0 overflow-hidden rounded-full border border-black/10 bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center transition hover:bg-black/[0.04]"
            aria-label="Decrease quantity"
          >
            <Minus size={15} strokeWidth={2.2} />
          </button>
          <span className="min-w-[40px] text-center text-[0.95rem] font-semibold text-[var(--foreground)]">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center transition hover:bg-black/[0.04]"
            aria-label="Increase quantity"
          >
            <Plus size={15} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex h-[50px] w-full items-center justify-center gap-2 rounded-full text-[0.95rem] font-semibold text-white transition ${
            added
              ? "bg-green-600 hover:bg-green-700"
              : "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
          }`}
        >
          {added ? (
            <>
              <Check size={18} strokeWidth={2.5} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={18} strokeWidth={2} />
              Add to Cart
            </>
          )}
        </button>

        <div className="flex gap-3">
          <Link
            href="/quote"
            className="flex h-[44px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f5f5f5]"
          >
            Request Quote
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-[44px] flex-1 items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f5f5f5]"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Description */}
      <p className="mt-6 border-t border-black/[0.07] pt-5 text-[0.95rem] leading-7 text-[var(--muted)]">
        {product.description}
      </p>

      {/* Share */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Share
        </span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.href : ""
          )}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.8rem] font-medium text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          Facebook
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.8rem] font-medium text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          WhatsApp
        </a>
        <a
          href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.href : ""
          )}&media=${encodeURIComponent(product.images[0])}&description=${encodeURIComponent(
            `${product.brand} ${product.name} ${product.size}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.8rem] font-medium text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
        >
          Pinterest
        </a>
      </div>
    </div>
  );
}
