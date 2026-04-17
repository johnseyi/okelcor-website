/**
 * lib/payment-config.ts
 *
 * Central payment provider feature flags.
 *
 * Adyen Drop-in handles card, Apple Pay, Google Pay, PayPal, and Klarna
 * natively when NEXT_PUBLIC_ADYEN_CLIENT_KEY is set.
 *
 * ── HOW TO ACTIVATE ───────────────────────────────────────────────────────────
 *
 * Adyen (card, Apple Pay, Google Pay, Klarna, PayPal via Drop-in):
 *   1. Log in to https://ca-live.adyen.com (or test: https://ca-test.adyen.com)
 *   2. Developers → API credentials → create a client-side integration credential
 *   3. Set NEXT_PUBLIC_ADYEN_CLIENT_KEY (e.g. test_XXXX or live_XXXX)
 *   4. Set NEXT_PUBLIC_ADYEN_ENVIRONMENT to "test" or "live"
 *   5. Laravel backend must handle POST /payments/create-session and return
 *      { id, sessionData } from the Adyen Sessions API
 *
 * PayPal (standalone):
 *   Set NEXT_PUBLIC_PAYPAL_CLIENT_ID when PayPal is set up separately.
 *
 * ── VERCEL DEPLOYMENT ─────────────────────────────────────────────────────────
 * NEXT_PUBLIC_* vars must be added before build time (Project → Settings →
 * Environment Variables).
 */

const adyenConfigured = !!process.env.NEXT_PUBLIC_ADYEN_CLIENT_KEY;
const paypalConfigured = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

export interface ProviderConfig {
  enabled: boolean;
  label: string;
  description: string;
}

export type PaymentMethodKey = "card" | "paypal" | "applepay" | "googlepay" | "klarna";

export const PAYMENT_PROVIDERS: Record<PaymentMethodKey, ProviderConfig> = {
  card: {
    enabled:     adyenConfigured,
    label:       "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
  },
  paypal: {
    enabled:     adyenConfigured || paypalConfigured,
    label:       "PayPal",
    description: "Pay with PayPal",
  },
  applepay: {
    enabled:     adyenConfigured,
    label:       "Apple Pay",
    description: "Touch or Face ID",
  },
  googlepay: {
    enabled:     adyenConfigured,
    label:       "Google Pay",
    description: "Pay with Google",
  },
  klarna: {
    enabled:     adyenConfigured,
    label:       "Klarna",
    description: "Pay later / instalments",
  },
};

export const anyProviderEnabled = Object.values(PAYMENT_PROVIDERS).some((p) => p.enabled);

export const ADYEN_CLIENT_KEY = process.env.NEXT_PUBLIC_ADYEN_CLIENT_KEY ?? "";
export const ADYEN_ENVIRONMENT = process.env.NEXT_PUBLIC_ADYEN_ENVIRONMENT ?? "test";
export const PAYPAL_CLIENT_ID  = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
