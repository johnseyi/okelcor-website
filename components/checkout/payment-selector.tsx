"use client";

import { CreditCard, Wallet } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { PAYMENT_PROVIDERS } from "@/lib/payment-config";

export type PaymentMethod = "card" | "paypal" | "applepay" | "klarna";

export type CardData = {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
};

type Props = {
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  cardData: CardData;
  onCardChange: (data: CardData) => void;
  cardErrors: Partial<CardData>;
};

const inputCls =
  "w-full rounded-[12px] border border-black/[0.08] bg-white px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10";

const inputErrCls =
  "w-full rounded-[12px] border border-red-400 bg-red-50/50 px-4 py-3 text-[0.93rem] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] transition focus:border-red-500";

function formatCardNumber(val: string) {
  return val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function PaymentSelector({
  method,
  onChange,
  cardData,
  onCardChange,
  cardErrors,
}: Props) {
  const { t } = useLanguage();
  const c = t.checkout;

  const METHODS: { key: PaymentMethod; label: string; description: string }[] = [
    { key: "card",     label: c.payCardLabel,   description: c.payCardDesc   },
    { key: "paypal",   label: c.payPaypalLabel, description: c.payPaypalDesc },
    { key: "applepay", label: c.payAppleLabel,  description: c.payAppleDesc  },
    { key: "klarna",   label: c.payKlarnaLabel, description: c.payKlarnaDesc },
  ];

  return (
    <div className="rounded-[22px] bg-[#efefef] p-6">
      <p className="mb-4 text-[1rem] font-extrabold text-[var(--foreground)]">
        {c.paymentMethod}
      </p>

      {/* Method grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {METHODS.map((m) => {
          const providerKey = m.key === "applepay" ? "applepay" : m.key;
          const enabled = PAYMENT_PROVIDERS[providerKey]?.enabled ?? false;
          const isSelected = method === m.key;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => enabled && onChange(m.key)}
              disabled={!enabled}
              title={!enabled ? "Coming soon — not yet available" : undefined}
              className={`relative flex flex-col items-start gap-1.5 rounded-[12px] border-2 p-3 text-left transition
                ${!enabled ? "cursor-not-allowed opacity-50" : ""}
                ${isSelected && enabled
                  ? "border-[var(--primary)] bg-[var(--primary)]/[0.04]"
                  : enabled
                    ? "border-black/[0.08] bg-white hover:border-black/20"
                    : "border-black/[0.06] bg-white/60"
                }`}
            >
              {/* "Coming soon" badge for unconfigured providers */}
              {!enabled && (
                <span className="absolute right-2 top-2 rounded-full bg-black/[0.07] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Soon
                </span>
              )}

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isSelected && enabled ? "bg-[var(--primary)]/10" : "bg-black/[0.05]"
                }`}
              >
                {m.key === "card" ? (
                  <CreditCard
                    size={16}
                    className={isSelected && enabled ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                  />
                ) : (
                  <Wallet
                    size={16}
                    className={isSelected && enabled ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                  />
                )}
              </div>
              <div>
                <p className="text-[0.82rem] font-semibold text-[var(--foreground)] leading-tight">
                  {m.label}
                </p>
                <p className="mt-0.5 text-[0.74rem] text-[var(--muted)] leading-snug">
                  {m.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Credit card fields */}
      {method === "card" && (
        <div className="mt-5 flex flex-col gap-3">
          <div>
            <label htmlFor="card-number" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
              {c.labelCardNumber}
            </label>
            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              placeholder={c.placeholderCardNumber}
              value={cardData.number}
              onChange={(e) =>
                onCardChange({ ...cardData, number: formatCardNumber(e.target.value) })
              }
              aria-describedby={cardErrors.number ? "card-number-error" : undefined}
              aria-invalid={!!cardErrors.number}
              className={cardErrors.number ? inputErrCls : inputCls}
            />
            {cardErrors.number && (
              <p id="card-number-error" role="alert" className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.number}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="card-expiry" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                {c.labelExpiry}
              </label>
              <input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                placeholder={c.placeholderExpiry}
                value={cardData.expiry}
                onChange={(e) =>
                  onCardChange({ ...cardData, expiry: formatExpiry(e.target.value) })
                }
                aria-describedby={cardErrors.expiry ? "card-expiry-error" : undefined}
                aria-invalid={!!cardErrors.expiry}
                className={cardErrors.expiry ? inputErrCls : inputCls}
              />
              {cardErrors.expiry && (
                <p id="card-expiry-error" role="alert" className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.expiry}</p>
              )}
            </div>
            <div>
              <label htmlFor="card-cvv" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                {c.labelCvv}
              </label>
              <input
                id="card-cvv"
                type="text"
                inputMode="numeric"
                placeholder={c.placeholderCvv}
                maxLength={4}
                value={cardData.cvv}
                onChange={(e) =>
                  onCardChange({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                aria-describedby={cardErrors.cvv ? "card-cvv-error" : undefined}
                aria-invalid={!!cardErrors.cvv}
                className={cardErrors.cvv ? inputErrCls : inputCls}
              />
              {cardErrors.cvv && (
                <p id="card-cvv-error" role="alert" className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="card-holder" className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
              {c.labelHolder}
            </label>
            <input
              id="card-holder"
              type="text"
              placeholder={c.placeholderHolder}
              value={cardData.holder}
              onChange={(e) => onCardChange({ ...cardData, holder: e.target.value })}
              aria-describedby={cardErrors.holder ? "card-holder-error" : undefined}
              aria-invalid={!!cardErrors.holder}
              className={cardErrors.holder ? inputErrCls : inputCls}
            />
            {cardErrors.holder && (
              <p id="card-holder-error" role="alert" className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.holder}</p>
            )}
          </div>
        </div>
      )}

      {/* Info panel when no payment provider is live yet */}
      {!Object.values(PAYMENT_PROVIDERS).some((p) => p.enabled) && (
        <div className="mt-4 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[0.82rem] font-semibold text-amber-800">
            Online payment coming soon
          </p>
          <p className="mt-1 text-[0.78rem] leading-5 text-amber-700">
            Our payment gateway is being set up. Place your order now and our team will contact you to arrange payment before dispatch.
          </p>
        </div>
      )}

      {/* Info text for other methods */}
      {method === "paypal" && (
        <p className="mt-4 rounded-[10px] bg-[#003087]/[0.05] px-4 py-3 text-[0.88rem] text-[var(--muted)]">
          {c.payPaypalInfo}
        </p>
      )}
      {method === "applepay" && (
        <p className="mt-4 rounded-[10px] bg-black/[0.04] px-4 py-3 text-[0.88rem] text-[var(--muted)]">
          {c.payAppleInfo}
        </p>
      )}
      {method === "klarna" && (
        <p className="mt-4 rounded-[10px] bg-[#ffb3c7]/20 px-4 py-3 text-[0.88rem] text-[var(--muted)]">
          {c.payKlarnaInfo}
        </p>
      )}
    </div>
  );
}
