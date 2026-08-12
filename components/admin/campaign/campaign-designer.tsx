"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Palette, Save, RefreshCw, AlertTriangle, LayoutTemplate } from "lucide-react";
import type {
  CampaignBlock, CampaignDesign, CampaignImportResult, CampaignPreview, CampaignTemplate,
} from "@/lib/admin-api";
import {
  normaliseCampaignDesign, themeToWire, themeOverridesOf,
  type CampaignThemeOverrides,
} from "@/lib/campaign-design";
import { themeToKey } from "@/hooks/use-campaign-autosave";
import BlockEditor from "./block-editor";
import CampaignPreviewPane from "./campaign-preview";
import TemplatePicker, { useCampaignTemplates } from "./template-picker";
import InDesignImport from "./indesign-import";
import TestSend from "./test-send";
import SaveTemplateModal from "./save-template-modal";

const EMPTY_DESIGN: CampaignDesign = { blocks: [], themes: [], mergeTags: [] };

export default function CampaignDesigner({
  subject,
  blocks,
  theme,
  themeOverrides,
  onBlocksChange,
  onThemeChange,
  onThemeOverridesChange,
  blockErrors,
  generalErrors,
  adminEmail,
}: {
  subject: string;
  blocks: CampaignBlock[];
  /** The preset key. The picker needs a string; overrides ride alongside. */
  theme: string;
  /** Colour overrides from an imported or saved design, passed through verbatim. */
  themeOverrides?: CampaignThemeOverrides | null;
  onBlocksChange: (b: CampaignBlock[]) => void;
  onThemeChange: (t: string) => void;
  onThemeOverridesChange?: (o: CampaignThemeOverrides | null) => void;
  blockErrors: Record<number, string[]>;
  generalErrors: string[];
  adminEmail: string;
}) {
  const [design, setDesign]         = useState<CampaignDesign>(EMPTY_DESIGN);
  const [designLoading, setLoading] = useState(true);
  const [pickedStart, setPicked]    = useState(false);
  const [showSave, setShowSave]     = useState(false);
  const [showImport, setShowImport] = useState(false);
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
          body: JSON.stringify({ subject, blocks, theme: themeToWire(theme, themeOverrides) }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          // A 422 carrying *block* errors is normal while half-finished — those
          // messages land on the blocks themselves at send time, so the pane
          // stays quiet rather than nagging on every keystroke.
          //
          // A 422 with no block errors is a different animal: the request itself
          // was rejected. Swallowing those indiscriminately is what let a
          // malformed `theme` reach production looking like an empty preview
          // beside a full block list, for two weeks, with nothing logged.
          const hasBlockErrors =
            !!json?.errors?.blocks ||
            Object.keys(json?.errors ?? {}).some((k) => k.startsWith("blocks"));
          if (res.status === 422 && hasBlockErrors) {
            // Half-built: keep the last good render on screen, say nothing.
            setPreviewError(null);
          } else {
            // The request itself was rejected. Drop the stale render — leaving
            // the previous one up is what made a refused refresh look like a
            // successful render of the wrong layout, which is exactly how a
            // rejected `theme` payload got reported as an import bug.
            setPreview(null);
            setPreviewError(json.error ?? json.message ?? null);
          }
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
  }, [blocks, theme, themeOverrides, subject]);

  const buildTestPayload = useCallback(() => {
    if (blocks.length === 0) return { error: "Add at least one block before sending a test." };
    if (!subject.trim())     return { error: "Add a subject line before sending a test." };
    return { payload: { subject, blocks, theme: themeToWire(theme, themeOverrides) } };
  }, [blocks, subject, theme, themeOverrides]);

  /**
   * Applying a saved design.
   *
   * The blocks are fetched by id rather than taken from the card, because the
   * *list* endpoint returns `block_count` without `blocks` — deliberately, to
   * keep the list light. Trusting the list payload here applied an empty design
   * over the marketer's canvas and looked exactly like a template that had lost
   * its contents. Starters carry their blocks inline, so they skip the fetch.
   */
  async function applyTemplate(t: CampaignTemplate) {
    setPicked(true);
    // The card comes from the *list*, which carries `block_count` and no
    // `blocks` (and no `preview_html`) to stay light. Starters carry both inline.
    let full = t;
    if (((t.blocks?.length ?? 0) === 0 || !t.preview_html) && !t.is_starter) {
      try {
        const res  = await fetch(`/api/admin/campaign-templates/${t.id}`);
        const json = await res.json().catch(() => null);
        const fetched: CampaignTemplate | null = json?.data ?? null;
        if (fetched?.blocks?.length) full = fetched;
      } catch { /* fall back to the card's own payload */ }
    }
    onBlocksChange(full.blocks ?? []);
    const key = themeToKey(full.theme);
    if (key) onThemeChange(key);
    onThemeOverridesChange?.(themeOverridesOf(full.theme));
    seedPreview(full.preview_html, full.preview_text);
  }

  /**
   * Show the server's own render immediately.
   *
   * The debounced preview below would fetch an equivalent one within 700ms, but
   * seeding buys three things: the correct layout appears instantly instead of
   * after a round trip; it is byte-identical to what the import screen showed, so
   * "it looked right on upload" is guaranteed rather than hoped for; and it is
   * still right if the preview endpoint is unreachable.
   *
   * Set as `html` only, leaving `html_personalized` empty — the pane falls back
   * to `html`, so merge tags show as literal tokens for the moment it takes the
   * debounced fetch to return the personalised version. Better a correct layout
   * with `[[FIRST_NAME|there]]` visible for 700ms than a blank pane.
   */
  function seedPreview(html?: string | null, text?: string | null) {
    if (!html) return;
    setPreview({
      html,
      html_personalized: "",
      text: text ?? "",
      subject_personalized: "",
      unknown_merge_tags: [],
    });
    setPreviewError(null);
  }

  /**
   * An imported design is an ordinary template from here on, so it goes through
   * the same path as any other. Two differences worth noting:
   *
   * - its `theme` is an object (`{ preset, heading_color, … }`), never a bare
   *   preset key. The preset drives the picker; the rest are overrides passed
   *   through verbatim. Note this does *not* mean reinstating the export's own
   *   palette — the importer has already replaced an illegible one with the
   *   house theme before it ever reaches here, so what arrives is what should be
   *   rendered. Dropping the overrides is the actual bug, not keeping them.
   * - the templates list is refreshed either way, so a design saved but not used
   *   now is waiting under "Your saved designs" rather than needing a reload.
   */
  function applyImported(result: CampaignImportResult, useNow: boolean) {
    setShowImport(false);
    templates.refresh();
    if (!useNow) return;
    onBlocksChange(result.blocks ?? []);
    const key = themeToKey(result.theme);
    if (key) onThemeChange(key);
    // The recovered palette — gold headings, button colours — travels as
    // overrides on top of the preset and is passed through verbatim. Reducing
    // the imported theme to its preset alone (which this did at first) silently
    // repainted the design in house colours the moment it was previewed.
    onThemeOverridesChange?.(themeOverridesOf(result.theme));
    // The same HTML the import screen just showed, carried straight over, so
    // "Use this design" cannot look different from what was approved on upload.
    seedPreview(result.preview_html, null);
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
      <>
        <TemplatePicker
          starters={templates.starters}
          saved={templates.saved}
          loading={templates.loading}
          onPick={applyTemplate}
          onStartBlank={() => setPicked(true)}
          onDelete={deleteTemplate}
          onImport={() => setShowImport(true)}
        />
        {showImport && (
          <InDesignImport onClose={() => setShowImport(false)} onImported={applyImported} />
        )}
      </>
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
          themeOverrides={themeOverrides}
          onClose={() => setShowSave(false)}
          onSaved={templates.refresh}
        />
      )}
    </div>
  );
}
