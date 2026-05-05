import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("customer_token")?.value;

  let parsed: unknown;
  let body: string;
  try {
    parsed = await request.json();
    body = JSON.stringify(parsed);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // DEBUG: log payload received (no tokens logged — remove after fix confirmed)
  console.log("[tax-preview/route] payload received →", body);
  console.log("[tax-preview/route] has token →", !!token);
  console.log("[tax-preview/route] target →", `${API_URL}/payments/tax-preview`);

  try {
    const res = await fetch(`${API_URL}/payments/tax-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
    });
    const text = await res.text();

    // DEBUG: backend response (remove after fix confirmed)
    console.log("[tax-preview/route] backend status →", res.status);
    console.log("[tax-preview/route] backend response →", text.substring(0, 600));

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    console.log("[tax-preview/route] fetch error →", (err as Error).message);
    return NextResponse.json({ error: "Could not reach tax service." }, { status: 502 });
  }
}
