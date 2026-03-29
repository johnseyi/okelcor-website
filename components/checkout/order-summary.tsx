"use client";

import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";

type Props = {
  deliveryCost: number;
};

function SummaryRow({
  label,
  value,
  bold,
  large,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`${bold ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted)]"} ${
          large ? "text-[1rem]" : "text-[0.88rem]"
        }`}
      >
        {label}
      </span>
      <span
        className={`${bold ? "font-extrabold text-[var(--foreground)]" : "text-[var(--foreground)]"} ${
          large ? "text-[1.2rem]" : "text-[0.88rem]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function OrderSummary({ deliveryCost }: Props) {
  const { items, subtotal, totalItems } = useCart();
  const { t } = useLanguage();
  const c = t.checkout;

  const total = subtotal + deliveryCost;

  return (
    <div className="rounded-[22px] bg-[#efefef] overflow-hidden">
      {/* Header */}
      <div className="border-b border-black/[0.07] px-6 py-4">
        <p className="text-[1rem] font-extrabold text-[var(--foreground)]">
          {c.summaryTitle}
        </p>
        <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">
          {totalItems} {totalItems === 1 ? c.item : c.items}
        </p>
      </div>

      {/* Product list */}
      <div className="divide-y divide-black/[0.06] px-6">
        {items.map((item) => {
          const lineTotal = item.product.price * item.quantity;
          return (
            <div key={item.product.id} className="flex gap-3 py-4">
              {/* Thumbnail */}
              <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[10px] bg-white">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[0.88rem] font-semibold text-[var(--foreground)]">
                      {item.product.brand} {item.product.name}
                    </p>
                    <p className="text-[0.78rem] text-[var(--muted)]">
                      {item.product.size} · {item.product.spec}
                    </p>
                  </div>
                  <p className="shrink-0 text-[0.88rem] font-semibold text-[var(--foreground)]">
                    €{lineTotal.toFixed(2)}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded-full bg-[#efefef] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
                    {c.qty} {item.quantity}
                  </span>
                  <span className="text-[0.75rem] text-[var(--muted)]">
                    €{item.product.price.toFixed(2)} {c.each}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-black/[0.07] px-6 py-5 flex flex-col gap-3">
        <SummaryRow label={c.subtotal} value={`€${subtotal.toFixed(2)}`} />
        <SummaryRow
          label={c.delivery}
          value={deliveryCost === 0 ? c.free : `€${deliveryCost.toFixed(2)}`}
        />
        <SummaryRow label={c.tax} value={c.taxNote} />
        <div className="mt-1 border-t border-black/[0.07] pt-3">
          <SummaryRow
            label={c.total}
            value={`€${total.toFixed(2)}`}
            bold
            large
          />
        </div>
        <p className="text-[0.75rem] text-[var(--muted)]">
          {c.taxDisclaimer}
        </p>
      </div>
    </div>
  );
}
