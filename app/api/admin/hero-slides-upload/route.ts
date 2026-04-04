/**
 * POST /api/admin/hero-slides-upload?id={slideId}
 *
 * Route Handler (not a Server Action) — no body size limit.
 * Proxies the multipart FormData directly to the Laravel API.
 * FormData fields: `media` (file) + `media_type` ("image" | "video")
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function POST(req: NextRequest) {
  // Auth
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Slide id from query param
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing slide id." }, { status: 400 });
  }

  // Parse the incoming multipart body
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse upload." }, { status: 400 });
  }

  // Forward to Laravel
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/hero-slides/${id}/media`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch {
    return NextResponse.json({ error: "Network error. Could not reach the server." }, { status: 502 });
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: json.message || `Upload failed (HTTP ${res.status}).` },
      { status: res.status }
    );
  }

  // Bust caches
  revalidatePath("/admin/hero-slides");
  revalidatePath("/", "page");

  return NextResponse.json({ ok: true });
}
