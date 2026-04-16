/**
 * POST /api/admin/products/import
 *
 * Proxy to POST /api/v1/admin/products/import on the Laravel backend.
 * Reads admin_token from the httpOnly cookie server-side, then pipes the
 * multipart/form-data body (containing the CSV file) straight through to
 * the backend without buffering to avoid Vercel's request-body size limit.
 *
 * Expected response shape from the backend:
 * {
 *   imported: number,
 *   updated:  number,
 *   skipped:  number,
 *   errors:   { row: number; message: string }[]
 * }
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin/products/import`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "content-type": contentType,
      },
      body: request.body,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore  Node 18+ requires duplex when body is a ReadableStream
      duplex: "half",
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

  const json = await res.json().catch(() => ({
    error: "The server returned an unreadable response.",
  }));

  if (res.ok) {
    revalidateTag("products");
    revalidatePath("/shop", "page");
    revalidatePath("/shop/[id]", "page");
    revalidatePath("/admin/products");
  }

  return NextResponse.json(json, { status: res.status });
}
