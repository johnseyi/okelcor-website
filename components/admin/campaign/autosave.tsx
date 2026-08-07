"use client";

import { useEffect, useState } from "react";
import { Check, CloudOff, RefreshCw, RotateCcw, AlertTriangle, X } from "lucide-react";
import { timeAgo } from "@/lib/admin-notifications";
import type { CampaignDraft } from "@/lib/admin-api";
import type { AutosaveStatus } from "@/hooks/use-campaign-autosave";

/**
 * Autosave state, stated plainly and never in the way.
 *
 * `unavailable` is its own quiet grey line rather than a red failure: while
 * migration #29 is pending every save fails, and an alarm she can do nothing
 * about is an alarm she learns to ignore. It is still *said* — silence there
 * would let her assume work is being saved when it isn't.
 */
export function AutosaveIndicator({
  status, lastSavedAt,
}: {
  status: AutosaveStatus;
  lastSavedAt: number | null;
}) {
  // Re-render on a slow tick so "Saved 2m ago" doesn't sit frozen at "just now".
  const [, tick] = useState(0);
  useEffect(() => {
    if (status !== "saved") return;
    const i = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(i);
  }, [status]);

  if (status === "idle") return null;

  const base = "flex items-center gap-1.5 text-[0.75rem]";

  if (status === "unavailable") {
    return (
      <span className={`${base} text-[#8c8f94]`} title="Backend migration #29 is not deployed yet.">
        <CloudOff size={12} /> Autosave unavailable — don&apos;t leave this tab
      </span>
    );
  }
  if (status === "saving") {
    return <span className={`${base} text-[#5c5e62]`}><RefreshCw size={12} className="animate-spin" /> Saving…</span>;
  }
  if (status === "error") {
    return (
      <span className={`${base} text-amber-700`}>
        <AlertTriangle size={12} /> Not saved — will retry
      </span>
    );
  }
  if (status === "dirty") {
    return <span className={`${base} text-[#8c8f94]`}>Unsaved changes</span>;
  }
  return (
    <span className={`${base} text-emerald-700`}>
      <Check size={12} /> Saved{lastSavedAt ? ` ${timeAgo(new Date(lastSavedAt).toISOString())}` : ""}
    </span>
  );
}

/**
 * The restore offer. Only rendered when there is genuinely something to bring
 * back — backend returns `data: null` for an empty draft precisely so this
 * prompt keeps meaning something every time it appears.
 */
export function RestoreDraftBar({
  draft, onRestore, onDiscard,
}: {
  draft: CampaignDraft;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  const when = draft.updated_at ? timeAgo(draft.updated_at) : "earlier";
  // The subject is what she'd recognise; `label` is the server's own display
  // name for the restore list and the documented response field.
  const label = draft.subject?.trim() || draft.label?.trim() || draft.name?.trim() || "Untitled campaign";
  const blocks = draft.block_count ?? draft.blocks?.length ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#f4511e]/25 bg-[#fff5f1] p-4">
      <RotateCcw size={16} className="shrink-0 text-[#f4511e]" />
      <div className="min-w-0 flex-1">
        <p className="text-[0.83rem] font-semibold text-[#171a20]">
          You have unfinished work from {when}
        </p>
        <p className="truncate text-[0.78rem] text-[#5c5e62]">
          {label}
          {blocks > 0 && <span className="text-[#8c8f94]"> · {blocks} block{blocks === 1 ? "" : "s"}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="rounded-full bg-[#f4511e] px-4 py-1.5 text-[0.78rem] font-semibold text-white transition hover:bg-[#df4618]"
        >
          Restore it
        </button>
        <button
          type="button"
          onClick={onDiscard}
          title="Delete this draft and start fresh"
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.78rem] font-semibold text-[#5c5e62] transition hover:bg-black/[0.04] hover:text-[#171a20]"
        >
          <X size={12} /> Start fresh
        </button>
      </div>
    </div>
  );
}
