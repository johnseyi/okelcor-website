import { NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/payments/create-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid response from payment service." },
        { status: 502 },
      );
    }

    if (!res.ok) {
      const msg = (data as Record<string, string>)?.message ?? "Failed to create payment session.";
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    // Unwrap Laravel data envelope if present
    const payload = (data as Record<string, unknown>)?.data ?? data;
    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Payment service unavailable." },
      { status: 500 },
    );
  }
}
