import { NextRequest, NextResponse } from "next/server";

const WHEEL_SIZE_KEY = process.env.WHEEL_SIZE_API_KEY ?? "";
const BASE = "https://api.wheel-size.com/v2";

export async function GET(req: NextRequest) {
  const make = req.nextUrl.searchParams.get("make") ?? "";

  if (!make.trim()) {
    return NextResponse.json({ error: "make query parameter is required" }, { status: 400 });
  }

  if (!WHEEL_SIZE_KEY) {
    return NextResponse.json({ error: "Car lookup not configured (missing WHEEL_SIZE_API_KEY)" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `${BASE}/models/?make=${encodeURIComponent(make)}&user_key=${WHEEL_SIZE_KEY}`,
      { next: { revalidate: 86400 } },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to load models from Wheel-Size API" }, { status: 502 });
    }

    const json = await res.json() as { data?: { slug: string; name: string }[] };
    const models = (json.data ?? json) as { slug: string; name: string }[];
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ error: "Could not reach the vehicle data service" }, { status: 503 });
  }
}
