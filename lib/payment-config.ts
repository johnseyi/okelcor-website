/**
 * lib/payment-config.ts
 *
 * Legacy Mollie payment gateway configuration.
 *
 * Mollie and Adyen are inactive until Okelcor account/API credentials are
 * approved. Stripe Checkout is the active gateway. The frontend posts to
 * /api/checkout/stripe-session, which forwards to Laravel
 * /api/v1/payments/create-session.
 *
 * ── HOW TO ACTIVATE ───────────────────────────────────────────────────────────
 *
 * 1. Sign up at https://www.mollie.com
 * 2. Dashboard → Developers → API keys
 *    - Test key: test_xxxxxxxxxx
 *    - Live key: live_xxxxxxxxxx  (set once your account is approved)
 * 3. Set MOLLIE_API_KEY in your environment (server-side — no NEXT_PUBLIC_ needed)
 * 4. Set NEXT_PUBLIC_BASE_URL to your production domain (e.g. https://okelcor.com)
 *    so Mollie can redirect back correctly.
 *
 * ── OPTIONAL ──────────────────────────────────────────────────────────────────
 *
 * MOLLIE_WEBHOOK_SECRET — a shared secret your backend uses to verify that
 * webhook calls genuinely come from your Next.js server (not MOLLIE's secret,
 * just a string you make up and share with the backend team).
 *
 * ── VERCEL DEPLOYMENT ─────────────────────────────────────────────────────────
 * MOLLIE_API_KEY and MOLLIE_WEBHOOK_SECRET are server-side only — do NOT prefix
 * them with NEXT_PUBLIC_.  NEXT_PUBLIC_BASE_URL must be set before build time.
 */

export const MOLLIE_CONFIGURED = !!process.env.MOLLIE_API_KEY;
