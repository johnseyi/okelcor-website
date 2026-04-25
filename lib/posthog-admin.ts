/**
 * lib/posthog-admin.ts
 *
 * Server-side helper for querying PostHog via the REST API.
 * Uses POSTHOG_PERSONAL_API_KEY — never exposed to the browser.
 *
 * NOTE: POSTHOG_PERSONAL_API_KEY must be a Personal API Key (starts with phx_),
 * NOT a Project API Key (phc_). Get it from PostHog → Personal Settings → API Keys.
 */

const HOST    = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(/\/$/, "");
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

export type PostHogStats = {
  activeUsersNow:    number;
  sessionsToday:     number;
  sessionsYesterday: number;
  topPages:          { path: string; views: number }[];
  recentEvents:      { timestamp: string; event: string; url: string }[];
};

export type PostHogResult =
  | { ok: true;  stats: PostHogStats }
  | { ok: false; error: string; step: string };

// ── Project ID discovery (cached per process lifetime) ──────────────────────

let cachedProjectId: number | null = null;

async function getProjectId(): Promise<{ id: number } | { error: string }> {
  if (cachedProjectId) return { id: cachedProjectId };
  if (!API_KEY) return { error: "POSTHOG_PERSONAL_API_KEY is not set" };

  let res: Response;
  try {
    res = await fetch(`${HOST}/api/projects/`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    });
  } catch (e) {
    return { error: `Network error reaching PostHog: ${String(e)}` };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      error: `PostHog /api/projects/ returned HTTP ${res.status}${res.status === 401 ? " — check that POSTHOG_PERSONAL_API_KEY is a Personal API Key (phx_…), not a Project API Key (phc_…)" : ""}. Body: ${body.slice(0, 200)}`,
    };
  }

  const json = await res.json().catch(() => null);
  const id: number | undefined = json?.results?.[0]?.id;
  if (!id) {
    return { error: `Could not parse project ID from response: ${JSON.stringify(json).slice(0, 200)}` };
  }

  cachedProjectId = id;
  return { id };
}

// ── HogQL query helper ───────────────────────────────────────────────────────

type HogqlResult = { rows: unknown[][] } | { error: string };

async function hogql(projectId: number, query: string): Promise<HogqlResult> {
  if (!API_KEY) return { error: "No API key" };
  try {
    const res = await fetch(`${HOST}/api/projects/${projectId}/query/`, {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { error: `HTTP ${res.status}: ${body.slice(0, 300)}` };
    }
    const json = await res.json().catch(() => null);
    if (!Array.isArray(json?.results)) {
      return { error: `Unexpected response shape: ${JSON.stringify(json).slice(0, 200)}` };
    }
    return { rows: json.results as unknown[][] };
  } catch (e) {
    return { error: String(e) };
  }
}

function rowsOf(r: HogqlResult): unknown[][] {
  return "rows" in r ? r.rows : [];
}

// ── Public fetch function ────────────────────────────────────────────────────

export async function fetchPostHogStats(): Promise<PostHogResult> {
  if (!API_KEY) {
    return { ok: false, error: "POSTHOG_PERSONAL_API_KEY environment variable is not set", step: "config" };
  }

  const projectRes = await getProjectId();
  if ("error" in projectRes) {
    return { ok: false, error: projectRes.error, step: "project_discovery" };
  }
  const projectId = projectRes.id;

  // Run all queries in parallel; individual failures return empty data, not a total failure.
  const [activeRes, todayRes, yesterdayRes, pageRes, eventRes] = await Promise.all([
    // Active users: distinct people with any event in the last 5 minutes
    hogql(
      projectId,
      `SELECT count(distinct person_id)
       FROM events
       WHERE timestamp > now() - interval 5 minute`
    ),

    // Sessions today (pageview count as proxy)
    hogql(
      projectId,
      `SELECT count(distinct properties['$session_id'])
       FROM events
       WHERE event = '$pageview'
         AND toDate(timestamp) = today()`
    ),

    // Sessions yesterday
    hogql(
      projectId,
      `SELECT count(distinct properties['$session_id'])
       FROM events
       WHERE event = '$pageview'
         AND toDate(timestamp) = yesterday()`
    ),

    // Top pages today
    hogql(
      projectId,
      `SELECT
         coalesce(properties['$pathname'], '/') as path,
         count()                                as views
       FROM events
       WHERE event = '$pageview'
         AND toDate(timestamp) = today()
       GROUP BY path
       ORDER BY views DESC
       LIMIT 8`
    ),

    // Recent events (last 2 hours, excluding noise)
    hogql(
      projectId,
      `SELECT
         timestamp,
         event,
         coalesce(properties['$current_url'], properties['$pathname'], '') as url
       FROM events
       WHERE timestamp >= now() - interval 2 hour
         AND event NOT IN (
           '$autocapture', '$feature_flag_called',
           '$$heatmap', '$rageclick', '$heartbeat', '$web_vitals'
         )
       ORDER BY timestamp DESC
       LIMIT 10`
    ),
  ]);

  // Log any individual query errors server-side for debugging
  const queryErrors: string[] = [];
  for (const [name, res] of [
    ["active", activeRes], ["today", todayRes], ["yesterday", yesterdayRes],
    ["pages", pageRes], ["events", eventRes],
  ] as const) {
    if ("error" in res) queryErrors.push(`${name}: ${res.error}`);
  }
  if (queryErrors.length > 0) {
    console.error("[PostHog] Query errors:", queryErrors);
  }

  const activeUsersNow    = Number(rowsOf(activeRes)[0]?.[0]    ?? 0);
  const sessionsToday     = Number(rowsOf(todayRes)[0]?.[0]     ?? 0);
  const sessionsYesterday = Number(rowsOf(yesterdayRes)[0]?.[0] ?? 0);

  const topPages = rowsOf(pageRes).map((r) => ({
    path:  String(r[0] ?? "/"),
    views: Number(r[1] ?? 0),
  }));

  const recentEvents = rowsOf(eventRes).map((r) => ({
    timestamp: String(r[0] ?? ""),
    event:     String(r[1] ?? ""),
    url:       String(r[2] ?? ""),
  }));

  // Surface query errors to caller so the panel can display them
  if (queryErrors.length > 0 && activeUsersNow === 0 && sessionsToday === 0 && topPages.length === 0) {
    return {
      ok: false,
      error: `HogQL queries failed. First error: ${queryErrors[0]}`,
      step:  "hogql_queries",
    };
  }

  return {
    ok:    true,
    stats: { activeUsersNow, sessionsToday, sessionsYesterday, topPages, recentEvents },
  };
}
