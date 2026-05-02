import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

/**
 * Active checkout route. Proxies Stripe Checkout session creation to Laravel:
 * POST /api/v1/payments/create-session.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const customerToken = cookieStore.get("customer_token")?.value;

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/payments/create-session`, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") ?? "application/json",
        Accept: "application/json",
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
      body: body || "{}",
      cache: "no-store",
    });

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment session service." },
      { status: 502 }
    );
  }
}
