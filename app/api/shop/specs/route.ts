import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  const customerToken = request.cookies.get("customer_token")?.value;
  try {
    const res = await fetch(`${API_URL}/products/specs`, {
      next: { revalidate: 300 },
      headers: {
        Accept: "application/json",
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/shop/specs] upstream error:", err);
    return NextResponse.json({ data: {} }, { status: 502 });
  }
}
