import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const token: string =
      data.token ?? data.access_token ?? data.data?.token ?? "";

    const customer =
      data.user ?? data.customer ?? data.data?.user ?? data.data ?? null;

    const response = NextResponse.json({
      customer,
      email_verified: data.email_verified ?? customer?.email_verified ?? true,
      must_reset: data.must_reset ?? false,
    });

    if (token) {
      response.cookies.set("customer_token", token, COOKIE_OPTS);
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
