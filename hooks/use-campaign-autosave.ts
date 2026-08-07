"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BulkEmailFilters, CampaignBlock, CampaignDraft, CampaignThemeValue,
} from "@/lib/admin-api";

/**
 * Autosave for the campaign composer.
 *
 * Background: `POST /admin/bulk-emails` creates *and sends*. Until the moment
 * she hit Send, a campaign existed only in browser memory — so opening the
 * Media Library in the same tab and coming back lost everything. Backend added
 * draft storage; this is the client half.
 *
 * Rules this deliberately follows:
 *
 * - **No pre-validation.** Half-built work is exactly what needs saving. The
 *   block rules still run at preview and at send, where they belong. Refusing
 *   to save invalid work would reintroduce the bug at the moment it matters.
 * - **Full replace, never a merge.** The whole document goes up every time, so
 *   deleting the last block is expressible. An absent key means empty.
 * - **Idle-debounced, not per-keystroke** — plus blur and `visibilitychange`.
 *   That last one is the one that actually fixes the complaint: it fires as the
 *   tab is hidden, which is precisely when she navigates away.
 * - **Failure is never blocking.** No modal, no disabled editor, no lost
 *   keystrokes — just an indicator.
 */

const IDLE_MS = 4000;

/**
 * Browsers cap the *total* body of in-flight `keepalive` requests at 64 KB and
 * reject anything larger outright. Draft storage allows 512 KB, so a big
 * campaign would exceed the keepalive limit and the leaving-the-tab save —
 * the one that fixes the actual complaint — would be the save that throws.
 * Over this size we fall back to a normal request.
 */
const KEEPALIVE_MAX_BYTES = 60_000;

export type DraftDocument = {
  subject: string;
  blocks: CampaignBlock[];
  theme: string;
  bodyHtml: string;
  filters: BulkEmailFilters;
};

export type AutosaveStatus =
  | "idle"        // nothing worth saving yet
  | "dirty"       // edited, save pending
  | "saving"
  | "saved"
  | "error"       // transient — will retry on the next edit
  | "unavailable"; // no draft storage on this server (migration #29 pending)

/** Mirrors backend's own emptiness rule for `/latest`, so a restore offer always means something. */
export function isDraftEmpty(doc: {
  subject?: string | null;
  blocks?: CampaignBlock[] | null;
  bodyHtml?: string | null;
  filters?: BulkEmailFilters | null;
}): boolean {
  if (doc.subject?.trim()) return false;
  if (doc.blocks?.length) return false;
  const html = doc.bodyHtml?.trim();
  if (html && html !== "<p></p>") return false;
  const f = doc.filters;
  if (f && (f.markets?.length || f.company || f.country || f.status || f.search)) return false;
  return true;
}

/**
 * Is this draft worth offering back? Backend ships its own `is_empty` verdict
 * and already withholds empty drafts from `/latest`; that answer wins over the
 * local heuristic, which stays as the fallback for the light list shape.
 */
export function draftHasContent(d: CampaignDraft): boolean {
  if (typeof d.is_empty === "boolean") return !d.is_empty;
  if (typeof d.block_count === "number" && d.block_count > 0) return true;
  return !isDraftEmpty({
    subject: d.subject, blocks: d.blocks, bodyHtml: d.body_html, filters: d.filters,
  });
}

/**
 * Theme travels in two shapes. The composer, the design schema and the send
 * endpoint all use a bare preset key; draft storage documents `{ preset }`.
 * Written in the documented object form, read back tolerantly either way — a
 * theme silently lost on restore would be invisible until the send.
 */
export function themeToKey(theme: CampaignThemeValue | undefined): string {
  if (!theme) return "";
  if (typeof theme === "string") return theme;
  return theme.preset ?? "";
}

function themeToWire(key: string) {
  return key ? { preset: key } : null;
}

/** The wire shape. `name` gives the restore list something readable to show. */
function toPayload(doc: DraftDocument) {
  return {
    name: doc.subject.trim() || "Untitled campaign",
    subject: doc.subject,
    blocks: doc.blocks,
    theme: themeToWire(doc.theme),
    body_html: doc.bodyHtml || null,
    filters: doc.filters,
  };
}

export function useCampaignAutosave(doc: DraftDocument) {
  const [status, setStatus]         = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSaved] = useState<number | null>(null);

  const draftId     = useRef<number | null>(null);
  const lastSaved   = useRef<string | null>(null);   // serialised doc of the last accepted save
  const inFlight    = useRef(false);
  const rerun       = useRef(false);                 // an edit landed mid-save
  const unavailable = useRef(false);                 // sticky for the session — stop hammering
  const suspended   = useRef(false);                 // set after send, until the next real edit
  const timer       = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The live document, readable from event handlers that outlive a render.
  const docRef = useRef(doc);
  docRef.current = doc;

  const save = useCallback(async (opts: { keepalive?: boolean } = {}) => {
    if (unavailable.current || suspended.current) return;

    const current = docRef.current;
    if (isDraftEmpty(current)) return;

    const serialised = JSON.stringify(toPayload(current));
    if (serialised === lastSaved.current) return;

    if (inFlight.current) { rerun.current = true; return; }
    inFlight.current = true;
    setStatus("saving");

    const id = draftId.current;
    // Oversized bodies are rejected outright by keepalive, so a large campaign
    // would lose exactly the save that matters. Send it normally instead.
    // Measured in bytes, not characters — the cap is a byte limit, and an
    // accented German subject line is not one byte per character.
    const keepalive =
      (opts.keepalive ?? false) &&
      new TextEncoder().encode(serialised).byteLength <= KEEPALIVE_MAX_BYTES;

    try {
      const res = await fetch(
        id ? `/api/admin/campaign-drafts/${id}` : "/api/admin/campaign-drafts",
        {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: serialised,
          // Lets the save survive the tab being hidden or closed mid-request.
          keepalive,
        },
      );

      if (res.status === 501) {
        // Endpoints aren't live yet (migration #29). Go quiet rather than
        // showing a failure on a timer for something she can't act on.
        unavailable.current = true;
        setStatus("unavailable");
        return;
      }
      if (!res.ok) { setStatus("error"); return; }

      if (!id) {
        const json = await res.json().catch(() => null);
        const created: CampaignDraft | null = json?.data ?? json ?? null;
        if (typeof created?.id === "number") {
          draftId.current = created.id;
        } else {
          // No id back means nothing to update next time — treat as a failure
          // rather than silently creating a new draft on every keystroke.
          setStatus("error");
          return;
        }
      }

      lastSaved.current = serialised;
      setLastSaved(Date.now());
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      inFlight.current = false;
      if (rerun.current) { rerun.current = false; void save(); }
    }
  }, []);

  // ── Idle debounce ──────────────────────────────────────────────────────────
  // Keyed on the serialised document alone. The composer re-renders on things
  // that aren't edits (the recipient count refreshes on its own timer); if
  // those reset the debounce, a long enough sequence of them starves the save.
  const serialisedNow = JSON.stringify(toPayload(doc));
  useEffect(() => {
    if (unavailable.current) return;
    if (isDraftEmpty(docRef.current)) return;
    if (serialisedNow === lastSaved.current) return;

    // A real edit revives autosave after a send.
    suspended.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to an edit, same pattern as cart-context.tsx
    setStatus((s) => (s === "saving" ? s : "dirty"));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void save(); }, IDLE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [serialisedNow, save]);

  // ── Flush on leaving: hidden tab, blurred window, page unload ──────────────
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") void save({ keepalive: true }); };
    const onBlur = () => { void save(); };
    const onPageHide = () => { void save({ keepalive: true }); };

    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onBlur);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [save]);

  /**
   * Take over an existing draft (a restore). Its content becomes the saved
   * baseline, so restoring doesn't immediately fire a redundant save.
   */
  const adopt = useCallback((draft: CampaignDraft, restored: DraftDocument) => {
    draftId.current = draft.id;
    lastSaved.current = JSON.stringify(toPayload(restored));
    suspended.current = false;
    setLastSaved(draft.updated_at ? new Date(draft.updated_at).getTime() : Date.now());
    setStatus("saved");
  }, []);

  /**
   * Called once a campaign is safely queued. The backend retires the draft
   * itself when `draft_id` is passed to the send — so this only drops the
   * local handle, and does it *after* the send succeeded, never before.
   */
  const retire = useCallback(() => {
    draftId.current = null;
    lastSaved.current = null;
    suspended.current = true;
    setLastSaved(null);
    setStatus("idle");
  }, []);

  /** Explicit "start fresh" — deletes server-side. */
  const discard = useCallback(async () => {
    const id = draftId.current;
    retire();
    if (id) await fetch(`/api/admin/campaign-drafts/${id}`, { method: "DELETE" }).catch(() => {});
  }, [retire]);

  return {
    status,
    lastSavedAt,
    /**
     * Read at send time, not at render time — the id lands in a ref (a created
     * draft doesn't re-render the composer), so a captured value would be stale
     * on the very first send after the draft was created.
     */
    getDraftId: () => draftId.current,
    saveNow: save,
    adopt,
    retire,
    discard,
  };
}
