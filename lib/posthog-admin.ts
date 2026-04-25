/**
 * lib/posthog-admin.ts
 *
 * Server-side helper for querying PostHog via the REST API.
 * Uses POSTHOG_PERSONAL_API_KEY — never exposed to the browser.
 */

const HOST    = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

export type PostHogStats = {
  activeUsersNow:    number;
  sessionsToday:     number;
  sessionsYesterday: number;
  topPages:          { path: string; views: number }[];
  recentEvents:      { timestamp: string; event: string; url: string }[];
};

// ── Project ID discovery (cached per process lifetime) ──────────────────────

let cachedProjectId: number | null = null;

async function getProjectId(): Promise<number | null> {
  if (cachedProjectId) return cachedProjectId;
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${HOST}/api/projects/`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const id: number | undefined = json.results?.[0]?.id;
    if (id) cachedProjectId = id;
    return id ?? null;
  } catch {
    return null;
  }
}

// ── HogQL query helper ───────────────────────────────────────────────────────

async function hogql(
  projectId: number,
  query: string
): Promise<unknown[][] | null> {
  if (!API_KEY) return null;
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
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.results) ? json.results : null;
  } catch {
    return null;
  }
}

// ── Public fetch function ────────────────────────────────────────────────────

export async function fetchPostHogStats(): Promise<PostHogStats | null> {
  if (!API_KEY) return null;

  const projectId = await getProjectId();
  if (!projectId) return null;

  const [activeRows, sessionRows, pageRows, eventRows] = await Promise.all([
    // Active users: distinct people who sent any event in the last 5 minutes
    hogql(
      projectId,
      `SELECT count(distinct person_id)
       FROM events
       WHERE timestamp > now() - interval 5 minute`
    ),

    // Sessions today vs yesterday: count distinct session_ids per day
    hogql(
      projectId,
      `SELECT
         countIf(toDate(timestamp) = today())     as today_sessions,
         countIf(toDate(timestamp) = yesterday()) as yesterday_sessions
       FROM events
       WHERE event = '$pageview'
         AND toDate(timestamp) >= yesterday()`
    ),

    // Top pages today by pageview count
    hogql(
      projectId,
      `SELECT
         coalesce(properties.$pathname, '/') as path,
         count()                             as views
       FROM events
       WHERE event = '$pageview'
         AND toDate(timestamp) = today()
       GROUP BY path
       ORDER BY views DESC
       LIMIT 8`
    ),

    // Recent events (last hour, excluding noise)
    hogql(
      projectId,
      `SELECT
         timestamp,
         event,
         coalesce(properties.$current_url, properties.$pathname, '') as url
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

  const activeUsersNow    = Number(activeRows?.[0]?.[0] ?? 0);
  const sessionsToday     = Number(sessionRows?.[0]?.[0] ?? 0);
  const sessionsYesterday = Number(sessionRows?.[0]?.[1] ?? 0);

  const topPages = (pageRows ?? []).map((r) => ({
    path:  String(r[0] ?? "/"),
    views: Number(r[1] ?? 0),
  }));

  const recentEvents = (eventRows ?? []).map((r) => ({
    timestamp: String(r[0] ?? ""),
    event:     String(r[1] ?? ""),
    url:       String(r[2] ?? ""),
  }));

  return { activeUsersNow, sessionsToday, sessionsYesterday, topPages, recentEvents };
}
