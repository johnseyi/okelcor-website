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

const CRISP_BASE    = "https://api.crisp.chat/v1";
const WEBSITE_ID    = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? "";
const IDENTIFIER    = process.env.CRISP_IDENTIFIER ?? "";
const KEY           = process.env.CRISP_KEY ?? "";

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
      "X-Crisp-Tier": "plugin",
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
    return NextResponse.json({ error: "Crisp API not configured. Add CRISP_IDENTIFIER and CRISP_KEY to .env.local." }, { status: 503 });
  }

  const { searchParams } = request.nextUrl;
  const action    = searchParams.get("action");
  const sessionId = searchParams.get("session_id");
  const page      = searchParams.get("page") ?? "1";

  try {
    if (action === "conversations") {
      const res = await crispFetch(
        `/website/${WEBSITE_ID}/conversations/${page}`
      );
      const json = await res.json().catch(() => ({}));
      return NextResponse.json(json, { status: res.status });
    }

    if (action === "messages" && sessionId) {
      const res = await crispFetch(
        `/website/${WEBSITE_ID}/conversation/${sessionId}/messages`
      );
      const json = await res.json().catch(() => ({}));
      return NextResponse.json(json, { status: res.status });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not reach Crisp API." }, { status: 502 });
  }
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
      const json = await res.json().catch(() => ({}));
      return NextResponse.json(json, { status: res.status });
    }

    if (action === "resolve" && session_id) {
      const res = await crispFetch(
        `/website/${WEBSITE_ID}/conversation/${session_id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ state: "resolved" }),
        }
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("[crisp/resolve] Crisp API error:", res.status, JSON.stringify(json));
        return NextResponse.json(
          { error: json?.reason ?? json?.error ?? `Crisp returned ${res.status}` },
          { status: res.status }
        );
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Could not reach Crisp API." }, { status: 502 });
  }
}
