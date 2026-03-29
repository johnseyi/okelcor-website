/**
 * lib/payment-config.ts
 *
 * Central payment provider feature flags.
 *
 * Each provider is "enabled" when its required NEXT_PUBLIC_ env var is present.
 * Only NEXT_PUBLIC_ variables are used here — this file is safe to import from
 * both server components/routes and client components.
 *
 * Secret keys (STRIPE_SECRET_KEY, PAYPAL_CLIENT_SECRET, KLARNA_API_KEY) are
 * used ONLY inside app/api/checkout/route.ts and never exposed to the client.
 *
 * ── HOW TO ACTIVATE A PROVIDER ────────────────────────────────────────────────
 *
 * Stripe (card, Apple Pay, Google Pay):
 *   1. Create an account at https://dashboard.stripe.com
 *   2. Copy the Publishable Key + Secret Key from Developers → API Keys
 *   3. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY
 *   4. Card, Apple Pay, and Google Pay all activate automatically
 *
 * PayPal:
 *   1. Create an app at https://developer.paypal.com/dashboard
 *   2. Copy the Client ID (sandbox → live once ready)
 *   3. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET
 *
 * Klarna:
 *   1. Apply for a Klarna merchant account at https://www.klarna.com/business
 *   2. Once approved, integrate via Stripe (recommended) or Klarna's own SDK
 *   3. Set NEXT_PUBLIC_KLARNA_ENABLED=true and KLARNA_API_KEY
 *   4. Requires Stripe to also be configured (Klarna flows through Stripe)
 *
 * Apple Pay:
 *   • Requires Stripe to be configured (uses Stripe Payment Request Button)
 *   • Requires domain verification: download the file from Stripe dashboard
 *     and place at public/.well-known/apple-developer-merchantid-domain-association
 *   • Only available on Safari / Apple devices
 *
 * Google Pay:
 *   • Requires Stripe to be configured (uses Stripe Payment Request Button)
 *   • Works in Chrome and other Google Pay-enabled browsers
 *
 * ── VERCEL DEPLOYMENT ─────────────────────────────────────────────────────────
 * Add all env vars under Project → Settings → Environment Variables.
 * NEXT_PUBLIC_* vars must be set before build time to be included in the bundle.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const stripeConfigured  = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const paypalConfigured  = !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const klarnaConfigured  = stripeConfigured && !!process.env.NEXT_PUBLIC_KLARNA_ENABLED;

// Apple Pay and Google Pay both flow through Stripe's Payment Request Button.
const applePayConfigured  = stripeConfigured;
const googlePayConfigured = stripeConfigured;

export interface ProviderConfig {
  /** True when the required env var(s) for this provider are set. */
  enabled: boolean;
  /** Short label shown in the payment method selector. */
  label: string;
  /** One-line description shown below the label. */
  description: string;
}

export type PaymentMethodKey = "card" | "paypal" | "applepay" | "googlepay" | "klarna";

export const PAYMENT_PROVIDERS: Record<PaymentMethodKey, ProviderConfig> = {
  card: {
    enabled:     stripeConfigured,
    label:       "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
  },
  paypal: {
    enabled:     paypalConfigured,
    label:       "PayPal",
    description: "Pay with PayPal",
  },
  applepay: {
    enabled:     applePayConfigured,
    label:       "Apple Pay",
    description: "Touch or Face ID",
  },
  googlepay: {
    enabled:     googlePayConfigured,
    label:       "Google Pay",
    description: "Pay with Google",
  },
  klarna: {
    enabled:     klarnaConfigured,
    label:       "Klarna",
    description: "Pay later / instalments",
  },
};

/** True when at least one payment method has live credentials. */
export const anyProviderEnabled = Object.values(PAYMENT_PROVIDERS).some((p) => p.enabled);

/** Stripe publishable key — pass to Stripe.js on the client. Empty string when not configured. */
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** PayPal client ID — pass to PayPal SDK on the client. Empty string when not configured. */
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";
