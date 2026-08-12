/**
 * Normalisation for the campaign designer.
 *
 * The editor is generated from `GET /admin/campaign-design` rather than a
 * hardcoded block list, so a block type added server-side shows up on its own.
 * That means this file must not assume one exact JSON spelling: it accepts the
 * plausible variants for each key and returns one predictable shape. Anything
 * it genuinely can't read comes back empty, and the editor says so instead of
 * rendering a blank canvas that looks like a bug.
 */

import type {
  CampaignBlock, CampaignBlockSpec, CampaignDesign, CampaignFieldSpec,
  CampaignFieldType, CampaignMergeTagSpec, CampaignSelectOption, CampaignThemeSpec,
} from "./admin-api";

const FIELD_TYPES: CampaignFieldType[] = [
  "text", "textarea", "select", "number", "url", "image_url", "text_list", "link_list",
];

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v !== "" ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** Human label from a machine key, for when the server sends only the key. */
function titleise(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Options arrive as `["left","center"]` or `[{value,label}]`. */
function normaliseOptions(v: unknown): CampaignSelectOption[] {
  return asArray(v).flatMap((o) => {
    if (typeof o === "string") return [{ value: o, label: titleise(o) }];
    const r = asRecord(o);
    const value = str(r.value) ?? str(r.key) ?? str(r.id);
    if (!value) return [];
    return [{ value, label: str(r.label) ?? str(r.name) ?? titleise(value) }];
  });
}

function normaliseField(v: unknown): CampaignFieldSpec | null {
  const r = asRecord(v);
  const name = str(r.name) ?? str(r.key) ?? str(r.field);
  if (!name) return null;

  const rawType = str(r.type) ?? str(r.input) ?? "text";
  // An unrecognised field type degrades to a plain text input rather than
  // rendering nothing — a marketer can still type into it.
  const type = (FIELD_TYPES as string[]).includes(rawType)
    ? (rawType as CampaignFieldType)
    : "text";

  return {
    name,
    label: str(r.label) ?? str(r.title) ?? titleise(name),
    type,
    required: r.required === true,
    options: normaliseOptions(r.options ?? r.choices ?? r.values),
    default: r.default ?? r.default_value,
    min: num(r.min) ?? num(r.minimum),
    max: num(r.max) ?? num(r.maximum),
    placeholder: str(r.placeholder) ?? str(r.example),
    help: str(r.help) ?? str(r.hint) ?? str(r.description),
  };
}

function normaliseBlockSpec(v: unknown, fallbackType?: string): CampaignBlockSpec | null {
  const r = asRecord(v);
  const type = str(r.type) ?? str(r.key) ?? str(r.name) ?? fallbackType;
  if (!type) return null;

  return {
    type,
    label: str(r.label) ?? str(r.title) ?? titleise(type),
    description: str(r.description) ?? str(r.help),
    fields: asArray(r.fields ?? r.properties ?? r.inputs)
      .map(normaliseField)
      .filter((f): f is CampaignFieldSpec => f !== null),
  };
}

/**
 * Collections may arrive as an array, or as an object keyed by type/name
 * (`{ heading: {...}, image: {...} }`) — both are common in hand-rolled
 * schema endpoints, so both are read.
 */
function normaliseCollection<T>(v: unknown, one: (item: unknown, key?: string) => T | null): T[] {
  if (Array.isArray(v)) return v.map((i) => one(i)).filter((x): x is T => x !== null);
  const r = asRecord(v);
  return Object.entries(r)
    .map(([key, item]) => one(item, key))
    .filter((x): x is T => x !== null);
}

function normaliseTheme(v: unknown, key?: string): CampaignThemeSpec | null {
  if (typeof v === "string") return { key: v, label: titleise(v) };
  const r = asRecord(v);
  const k = str(r.key) ?? str(r.name) ?? str(r.value) ?? str(r.id) ?? key;
  if (!k) return null;
  return { key: k, label: str(r.label) ?? str(r.title) ?? titleise(k) };
}

function normaliseMergeTag(v: unknown, key?: string): CampaignMergeTagSpec | null {
  if (typeof v === "string") {
    const bare = v.replace(/^\[\[|\]\]$/g, "");
    return { tag: bare, label: titleise(bare) };
  }
  const r = asRecord(v);
  const raw = str(r.tag) ?? str(r.name) ?? str(r.key) ?? key;
  if (!raw) return null;
  const tag = raw.replace(/^\[\[|\]\]$/g, "");
  return {
    tag,
    label: str(r.label) ?? str(r.description) ?? titleise(tag),
    fallback: str(r.fallback) ?? str(r.default) ?? str(r.example),
  };
}

export function normaliseCampaignDesign(raw: unknown): CampaignDesign {
  const root = asRecord(raw);
  const d = asRecord(root.data ?? root);

  return {
    blocks: normaliseCollection(
      d.blocks ?? d.block_types ?? d.blockTypes ?? d.types,
      (item, key) => normaliseBlockSpec(item, key),
    ),
    themes: normaliseCollection(
      d.themes ?? d.theme_presets ?? d.themePresets ?? d.presets,
      (item, key) => normaliseTheme(item, key),
    ),
    mergeTags: normaliseCollection(
      d.merge_tags ?? d.mergeTags ?? d.tags,
      (item, key) => normaliseMergeTag(item, key),
    ),
  };
}

/**
 * Widths of the two preview modes, in CSS pixels.
 *
 * These are the iframe element's **real** width, never a `transform: scale()` on
 * a wider document. The distinction is the whole ballgame: scaling a 620px render
 * down still leaves the document 620px wide, so the email's media queries never
 * fire and the result is the desktop layout drawn smaller — which is
 * indistinguishable from "the email isn't responsive". If a zoom control is ever
 * added, it must transform the iframe *element*, never the document inside it.
 *
 * 375 is the canonical phone width and the one the backend's responsive checks
 * are written against, so both sides test the same number.
 */
export const PREVIEW_WIDTH = { mobile: 375, desktop: 700 } as const;

/**
 * Colour overrides carried alongside a theme preset — `heading_color`,
 * `button_background` and so on. An imported design brings its recovered palette
 * this way; a hand-built campaign has none.
 */
export type CampaignThemeOverrides = Record<string, string | number>;

/**
 * Build the `theme` value every campaign endpoint expects.
 *
 * **This is an object, never a bare preset string.** `preview`, `test-send`,
 * `bulk-emails` (the real send) and both `campaign-templates` writes all
 * validate `theme` as `['nullable', 'array']`, so a string is a 422 — and on the
 * preview that 422 was being swallowed as "normal while half-finished", which is
 * how a broken theme reached production looking like an empty preview pane.
 *
 * Overrides go through verbatim: the renderer applies them on top of the preset
 * and ignores any key it doesn't recognise, so there is nothing to filter here.
 */
export function themeToWire(
  preset: string,
  overrides?: CampaignThemeOverrides | null,
): Record<string, unknown> | undefined {
  const hasOverrides = overrides != null && Object.keys(overrides).length > 0;
  if (!preset && !hasOverrides) return undefined;
  return { ...(preset ? { preset } : {}), ...(hasOverrides ? overrides : {}) };
}

/**
 * Pull the colour overrides out of a served theme, dropping the preset itself
 * (which the composer tracks separately, because the picker needs a string).
 * A bare string theme carries no overrides.
 */
export function themeOverridesOf(theme: unknown): CampaignThemeOverrides | null {
  if (!theme || typeof theme !== "string" && typeof theme !== "object") return null;
  if (typeof theme === "string") return null;
  const out: CampaignThemeOverrides = {};
  for (const [k, v] of Object.entries(theme as Record<string, unknown>)) {
    if (k === "preset" || k === "label") continue;
    if (typeof v === "string" || typeof v === "number") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** A new block pre-filled from its spec's declared defaults. */
export function blankBlock(spec: CampaignBlockSpec): CampaignBlock {
  const block: CampaignBlock = { type: spec.type };
  for (const f of spec.fields) {
    if (f.default !== undefined) block[f.name] = f.default;
    else if (f.type === "text_list" || f.type === "link_list") block[f.name] = [];
    else if (f.type === "select") block[f.name] = f.options[0]?.value ?? "";
    else if (f.type === "number") block[f.name] = f.min ?? 0;
    else block[f.name] = "";
  }
  return block;
}

/**
 * Merge tags are always inserted with a fallback. Most of the imported list
 * has an email and nothing else, so a bare `[[FIRST_NAME]]` would send "Hi ,"
 * to much of it.
 */
export function mergeTagToken(tag: CampaignMergeTagSpec): string {
  // A URL tag with a fallback would be nonsense — only personal fields get one.
  if (tag.tag === "UNSUBSCRIBE_URL") return `[[${tag.tag}]]`;
  const fallback = tag.fallback ?? DEFAULT_FALLBACKS[tag.tag];
  return fallback ? `[[${tag.tag}|${fallback}]]` : `[[${tag.tag}]]`;
}

const DEFAULT_FALLBACKS: Record<string, string> = {
  FIRST_NAME: "there",
  LAST_NAME:  "",
  FULL_NAME:  "there",
  COMPANY:    "your company",
  COUNTRY:    "",
  MARKET:     "",
  EMAIL:      "",
};

/**
 * Backend validation is written for the marketer: plain strings like
 * `Block 2 (Button): "Where it goes" is required.` Attaching each message to
 * its block beats dumping the whole list at the top of the page, which is how
 * a 12-block campaign becomes unfixable.
 *
 * `Block N` is 1-based. Anything without that prefix is returned as a general
 * message rather than dropped.
 */
export function groupBlockErrors(messages: string[]): {
  byIndex: Record<number, string[]>;
  general: string[];
} {
  const byIndex: Record<number, string[]> = {};
  const general: string[] = [];

  for (const msg of messages) {
    const m = /^\s*Block\s+(\d+)\s*(?:\([^)]*\))?\s*[:.-]\s*(.*)$/i.exec(msg);
    if (m) {
      const idx = Number(m[1]) - 1;
      if (idx >= 0) {
        (byIndex[idx] ??= []).push(m[2].trim() || msg.trim());
        continue;
      }
    }
    general.push(msg.trim());
  }

  return { byIndex, general };
}

/** Wrap the current selection of an input, for the bold/italic/link buttons. */
export function wrapSelection(
  el: HTMLInputElement | HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
): { value: string; cursor: number } {
  const start = el.selectionStart ?? el.value.length;
  const end   = el.selectionEnd ?? start;
  const selected = el.value.slice(start, end) || placeholder;
  const value = el.value.slice(0, start) + before + selected + after + el.value.slice(end);
  return { value, cursor: start + before.length + selected.length + after.length };
}
