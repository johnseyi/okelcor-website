import { NextRequest, NextResponse } from "next/server";

// Public endpoint — no auth token required.
// Proxies to the Laravel tracking API so the backend URL stays server-side
// and both the admin UI and customer-facing pages can use /api/tracking/:container.

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ container: string }> },
) {
  const { container } = await params;

  if (!container?.trim()) {
    return NextResponse.json({ error: "Container number is required" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${API_URL}/tracking/${encodeURIComponent(container.trim())}`,
      { cache: "no-store" },
    );

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      return NextResponse.json(
        { error: "No tracking data found for this container." },
        { status: res.ok ? 404 : res.status },
      );
    }

    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { error: "Could not reach the tracking service." },
      { status: 503 },
    );
  }
}
