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

  let bodyObj: unknown;
  try {
    bodyObj = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = JSON.stringify(bodyObj);
  const targetUrl = `${API_URL}/payments/create-session`;
  console.log("[stripe-session] target URL :", targetUrl);
  console.log("[stripe-session] request body:", body);

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
      body,
      cache: "no-store",
    });

    const text = await res.text();

    // Parse response to audit whether the fields the frontend needs are present.
    let parsed: Record<string, unknown> = {};
    try { parsed = JSON.parse(text); } catch { /* non-JSON response */ }
    const responseData = (parsed?.data ?? {}) as Record<string, unknown>;
    console.log("[stripe-session] HTTP status     :", res.status);
    console.log("[stripe-session] has checkout_url :", typeof responseData.checkout_url === "string");
    console.log("[stripe-session] has order_ref    :", typeof responseData.order_ref === "string");
    console.log("[stripe-session] raw response     :", text.slice(0, 600));

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
