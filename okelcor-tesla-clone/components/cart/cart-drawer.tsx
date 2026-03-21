"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/context/cart-context";

function CartItemRow({ item }: { item: CartItem }) {
  const { removeItem, updateQuantity } = useCart();
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  return (
    <div className="flex gap-4 py-4">
      {/* Thumbnail */}
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] bg-[#f0f0f0]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              {product.brand}
            </p>
            <p className="mt-0.5 truncate text-[0.9rem] font-semibold text-[var(--foreground)]">
              {product.name}
            </p>
            <p className="text-[0.8rem] text-[var(--muted)]">
              {product.size} · {product.spec}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="shrink-0 rounded-full p-1 text-[var(--muted)] transition hover:bg-black/[0.06] hover:text-[var(--foreground)]"
            aria-label="Remove item"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Qty + price row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center overflow-hidden rounded-full border border-black/10 bg-white">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex h-7 w-7 items-center justify-center transition hover:bg-black/[0.05]"
              aria-label="Decrease"
            >
              <Minus size={12} strokeWidth={2.5} />
            </button>
            <span className="min-w-[28px] text-center text-[0.82rem] font-semibold text-[var(--foreground)]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex h-7 w-7 items-center justify-center transition hover:bg-black/[0.05]"
              aria-label="Increase"
            >
              <Plus size={12} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-[0.95rem] font-extrabold text-[var(--foreground)]">
            €{lineTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, totalItems, subtotal, isOpen, closeCart, clearCart } =
    useCart();

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-screen w-full max-w-[420px] flex-col bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.12)]"
          >
            {/* Header */}
            <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-black/[0.07] px-5">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={20} strokeWidth={1.9} />
                <span className="text-[1rem] font-extrabold text-[var(--foreground)]">
                  Cart
                </span>
                {totalItems > 0 && (
                  <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[11px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-full px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--muted)] transition hover:bg-black/[0.05] hover:text-[var(--foreground)]"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeCart}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/[0.06]"
                  aria-label="Close cart"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Item list */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingCart
                  size={44}
                  strokeWidth={1.3}
                  className="text-black/20"
                />
                <p className="text-[1rem] font-semibold text-[var(--foreground)]">
                  Your cart is empty
                </p>
                <p className="text-[0.88rem] text-[var(--muted)]">
                  Browse the catalogue and add tyres to get started.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-2 rounded-full bg-[var(--primary)] px-6 py-2.5 text-[0.88rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <div className="hide-scrollbar flex-1 overflow-y-auto px-5">
                <div className="divide-y divide-black/[0.06]">
                  {items.map((item) => (
                    <CartItemRow key={item.product.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            {items.length > 0 && (
              <div className="shrink-0 border-t border-black/[0.07] px-5 py-5">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-[0.9rem] text-[var(--muted)]">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                  </span>
                  <span className="text-[1.25rem] font-extrabold text-[var(--foreground)]">
                    €{subtotal.toFixed(2)}
                  </span>
                </div>
                <p className="mt-0.5 text-[0.76rem] text-[var(--muted)]">
                  Price estimate · Excl. tax · Shipping calculated at checkout
                </p>

                {/* CTAs */}
                <div className="mt-4 flex flex-col gap-2.5">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex h-[48px] items-center justify-center rounded-full bg-[var(--primary)] text-[0.95rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="flex h-[44px] items-center justify-center rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition hover:bg-[#f5f5f5]"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
