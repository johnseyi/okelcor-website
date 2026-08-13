"use client";

import { useState } from "react";
import {
  ChevronUp, ChevronDown, Trash2, Plus, GripVertical, AlertTriangle, Copy,
} from "lucide-react";
import type { CampaignBlock, CampaignBlockSpec, CampaignMergeTagSpec } from "@/lib/admin-api";
import { blankBlock } from "@/lib/campaign-design";
import BlockField from "./block-field";

/**
 * Row-key source. Module scope rather than a ref so it can be read during
 * render without reaching into a ref, and so two editors on one page can't
 * collide. Ids need only be unique and stable, never meaningful.
 */
let idSeq = 0;
const freshIds = (n: number) => Array.from({ length: n }, () => `blk${idSeq++}`);

/**
 * Vertical block list. Drag-to-reorder plus up/down arrows — the arrows are
 * the ones that matter: they're keyboard-reachable and don't fail on a
 * trackpad, and reordering is how a non-technical author fixes a layout.
 *
 * **Dragging is armed by the grip handle, never by the card.** `draggable` on
 * the whole card is what made "highlighting text drags the block sideways": the
 * HTML5 drag-and-drop spec suppresses native text selection inside a
 * `draggable="true"` subtree, so a press-and-move starting in a text field was
 * claimed as a block drag before a selection could begin. The pointer never
 * highlighted anything and the card followed it instead — sideways, because it
 * was a drag ghost rather than a layout shift.
 *
 * The card still carries `draggable` while the grip is held, so the drag image
 * is the whole block rather than a lone icon.
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
  const [armedIndex, setArmed] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  /**
   * Stable React keys, held **beside** the blocks rather than on them.
   *
   * `blocks` is serialised verbatim to `preview`, `test-send`, the real send and
   * the autosave draft, and it feeds autosave's dirty-tracking hash — so an `id`
   * written onto a block object would travel to the server as an unknown field
   * and mark a pristine campaign dirty. The ids therefore live in a parallel
   * array that every structural change below updates in lockstep.
   *
   * Keying on the array index instead binds each row's local UI state — the
   * image field's broken/picking flags, an open merge-tag menu — to a *position*
   * rather than to a block. Delete block 2 of 5 and React reuses row 2's DOM for
   * what is now a different block, so those flags stay behind on the wrong one.
   */
  const [ids, setIds] = useState<string[]>(() => freshIds(blocks.length));

  // A length change we didn't make ourselves means the parent replaced the
  // canvas wholesale — a template applied, an import used, a draft restored.
  // Fresh ids are correct there: those genuinely are different blocks. This is
  // React's documented "adjust state while rendering" pattern; it re-renders
  // immediately, before anything is committed to the DOM.
  if (ids.length !== blocks.length) setIds(freshIds(blocks.length));

  const specFor = (type: string) => specs.find((s) => s.type === type);

  /** Structural change: blocks and their ids move together, or neither does. */
  function commit(nextBlocks: CampaignBlock[], nextIds: string[]) {
    setIds(nextIds);
    onChange(nextBlocks);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= blocks.length || from === to) return;
    const next    = [...blocks];
    const nextIds = [...ids];
    const [item] = next.splice(from, 1);
    const [id]   = nextIds.splice(from, 1);
    next.splice(to, 0, item);
    nextIds.splice(to, 0, id);
    commit(next, nextIds);
  }

  // Not structural — same rows, same ids, so nothing is remounted mid-keystroke.
  function update(index: number, fieldName: string, value: unknown) {
    onChange(blocks.map((b, i) => (i === index ? { ...b, [fieldName]: value } : b)));
  }

  function remove(index: number) {
    commit(
      blocks.filter((_, i) => i !== index),
      ids.filter((_, i) => i !== index),
    );
  }

  function duplicate(index: number) {
    const next    = [...blocks];
    const nextIds = [...ids];
    next.splice(index + 1, 0, { ...blocks[index] });
    nextIds.splice(index + 1, 0, freshIds(1)[0]);
    commit(next, nextIds);
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => {
        const spec = specFor(block.type);
        const errors = errorsByIndex[i] ?? [];
        const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;

        return (
          <div
            key={ids[i]}
            draggable={armedIndex === i}
            onDragStart={(e) => {
              // Belt and braces: even armed, a drag that began inside an
              // editable field is a text selection the user is trying to make.
              if ((e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]")) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.effectAllowed = "move";
              setDragIndex(i);
            }}
            onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); setArmed(null); }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
              setArmed(null);
            }}
            className={[
              "rounded-xl border bg-white transition",
              errors.length > 0 ? "border-red-300" : "border-black/[0.07]",
              isOver ? "ring-2 ring-[#f4511e]/40" : "",
              dragIndex === i ? "opacity-50" : "",
            ].join(" ")}
          >
            <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2">
              {/*
                The one place a drag may start. Arming on pointer-down and
                disarming on pointer-up/drag-end means the card is draggable
                only while the grip is actually held — everywhere else, and at
                every other moment, text selects normally.

                Not focusable on purpose: the up/down arrows are the keyboard
                path to reordering and a handle that can be tabbed to but not
                operated from the keyboard would be a worse promise than none.
              */}
              <span
                onPointerDown={() => setArmed(i)}
                onPointerUp={() => setArmed(null)}
                title="Drag to reorder"
                aria-hidden="true"
                className="cursor-grab text-[#8c8f94] active:cursor-grabbing"
              >
                <GripVertical size={14} />
              </span>
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
                    siblings={block}
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
