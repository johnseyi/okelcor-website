/**
 * /api/admin/crisp
 *
 * Authenticated proxy to the Crisp REST API with:
 *  - In-memory conversation cache (5 min TTL) to absorb rate limits
 *  - Explicit 429 handling — serves cached data when rate-limited
 *  - Status field on every response so the UI can show a connectivity dot
 *
 * GET  ?action=conversations[&page=1]           → list conversations
 * GET  ?action=messages&session_id=xxx          → messages for a conversation
 * POST { action:"reply", session_id, content }  → send operator reply
 * POST { action:"resolve", session_id }         → mark conversation resolved
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const CRISP_BASE = "https://api.crisp.chat/v1";
const WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? "";

// Support both naming conventions for backwards compatibility
const IDENTIFIER =
  process.env.CRISP_API_IDENTIFIER ?? process.env.CRISP_IDENTIFIER ?? "";
const KEY =
  process.env.CRISP_API_KEY ?? process.env.CRISP_KEY ?? "";

// ── In-memory cache (best-effort; shared within a warm serverless instance) ──

interface CacheEntry { data: unknown; ts: number }
let convCache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Helpers ───────────────────────────────────────────────────────────────────

function crispAuth(): string {
  return "Basic " + Buffer.from(`${IDENTIFIER}:${KEY}`).toString("base64");
}

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin_token")?.value;
}

function crispConfigured(): boolean {
  return !!(WEBSITE_ID && IDENTIFIER && KEY);
}

async function crispFetch(path: string, options?: RequestInit) {
  return fetch(`${CRISP_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: crispAuth(),
      "X-Crisp-Tier": "website",
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!crispConfigured()) {
    return NextResponse.json(
      {
        error: "Crisp not configured. Add CRISP_IDENTIFIER and CRISP_KEY to environment variables.",
        crisp_status: "unconfigured",
      },
      { status: 503 }
    );
  }

  const { searchParams } = request.nextUrl;
  const action    = searchParams.get("action");
  const sessionId = searchParams.get("session_id");
  const page      = searchParams.get("page") ?? "1";

  // ── Conversations (with caching + rate-limit fallback) ────────────────────

  if (action === "conversations") {
    const now    = Date.now();
    const cached = convCache && (now - convCache.ts) < CACHE_TTL ? convCache : null;

    try {
      const res = await crispFetch(`/website/${WEBSITE_ID}/conversations/${page}`);

      // Rate limited — serve cached data if available
      if (res.status === 429) {
        if (cached) {
          return NextResponse.json(
            { ...(cached.data as object), crisp_status: "rate_limited", cached: true },
            { status: 200 }
          );
        }
        return NextResponse.json(
          { error: "Crisp API rate limit reached. No cached data available yet.", crisp_status: "rate_limited" },
          { status: 429 }
        );
      }

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Serve stale cache on any transient error
        if (cached) {
          return NextResponse.json(
            { ...(cached.data as object), crisp_status: "degraded", cached: true },
            { status: 200 }
          );
        }
        return NextResponse.json(
          { error: `Crisp API error (HTTP ${res.status})`, crisp_status: "error" },
          { status: res.status }
        );
      }

      // Success — update cache and return
      convCache = { data: { ...json, crisp_status: "connected" }, ts: now };
      return NextResponse.json({ ...json, crisp_status: "connected" }, { status: 200 });

    } catch {
      // Network/timeout — serve cached data if available
      if (cached) {
        return NextResponse.json(
          { ...(cached.data as object), crisp_status: "degraded", cached: true },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Could not reach Crisp API.", crisp_status: "error" },
        { status: 502 }
      );
    }
  }

  // ── Messages (no caching — real-time needed) ──────────────────────────────

  if (action === "messages" && sessionId) {
    try {
      const res  = await crispFetch(`/website/${WEBSITE_ID}/conversation/${sessionId}/messages`);
      const json = await res.json().catch(() => ({}));

      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limited. Please wait a moment before loading messages.", crisp_status: "rate_limited" },
          { status: 429 }
        );
      }

      return NextResponse.json(json, { status: res.status });
    } catch {
      return NextResponse.json({ error: "Could not reach Crisp API." }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (!crispConfigured()) {
    return NextResponse.json({ error: "Crisp API not configured." }, { status: 503 });
  }

  let body: { action?: string; session_id?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const { action, session_id, content } = body;

  try {
    if (action === "reply" && session_id && content?.trim()) {
      const res = await crispFetch(
        `/website/${WEBSITE_ID}/conversation/${session_id}/message`,
        {
          method: "POST",
          body: JSON.stringify({
            type:    "text",
            content: content.trim(),
            from:    "operator",
            origin:  "chat",
          }),
        }
      );

      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limited — please wait a moment before sending." },
          { status: 429 }
        );
      }

      const json = await res.json().catch(() => ({}));
      return NextResponse.json(json, { status: res.status });
    }

    if (action === "resolve" && session_id) {
      const res = await crispFetch(
        `/website/${WEBSITE_ID}/conversation/${session_id}/state`,
        {
          method: "PATCH",
          body: JSON.stringify({ state: "resolved" }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limited — please try resolving again in a moment." },
          { status: 429 }
        );
      }

      if (!res.ok) {
        console.error("[crisp/resolve] Crisp API error:", res.status, JSON.stringify(json));
        return NextResponse.json(
          { error: json?.reason ?? json?.error ?? `Crisp returned ${res.status}` },
          { status: res.status }
        );
      }

      // Invalidate cache so the next poll reflects the resolved state
      convCache = null;

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not reach Crisp API." }, { status: 502 });
  }
}
