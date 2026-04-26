/**
 * GET /api/admin/sentry/stats
 *
 * Fetches error stats from the Sentry API for the admin dashboard card.
 * Returns gracefully when Sentry credentials are not configured.
 *
 * Required env vars:
 *   SENTRY_AUTH_TOKEN  — internal integration token from sentry.io/settings/{org}/auth-tokens/
 *   SENTRY_ORG         — organisation slug (e.g. "okelcor")
 *   SENTRY_PROJECT     — project slug (e.g. "okelcor")
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const SENTRY_API = "https://sentry.io/api/0";

function sentryHeaders() {
  return {
    Authorization: `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
    Accept:        "application/json",
  };
}

function isConfigured(): boolean {
  return !!(
    process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT
  );
}

async function fetchIssueCount(params: Record<string, string>): Promise<number> {
  const org     = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  const url     = new URL(`${SENTRY_API}/projects/${org}/${project}/issues/`);
  url.searchParams.set("limit", "1");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { headers: sentryHeaders(), cache: "no-store" });
  if (!res.ok) return 0;

  // Sentry returns total count in the X-Hits header
  const hits = res.headers.get("X-Hits");
  return hits ? parseInt(hits, 10) : 0;
}

async function fetchTopIssue(): Promise<{ title: string; count: number; id: string } | null> {
  const org     = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  const url     = new URL(`${SENTRY_API}/projects/${org}/${project}/issues/`);
  url.searchParams.set("query",       "is:unresolved");
  url.searchParams.set("sort",        "freq");
  url.searchParams.set("statsPeriod", "7d");
  url.searchParams.set("limit",       "1");

  const res = await fetch(url.toString(), { headers: sentryHeaders(), cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json().catch(() => []) as { id: string; title: string; count: string }[];
  if (!Array.isArray(data) || data.length === 0) return null;

  const top = data[0];
  return {
    id:    top.id,
    title: top.title,
    count: parseInt(top.count ?? "0", 10),
  };
}

export async function GET() {
  // Auth check — dashboard only
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isConfigured()) {
    return NextResponse.json({
      configured:  false,
      unresolved:  null,
      last24h:     null,
      topIssue:    null,
    });
  }

  try {
    const [unresolved, last24h, topIssue] = await Promise.all([
      fetchIssueCount({ query: "is:unresolved" }),
      fetchIssueCount({ query: "is:unresolved", statsPeriod: "24h" }),
      fetchTopIssue(),
    ]);

    const org     = process.env.SENTRY_ORG;
    const project = process.env.SENTRY_PROJECT;

    return NextResponse.json({
      configured: true,
      unresolved,
      last24h,
      topIssue,
      sentryUrl: `https://sentry.io/organizations/${org}/issues/?project=${project}`,
    });
  } catch (err) {
    console.error("[sentry/stats] fetch error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({
      configured: true,
      unresolved: null,
      last24h:    null,
      topIssue:   null,
      error:      "Could not reach Sentry API",
    });
  }
}
