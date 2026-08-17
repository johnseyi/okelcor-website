import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — `staff.self`. Own entries; a colleague's needs `staff.view_team`. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/staff/contributions", tk, { search: req.nextUrl.searchParams });
}

/**
 * POST — `staff.self`. JSON, or multipart when evidence rides along.
 *
 * The file is accepted on create rather than only afterwards, for the same
 * reason the finance invoice upload is: people have the artifact in front of
 * them while they are writing the entry, and a separate "now attach it" step is
 * a step that gets skipped.
 *
 * The 201-with-a-message case — entry saved, file did not — is forwarded as-is.
 * That is not a plain success and must not be rendered as one.
 */
export async function POST(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
    }
    try {
      const res = await fetch(`${ADMIN_BASE}/staff/contributions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
        body: form,
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));
      return NextResponse.json(json, { status: res.status });
    } catch {
      return NextResponse.json({ error: "Network error" }, { status: 502 });
    }
  }

  const body = await req.json().catch(() => ({}));
  return forward("/staff/contributions", tk, { method: "POST", body });
}
