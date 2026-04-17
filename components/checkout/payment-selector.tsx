"use client";

import { CreditCard, Wallet } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { PAYMENT_PROVIDERS } from "@/lib/payment-config";
import { useSiteSettings } from "@/context/site-settings-context";

export type PaymentMethod = "card" | "paypal" | "applepay" | "klarna";

type Props = {
  method: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PaymentSelector({ method, onChange }: Props) {
  const { t } = useLanguage();
  const c = t.checkout;
  const s = useSiteSettings();

  function isEnabled(key: PaymentMethod): boolean {
    const settingsKey =
      key === "card" || key === "applepay" ? "adyen_enabled" :
      key === "paypal" ? "paypal_enabled" :
      key === "klarna" ? "klarna_enabled" : null;

    if (settingsKey && s[settingsKey] === "true") return true;
    return PAYMENT_PROVIDERS[key]?.enabled ?? false;
  }

  const anyEnabled =
    (["card", "paypal", "applepay", "klarna"] as PaymentMethod[]).some(isEnabled);

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

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {METHODS.map((m) => {
          const enabled = isEnabled(m.key);
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
              {!enabled && (
                <span className="absolute right-2 top-2 rounded-full bg-black/[0.07] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Soon
                </span>
              )}
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isSelected && enabled ? "bg-[var(--primary)]/10" : "bg-black/[0.05]"}`}>
                {m.key === "card" ? (
                  <CreditCard size={16} className={isSelected && enabled ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
                ) : (
                  <Wallet size={16} className={isSelected && enabled ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
                )}
              </div>
              <div>
                <p className="text-[0.82rem] font-semibold leading-tight text-[var(--foreground)]">{m.label}</p>
                <p className="mt-0.5 text-[0.74rem] leading-snug text-[var(--muted)]">{m.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {!anyEnabled && (
        <div className="mt-4 rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[0.82rem] font-semibold text-amber-800">Online payment coming soon</p>
          <p className="mt-1 text-[0.78rem] leading-5 text-amber-700">
            Our payment gateway is being set up. Place your order now and our team will contact you to arrange payment before dispatch.
          </p>
        </div>
      )}

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
