import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getMollieClient, formatAmount, SITE_URL } from "@/lib/mollie";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const customerToken = cookieStore.get("customer_token")?.value;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // ── Step 1: create order in the backend ──────────────────────────────────────
  let orderRef: string;
  try {
    const orderRes = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const orderJson = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) {
      return NextResponse.json(
        { error: orderJson.message ?? "Failed to create order." },
        { status: orderRes.status }
      );
    }

    orderRef = orderJson.data?.ref ?? orderJson.data?.order_ref ?? `OKL-${Date.now()}`;
  } catch {
    return NextResponse.json({ error: "Could not reach the order service." }, { status: 502 });
  }

  // ── Step 2: calculate total ───────────────────────────────────────────────────
  const items = Array.isArray(body.items) ? body.items as { quantity: number; product: { price: number } }[] : [];
  const fetAddon = body.fet_addon as { unit_price: number; quantity: number } | undefined;
  const itemsTotal = items.reduce((sum, i) => sum + Number(i.product.price) * Number(i.quantity), 0);
  const fetTotal   = fetAddon ? Number(fetAddon.unit_price) * Number(fetAddon.quantity) : 0;
  const total      = itemsTotal + fetTotal;

  if (total <= 0) {
    return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 });
  }

  // ── Step 3: create Mollie payment ─────────────────────────────────────────────
  try {
    const payment = await getMollieClient().payments.create({
      amount: {
        currency: "EUR",
        value: formatAmount(total),
      },
      description: `Order ${orderRef} — Okelcor`,
      redirectUrl: `${SITE_URL}/checkout/return?orderRef=${encodeURIComponent(orderRef)}`,
      webhookUrl: `${SITE_URL}/api/payments/mollie/webhook`,
      metadata: {
        orderRef,
        customerEmail: (body.delivery as Record<string, string>)?.email ?? "",
      },
    });

    const checkoutUrl = payment._links.checkout?.href;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Mollie did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({
      checkoutUrl,
      paymentId: payment.id,
      orderRef,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Mollie payment creation failed.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
