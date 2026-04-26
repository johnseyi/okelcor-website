import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA_PROPERTY_ID ?? "";

function getClient() {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey  = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey || !propertyId) return null;

  return new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });
}

export type GaOverview = {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number; // seconds
  bounceRate: number;         // 0–100
};

export type GaDayPoint = {
  date: string; // "YYYY-MM-DD"
  sessions: number;
  pageViews: number;
};

export type GaTopPage = {
  path: string;
  pageViews: number;
};

export type GaTrafficSource = {
  source: string;
  sessions: number;
};

export type GaCountry = {
  country: string;
  sessions: number;
};

// ── helpers ───────────────────────────────────────────────────────────────────

function num(val: string | null | undefined): number {
  return val ? Math.round(Number(val)) : 0;
}

function fmt(val: string | null | undefined): string {
  return val ?? "(not set)";
}

// ── Overview metrics ──────────────────────────────────────────────────────────

export async function fetchGaOverview(
  startDate: string,
  endDate: string
): Promise<GaOverview | null> {
  try {
    const client = getClient();
    if (!client) return null;

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    });

    const row = response.rows?.[0]?.metricValues ?? [];
    return {
      activeUsers:        num(row[0]?.value),
      sessions:           num(row[1]?.value),
      pageViews:          num(row[2]?.value),
      avgSessionDuration: num(row[3]?.value),
      bounceRate:         Math.round(Number(row[4]?.value ?? 0) * 100),
    };
  } catch (e) {
    console.error("[GA] fetchGaOverview error:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

// ── Daily trend ───────────────────────────────────────────────────────────────

export async function fetchGaDailyTrend(
  startDate: string,
  endDate: string
): Promise<GaDayPoint[]> {
  try {
    const client = getClient();
    if (!client) return [];

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    return (response.rows ?? []).map((row) => {
      const raw  = row.dimensionValues?.[0]?.value ?? "";
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
      return {
        date,
        sessions:  num(row.metricValues?.[0]?.value),
        pageViews: num(row.metricValues?.[1]?.value),
      };
    });
  } catch (e) {
    console.error("[GA] fetchGaDailyTrend error:", e instanceof Error ? e.message : String(e));
    return [];
  }
}

// ── Top pages ─────────────────────────────────────────────────────────────────

export async function fetchGaTopPages(
  startDate: string,
  endDate: string,
  limit = 10
): Promise<GaTopPage[]> {
  try {
    const client = getClient();
    if (!client) return [];

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    });

    return (response.rows ?? []).map((row) => ({
      path:      fmt(row.dimensionValues?.[0]?.value),
      pageViews: num(row.metricValues?.[0]?.value),
    }));
  } catch (e) {
    console.error("[GA] fetchGaTopPages error:", e instanceof Error ? e.message : String(e));
    return [];
  }
}

// ── Traffic sources ───────────────────────────────────────────────────────────

export async function fetchGaTrafficSources(
  startDate: string,
  endDate: string,
  limit = 8
): Promise<GaTrafficSource[]> {
  try {
    const client = getClient();
    if (!client) return [];

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    return (response.rows ?? []).map((row) => ({
      source:   fmt(row.dimensionValues?.[0]?.value),
      sessions: num(row.metricValues?.[0]?.value),
    }));
  } catch (e) {
    console.error("[GA] fetchGaTrafficSources error:", e instanceof Error ? e.message : String(e));
    return [];
  }
}

// ── Top countries ─────────────────────────────────────────────────────────────

export async function fetchGaCountries(
  startDate: string,
  endDate: string,
  limit = 8
): Promise<GaCountry[]> {
  try {
    const client = getClient();
    if (!client) return [];

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    return (response.rows ?? []).map((row) => ({
      country:  fmt(row.dimensionValues?.[0]?.value),
      sessions: num(row.metricValues?.[0]?.value),
    }));
  } catch (e) {
    console.error("[GA] fetchGaCountries error:", e instanceof Error ? e.message : String(e));
    return [];
  }
}
