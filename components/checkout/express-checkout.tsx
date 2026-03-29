"use client";

import { useLanguage } from "@/context/language-context";
import { PAYMENT_PROVIDERS } from "@/lib/payment-config";

type Props = {
  onSelect: (method: "applepay" | "paypal" | "googlepay") => void;
};

export default function ExpressCheckout({ onSelect }: Props) {
  const { t } = useLanguage();

  const appleEnabled  = PAYMENT_PROVIDERS.applepay.enabled;
  const paypalEnabled = PAYMENT_PROVIDERS.paypal.enabled;
  const googleEnabled = PAYMENT_PROVIDERS.googlepay.enabled;

  // If no express provider is configured, hide the entire section to avoid
  // showing a row of disabled buttons with no explanation.
  if (!appleEnabled && !paypalEnabled && !googleEnabled) return null;

  return (
    <div className="rounded-[22px] bg-[#efefef] p-6">
      <p className="mb-4 text-[1rem] font-extrabold text-[var(--foreground)]">
        {t.checkout.expressCheckout}
      </p>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        {/* Apple Pay */}
        <button
          type="button"
          onClick={() => appleEnabled && onSelect("applepay")}
          disabled={!appleEnabled}
          title={!appleEnabled ? "Coming soon" : undefined}
          className={`flex h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-black text-[0.9rem] font-semibold text-white transition
            ${appleEnabled ? "hover:bg-black/80" : "cursor-not-allowed opacity-40"}`}
        >
          {/* Apple logo mark */}
          <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
            <path d="M13.047 9.48c-.02-2.11 1.724-3.13 1.803-3.181C13.73 4.24 11.9 4.01 11.24 3.99c-1.52-.155-2.98.9-3.752.9-.79 0-1.99-.88-3.277-.856C2.6 4.057 1.12 4.99.36 6.41c-1.56 2.703-.4 6.706 1.11 8.9.74 1.072 1.62 2.27 2.776 2.226 1.12-.045 1.543-.72 2.896-.72 1.35 0 1.733.72 2.912.697 1.204-.02 1.96-1.086 2.688-2.163a10.5 10.5 0 001.22-2.5c-.03-.013-2.338-.9-2.36-3.37zM10.33 2.655c.614-.746 1.03-1.78.916-2.81-.886.036-1.958.59-2.594 1.334C8.06 1.9 7.556 2.96 7.692 3.968c.988.077 2-.5 2.638-1.313z" />
          </svg>
          Apple Pay
        </button>

        {/* PayPal */}
        <button
          type="button"
          onClick={() => paypalEnabled && onSelect("paypal")}
          disabled={!paypalEnabled}
          title={!paypalEnabled ? "Coming soon" : undefined}
          className={`flex h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-[#003087] text-[0.9rem] font-semibold text-white transition
            ${paypalEnabled ? "hover:bg-[#00256b]" : "cursor-not-allowed opacity-40"}`}
        >
          {/* PayPal P mark */}
          <svg width="16" height="18" viewBox="0 0 24 28" fill="currentColor">
            <path d="M19.6 4.4C18.3 2.8 15.9 2 12.8 2H5.1C4.5 2 4 2.5 3.9 3.1L1 21.4c-.1.4.2.8.6.8H6l1.1-7h3.3c5.3 0 8.6-2.6 9.6-7.7.4-2 0-3.6-0.4-3.1zM8.9 15.3l.9-5.5h2.4c1.5 0 2.4.3 2.8 1 .4.7.4 1.7 0 2.8-.6 2.3-2.3 3.4-4.4 3.4H8.9v-1.7z" />
            <path d="M22.4 8c-1.1 4.9-4.3 7.3-9.3 7.3h-1.8l-1.3 8.2c-.1.3.2.6.5.6h3.6c.5 0 .9-.4 1-.9l.7-4.6h2.6c4.5 0 7.1-2.2 7.9-6.6.4-2 .1-3.7-.9-4z" />
          </svg>
          PayPal
        </button>

        {/* Google Pay */}
        <button
          type="button"
          onClick={() => googleEnabled && onSelect("googlepay")}
          disabled={!googleEnabled}
          title={!googleEnabled ? "Coming soon" : undefined}
          className={`flex h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-black/10 bg-white text-[0.9rem] font-semibold text-[var(--foreground)] transition
            ${googleEnabled ? "hover:bg-[#f5f5f5]" : "cursor-not-allowed opacity-40"}`}
        >
          {/* Coloured G */}
          <span className="font-bold">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          Pay
        </button>
      </div>
    </div>
  );
}
