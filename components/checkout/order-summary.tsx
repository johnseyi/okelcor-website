"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type FetAddon = {
  name: string;
  unitPrice: number;
  qty: number;
};

type TaxPreview = {
  subtotal_net: number;
  delivery_cost: number;
  tax_rate: number;
  tax_amount: number;
  tax_treatment: string;
  is_reverse_charge: boolean;
  total: number;
  note: string | null;
};

type Props = {
  deliveryCost: number;
  fetAddon?: FetAddon | null;
  country: string;
  vatNumber: string;
  vatValid: boolean;
  customerType?: string;
};

// ─── SummaryRow ───────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderSummary({
  deliveryCost,
  fetAddon,
  country,
  vatNumber,
  vatValid,
  customerType,
}: Props) {
  const { items, subtotal, totalItems } = useCart();
  const { t } = useLanguage();
  const c = t.checkout;

  const fetLineTotal = fetAddon ? fetAddon.unitPrice * fetAddon.qty : 0;
  const cartTotal = subtotal + deliveryCost + fetLineTotal;

  // Keep vatNumber readable inside the effect without making it a trigger.
  // Per spec, tax preview fires on vatValid change, not on every keystroke.
  const vatNumberRef = useRef(vatNumber);
  useEffect(() => { vatNumberRef.current = vatNumber; });

  const [taxPreview, setTaxPreview] = useState<TaxPreview | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState(false);

  useEffect(() => {
    if (!country) {
      setTaxPreview(null);
      setTaxLoading(false);
      setTaxError(false);
      return;
    }

    setTaxLoading(true);
    setTaxError(false);

    const controller = new AbortController();

    const payload = {
      items: [
        ...items.map((i) => ({
          product_id: i.product.id,
          unit_price: i.product.price,
          quantity: i.quantity,
        })),
        ...(fetAddon
          ? [{ unit_price: fetAddon.unitPrice, quantity: fetAddon.qty }]
          : []),
      ],
      delivery_cost: deliveryCost,
      country,
      vat_number: vatValid ? vatNumberRef.current : undefined,
      vat_valid: vatValid,
      customer_type: customerType,
    };

    // DEBUG: confirm trigger state (remove after fix confirmed)
    console.log("[tax-preview] triggered →", {
      country,
      vatValid,
      vatNumber: vatValid ? vatNumberRef.current : "(not sent)",
      customerType,
      itemCount: items.length,
    });

    const timer = setTimeout(async () => {
      // DEBUG: log exact payload (remove after fix confirmed)
      console.log("[tax-preview] payload →", JSON.stringify(payload));

      try {
        const res = await fetch("/api/checkout/tax-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        // DEBUG: response status (remove after fix confirmed)
        console.log("[tax-preview] response status →", res.status);

        if (!res.ok) throw new Error("preview_failed");

        const json = await res.json();

        // DEBUG: response data (remove after fix confirmed)
        console.log("[tax-preview] response data →", json);

        const data: TaxPreview | null = json?.data ?? null;
        if (!data || typeof data.total !== "number") throw new Error("invalid_response");

        setTaxPreview(data);
        setTaxError(false);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // DEBUG: catch reason (remove after fix confirmed)
        console.log("[tax-preview] error →", (err as Error).message);
        setTaxPreview(null);
        setTaxError(true);
      } finally {
        setTaxLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  // vatNumber intentionally excluded: only vatValid triggers the call (per spec).
  // vatNumberRef.current is synced on every render and read inside the timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, deliveryCost, fetAddon, country, vatValid, customerType]);

  // ── Derived display values ─────────────────────────────────────────────────

  const displaySubtotal = taxPreview ? taxPreview.subtotal_net : subtotal;
  const displayDelivery = taxPreview ? taxPreview.delivery_cost : deliveryCost;
  const displayTotal    = taxPreview ? taxPreview.total : cartTotal;

  return (
    <div className="overflow-hidden rounded-[22px] bg-[#efefef]">
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
              <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[10px] bg-white">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
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

        {/* FET add-on line item */}
        {fetAddon && (
          <div className="flex gap-3 py-4">
            <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#dcfce7]">
              <span className="text-center text-[10px] font-extrabold leading-tight text-[#166534]">FET</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[0.88rem] font-semibold text-[var(--foreground)]">
                    {fetAddon.name}
                  </p>
                  <p className="text-[0.78rem] text-[var(--muted)]">SKU: FET-001</p>
                </div>
                <p className="shrink-0 text-[0.88rem] font-semibold text-[var(--foreground)]">
                  €{(fetAddon.unitPrice * fetAddon.qty).toFixed(2)}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
                  {c.qty} {fetAddon.qty}
                </span>
                <span className="text-[0.75rem] text-[var(--muted)]">
                  €{fetAddon.unitPrice.toFixed(2)} {c.each}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-3 border-t border-black/[0.07] px-6 py-5">
        {/* Subtotal */}
        <SummaryRow label={c.subtotal} value={`€${displaySubtotal.toFixed(2)}`} />

        {/* Delivery */}
        <SummaryRow
          label={c.delivery}
          value={displayDelivery === 0 ? c.free : `€${displayDelivery.toFixed(2)}`}
        />

        {/* VAT row — three states */}
        {taxLoading ? (
          <div className="flex items-center gap-2 text-[0.82rem] text-[var(--muted)]">
            <Loader2 size={13} strokeWidth={2} className="shrink-0 animate-spin" />
            <span>Calculating VAT…</span>
          </div>
        ) : taxPreview ? (
          taxPreview.is_reverse_charge ? (
            <>
              <SummaryRow label="VAT reverse charge (0%)" value="€0.00" />
              {taxPreview.note && (
                <p className="text-[0.75rem] italic text-[var(--muted)]">{taxPreview.note}</p>
              )}
            </>
          ) : taxPreview.tax_treatment === "exempt" ? (
            <>
              <SummaryRow label="VAT exempt (0%)" value="€0.00" />
              {taxPreview.note && (
                <p className="text-[0.75rem] italic text-[var(--muted)]">{taxPreview.note}</p>
              )}
            </>
          ) : (
            <SummaryRow
              label={`${c.tax} (${taxPreview.tax_rate}%)`}
              value={`€${taxPreview.tax_amount.toFixed(2)}`}
            />
          )
        ) : (
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.82rem] text-[var(--muted)]">{c.tax}</span>
            <span className="text-[0.78rem] italic text-[var(--muted)]">
              {taxError
                ? "VAT will be confirmed at Stripe Checkout."
                : c.taxNote}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="mt-1 border-t border-black/[0.07] pt-3">
          <SummaryRow
            label={c.total}
            value={taxLoading ? "—" : `€${displayTotal.toFixed(2)}`}
            bold
            large
          />
        </div>

        {/* Disclaimer — only shown when no live preview */}
        {!taxPreview && !taxLoading && (
          <p className="text-[0.75rem] italic text-[var(--muted)]">{c.taxDisclaimer}</p>
        )}
      </div>
    </div>
  );
}
