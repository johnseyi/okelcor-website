import { adminToken } from "@/lib/partner-proxy";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

/**
 * GET /api/admin/partner-sales/export — CSV for the books.
 *
 * This is the feature the whole system exists for: head office could not get
 * numbers out of paper reports.
 *
 * Unlike the sibling routes this does NOT parse JSON. The upstream endpoint
 * streams CSV via `streamDownload`, and buffering it here would defeat the
 * point and cap the export at whatever fits in memory. The body is piped
 * straight through and the upstream `Content-Disposition` is preserved so the
 * browser downloads a properly-named file.
 *
 * The bearer token is attached server-side, which is why this is proxied at
 * all — a token-protected download cannot be triggered by a plain `<a href>`,
 * since there is nowhere to put the header.
 *
 * Known limit, flagged by backend: a very large export (year-end, all markets)
 * could exceed the serverless function duration. If that happens the fix is
 * for the backend to generate to storage and return a signed URL — no contract
 * change, and nothing to do until row counts actually warrant it.
 */
export async function GET(request: Request) {
  const token = await adminToken();
  if (!token) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const incoming = new URL(request.url).searchParams;
  const qs = new URLSearchParams();
  for (const k of ["partner", "market", "from", "to", "status", "currency", "include_deleted"]) {
    const v = incoming.get(k);
    if (v) qs.set(k, v);
  }

  try {
    const upstream = await fetch(`${BASE}/partner-sales/export?${qs}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "text/csv" },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "export_failed", status: upstream.status },
        { status: upstream.status >= 500 ? 502 : upstream.status }
      );
    }

    const filename =
      upstream.headers.get("content-disposition") ??
      `attachment; filename="partner-sales.csv"`;

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "text/csv; charset=utf-8",
        "Content-Disposition": filename,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}
