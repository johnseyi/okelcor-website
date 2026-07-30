"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Palette, Save, RefreshCw, AlertTriangle, LayoutTemplate } from "lucide-react";
import type {
  CampaignBlock, CampaignDesign, CampaignPreview, CampaignTemplate,
} from "@/lib/admin-api";
import { normaliseCampaignDesign } from "@/lib/campaign-design";
import BlockEditor from "./block-editor";
import CampaignPreviewPane from "./campaign-preview";
import TemplatePicker, { useCampaignTemplates } from "./template-picker";
import TestSend from "./test-send";
import SaveTemplateModal from "./save-template-modal";

const EMPTY_DESIGN: CampaignDesign = { blocks: [], themes: [], mergeTags: [] };

export default function CampaignDesigner({
  subject,
  blocks,
  theme,
  onBlocksChange,
  onThemeChange,
  blockErrors,
  generalErrors,
  adminEmail,
}: {
  subject: string;
  blocks: CampaignBlock[];
  theme: string;
  onBlocksChange: (b: CampaignBlock[]) => void;
  onThemeChange: (t: string) => void;
  blockErrors: Record<number, string[]>;
  generalErrors: string[];
  adminEmail: string;
}) {
  const [design, setDesign]         = useState<CampaignDesign>(EMPTY_DESIGN);
  const [designLoading, setLoading] = useState(true);
  const [pickedStart, setPicked]    = useState(false);
  const [showSave, setShowSave]     = useState(false);
  const [mobile, setMobile]         = useState(false);

  const [preview, setPreview]             = useState<CampaignPreview | null>(null);
  const [previewLoading, setPreviewLoad]  = useState(false);
  const [previewError, setPreviewError]   = useState<string | null>(null);

  const templates = useCampaignTemplates();

  // ── Design schema — the editor is generated from this ──────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res  = await fetch("/api/admin/campaign-design");
        const json = await res.json().catch(() => null);
        if (!cancelled) setDesign(normaliseCampaignDesign(json));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Debounced live preview ─────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (blocks.length === 0) { setPreview(null); setPreviewError(null); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setPreviewLoad(true);
      try {
        const res = await fetch("/api/admin/bulk-emails/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, blocks, theme: theme || undefined }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          // A 422 while half-finished is normal — those messages land on the
          // blocks themselves when the author tries to send, so the preview
          // pane stays quiet rather than nagging on every keystroke.
          setPreviewError(res.status === 422 ? null : (json.error ?? json.message ?? null));
          return;
        }
        setPreviewError(null);
        setPreview((json.data ?? json) as CampaignPreview);
      } catch {
        setPreviewError("Could not reach the server to render a preview.");
      } finally {
        setPreviewLoad(false);
      }
    }, 700);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [blocks, theme, subject]);

  const buildTestPayload = useCallback(() => {
    if (blocks.length === 0) return { error: "Add at least one block before sending a test." };
    if (!subject.trim())     return { error: "Add a subject line before sending a test." };
    return { payload: { subject, blocks, theme: theme || undefined } };
  }, [blocks, subject, theme]);

  function applyTemplate(t: CampaignTemplate) {
    onBlocksChange(t.blocks ?? []);
    if (t.theme) onThemeChange(t.theme);
    setPicked(true);
  }

  async function deleteTemplate(t: CampaignTemplate) {
    if (!confirm(`Delete the saved design "${t.name}"?`)) return;
    await fetch(`/api/admin/campaign-templates/${t.id}`, { method: "DELETE" });
    templates.refresh();
  }

  if (designLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.07] bg-white py-12 text-[0.83rem] text-[#5c5e62]">
        <RefreshCw size={14} className="animate-spin" /> Loading the design editor…
      </div>
    );
  }

  // The schema drives everything; without it there are no blocks to offer.
  if (design.blocks.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[0.83rem] text-amber-800">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">The block editor isn&apos;t available on this server yet.</p>
          <p className="mt-0.5">
            Switch to <strong>Write HTML</strong> above to compose this campaign the old way — nothing
            about sending has changed.
          </p>
        </div>
      </div>
    );
  }

  // Never open on a blank canvas.
  if (blocks.length === 0 && !pickedStart) {
    return (
      <TemplatePicker
        starters={templates.starters}
        saved={templates.saved}
        loading={templates.loading}
        onPick={applyTemplate}
        onStartBlank={() => setPicked(true)}
        onDelete={deleteTemplate}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TestSend buildPayload={buildTestPayload} defaultEmail={adminEmail} />

      {generalErrors.length > 0 && (
        <ul className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 text-[0.83rem] text-red-700">
          {generalErrors.map((e, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {e}
            </li>
          ))}
        </ul>
      )}

      {/* Toolbar: theme + template actions */}
      <div className="flex flex-wrap items-center gap-2">
        {design.themes.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Palette size={14} className="text-[#5c5e62]" />
            <label className="text-[0.78rem] font-semibold text-[#5c5e62]">Colours</label>
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="h-9 rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] focus:border-[#f4511e] focus:outline-none"
            >
              {design.themes.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={() => { onBlocksChange([]); setPicked(false); }}
          className="flex items-center gap-1.5 rounded-full bg-[#f0f2f5] px-3.5 py-1.5 text-[0.78rem] font-semibold text-[#5c5e62] transition hover:bg-[#e5e7eb] hover:text-[#171a20]"
        >
          <LayoutTemplate size={13} /> Start from a different design
        </button>

        <button
          type="button"
          onClick={() => setShowSave(true)}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-[#f0f2f5] px-3.5 py-1.5 text-[0.78rem] font-semibold text-[#5c5e62] transition hover:bg-[#e5e7eb] hover:text-[#171a20]"
        >
          <Save size={13} /> Save as design
        </button>
      </div>

      {/* Editor + preview. Stacked on small screens; the preview is the point
          of the feature, so it isn't hidden behind a tab on desktop. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BlockEditor
          blocks={blocks}
          specs={design.blocks}
          mergeTags={design.mergeTags}
          errorsByIndex={blockErrors}
          onChange={onBlocksChange}
        />
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)]">
          <CampaignPreviewPane
            preview={preview}
            loading={previewLoading}
            error={previewError}
            mobile={mobile}
            onToggleMobile={setMobile}
          />
        </div>
      </div>

      {showSave && (
        <SaveTemplateModal
          blocks={blocks}
          theme={theme}
          onClose={() => setShowSave(false)}
          onSaved={templates.refresh}
        />
      )}
    </div>
  );
}
