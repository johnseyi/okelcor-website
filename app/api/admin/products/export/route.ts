/**
 * GET /api/admin/products/export
 *
 * Proxy to GET /api/v1/admin/products/export on the Laravel backend.
 * Reads admin_token from the httpOnly cookie server-side, then streams
 * the CSV response back to the browser with the correct headers so the
 * browser triggers a file download.
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/products/export`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/csv, application/csv, */*",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the API server." },
      { status: 502 }
    );
  }

  if (res.status === 401) {
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: `Export failed (HTTP ${res.status}).` },
      { status: res.status }
    );
  }

  // Forward the CSV body and preserve Content-Disposition so the browser
  // downloads the file rather than trying to display it inline.
  const contentDisposition =
    res.headers.get("content-disposition") ??
    `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`;

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": contentDisposition,
    },
  });
}
