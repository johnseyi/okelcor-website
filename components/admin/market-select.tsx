"use client";

import { useCallback, useEffect, useState } from "react";

export type MarketOption = { market: string; contact_count: number };

/**
 * Markets are auto-discovered server-side from real contact data (grouped
 * by the `market` column) — not a hardcoded list. Fetched once per mount;
 * call `refresh()` after creating a contact under a brand-new market so it
 * shows up without a full page reload.
 */
export function useMarketOptions() {
  const [markets, setMarkets] = useState<MarketOption[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketing-contacts/markets");
      const json = await res.json().catch(() => ({ data: [] }));
      setMarkets(Array.isArray(json.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { markets, loading, refresh };
}

export function label(market: string) {
  return market.charAt(0).toUpperCase() + market.slice(1);
}

/**
 * Multi-market picker (campaign audience). A contact can belong to several
 * markets, and the backend selects one in two of them exactly once — so the
 * send size is whatever the recipient-count endpoint reports, never the sum of
 * the per-market counts shown on the chips.
 *
 * Selection only, no free-text: filtering by a market with zero contacts is
 * meaningless, same reasoning as `mode="filter"` above.
 */
export function MarketMultiSelect({
  markets,
  value,
  onChange,
}: {
  markets: MarketOption[];
  value: string[];
  onChange: (markets: string[]) => void;
}) {
  if (markets.length === 0) {
    return <p className="text-[0.78rem] text-[#8c8f94]">No markets yet — import or add a contact first.</p>;
  }

  function toggle(market: string) {
    onChange(value.includes(market) ? value.filter((m) => m !== market) : [...value, market]);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange([])}
        className={[
          "rounded-full px-3 py-1.5 text-[0.78rem] font-semibold transition",
          value.length === 0 ? "bg-[#171a20] text-white" : "bg-[#f0f2f5] text-[#5c5e62] hover:bg-[#e5e7eb]",
        ].join(" ")}
      >
        All markets
      </button>
      {markets.map((m) => {
        const on = value.includes(m.market);
        return (
          <button
            key={m.market}
            type="button"
            onClick={() => toggle(m.market)}
            aria-pressed={on}
            className={[
              "rounded-full px-3 py-1.5 text-[0.78rem] font-semibold capitalize transition",
              on ? "bg-[#f4511e] text-white" : "bg-[#f0f2f5] text-[#5c5e62] hover:bg-[#e5e7eb]",
            ].join(" ")}
          >
            {m.market} ({m.contact_count})
          </button>
        );
      })}
    </div>
  );
}

const NEW_MARKET_SENTINEL = "__new__";
const BASE_CLASS =
  "h-9 rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] focus:border-[#f4511e] focus:outline-none";

/**
 * Two modes:
 * - "filter": plain dropdown of discovered markets only — filtering by a
 *   market with zero contacts is meaningless, so no way to add one here.
 * - "create": adds a "+ New market" option that reveals a free-text input,
 *   for import/manual-add flows that can genuinely tag something new.
 *
 * Note: the backend does not normalise (slugify) market values embedded
 * inside an imported CSV's own column, only ones supplied here directly —
 * so this component doesn't attempt client-side dedup/casing fixes either;
 * it shows exactly what `/markets` returns.
 */
export function MarketSelect({
  markets,
  value,
  onChange,
  mode,
  allLabel = "All markets",
  className,
}: {
  markets: MarketOption[];
  value: string;
  onChange: (market: string) => void;
  mode: "filter" | "create";
  allLabel?: string;
  className?: string;
}) {
  const isKnownMarket = markets.some((m) => m.market === value);
  const [creatingNew, setCreatingNew] = useState(mode === "create" && value !== "" && !isKnownMarket);

  if (mode === "filter") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={className ?? BASE_CLASS}>
        <option value="">{allLabel}</option>
        {markets.map((m) => (
          <option key={m.market} value={m.market}>
            {label(m.market)} ({m.contact_count})
          </option>
        ))}
      </select>
    );
  }

  if (creatingNew) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          autoFocus
          placeholder="New market name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={
            className ??
            "h-9 flex-1 rounded-lg border border-black/[0.10] bg-white px-3 text-[0.83rem] text-[#171a20] placeholder:text-[#8c8f94] focus:border-[#f4511e] focus:outline-none"
          }
        />
        <button
          type="button"
          onClick={() => {
            setCreatingNew(false);
            onChange("");
          }}
          className="shrink-0 text-[0.78rem] text-[#5c5e62] hover:text-[#171a20]"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === NEW_MARKET_SENTINEL) {
          setCreatingNew(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className={className ?? BASE_CLASS}
    >
      <option value="">Select market…</option>
      {markets.map((m) => (
        <option key={m.market} value={m.market}>
          {label(m.market)} ({m.contact_count})
        </option>
      ))}
      <option value={NEW_MARKET_SENTINEL}>+ New market</option>
    </select>
  );
}
