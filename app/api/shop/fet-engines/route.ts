import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams();
  if (searchParams.get("category")) params.set("category", searchParams.get("category")!);
  if (searchParams.get("search"))   params.set("search",   searchParams.get("search")!);
  if (searchParams.get("page"))     params.set("page",     searchParams.get("page")!);
  params.set("per_page", "50");

  try {
    const res = await fetch(`${API_URL}/fet/engines?${params}`, {
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ data: [], meta: {} });
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ data: [], meta: {} });
  }
}
