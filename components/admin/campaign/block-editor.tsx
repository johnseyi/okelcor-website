"use client";

import { useState } from "react";
import {
  ChevronUp, ChevronDown, Trash2, Plus, GripVertical, AlertTriangle, Copy,
} from "lucide-react";
import type { CampaignBlock, CampaignBlockSpec, CampaignMergeTagSpec } from "@/lib/admin-api";
import { blankBlock } from "@/lib/campaign-design";
import BlockField from "./block-field";

/**
 * Vertical block list. Drag-to-reorder plus up/down arrows — the arrows are
 * the ones that matter: they're keyboard-reachable and don't fail on a
 * trackpad, and reordering is how a non-technical author fixes a layout.
 */
export default function BlockEditor({
  blocks,
  specs,
  mergeTags,
  errorsByIndex,
  onChange,
}: {
  blocks: CampaignBlock[];
  specs: CampaignBlockSpec[];
  mergeTags: CampaignMergeTagSpec[];
  errorsByIndex: Record<number, string[]>;
  onChange: (blocks: CampaignBlock[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const specFor = (type: string) => specs.find((s) => s.type === type);

  function move(from: number, to: number) {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next = [...blocks];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function update(index: number, fieldName: string, value: unknown) {
    onChange(blocks.map((b, i) => (i === index ? { ...b, [fieldName]: value } : b)));
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function duplicate(index: number) {
    const next = [...blocks];
    next.splice(index + 1, 0, { ...blocks[index] });
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const spec = specFor(block.type);
        const errors = errorsByIndex[i] ?? [];
        const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;

        return (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={[
              "rounded-xl border bg-white transition",
              errors.length > 0 ? "border-red-300" : "border-black/[0.07]",
              isOver ? "ring-2 ring-[#f4511e]/40" : "",
              dragIndex === i ? "opacity-50" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2">
              <GripVertical size={14} className="cursor-grab text-[#8c8f94]" />
              <span className="text-[0.78rem] font-bold text-[#171a20]">
                {spec?.label ?? block.type}
              </span>
              <span className="text-[0.72rem] text-[#8c8f94]">Block {i + 1}</span>

              <div className="ml-auto flex items-center gap-0.5">
                <button
                  type="button" onClick={() => move(i, i - 1)} disabled={i === 0}
                  title="Move up"
                  className="rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-[#f0f2f5] hover:text-[#171a20] disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button" onClick={() => move(i, i + 1)} disabled={i === blocks.length - 1}
                  title="Move down"
                  className="rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-[#f0f2f5] hover:text-[#171a20] disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button" onClick={() => duplicate(i)} title="Duplicate"
                  className="rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-[#f0f2f5] hover:text-[#171a20]"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button" onClick={() => remove(i)} title="Delete block"
                  className="rounded-lg p-1.5 text-[#5c5e62] transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Errors sit on the block they belong to — a 12-block campaign is
                unfixable if they're all dumped at the top of the page. */}
            {errors.length > 0 && (
              <ul className="space-y-0.5 border-b border-red-100 bg-red-50 px-3 py-2 text-[0.78rem] text-red-700">
                {errors.map((e, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {e}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3 p-3">
              {spec ? (
                spec.fields.map((f) => (
                  <BlockField
                    key={f.name}
                    field={f}
                    value={block[f.name]}
                    mergeTags={mergeTags}
                    onChange={(v) => update(i, f.name, v)}
                  />
                ))
              ) : (
                // A block type the current schema doesn't describe (older
                // campaign, newer server). Editing it blind would corrupt it.
                <p className="rounded-lg bg-amber-50 p-3 text-[0.78rem] text-amber-800">
                  This block type (<span className="font-mono">{block.type}</span>) isn&apos;t in the
                  current design schema, so it can&apos;t be edited here. It will still send as-is —
                  delete it if you don&apos;t want it.
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Add block */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          disabled={specs.length === 0}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-black/10 py-3 text-[0.83rem] font-semibold text-[#5c5e62] transition hover:border-[#f4511e]/50 hover:text-[#171a20] disabled:opacity-50"
        >
          <Plus size={14} /> Add block
        </button>
        {adding && specs.length > 0 && (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setAdding(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <div className="absolute bottom-full left-1/2 z-20 mb-1 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-black/[0.08] bg-white py-1 shadow-lg">
              {specs.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  onClick={() => { onChange([...blocks, blankBlock(s)]); setAdding(false); }}
                  className="block w-full px-3 py-2 text-left transition hover:bg-[#f5f5f5]"
                >
                  <span className="block text-[0.83rem] font-semibold text-[#171a20]">{s.label}</span>
                  {s.description && (
                    <span className="block text-[0.72rem] text-[#8c8f94]">{s.description}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
