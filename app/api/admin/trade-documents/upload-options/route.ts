import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

/**
 * GET /api/admin/trade-documents/upload-options
 *
 * Feeds both fields of the document upload dialog: the controlled `type`
 * vocabulary (which drives supersede, payment gating and customer visibility)
 * and the previously-used "File as" labels, which are free text.
 *
 * Degrades to 404/405 as-is — the caller falls back to its built-in type list
 * so the upload dialog still works against a backend without this route.
 */
export async function GET() {
  const tk = (await cookies()).get("admin_token")?.value;
  if (!tk) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${BASE}/trade-documents/upload-options`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "Network error" }, { status: 502 });
  }
}
