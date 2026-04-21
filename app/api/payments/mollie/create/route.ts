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

  // ── Normalise delivery keys: camelCase → snake_case for Laravel ─────────────
  const rawDelivery = body.delivery as Record<string, string> | undefined;
  const delivery = rawDelivery
    ? {
        name:        rawDelivery.name,
        email:       rawDelivery.email,
        address:     rawDelivery.address,
        city:        rawDelivery.city,
        postal_code: rawDelivery.postal_code ?? rawDelivery.postalCode,
        country:     rawDelivery.country,
        phone:       rawDelivery.phone,
      }
    : undefined;

  // payment_method comes from frontend (e.g. "creditcard", "ideal", "paypal")
  const paymentMethod = (body.payment_method as string) || "creditcard";

  // Flatten items: { product: { id, brand, name, size, price }, quantity }
  //             → { sku, brand, name, size, unit_price, quantity }
  type RawItem = { product: Record<string, unknown>; quantity: number };
  const rawItems = Array.isArray(body.items) ? (body.items as RawItem[]) : [];
  const normalisedItems = rawItems.map((item) => ({
    sku:        item.product.sku,
    brand:      item.product.brand,
    name:       item.product.name,
    size:       item.product.size,
    unit_price: item.product.price,
    quantity:   item.quantity,
  }));

  const normalisedBody = { ...body, delivery, items: normalisedItems, payment_method: paymentMethod };

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
      body: JSON.stringify(normalisedBody),
      cache: "no-store",
    });

    const orderJson = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) {
      // Surface full Laravel validation errors for easier debugging
      const detail = orderJson.errors
        ? Object.values(orderJson.errors as Record<string, string[]>).flat().join(" | ")
        : null;
      return NextResponse.json(
        { error: detail ?? orderJson.message ?? "Failed to create order." },
        { status: orderRes.status }
      );
    }

    orderRef = orderJson.data?.ref ?? orderJson.data?.order_ref ?? `OKL-${Date.now()}`;
  } catch {
    return NextResponse.json({ error: "Could not reach the order service." }, { status: 502 });
  }

  // ── Step 2: calculate total ───────────────────────────────────────────────────
  const fetAddon = body.fet_addon as { unit_price: number; quantity: number } | undefined;
  const itemsTotal = rawItems.reduce((sum, i) => sum + Number(i.product.price) * Number(i.quantity), 0);
  const fetTotal   = fetAddon ? Number(fetAddon.unit_price) * Number(fetAddon.quantity) : 0;
  const total      = itemsTotal + fetTotal;

  if (total <= 0) {
    return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 });
  }

  // ── Step 3: create Mollie payment ─────────────────────────────────────────────
  // Map our method names to Mollie's accepted method identifiers
  const MOLLIE_METHODS: Record<string, string> = {
    creditcard: "creditcard",
    ideal:      "ideal",
    paypal:     "paypal",
    klarna:     "klarna",
    bancontact: "bancontact",
  };
  const mollieMethod = MOLLIE_METHODS[paymentMethod];

  try {
    const payment = await getMollieClient().payments.create({
      amount: {
        currency: "EUR",
        value: formatAmount(total),
      },
      description: `Order ${orderRef} — Okelcor`,
      redirectUrl: `${SITE_URL}/checkout/return?orderRef=${encodeURIComponent(orderRef)}`,
      webhookUrl: `${SITE_URL}/api/payments/mollie/webhook`,
      // Pre-select the payment method on Mollie's hosted page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(mollieMethod ? { method: mollieMethod as any } : {}),
      metadata: {
        orderRef,
        customerEmail: delivery?.email ?? "",
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
