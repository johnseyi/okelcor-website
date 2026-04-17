import { NextResponse } from "next/server";

const WHEEL_SIZE_KEY = process.env.WHEEL_SIZE_API_KEY ?? "";
const BASE = "https://api.wheel-size.com/v2";

export async function GET() {
  if (!WHEEL_SIZE_KEY) {
    return NextResponse.json({ error: "Car lookup not configured (missing WHEEL_SIZE_API_KEY)" }, { status: 503 });
  }

  try {
    const res = await fetch(`${BASE}/makes/?user_key=${WHEEL_SIZE_KEY}`, {
      next: { revalidate: 86400 }, // makes list is stable — cache 24 h
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to load makes from Wheel-Size API" }, { status: 502 });
    }

    const json = await res.json() as { data?: { slug: string; name: string }[] };
    const makes = (json.data ?? json) as { slug: string; name: string }[];
    return NextResponse.json({ makes });
  } catch {
    return NextResponse.json({ error: "Could not reach the vehicle data service" }, { status: 503 });
  }
}
