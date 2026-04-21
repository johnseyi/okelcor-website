import { NextRequest, NextResponse } from "next/server";
import { mollieClient } from "@/lib/mollie";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const WEBHOOK_SECRET = process.env.MOLLIE_WEBHOOK_SECRET ?? "";

export async function POST(request: NextRequest) {
  // Mollie sends form-encoded body with "id" field
  let paymentId: string | null = null;
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    paymentId = params.get("id");
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment id." }, { status: 400 });
  }

  // Fetch the payment from Mollie to verify status
  let payment;
  try {
    payment = await mollieClient.payments.get(paymentId);
  } catch {
    return NextResponse.json({ error: "Could not fetch payment." }, { status: 502 });
  }

  const meta = payment.metadata as Record<string, string> | null;
  const orderRef = meta?.orderRef ?? "";
  const status   = payment.status; // 'paid' | 'failed' | 'expired' | 'canceled' | 'pending' | 'open'

  // Notify the backend to update the order status
  if (orderRef) {
    try {
      await fetch(`${API_URL}/orders/mollie-webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(WEBHOOK_SECRET ? { "X-Webhook-Secret": WEBHOOK_SECRET } : {}),
        },
        body: JSON.stringify({ paymentId, orderRef, status }),
        cache: "no-store",
      });
    } catch {
      // Log but don't fail — Mollie will retry the webhook
      console.error("[Mollie webhook] Failed to notify backend for order", orderRef);
    }
  }

  // Always return 200 so Mollie doesn't keep retrying
  return NextResponse.json({ received: true });
}
