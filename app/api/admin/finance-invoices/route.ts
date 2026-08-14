import { NextRequest, NextResponse } from "next/server";
import { ADMIN_BASE, adminToken, forward, unauthorized } from "@/lib/admin-proxy";

export const dynamic = "force-dynamic";

/** GET — finance.view. Filters: from, to, channel, system, matched, q, per_page. */
export async function GET(req: NextRequest) {
  const tk = await adminToken();
  if (!tk) return unauthorized();
  return forward("/finance-invoices", tk, { search: req.nextUrl.searchParams });
}

/**
 * POST — finance.manage. JSON, or multipart when the sevDesk PDF rides along.
 *
 * The file is accepted on *create* rather than only on the row, because finance
 * has the PDF in front of them while they type the number: a separate "now
 * attach it" step is a step that gets skipped, and one round trip cannot half
 * happen the way two can.
 *
 * A duplicate `external_number` comes back as a 422 with
 * `errors.external_number`, which is forwarded as-is: the duplicate is the one
 * thing that would make the two sides of the board agree when they do not, so
 * the message belongs on the field rather than in a generic failure. So does the
 * 201-with-a-message case, where the record saved but the file did not — that is
 * not a plain success and must not be shown as one.
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
      const res = await fetch(`${ADMIN_BASE}/finance-invoices`, {
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
  return forward("/finance-invoices", tk, { method: "POST", body });
}
