/**
 * /api/admin/crisp
 *
 * Authenticated proxy to the Crisp REST API.
 * All requests are admin-token gated server-side.
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
const IDENTIFIER = process.env.CRISP_IDENTIFIER ?? "";
const KEY        = process.env.CRISP_KEY ?? "";

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
      ...(options?.headers ?? {}),
      // Auth headers always last — must not be overridable by callers
      Authorization: crispAuth(),
      "X-Crisp-Tier": "website",
    },
    cache: "no-store",
  });
}

/** Normalise a non-OK Crisp response into a consistent error shape the panel can detect. */
function crispError(status: number, reason: string, body: unknown) {
  console.error(`[crisp] API error — HTTP ${status} | reason: ${reason} | body:`, JSON.stringify(body));
  return NextResponse.json(
    { error: reason, crisp_status: "error" },
    { status }
  );
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!crispConfigured()) {
    console.error("[crisp] Not configured — NEXT_PUBLIC_CRISP_WEBSITE_ID, CRISP_IDENTIFIER or CRISP_KEY is missing.");
    return NextResponse.json(
      { error: "Crisp not configured. Add NEXT_PUBLIC_CRISP_WEBSITE_ID, CRISP_IDENTIFIER and CRISP_KEY to environment variables.", crisp_status: "unconfigured" },
      { status: 503 }
    );
  }

  const { searchParams } = request.nextUrl;
  const action    = searchParams.get("action");
  const sessionId = searchParams.get("session_id");
  const page      = searchParams.get("page") ?? "1";

  // ── Conversations ───────────────────────────────────────────────────────────

  if (action === "conversations") {
    try {
      const res  = await crispFetch(`/website/${WEBSITE_ID}/conversations/list/${page}`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        return crispError(res.status, json?.reason ?? `HTTP ${res.status}`, json);
      }

      return NextResponse.json({ ...json, crisp_status: "connected" }, { status: 200 });
    } catch (err) {
      console.error("[crisp] Network error fetching conversations:", err);
      return NextResponse.json(
        { error: "Could not reach Crisp API.", crisp_status: "error" },
        { status: 502 }
      );
    }
  }

  // ── Messages ────────────────────────────────────────────────────────────────

  if (action === "messages" && sessionId) {
    try {
      const res  = await crispFetch(`/website/${WEBSITE_ID}/conversation/${sessionId}/messages`);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error(`[crisp] Messages fetch failed — HTTP ${res.status}:`, JSON.stringify(json));
        return NextResponse.json(
          { error: json?.reason ?? `HTTP ${res.status}` },
          { status: res.status }
        );
      }

      return NextResponse.json(json, { status: 200 });
    } catch (err) {
      console.error("[crisp] Network error fetching messages:", err);
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

  // ── Reply ──────────────────────────────────────────────────────────────────

  if (action === "reply" && session_id && content?.trim()) {
    try {
      const res = await crispFetch(
        `/website/${WEBSITE_ID}/conversation/${session_id}/message`,
        {
          method: "POST",
          body: JSON.stringify({ type: "text", content: content.trim(), from: "operator", origin: "chat" }),
        }
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error(`[crisp] Reply failed — HTTP ${res.status}:`, JSON.stringify(json));
        return NextResponse.json(
          { error: json?.reason ?? `Could not send reply (HTTP ${res.status})` },
          { status: res.status }
        );
      }

      return NextResponse.json(json, { status: 200 });
    } catch (err) {
      console.error("[crisp] Network error sending reply:", err);
      return NextResponse.json({ error: "Could not reach Crisp API." }, { status: 502 });
    }
  }

  // ── Resolve ────────────────────────────────────────────────────────────────

  if (action === "resolve" && session_id) {
    try {
      const res = await crispFetch(
        `/website/${WEBSITE_ID}/conversation/${session_id}/state`,
        {
          method: "PATCH",
          body: JSON.stringify({ state: "resolved" }),
        }
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error(`[crisp] Resolve failed — HTTP ${res.status}:`, JSON.stringify(json));
        return NextResponse.json(
          { error: json?.reason ?? `Could not resolve conversation (HTTP ${res.status})` },
          { status: res.status }
        );
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
      console.error("[crisp] Network error resolving conversation:", err);
      return NextResponse.json({ error: "Could not reach Crisp API." }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
