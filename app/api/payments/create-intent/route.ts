import { NextResponse } from "next/server";

/**
 * POST /api/payments/create-intent
 *
 * Thin proxy to the Laravel backend's payment intent endpoint.
 * Keeps the Stripe secret key server-side only — the client never
 * calls the backend directly for intent creation.
 *
 * Env vars (server-side only, no NEXT_PUBLIC_ prefix):
 *   API_URL          — e.g. https://api.okelcor.de/api/v1
 *   STRIPE_SECRET_KEY — Stripe secret key (never exposed to client)
 *
 * Request body: { delivery, items, vat_number? }
 * Response:     { client_secret: string }
 */
export async function POST(request: Request) {
  // API_URL is a server-only var (no NEXT_PUBLIC_ prefix) so it is
  // available in API routes and server components but never bundled
  // into the client. Falls back to NEXT_PUBLIC_API_URL for local dev.
  const API_URL =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "https://api.takeovercreatives.com/api/v1";

  try {
    const body = await request.json();

    console.log("[create-intent] API_URL:", API_URL);
    console.log("[create-intent] request body:", JSON.stringify(body));

    const res = await fetch(`${API_URL}/payments/create-intent`, {
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
    } catch (parseError) {
      console.error("[create-intent] Failed to parse backend response:", parseError);
      return NextResponse.json(
        { error: "Invalid response from payment service." },
        { status: 502 }
      );
    }

    console.log("[create-intent] backend status:", res.status, "body:", JSON.stringify(data));

    if (!res.ok) {
      const errMsg = (data as Record<string, string>)?.message ?? "Failed to create payment intent.";
      console.error("[create-intent] backend error:", res.status, errMsg);
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    const client_secret =
      (data as Record<string, Record<string, string>>)?.data?.client_secret ??
      (data as Record<string, string>)?.client_secret;

    if (!client_secret) {
      console.error("[create-intent] No client_secret in response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "No client secret returned from payment service." },
        { status: 502 }
      );
    }

    return NextResponse.json({ client_secret });
  } catch (error) {
    console.error("[create-intent] Unhandled error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Payment service unavailable. Please try again." },
      { status: 500 }
    );
  }
}
