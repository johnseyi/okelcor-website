import { createMollieClient } from "@mollie/api-client";

/**
 * LEGACY/INACTIVE: Mollie helpers are retained for historical routes only.
 * Active checkout uses Stripe Checkout via /api/checkout/stripe-session,
 * which forwards to Laravel /api/v1/payments/create-session.
 */
export function getMollieClient() {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) throw new Error("MOLLIE_API_KEY is not set.");
  return createMollieClient({ apiKey });
}

export function formatAmount(euros: number): string {
  return euros.toFixed(2);
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
