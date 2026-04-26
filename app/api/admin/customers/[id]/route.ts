/**
 * /api/admin/customers/[id]
 * GET  → fetch customer detail (status, last_login, notes, etc.)
 * PATCH → update status or admin_notes
 * DELETE → delete customer account
 */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

async function token() {
  const s = await cookies();
  return s.get("admin_token")?.value ?? null;
}

function unauth() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await token();
  if (!tk) return unauth();
  const { id } = await params;

  try {
    // Try the individual detail endpoint first
    const res = await fetch(`${BASE}/customers/${id}`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json().catch(() => ({}));
      return NextResponse.json(json);
    }

    // Backend returned 404 (endpoint not yet implemented) — fall back to
    // fetching the paginated list and finding the customer by ID.
    if (res.status === 404) {
      let page = 1;
      while (page <= 10) { // cap at 10 pages (500 customers @ per_page=50)
        const listRes = await fetch(`${BASE}/customers?per_page=50&page=${page}`, {
          headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
          cache: "no-store",
        });
        if (!listRes.ok) break;
        const listData = await listRes.json().catch(() => null);
        const rows: Record<string, unknown>[] = listData?.data ?? listData ?? [];
        if (!Array.isArray(rows) || rows.length === 0) break;

        const match = rows.find(c => String(c.id) === String(id));
        if (match) return NextResponse.json(match);

        // If we've seen fewer rows than the page size we've exhausted the list
        if (rows.length < 50) break;
        page++;
      }
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await token();
  if (!tk) return unauth();
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const res = await fetch(`${BASE}/customers/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tk}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tk = await token();
  if (!tk) return unauth();
  const { id } = await params;

  try {
    const res = await fetch(`${BASE}/customers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}
