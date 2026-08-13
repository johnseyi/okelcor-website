"use client";

import { useRef, useState } from "react";
import { ImageIcon, Plus, X, Bold, Italic, Link2, Tag, ImageOff } from "lucide-react";
import type { CampaignFieldSpec, CampaignMergeTagSpec, CampaignSelectOption } from "@/lib/admin-api";
import { mergeTagToken, wrapSelection } from "@/lib/campaign-design";
import MediaPickerModal from "@/components/admin/media-picker-modal";

const INPUT =
  "h-9 w-full rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none";
const LABEL = "mb-1 block text-[0.78rem] font-semibold text-[#5c5e62]";

/** Merge tags apply to prose and to a button URL, not to every field. */
function acceptsMergeTags(type: CampaignFieldSpec["type"]) {
  return type === "text" || type === "textarea" || type === "url";
}

/** Inline formatting is paragraph-level only. */
function acceptsFormatting(type: CampaignFieldSpec["type"]) {
  return type === "text" || type === "textarea";
}

// ── Toolbar above prose inputs ────────────────────────────────────────────────

function FieldToolbar({
  field,
  mergeTags,
  onInsert,
  onWrap,
}: {
  field: CampaignFieldSpec;
  mergeTags: CampaignMergeTagSpec[];
  onInsert: (token: string) => void;
  onWrap: (before: string, after: string, placeholder: string) => void;
}) {
  const [openTags, setOpenTags] = useState(false);
  const showTags = acceptsMergeTags(field.type) && mergeTags.length > 0;
  const showFormat = acceptsFormatting(field.type);
  if (!showTags && !showFormat) return null;

  const btn =
    "flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.72rem] font-semibold text-[#5c5e62] transition hover:bg-[#f0f2f5] hover:text-[#171a20]";

  return (
    <div className="mb-1 flex flex-wrap items-center gap-0.5">
      {showFormat && (
        <>
          <button type="button" onClick={() => onWrap("**", "**", "bold text")} title="Bold" className={btn}>
            <Bold size={12} />
          </button>
          <button type="button" onClick={() => onWrap("*", "*", "italic text")} title="Italic" className={btn}>
            <Italic size={12} />
          </button>
          <button
            type="button"
            onClick={() => onWrap("[", "](https://okelcor.com)", "link text")}
            title="Link"
            className={btn}
          >
            <Link2 size={12} />
          </button>
        </>
      )}

      {showTags && (
        <div className="relative">
          <button type="button" onClick={() => setOpenTags((v) => !v)} className={btn}>
            <Tag size={12} /> Insert name / company…
          </button>
          {openTags && (
            <>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpenTags(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-black/[0.08] bg-white py-1 shadow-lg">
                {mergeTags.map((t) => {
                  const token = mergeTagToken(t);
                  return (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => { onInsert(token); setOpenTags(false); }}
                      className="block w-full px-3 py-1.5 text-left transition hover:bg-[#f5f5f5]"
                    >
                      <span className="block text-[0.78rem] font-semibold text-[#171a20]">{t.label}</span>
                      <span className="block font-mono text-[0.68rem] text-[#8c8f94]">{token}</span>
                    </button>
                  );
                })}
                {/* The fallback is the point, so it's stated where it's chosen. */}
                <p className="border-t border-black/[0.06] px-3 py-1.5 text-[0.68rem] leading-snug text-[#8c8f94]">
                  The word after <span className="font-mono">|</span> is used when a contact has no
                  value — most of the list has only an email.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {showFormat && (
        <span className="ml-auto font-mono text-[0.68rem] text-[#8c8f94]">**bold** *italic* [text](url)</span>
      )}
    </div>
  );
}

// ── Image field ───────────────────────────────────────────────────────────────

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [picking, setPicking] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.08] bg-[#f5f5f5]">
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
              onLoad={() => setBroken(false)}
            />
          ) : (
            // Starter templates point at placeholder URLs that may not exist
            // yet. That's an instruction, not a fault — a broken-image icon
            // would read as something the marketer did wrong.
            <div className="px-1 text-center">
              <ImageOff size={14} className="mx-auto text-[#8c8f94]" />
              <span className="mt-0.5 block text-[0.62rem] leading-tight text-[#8c8f94]">
                {value ? "Replace this image" : "No image yet"}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#f0f2f5] px-3 py-1.5 text-[0.78rem] font-semibold text-[#171a20] transition hover:bg-[#e5e7eb]"
          >
            <ImageIcon size={12} /> {value ? "Change image" : "Choose from Media Library"}
          </button>
          {value && (
            <p className="mt-1 truncate font-mono text-[0.68rem] text-[#8c8f94]" title={value}>{value}</p>
          )}
        </div>
      </div>

      {picking && (
        <MediaPickerModal
          onSelect={(url) => { setBroken(false); onChange(url); setPicking(false); }}
          onClose={() => setPicking(false)}
        />
      )}
    </>
  );
}

// ── Repeatable lists ──────────────────────────────────────────────────────────

function TextListField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      {value.map((line, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={line}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            className={INPUT}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ""])}
        className="flex items-center gap-1 text-[0.78rem] font-semibold text-[#f4511e] hover:underline"
      >
        <Plus size={12} /> Add line
      </button>
    </div>
  );
}

type LinkItem = { label: string; url: string };

function LinkListField({ value, onChange }: { value: LinkItem[]; onChange: (v: LinkItem[]) => void }) {
  return (
    <div className="space-y-1.5">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={item.label ?? ""}
            placeholder="Name (e.g. Facebook)"
            onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, label: e.target.value } : v)))}
            className={`${INPUT} w-2/5`}
          />
          <input
            value={item.url ?? ""}
            placeholder="https://…"
            onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, url: e.target.value } : v)))}
            className={INPUT}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="shrink-0 rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { label: "", url: "" }])}
        className="flex items-center gap-1 text-[0.78rem] font-semibold text-[#f4511e] hover:underline"
      >
        <Plus size={12} /> Add link
      </button>
    </div>
  );
}

// ── Repeatable groups (type: "group_list") ────────────────────────────────────

/**
 * Entry keys, held beside the entries — same reasoning as the block rows in
 * `block-editor.tsx`. The server ignores undeclared keys, so a stray id inside
 * an entry wouldn't break a send, but it would still travel in the payload and
 * churn autosave's dirty hash for nothing.
 */
let entrySeq = 0;
const freshEntryIds = (n: number) => Array.from({ length: n }, () => `ent${entrySeq++}`);

/**
 * A repeating group of sub-fields — the cards block's items.
 *
 * Each entry renders through `BlockField` itself, so every field type already
 * supported works inside a group, including another group. That recursion is
 * what makes the container cost one renderer instead of a second vocabulary,
 * and it only holds because the server flattens `item_fields` into the same
 * shape as a block's own fields, at any depth.
 *
 * Entries are numbered "Entry N" on purpose: server-side validation reads
 * `Block 3 (Cards): entry 2 needs "Title".`, so the label a marketer is told to
 * look for is the label actually on screen.
 */
function GroupListField({
  field,
  value,
  mergeTags,
  onChange,
}: {
  field: CampaignFieldSpec;
  value: unknown;
  mergeTags: CampaignMergeTagSpec[];
  onChange: (v: unknown) => void;
}) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const [ids, setIds] = useState<string[]>(() => freshEntryIds(items.length));
  if (ids.length !== items.length) setIds(freshEntryIds(items.length));

  const itemFields = field.itemFields ?? [];
  const atMax = typeof field.maxItems === "number" && items.length >= field.maxItems;

  // An entry the server can't describe would be edited blind, exactly like a
  // block type missing from the schema — so it says so rather than guessing.
  if (itemFields.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 p-3 text-[0.78rem] text-amber-800">
        This list can&apos;t be edited here — the server didn&apos;t describe what one entry
        contains. It will still send as-is.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={ids[i]} className="rounded-lg border border-black/[0.08] bg-[#fafafa] p-2.5">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[0.72rem] font-semibold text-[#8c8f94]">Entry {i + 1}</span>
            <button
              type="button"
              onClick={() => {
                setIds(ids.filter((_, j) => j !== i));
                onChange(items.filter((_, j) => j !== i));
              }}
              title="Remove this entry"
              className="ml-auto rounded-lg p-1 text-[#5c5e62] transition hover:bg-red-50 hover:text-red-600"
            >
              <X size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {itemFields.map((f) => (
              <BlockField
                key={f.name}
                field={f}
                value={item[f.name]}
                mergeTags={mergeTags}
                onChange={(v) =>
                  onChange(items.map((it, j) => (j === i ? { ...it, [f.name]: v } : it)))
                }
                siblings={item}
              />
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        disabled={atMax}
        onClick={() => {
          // A blank entry is fine — the server drops an entirely empty row, so
          // pressing this twice can't produce a validation error to clear up.
          setIds([...ids, freshEntryIds(1)[0]]);
          onChange([...items, {}]);
        }}
        className="flex items-center gap-1 text-[0.78rem] font-semibold text-[#f4511e] transition hover:underline disabled:text-[#8c8f94] disabled:no-underline"
      >
        <Plus size={12} /> Add {field.label.toLowerCase().replace(/s$/, "")}
      </button>

      {atMax && (
        <p className="text-[0.72rem] text-[#8c8f94]">
          That&apos;s the maximum of {field.maxItems}. Remove one to add another.
        </p>
      )}
    </div>
  );
}

// ── Position grid (control: "position_grid") ──────────────────────────────────

/**
 * The nine positions come from `valign × align` on a table cell — the entire
 * vocabulary email has for putting words on a picture. So the grid is drawn
 * from that shape rather than from a count: three rows by three columns.
 */
const ROWS = ["top", "middle", "bottom"] as const;
const COLS = ["left", "center", "right"] as const;

/** Static class names — Tailwind can't see a string built at runtime. */
const V_ALIGN = { top: "items-start", middle: "items-center", bottom: "items-end" } as const;
const H_ALIGN = { left: "justify-start", center: "justify-center", right: "justify-end" } as const;
const H_TEXT  = { left: "text-left", center: "text-center", right: "text-right" } as const;

/**
 * Match the served options onto the 3×3 grid, or return null.
 *
 * Null means "this select doesn't have the shape the grid draws" and the caller
 * renders the ordinary dropdown. That is the whole safety story for `control`:
 * the hint is advice, and a server that sends `position_grid` on a field with
 * four options gets a working four-option dropdown rather than a broken grid.
 */
function positionCells(options: CampaignSelectOption[]): CampaignSelectOption[][] | null {
  const byValue = new Map(options.map((o) => [o.value, o]));
  const cells = ROWS.map((r) => COLS.map((c) => byValue.get(`${r}_${c}`)));
  if (cells.some((row) => row.some((cell) => cell === undefined))) return null;
  return cells as CampaignSelectOption[][];
}

/**
 * A 3×3 picker drawn over the block's own background picture.
 *
 * A dropdown reading `middle_center` is a correct control and a useless one —
 * the marketer's question is "where will the words be", and the answer should
 * be visible rather than decoded. Clicking a cell puts the real headline there,
 * over the real picture, with the real scrim.
 *
 * Sibling field names (`image`, `heading`, `text_color`, `overlay`) are read
 * softly: each is optional and the control degrades a step at a time — no
 * picture gives a neutral ground, no headline gives the word "Headline". So a
 * server that renames or drops one loses fidelity in the *preview*, never the
 * ability to choose a position.
 */
function PositionGrid({
  cells,
  value,
  onChange,
  siblings,
}: {
  cells: CampaignSelectOption[][];
  value: string;
  onChange: (v: string) => void;
  siblings: Record<string, unknown>;
}) {
  const image    = typeof siblings.image === "string" ? siblings.image.trim() : "";
  const heading  = typeof siblings.heading === "string" ? siblings.heading.trim() : "";
  const darkText = siblings.text_color === "dark";
  const overlay  = typeof siblings.overlay === "string" ? siblings.overlay : "soft";

  // The scrim follows the text colour, not the picture: it exists to put a
  // contrasting ground behind the words.
  const scrim =
    overlay === "none"   ? null
    : darkText           ? (overlay === "strong" ? "bg-white/60" : "bg-white/30")
    :                      (overlay === "strong" ? "bg-black/50" : "bg-black/25");

  return (
    <div>
      <div className="relative h-36 w-full overflow-hidden rounded-lg border border-black/[0.10] bg-[#e8eaed]">
        {/*
          A real <img> rather than a CSS `background-image`. Building
          `url("…")` from a value means a stray quote in it can close the
          string and inject declarations into the admin page — and an `src`
          attribute needs no such escaping. It also renders a picture that
          fails to load as nothing, over the neutral ground, instead of
          leaving a broken-image glyph under the grid.
        */}
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}

        {scrim && <div className={`pointer-events-none absolute inset-0 ${scrim}`} />}

        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {cells.flatMap((row, r) =>
            row.map((opt, c) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  aria-pressed={selected}
                  aria-label={opt.label}
                  title={opt.label}
                  className={[
                    "group flex overflow-hidden p-1.5 transition",
                    V_ALIGN[ROWS[r]], H_ALIGN[COLS[c]],
                    selected
                      ? "ring-2 ring-inset ring-[#f4511e]"
                      : "hover:bg-[#f4511e]/15",
                  ].join(" ")}
                >
                  {selected ? (
                    <span
                      className={[
                        "line-clamp-2 text-[0.66rem] font-bold leading-tight drop-shadow",
                        H_TEXT[COLS[c]],
                        darkText ? "text-[#171a20]" : "text-white",
                      ].join(" ")}
                    >
                      {heading || "Headline"}
                    </span>
                  ) : (
                    // A faint target, so all nine read as clickable without
                    // drawing nine boxes over the artwork.
                    <span className="h-1 w-1 rounded-full bg-white/0 transition group-hover:bg-white" />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/*
        Images-off is the normal state of a corporate inbox, not an edge case.
        The fallback ground is a flat colour picked from the text colour — a
        picture that never loads can't be sampled — so the headline has to work
        on its own. Said here, where the banner is being composed, rather than
        in a note nobody reads at send time.
      */}
      {/*
        Below the box, never inside it. Any in-box notice occupies one of the
        nine cells, so choosing that position drops the headline on top of it —
        `top_center` collided with this text when it sat at the top edge.
      */}
      {!image && (
        <p className="mt-1.5 text-[0.72rem] leading-snug text-[#5c5e62]">
          No picture chosen yet — pick one above to see the words sitting on it.
        </p>
      )}

      <p className="mt-1.5 text-[0.72rem] leading-snug text-[#8c8f94]">
        Many inboxes block pictures by default. When that happens the words show on a plain
        colour instead — so keep the headline short, and fill in the picture description.
      </p>
    </div>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

export default function BlockField({
  field,
  value,
  mergeTags,
  onChange,
  siblings,
}: {
  field: CampaignFieldSpec;
  value: unknown;
  mergeTags: CampaignMergeTagSpec[];
  onChange: (v: unknown) => void;
  /**
   * The other field values on this block, read-only. Only a control that draws
   * a picture of the result needs them (today: `position_grid`); everything
   * else edits its own value and ignores this.
   */
  siblings?: Record<string, unknown>;
}) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  function applyToInput(mutate: (el: HTMLInputElement | HTMLTextAreaElement) => { value: string; cursor: number }) {
    const el = ref.current;
    if (!el) return;
    const { value: next, cursor } = mutate(el);
    onChange(next);
    // Restore the caret after React re-renders with the new value, so the
    // author can keep typing where they left off.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  const insert = (token: string) =>
    applyToInput((el) => wrapSelection(el, token, "", ""));
  const wrap = (before: string, after: string, placeholder: string) =>
    applyToInput((el) => wrapSelection(el, before, after, placeholder));

  const asString = typeof value === "string" ? value : value == null ? "" : String(value);

  // `control` is a hint, so it is resolved to a concrete control here and
  // falls through to the plain one for the type whenever it can't be honoured
  // — an unknown name, or options that don't fit the grid.
  const gridCells =
    field.type === "select" && field.control === "position_grid"
      ? positionCells(field.options)
      : null;

  // On prose, `max` is a character limit the server enforces (heading 300,
  // card title 120). It was being ignored here, so the only way to discover it
  // was a 422 after writing. Stopping at the limit is kinder than truncating
  // server-side; the count appears once it's close enough to matter, and stays
  // out of the way until then.
  const charLimit =
    field.type === "text" || field.type === "textarea" ? field.max : undefined;
  const showCount = charLimit !== undefined && asString.length >= charLimit * 0.8;

  return (
    <div>
      <label className={LABEL}>
        {field.label}
        {field.required && <span className="ml-0.5 text-[#f4511e]">*</span>}
      </label>

      {(field.type === "text" || field.type === "textarea" || field.type === "url") && (
        <FieldToolbar field={field} mergeTags={mergeTags} onInsert={insert} onWrap={wrap} />
      )}

      {field.type === "textarea" ? (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={asString}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          maxLength={charLimit}
          rows={4}
          className="w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none"
        />
      ) : gridCells ? (
        <PositionGrid
          cells={gridCells}
          value={asString}
          onChange={onChange}
          siblings={siblings ?? {}}
        />
      ) : field.type === "select" ? (
        <select value={asString} onChange={(e) => onChange(e.target.value)} className={INPUT}>
          {!field.required && <option value="">—</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : field.type === "number" ? (
        <input
          type="number"
          value={asString}
          min={field.min}
          max={field.max}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className={INPUT}
        />
      ) : field.type === "image_url" ? (
        <ImageField value={asString} onChange={onChange} />
      ) : field.type === "text_list" ? (
        <TextListField
          value={Array.isArray(value) ? (value as string[]) : []}
          onChange={onChange}
        />
      ) : field.type === "link_list" ? (
        <LinkListField
          value={Array.isArray(value) ? (value as LinkItem[]) : []}
          onChange={onChange}
        />
      ) : field.type === "group_list" ? (
        <GroupListField field={field} value={value} mergeTags={mergeTags} onChange={onChange} />
      ) : (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type="text"
          value={asString}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          maxLength={charLimit}
          className={INPUT}
        />
      )}

      {showCount && (
        <p className="mt-1 text-right font-mono text-[0.68rem] text-[#8c8f94]">
          {asString.length}/{charLimit}
        </p>
      )}

      {field.help && <p className="mt-1 text-[0.72rem] text-[#8c8f94]">{field.help}</p>}
    </div>
  );
}
