"use client";

import { RotateCcw, ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * The catalogue's filters as a sidebar, the layout every serious tyre
 * platform uses. The old design put nine dropdowns in one horizontal row
 * behind a manual Filter button; a buyer could not see what was applied,
 * and nothing happened until they found the button. Here every control
 * applies itself and the applied state is readable at a glance.
 *
 * Fully controlled: state lives in ShopCatalogue, which owns the fetch.
 */

export type FilterValues = {
  type: string;
  width: string;
  height: string;
  rim: string;
  season: string;
  brand: string;
  priceMin: string;
  priceMax: string;
  speed: string;
  load: string;
};

type Options = {
  brands: string[];
  widths: string[];
  heights: string[];
  rims: string[];
  seasons: string[];
  speeds: string[];
  loadIndexes: string[];
  prices: string[];
};

const TYPES = [
  { value: "PCR", label: "Passenger" },
  { value: "TBR", label: "Truck & bus" },
  { value: "OTR", label: "OTR" },
  { value: "USED", label: "Used" },
] as const;

const selectCls =
  "h-9 w-full cursor-pointer appearance-none rounded-md border border-black/15 bg-white px-2.5 pr-7 text-[0.82rem] font-medium text-[#171a20] outline-none transition-colors focus:border-[#f4511e]";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/10 py-4 first:pt-0 last:border-b-0">
      <p className="mb-2.5 text-[0.72rem] font-bold uppercase tracking-wide text-[#8c8f94]">{title}</p>
      {children}
    </div>
  );
}

export default function CatalogueFilters({
  values,
  onChange,
  onReset,
  options,
  formatPrice,
  hasActive,
}: {
  values: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
  onReset: () => void;
  options: Options;
  formatPrice: (v: string) => string;
  hasActive: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(Boolean(values.speed || values.load));

  return (
    <div className="rounded-lg border border-black/10 bg-white p-4">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[0.95rem] font-bold text-[#171a20]">Filter</p>
        {hasActive && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[0.78rem] font-semibold text-[#5c5e62] transition-colors hover:text-[#f4511e]"
          >
            <RotateCcw size={12} strokeWidth={2} aria-hidden />
            Clear all
          </button>
        )}
      </div>

      <Group title="Vehicle type">
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map((t) => {
            const active = values.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ type: active ? "" : t.value })}
                className={`h-9 rounded-md border text-[0.8rem] font-semibold transition-colors ${
                  active
                    ? "border-[#171a20] bg-[#171a20] text-white"
                    : "border-black/15 bg-white text-[#171a20] hover:border-black/40"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Tyre size">
        <div className="grid grid-cols-3 gap-1.5">
          <select aria-label="Width" value={values.width} onChange={(e) => onChange({ width: e.target.value })} className={selectCls}>
            <option value="">Width</option>
            {options.widths.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select aria-label="Profile" value={values.height} onChange={(e) => onChange({ height: e.target.value })} className={selectCls}>
            <option value="">Profile</option>
            {options.heights.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select aria-label="Rim" value={values.rim} onChange={(e) => onChange({ rim: e.target.value })} className={selectCls}>
            <option value="">Rim</option>
            {options.rims.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </Group>

      <Group title="Season">
        <div className="grid gap-1">
          {options.seasons.map((s) => {
            const active = values.season === s;
            return (
              <label key={s} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[0.85rem] text-[#171a20] hover:bg-black/[0.03]">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onChange({ season: active ? "" : s })}
                  className="h-3.5 w-3.5 accent-[#f4511e]"
                />
                {s}
              </label>
            );
          })}
        </div>
      </Group>

      <Group title="Brand">
        <select aria-label="Brand" value={values.brand} onChange={(e) => onChange({ brand: e.target.value })} className={selectCls}>
          <option value="">All brands</option>
          {options.brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Group>

      <Group title="Price">
        <div className="grid grid-cols-2 gap-1.5">
          <select aria-label="Minimum price" value={values.priceMin} onChange={(e) => onChange({ priceMin: e.target.value })} className={selectCls}>
            <option value="">From</option>
            {options.prices.map((p) => <option key={p} value={p}>{formatPrice(p)}</option>)}
          </select>
          <select aria-label="Maximum price" value={values.priceMax} onChange={(e) => onChange({ priceMax: e.target.value })} className={selectCls}>
            <option value="">To</option>
            {options.prices.map((p) => <option key={p} value={p}>{formatPrice(p)}</option>)}
          </select>
        </div>
      </Group>

      <div className="pt-4">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="flex w-full items-center justify-between text-[0.72rem] font-bold uppercase tracking-wide text-[#8c8f94] transition-colors hover:text-[#171a20]"
        >
          Speed & load
          <ChevronDown size={13} strokeWidth={2.4} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} aria-hidden />
        </button>
        {moreOpen && (
          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <select aria-label="Speed rating" value={values.speed} onChange={(e) => onChange({ speed: e.target.value })} className={selectCls}>
              <option value="">Speed</option>
              {options.speeds.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select aria-label="Load index" value={values.load} onChange={(e) => onChange({ load: e.target.value })} className={selectCls}>
              <option value="">Load</option>
              {options.loadIndexes.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
