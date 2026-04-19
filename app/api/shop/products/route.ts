import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  try {
    // Forward all query params to the Laravel API as-is
    const search = request.nextUrl.search;
    const upstream = `${API_URL}/products${search}`;

    const res = await fetch(upstream, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[api/shop/products] upstream error:", err);
    return NextResponse.json(
      { data: [], meta: { total: 0 }, error: "Could not reach product catalogue." },
      { status: 502 }
    );
  }
}
