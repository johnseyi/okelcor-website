import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/promotions/active`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return NextResponse.json({ data: [] });
    const json = await res.json();
    // Backend may return a single object or an array — normalise to array
    const raw = json.data ?? json;
    const data = Array.isArray(raw) ? raw : raw && typeof raw === "object" && raw.id ? [raw] : [];
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
