/**
 * lib/site-settings.ts
 *
 * Fetches public (non-sensitive) site settings from the backend.
 * - Called server-side only (Server Components, API routes, layouts)
 * - Cached via Next.js ISR — refreshes every 60 seconds
 * - Gracefully returns {} if the endpoint is unavailable
 *
 * Backend endpoint required: GET /api/v1/settings/public
 * Returns either:
 *   { data: [{ key, value }] }          ← array envelope
 *   { data: { key: value, ... } }       ← map envelope
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type SiteSettings = Record<string, string>;

// Rewrite any stale okelcor.de email addresses to okelcor.com across all settings
function normalizeSettings(settings: SiteSettings): SiteSettings {
  const out: SiteSettings = {};
  for (const [k, v] of Object.entries(settings)) {
    out[k] = typeof v === "string" ? v.replace(/@okelcor\.de\b/g, "@okelcor.com") : v;
  }
  return out;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_URL}/settings/public`, {
      next: { revalidate: 60 }, // ISR: re-fetch at most once per 60 s
    });
    if (!res.ok) return {};
    const json = await res.json();

    // Array envelope: { data: [{ key: "company_email", value: "..." }] }
    if (Array.isArray(json.data)) {
      return normalizeSettings(
        Object.fromEntries(
          (json.data as { key: string; value: string }[]).map((s) => [s.key, s.value])
        )
      );
    }
    // Map envelope: { data: { company_email: "..." } }
    if (json.data && typeof json.data === "object") {
      return normalizeSettings(json.data as SiteSettings);
    }
    return {};
  } catch {
    // Endpoint not yet live — fall through; components use constants.ts defaults
    return {};
  }
}
