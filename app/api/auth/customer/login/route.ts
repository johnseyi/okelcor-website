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
  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  // Proxy to backend
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch (fetchError) {
    const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
    console.error("[login] Backend unreachable:", msg);
    return NextResponse.json(
      { message: "Unable to connect to authentication service. Please try again." },
      { status: 503 }
    );
  }

  // Parse backend response
  let data: Record<string, unknown>;
  try {
    data = await res.json();
  } catch {
    console.error("[login] Backend returned non-JSON response, status:", res.status);
    return NextResponse.json(
      { message: "Authentication service returned an unexpected response. Please try again." },
      { status: 502 }
    );
  }

  // Backend 5xx — don't expose internal error details to the client
  if (res.status >= 500) {
    console.error("[login] Backend returned", res.status, data);
    return NextResponse.json(
      { message: "Our authentication service is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  // Forward backend 4xx error responses directly to the client
  if (!res.ok) {
    // Normalise error message — backend may use "error", "message", or "errors"
    const message =
      (data.message as string) ??
      (data.error as string) ??
      (Array.isArray(data.errors)
        ? (data.errors[0] as string)
        : typeof data.errors === "object"
          ? Object.values(data.errors as Record<string, string[]>)[0]?.[0]
          : undefined) ??
      "Login failed. Please check your credentials.";

    return NextResponse.json({ ...data, message }, { status: res.status });
  }

  // Extract token and customer from any common backend response shape
  const token: string =
    (data.token as string) ??
    (data.access_token as string) ??
    ((data.data as Record<string, unknown>)?.token as string) ??
    ((data.data as Record<string, unknown>)?.access_token as string) ??
    "";

  const rawCustomer =
    data.user ??
    data.customer ??
    (data.data as Record<string, unknown>)?.user ??
    (data.data as Record<string, unknown>)?.customer ??
    null;

  if (!token) {
    console.error("[login] Backend login succeeded but no token in response. Keys:", Object.keys(data));
  }

  const response = NextResponse.json({
    customer: rawCustomer,
    email_verified: (data.email_verified as boolean) ?? (rawCustomer as Record<string, unknown> | null)?.email_verified ?? true,
    must_reset: (data.must_reset as boolean) ?? false,
  });

  if (token) {
    response.cookies.set("customer_token", token, COOKIE_OPTS);
  }

  return response;
}
