"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/**
 * The tyre finder — the first thing a buyer touches on this site.
 *
 * Every serious tyre platform opens with this tool, not with a slogan:
 * Oponeo's hero is a width/profile/rim form, Blackcircles' is a reg-plate/
 * size tab pair, Heuver's webshop leads with one size-first search box. A
 * buyer arrives knowing the size on the sidewall; the fastest route from
 * that number to a result list is the whole job of the homepage.
 *
 * The dropdowns are the REAL distinct values from the catalogue (served by
 * /products/specs), so the form can never offer a size we do not stock.
 * Links reuse the shop's existing query contract — ?size=205/55R16,
 * ?type=PCR, ?brand=X — so nothing downstream changes.
 */

type Specs = {
  widths: string[];
  heights: string[];
  rims: string[];
};

type BrandOption = { name: string; slug?: string | null };

const CATEGORIES = [
  { type: "PCR", label: "Passenger (PCR)", sub: "Cars, SUVs & vans", href: "/shop?type=PCR" },
  { type: "TBR", label: "Truck & Bus (TBR)", sub: "Fleet & logistics", href: "/shop?type=TBR" },
  // Real business, zero catalogue rows: these orders happen at the quote
  // desk, so that is where the buttons go.
  { type: "OTR", label: "Off-the-road (OTR)", sub: "On request", href: "/tyre-supply-quotation" },
  { type: "USED", label: "Quality used", sub: "By the container, on request", href: "/tyre-supply-quotation" },
] as const;

const SEASONS = [
  { value: "", label: "All seasons" },
  { value: "summer", label: "Summer" },
  { value: "winter", label: "Winter" },
  { value: "all-season", label: "All-season" },
] as const;

const POPULAR_SIZES = ["205/55R16", "225/45R17", "195/65R15", "315/80R22.5"];

const selectCls =
  "h-11 w-full cursor-pointer appearance-none rounded-md border border-black/15 bg-white px-3 pr-8 text-[0.9rem] font-medium text-[#171a20] outline-none transition-colors focus:border-[#f4511e] disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/40";

const labelCls = "mb-1 block text-[0.72rem] font-semibold text-[#5c5e62]";

export default function FinderCard({ specs, brands }: { specs: Specs | null; brands: BrandOption[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"size" | "category" | "brand">("size");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [rim, setRim] = useState("");
  const [season, setSeason] = useState("");

  function searchBySize(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    // Partial input still searches: width alone finds every 205, width +
    // profile every 205/55. The sidewall is not always fully legible.
    const size = [width, height && `/${height}`, rim && `R${rim}`]
      .filter(Boolean)
      .join("");
    if (size) p.set("size", size);
    if (season) p.set("season", season);
    router.push(`/shop${p.size ? `?${p}` : ""}`);
  }

  const tabCls = (active: boolean) =>
    `flex-1 border-b-2 px-2 pb-2.5 pt-1 text-[0.85rem] font-semibold transition-colors ${
      active
        ? "border-[#f4511e] text-[#171a20]"
        : "border-transparent text-[#5c5e62] hover:text-[#171a20]"
    }`;

  return (
    <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex gap-1 border-b border-black/10" role="tablist" aria-label="Find tyres">
        <button type="button" role="tab" aria-selected={tab === "size"} onClick={() => setTab("size")} className={tabCls(tab === "size")}>
          By size
        </button>
        <button type="button" role="tab" aria-selected={tab === "category"} onClick={() => setTab("category")} className={tabCls(tab === "category")}>
          By category
        </button>
        <button type="button" role="tab" aria-selected={tab === "brand"} onClick={() => setTab("brand")} className={tabCls(tab === "brand")}>
          By brand
        </button>
      </div>

      {tab === "size" && (
        <form onSubmit={searchBySize}>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="finder-width" className={labelCls}>Width</label>
              <select id="finder-width" value={width} onChange={(e) => setWidth(e.target.value)} className={selectCls}>
                <option value="">e.g. 205</option>
                {(specs?.widths ?? []).map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="finder-height" className={labelCls}>Profile</label>
              <select id="finder-height" value={height} onChange={(e) => setHeight(e.target.value)} className={selectCls}>
                <option value="">e.g. 55</option>
                {(specs?.heights ?? []).map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="finder-rim" className={labelCls}>Rim</label>
              <select id="finder-rim" value={rim} onChange={(e) => setRim(e.target.value)} className={selectCls}>
                <option value="">e.g. 16</option>
                {(specs?.rims ?? []).map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="finder-season" className={labelCls}>Season</label>
            <select id="finder-season" value={season} onChange={(e) => setSeason(e.target.value)} className={selectCls}>
              {SEASONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#f4511e] text-[0.95rem] font-bold text-white transition-colors hover:bg-[#df4618] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4511e]"
          >
            <Search size={16} strokeWidth={2.4} aria-hidden />
            Search tyres
          </button>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] text-[#5c5e62]">
            <span>Popular:</span>
            {POPULAR_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => router.push(`/shop?size=${encodeURIComponent(s)}`)}
                className="font-semibold text-[#171a20] underline decoration-black/20 underline-offset-2 transition-colors hover:decoration-[#f4511e]"
              >
                {s}
              </button>
            ))}
          </div>
        </form>
      )}

      {tab === "category" && (
        <div className="grid gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => router.push(c.href)}
              className="flex items-baseline justify-between rounded-md border border-black/10 px-3.5 py-3 text-left transition-colors hover:border-[#f4511e]"
            >
              <span className="text-[0.9rem] font-semibold text-[#171a20]">{c.label}</span>
              <span className="text-[0.78rem] text-[#5c5e62]">{c.sub}</span>
            </button>
          ))}
        </div>
      )}

      {tab === "brand" && (
        <div>
          <div className="grid max-h-56 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
            {brands.slice(0, 16).map((b) => (
              <button
                key={b.name}
                type="button"
                onClick={() => router.push(`/shop?brand=${encodeURIComponent(b.name)}`)}
                className="rounded-md border border-black/10 px-3 py-2.5 text-left text-[0.85rem] font-semibold text-[#171a20] transition-colors hover:border-[#f4511e]"
              >
                {b.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="mt-3 w-full rounded-md border border-black/15 py-2.5 text-[0.85rem] font-semibold text-[#171a20] transition-colors hover:border-[#f4511e]"
          >
            Browse the full catalogue
          </button>
        </div>
      )}
    </div>
  );
}
