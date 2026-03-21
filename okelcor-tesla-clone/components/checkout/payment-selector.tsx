"use client";

import { CreditCard, Wallet } from "lucide-react";

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

const METHODS: { key: PaymentMethod; label: string; description: string }[] = [
  { key: "card", label: "Credit / Debit Card", description: "Visa, Mastercard, Amex" },
  { key: "paypal", label: "PayPal", description: "Pay via your PayPal account" },
  { key: "applepay", label: "Apple Pay", description: "Touch ID or Face ID" },
  { key: "klarna", label: "Klarna", description: "Buy now, pay later" },
];

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
  return (
    <div className="rounded-[22px] bg-[#efefef] p-6">
      <p className="mb-4 text-[1rem] font-extrabold text-[var(--foreground)]">
        Payment Method
      </p>

      {/* Method grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            className={`flex flex-col items-start gap-1.5 rounded-[12px] border-2 p-3 text-left transition ${
              method === m.key
                ? "border-[var(--primary)] bg-[var(--primary)]/[0.04]"
                : "border-black/[0.08] bg-white hover:border-black/20"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                method === m.key ? "bg-[var(--primary)]/10" : "bg-black/[0.05]"
              }`}
            >
              {m.key === "card" ? (
                <CreditCard
                  size={16}
                  className={method === m.key ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                />
              ) : (
                <Wallet
                  size={16}
                  className={method === m.key ? "text-[var(--primary)]" : "text-[var(--muted)]"}
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
        ))}
      </div>

      {/* Credit card fields */}
      {method === "card" && (
        <div className="mt-5 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
              Card Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) =>
                onCardChange({ ...cardData, number: formatCardNumber(e.target.value) })
              }
              className={cardErrors.number ? inputErrCls : inputCls}
            />
            {cardErrors.number && (
              <p className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.number}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                Expiry Date
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) =>
                  onCardChange({ ...cardData, expiry: formatExpiry(e.target.value) })
                }
                className={cardErrors.expiry ? inputErrCls : inputCls}
              />
              {cardErrors.expiry && (
                <p className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.expiry}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
                CVV
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={cardData.cvv}
                onChange={(e) =>
                  onCardChange({ ...cardData, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                }
                className={cardErrors.cvv ? inputErrCls : inputCls}
              />
              {cardErrors.cvv && (
                <p className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.cvv}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[0.82rem] font-semibold text-[var(--foreground)]">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="Name as it appears on the card"
              value={cardData.holder}
              onChange={(e) => onCardChange({ ...cardData, holder: e.target.value })}
              className={cardErrors.holder ? inputErrCls : inputCls}
            />
            {cardErrors.holder && (
              <p className="mt-0.5 text-[0.75rem] text-red-500">{cardErrors.holder}</p>
            )}
          </div>
        </div>
      )}

      {/* Info text for other methods */}
      {method === "paypal" && (
        <p className="mt-4 rounded-[10px] bg-[#003087]/[0.05] px-4 py-3 text-[0.88rem] text-[var(--muted)]">
          You will be redirected to PayPal to complete your payment securely.
        </p>
      )}
      {method === "applepay" && (
        <p className="mt-4 rounded-[10px] bg-black/[0.04] px-4 py-3 text-[0.88rem] text-[var(--muted)]">
          Complete your payment using Touch ID or Face ID on your Apple device.
        </p>
      )}
      {method === "klarna" && (
        <p className="mt-4 rounded-[10px] bg-[#ffb3c7]/20 px-4 py-3 text-[0.88rem] text-[var(--muted)]">
          Split your order into 3 interest-free instalments. Subject to approval.
        </p>
      )}
    </div>
  );
}
