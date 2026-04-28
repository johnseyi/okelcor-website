import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  const upstream = `${API_URL}/products${search}`;

  // The Laravel /products endpoint requires auth — forward the customer token.
  // Fall back to a guest token (SHOP_GUEST_TOKEN env var) for unauthenticated visitors.
  const customerToken = request.cookies.get("customer_token")?.value;
  const guestToken    = process.env.SHOP_GUEST_TOKEN ?? "";
  const authToken     = customerToken || guestToken;

  console.log("[api/shop/products] →", upstream.replace(API_URL, "<API>"));

  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    const raw = await res.text();

    console.log(
      `[api/shop/products] ← HTTP ${res.status} | body[0..300]:`,
      raw.slice(0, 300)
    );

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      // Non-JSON response (e.g. HTML 404 page from Laravel)
      console.error("[api/shop/products] non-JSON response:", raw.slice(0, 200));
      return NextResponse.json(
        {
          data: [],
          meta: { total: 0 },
          _proxy_error: `Upstream returned HTTP ${res.status} with non-JSON body`,
        },
        { status: 502 }
      );
    }

    // Surface the upstream status so the client can distinguish 404 / 200-empty
    const response = NextResponse.json(data, { status: res.status });
    response.headers.set("X-Upstream-Status", String(res.status));
    return response;
  } catch (err) {
    console.error("[api/shop/products] network error:", err);
    return NextResponse.json(
      {
        data: [],
        meta: { total: 0 },
        _proxy_error: "Could not reach the product catalogue API.",
      },
      { status: 502 }
    );
  }
}
