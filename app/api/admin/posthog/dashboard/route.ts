/**
 * /api/admin/posthog/dashboard
 *
 * Extended PostHog stats for the admin dashboard:
 * active users, top pages, top countries, traffic sources, recent events.
 * Uses the same HogQL pattern as /api/admin/posthog/stats.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const HOST    = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/$/, "");
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

// ── Project ID (module-level cache) ─────────────────────────────────────────
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

// ── HogQL query ──────────────────────────────────────────────────────────────
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

const rows = (r: unknown[][] | null) => r ?? [];

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!API_KEY) {
    return NextResponse.json({ error: "POSTHOG_PERSONAL_API_KEY not configured", step: "config" }, { status: 503 });
  }

  const projectId = await getProject();
  if (!projectId) {
    return NextResponse.json({ error: "Could not resolve PostHog project ID.", step: "project" }, { status: 502 });
  }

  const [activeRes, todayRes, pageRes, countriesRes, sourcesRes, eventsRes] = await Promise.all([
    hogql(projectId, `SELECT count(distinct person_id) FROM events WHERE timestamp > now() - interval 5 minute`),

    hogql(projectId,
      `SELECT count(distinct properties['$session_id'])
       FROM events WHERE event = '$pageview' AND toDate(timestamp) = today()`),

    hogql(projectId,
      `SELECT coalesce(properties['$pathname'], '/') as path, count() as views
       FROM events WHERE event = '$pageview' AND toDate(timestamp) = today()
       GROUP BY path ORDER BY views DESC LIMIT 8`),

    hogql(projectId,
      `SELECT
         coalesce(properties['$geoip_country_code'], 'XX') as code,
         coalesce(properties['$geoip_country_name'], 'Unknown') as name,
         count() as visits
       FROM events WHERE event = '$pageview' AND toDate(timestamp) = today()
         AND notEmpty(properties['$geoip_country_code'])
       GROUP BY code, name ORDER BY visits DESC LIMIT 10`),

    hogql(projectId,
      `SELECT
         multiIf(
           empty(properties['$referring_domain']) OR properties['$referring_domain'] = '$direct', 'Direct',
           properties['$referring_domain'] LIKE '%google%', 'Google',
           properties['$referring_domain'] LIKE '%bing%', 'Bing',
           properties['$referring_domain'] LIKE '%facebook%', 'Facebook',
           properties['$referring_domain'] LIKE '%instagram%', 'Instagram',
           properties['$referring_domain'] LIKE '%linkedin%', 'LinkedIn',
           properties['$referring_domain'] LIKE '%yahoo%', 'Yahoo',
           'Other'
         ) as source,
         count() as visits
       FROM events WHERE event = '$pageview' AND toDate(timestamp) = today()
       GROUP BY source ORDER BY visits DESC LIMIT 8`),

    hogql(projectId,
      `SELECT timestamp, event, coalesce(properties['$current_url'], properties['$pathname'], '') as url
       FROM events
       WHERE timestamp >= now() - interval 2 hour
         AND event NOT IN ('$autocapture','$feature_flag_called','$$heatmap','$rageclick','$heartbeat','$web_vitals')
       ORDER BY timestamp DESC LIMIT 10`),
  ]);

  const activeUsersNow = Number(rows(activeRes)[0]?.[0] ?? 0);
  const sessionsToday  = Number(rows(todayRes)[0]?.[0]  ?? 0);

  const topPages = rows(pageRes).map(r => ({ path: String(r[0] ?? "/"), views: Number(r[1] ?? 0) }));

  const topCountries = rows(countriesRes).map(r => ({
    code:   String(r[0] ?? "XX"),
    name:   String(r[1] ?? "Unknown"),
    visits: Number(r[2] ?? 0),
  }));

  const trafficSources = rows(sourcesRes).map(r => ({
    source: String(r[0] ?? "Other"),
    visits: Number(r[1] ?? 0),
  }));

  const recentEvents = rows(eventsRes).map(r => ({
    timestamp: String(r[0] ?? ""),
    event:     String(r[1] ?? ""),
    url:       String(r[2] ?? ""),
  }));

  return NextResponse.json({ activeUsersNow, sessionsToday, topPages, topCountries, trafficSources, recentEvents });
}
