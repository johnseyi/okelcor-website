import { NextResponse } from "next/server";

/**
 * POST /api/payments/create-intent
 *
 * Thin proxy to the Laravel backend's payment intent endpoint.
 * Keeps the Stripe secret key server-side only — the client never
 * calls the backend directly for intent creation.
 *
 * Request body: { delivery, items, vat_number? }
 * Response:     { client_secret: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

    const res = await fetch(`${API_URL}/payments/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message ?? "Failed to create payment intent." },
        { status: res.status }
      );
    }

    const client_secret = data.data?.client_secret ?? data.client_secret;

    if (!client_secret) {
      return NextResponse.json(
        { error: "No client secret returned from payment service." },
        { status: 502 }
      );
    }

    return NextResponse.json({ client_secret });
  } catch {
    return NextResponse.json(
      { error: "Payment service unavailable. Please try again." },
      { status: 500 }
    );
  }
}
