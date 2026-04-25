/**
 * /api/admin/posthog/funnel
 * Returns the shop conversion funnel + top viewed products (last 7 days).
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const HOST    = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/$/, "");
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

let cachedProject: number | null = null;

async function getProject(): Promise<number | null> {
  if (cachedProject) return cachedProject;
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${HOST}/api/projects/`, {
      headers: { Authorization: `Bearer ${API_KEY}` }, cache: "no-store",
    });
    if (!res.ok) return null;
    const j = await res.json().catch(() => null);
    const id: number | undefined = j?.results?.[0]?.id;
    if (id) cachedProject = id;
    return id ?? null;
  } catch { return null; }
}

async function hogql(projectId: number, query: string): Promise<unknown[][] | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${HOST}/api/projects/${projectId}/query/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const j = await res.json().catch(() => null);
    return Array.isArray(j?.results) ? j.results : null;
  } catch { return null; }
}

const n = (r: unknown[][] | null) => Number(r?.[0]?.[0] ?? 0);

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!API_KEY) return NextResponse.json({ error: "PostHog not configured" }, { status: 503 });

  const projectId = await getProject();
  if (!projectId) return NextResponse.json({ error: "PostHog project not found" }, { status: 502 });

  const [shopRes, specRes, cartRes, checkoutRes, topProdRes] = await Promise.all([
    hogql(projectId,
      `SELECT count(distinct properties['$session_id']) FROM events
       WHERE event = '$pageview' AND properties['$pathname'] LIKE '/shop%'
         AND toDate(timestamp) = today()`),

    hogql(projectId,
      `SELECT count(distinct properties['$session_id']) FROM events
       WHERE event = 'tyre_spec_selected' AND toDate(timestamp) = today()`),

    hogql(projectId,
      `SELECT count(distinct properties['$session_id']) FROM events
       WHERE event = 'add_to_cart' AND toDate(timestamp) = today()`),

    hogql(projectId,
      `SELECT count(distinct properties['$session_id']) FROM events
       WHERE event = 'checkout_started' AND toDate(timestamp) = today()`),

    hogql(projectId,
      `SELECT
         coalesce(properties['product_name'], 'Unknown') as name,
         coalesce(properties['brand'], '') as brand,
         count() as views
       FROM events
       WHERE event = 'product_viewed'
         AND timestamp >= now() - interval 7 day
         AND notEmpty(properties['product_name'])
       GROUP BY name, brand
       ORDER BY views DESC LIMIT 5`),
  ]);

  const funnel = [
    { step: "Shop visited",         count: n(shopRes) },
    { step: "Tyre spec selected",   count: n(specRes) },
    { step: "Added to cart",        count: n(cartRes) },
    { step: "Checkout started",     count: n(checkoutRes) },
  ];

  const topProducts = (topProdRes ?? []).map(r => ({
    name:  String(r[0] ?? "Unknown"),
    brand: String(r[1] ?? ""),
    views: Number(r[2] ?? 0),
  }));

  return NextResponse.json({ funnel, topProducts });
}
