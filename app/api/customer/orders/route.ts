import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  const customerToken = request.cookies.get("customer_token")?.value;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  // Normalise delivery: camelCase → snake_case
  const rawDelivery = body.delivery as Record<string, string> | undefined;
  const normDelivery = rawDelivery
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

  // Flatten items: nested product object → flat fields expected by Laravel
  type RawItem = { product: Record<string, unknown>; quantity: number };
  const rawItems = Array.isArray(body.items) ? (body.items as RawItem[]) : [];
  const normItems = rawItems.map((item) => ({
    sku:        item.product.sku,
    brand:      item.product.brand,
    name:       item.product.name,
    size:       item.product.size,
    unit_price: item.product.price,
    quantity:   item.quantity,
  }));

  body = {
    ...body,
    ...(normDelivery ? { delivery: normDelivery } : {}),
    items: normItems,
  };

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Could not reach the order service. Please try again." },
      { status: 502 }
    );
  }
}
