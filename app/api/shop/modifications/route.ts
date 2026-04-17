import { NextRequest, NextResponse } from "next/server";

const WHEEL_SIZE_KEY = process.env.WHEEL_SIZE_API_KEY ?? "";
const BASE = "https://api.wheel-size.com/v2";

export async function GET(req: NextRequest) {
  const make  = req.nextUrl.searchParams.get("make")  ?? "";
  const model = req.nextUrl.searchParams.get("model") ?? "";
  const year  = req.nextUrl.searchParams.get("year")  ?? "";

  if (!make.trim() || !model.trim() || !year.trim()) {
    return NextResponse.json({ error: "make, model, and year are required" }, { status: 400 });
  }

  if (!WHEEL_SIZE_KEY) {
    return NextResponse.json({ error: "Car lookup not configured" }, { status: 503 });
  }

  console.log("[modifications] Fetching for:", { make, model, year });

  try {
    const res = await fetch(
      `${BASE}/modifications/?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(year)}&user_key=${WHEEL_SIZE_KEY}`,
      { cache: "no-store" },
    );

    console.log("[modifications] API status:", res.status);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.log("[modifications] Error body:", errText);
      return NextResponse.json({ error: "Failed to load modifications" }, { status: 502 });
    }

    const json = await res.json() as { data?: unknown[] };
    console.log("[modifications] Raw data:", JSON.stringify(json).slice(0, 1000));
    const raw  = Array.isArray(json.data) ? json.data : [];

    // Normalise to { slug, name } — the API returns objects with at minimum a slug field
    const modifications = raw.map((m) => {
      const obj  = m as Record<string, unknown>;
      const slug = (obj.slug ?? obj.id ?? "") as string;
      // Build a human-readable label from available fields
      const parts: string[] = [];
      if (obj.trim_level)   parts.push(String(obj.trim_level));
      if (obj.body)         parts.push(String(obj.body));
      if (obj.power)        parts.push(`${obj.power}hp`);
      if (obj.drive)        parts.push(String(obj.drive).toUpperCase());
      const name = parts.length > 0
        ? parts.join(" · ")
        : (obj.name ?? obj.slug ?? slug) as string;
      return { slug, name };
    }).filter((m) => m.slug);

    console.log("[modifications] Mapped modifications:", JSON.stringify(modifications));
    return NextResponse.json({ modifications });
  } catch {
    return NextResponse.json({ error: "Could not reach the vehicle data service" }, { status: 503 });
  }
}
