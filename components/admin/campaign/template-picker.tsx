"use client";

import { useCallback, useEffect, useState } from "react";
import { LayoutTemplate, RefreshCw, Trash2, FilePlus2, Star } from "lucide-react";
import type { CampaignTemplate } from "@/lib/admin-api";

/**
 * Start-from-template step. The editor never opens on a blank canvas — a
 * marketer who can't write HTML also can't design a layout from nothing, and
 * `okelcor_classic` is the house style they already recognise from Wix.
 */
export function useCampaignTemplates() {
  const [starters, setStarters] = useState<CampaignTemplate[]>([]);
  const [saved, setSaved]       = useState<CampaignTemplate[]>([]);
  const [loading, setLoading]   = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        fetch("/api/admin/campaign-templates/starters").then((r) => r.json()).catch(() => ({ data: [] })),
        fetch("/api/admin/campaign-templates").then((r) => r.json()).catch(() => ({ data: [] })),
      ]);
      setStarters(Array.isArray(s?.data) ? s.data : []);
      setSaved(Array.isArray(t?.data) ? t.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { starters, saved, loading, refresh };
}

function TemplateCard({
  template,
  onPick,
  onDelete,
}: {
  template: CampaignTemplate;
  onPick: () => void;
  onDelete?: () => void;
}) {
  const blockCount = template.blocks?.length ?? 0;
  return (
    <div className="group relative flex flex-col rounded-xl border border-black/[0.07] bg-white p-4 text-left transition hover:border-[#f4511e]/40 hover:shadow-sm">
      <button type="button" onClick={onPick} className="flex-1 text-left">
        <div className="mb-2 flex items-center gap-1.5">
          {template.is_starter
            ? <Star size={13} className="text-[#f4511e]" />
            : <LayoutTemplate size={13} className="text-[#5c5e62]" />}
          <span className="text-[0.83rem] font-bold text-[#171a20]">{template.name}</span>
        </div>
        {template.description && (
          <p className="text-[0.75rem] leading-snug text-[#5c5e62]">{template.description}</p>
        )}
        <p className="mt-2 text-[0.72rem] text-[#8c8f94]">
          {blockCount} block{blockCount === 1 ? "" : "s"}
        </p>
      </button>

      {/* Starters are built in — offering delete on them would only ever fail. */}
      {onDelete && !template.is_starter && (
        <button
          type="button"
          onClick={onDelete}
          title="Delete template"
          className="invisible absolute right-2 top-2 rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-red-50 hover:text-red-600 group-hover:visible"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

export default function TemplatePicker({
  starters,
  saved,
  loading,
  onPick,
  onStartBlank,
  onDelete,
}: {
  starters: CampaignTemplate[];
  saved: CampaignTemplate[];
  loading: boolean;
  onPick: (t: CampaignTemplate) => void;
  onStartBlank: () => void;
  onDelete: (t: CampaignTemplate) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.07] bg-white py-12 text-[0.83rem] text-[#5c5e62]">
        <RefreshCw size={14} className="animate-spin" /> Loading designs…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-[0.83rem] font-bold text-[#171a20]">Start from a design</h3>
        {starters.length === 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[0.78rem] text-amber-800">
            No built-in designs came back from the server. You can still start blank and add blocks.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {starters.map((t) => (
              <TemplateCard key={String(t.id)} template={{ ...t, is_starter: true }} onPick={() => onPick(t)} />
            ))}
          </div>
        )}
      </div>

      {saved.length > 0 && (
        <div>
          <h3 className="mb-2 text-[0.83rem] font-bold text-[#171a20]">Your saved designs</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((t) => (
              <TemplateCard
                key={String(t.id)}
                template={t}
                onPick={() => onPick(t)}
                onDelete={() => onDelete(t)}
              />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onStartBlank}
        className="flex items-center gap-1.5 text-[0.83rem] font-semibold text-[#5c5e62] transition hover:text-[#171a20]"
      >
        <FilePlus2 size={14} /> Start from an empty design instead
      </button>
    </div>
  );
}
