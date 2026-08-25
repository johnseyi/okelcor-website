/**
 * CRM-3B: Actionable work queue for the logged-in admin.
 * GET → GET /admin/my-work
 * Returns: { data: MyWorkItem[] }
 *
 * Graceful: returns empty list if endpoint unavailable (backend not deployed yet).
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const BASE = `${process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"}/admin`;

export async function GET() {
  const store = await cookies();
  const tk = store.get("admin_token")?.value;
  if (!tk) return NextResponse.json({ data: [] }, { status: 200 });

  try {
    const res = await fetch(`${BASE}/my-work`, {
      headers: { Authorization: `Bearer ${tk}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ data: [] }, { status: 200 });
    const json = await res.json().catch(() => ({ data: [] }));

    // The API returns `data` GROUPED by kind ({ assigned_leads: [...],
    // finance_tasks: [...], ... }); this page renders a flat list and
    // sections it by each item's own `type`. The old `json.data ?? []`
    // passed the object through, Array.isArray failed downstream, and
    // My Work rendered empty for everyone, always. Flatten here.
    const raw = json.data;
    const flat = Array.isArray(raw)
      ? raw
      : Object.values(raw ?? {}).flatMap((group) => (Array.isArray(group) ? group : []));

    return NextResponse.json({ data: flat, meta: json.meta ?? {} }, { status: 200 });
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
