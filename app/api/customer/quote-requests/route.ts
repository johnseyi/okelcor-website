import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const customerToken = request.cookies.get("customer_token")?.value;
  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let backendBody: BodyInit;
  let backendContentType: string | null = null; // null → let fetch set boundary for multipart

  if (isMultipart) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
    }
    backendBody = formData;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
    }
    backendBody = JSON.stringify(body);
    backendContentType = "application/json";
  }

  // ── Proxy to backend ─────────────────────────────────────────────────────────

  let backendData: unknown;
  let backendStatus: number;

  try {
    const res = await fetch(`${API_URL}/quote-requests`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(backendContentType ? { "Content-Type": backendContentType } : {}),
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
      },
      body: backendBody,
    });

    backendData = await res.json();
    backendStatus = res.status;
  } catch {
    return NextResponse.json(
      { message: "Could not reach the quote service. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json(backendData, { status: backendStatus });
}
