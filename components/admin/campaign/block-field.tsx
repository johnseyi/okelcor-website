"use client";

import { useRef, useState } from "react";
import { ImageIcon, Plus, X, Bold, Italic, Link2, Tag, ImageOff } from "lucide-react";
import type { CampaignFieldSpec, CampaignMergeTagSpec } from "@/lib/admin-api";
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

// ── Dispatcher ────────────────────────────────────────────────────────────────

export default function BlockField({
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
          rows={4}
          className="w-full rounded-lg border border-black/[0.10] bg-white px-3 py-2 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none"
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
      ) : (
        <input
          ref={ref as React.RefObject<HTMLInputElement>}
          type="text"
          value={asString}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={INPUT}
        />
      )}

      {field.help && <p className="mt-1 text-[0.72rem] text-[#8c8f94]">{field.help}</p>}
    </div>
  );
}
