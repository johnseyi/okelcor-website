import { NextRequest, NextResponse } from "next/server";

const WHEEL_SIZE_KEY = process.env.WHEEL_SIZE_API_KEY ?? "";
const BASE = "https://api.wheel-size.com/v2";

export async function GET(req: NextRequest) {
  const make  = req.nextUrl.searchParams.get("make")  ?? "";
  const model = req.nextUrl.searchParams.get("model") ?? "";

  if (!make.trim() || !model.trim()) {
    return NextResponse.json({ error: "make and model are required" }, { status: 400 });
  }

  if (!WHEEL_SIZE_KEY) {
    return NextResponse.json({ error: "Car lookup not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `${BASE}/years/?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&user_key=${WHEEL_SIZE_KEY}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to load years" }, { status: 502 });
    }

    const json = await res.json() as { data?: unknown[] };
    const raw  = Array.isArray(json.data) ? json.data : [];

    // Normalise: API may return integers or objects with a slug/name field
    const years: number[] = raw
      .map((y) => {
        if (typeof y === "number") return y;
        if (typeof y === "string") return parseInt(y, 10);
        const obj = y as Record<string, unknown>;
        return typeof obj.slug === "string"
          ? parseInt(obj.slug, 10)
          : typeof obj.name === "string"
            ? parseInt(obj.name, 10)
            : NaN;
      })
      .filter((y) => !isNaN(y))
      .sort((a, b) => b - a); // newest first

    return NextResponse.json({ years });
  } catch {
    return NextResponse.json({ error: "Could not reach the vehicle data service" }, { status: 503 });
  }
}
