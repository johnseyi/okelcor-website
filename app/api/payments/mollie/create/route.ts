import { NextResponse } from "next/server";

const LEGACY_DISABLED_MESSAGE = "Legacy payment gateway is currently disabled.";

/**
 * LEGACY/INACTIVE: Mollie payment creation is disabled until Okelcor
 * account/API credentials are approved. Active checkout uses Stripe Checkout:
 * /api/checkout/stripe-session -> /api/v1/payments/create-session.
 */
export async function POST() {
  return NextResponse.json(
    { message: LEGACY_DISABLED_MESSAGE },
    { status: 410 }
  );
}
