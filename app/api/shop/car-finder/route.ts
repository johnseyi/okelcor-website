import { NextRequest, NextResponse } from "next/server";

const WHEEL_SIZE_KEY = process.env.WHEEL_SIZE_API_KEY ?? "";
const BASE = "https://api.wheel-size.com/v2";

const LARAVEL_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LaravelSpecs {
  widths?:  string[];
  heights?: string[];
  rims?:    string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Walk the Wheel-Size search/by_model response and extract every tyre size
 * string we can find, normalised to "205/55R16" format.
 *
 * The API has shipped at least two response shapes over time; we handle both.
 */
function extractSizes(data: unknown[]): string[] {
  const sizes = new Set<string>();

  const addFromTireSide = (tf: Record<string, unknown>) => {
    const full = tf.full_format as string | undefined;
    if (full && /^\d+\/\d+[Rr]\d+/.test(full)) {
      sizes.add(full.split(" ")[0]); // strip speed-rating suffix if present
      return;
    }
    const w = tf.section_width, h = tf.aspect_ratio, d = tf.diameter;
    if (w && h && d) sizes.add(`${w}/${h}R${d}`);
  };

  for (const entry of data) {
    const e = entry as Record<string, unknown>;

    // Shape A: entry.tires[].tire_front / tire_rear
    const tiresA = e.tires as unknown[] | undefined;
    if (Array.isArray(tiresA)) {
      for (const t of tiresA) {
        const tt = t as Record<string, unknown>;
        for (const side of ["tire_front", "tire_rear"]) {
          const tf = tt[side] as Record<string, unknown> | undefined;
          if (tf) addFromTireSide(tf);
        }
      }
    }

    // Shape B: entry.rims[].tires[].tire.name  (e.g. "205/55R16 91V")
    const rims = e.rims as unknown[] | undefined;
    if (Array.isArray(rims)) {
      for (const r of rims) {
        const rimTires = (r as Record<string, unknown>).tires as unknown[] | undefined;
        if (!Array.isArray(rimTires)) continue;
        for (const rt of rimTires) {
          const tire = (rt as Record<string, unknown>).tire as Record<string, unknown> | undefined;
          const name = tire?.name as string | undefined;
          if (name && /^\d+\/\d+[Rr]\d+/.test(name)) {
            sizes.add(name.split(" ")[0]);
          }
        }
      }
    }
  }

  return [...sizes];
}

/** Remove sizes not stocked in the product catalogue. Falls back to full list. */
function filterByStock(sizes: string[], specs: LaravelSpecs): string[] {
  const wSet = new Set(specs.widths  ?? []);
  const hSet = new Set(specs.heights ?? []);
  const rSet = new Set(specs.rims    ?? []);

  if (!wSet.size && !hSet.size && !rSet.size) return sizes;

  return sizes.filter((size) => {
    const m = size.match(/^(\d+)\/(\d+)[Rr](\d+)$/);
    if (!m) return false;
    return (
      (!wSet.size || wSet.has(m[1])) &&
      (!hSet.size || hSet.has(m[2])) &&
      (!rSet.size || rSet.has(m[3]))
    );
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse + validate body
  let make = "", model = "", year = 0;
  try {
    const body = await req.json() as { make?: unknown; model?: unknown; year?: unknown };
    make  = typeof body.make  === "string" ? body.make.trim()  : "";
    model = typeof body.model === "string" ? body.model.trim() : "";
    year  = typeof body.year  === "number" ? body.year
          : typeof body.year  === "string" ? parseInt(body.year, 10) : 0;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!make || !model || !year) {
    return NextResponse.json({ error: "make, model, and year are required" }, { status: 400 });
  }

  if (!WHEEL_SIZE_KEY) {
    return NextResponse.json(
      { error: "Car lookup is not configured (missing WHEEL_SIZE_API_KEY)" },
      { status: 503 },
    );
  }

  // 2. Query Wheel-Size search/by_model
  let allSizes: string[] = [];
  try {
    const url =
      `${BASE}/search/by_model/?make=${encodeURIComponent(make)}` +
      `&model=${encodeURIComponent(model)}&year=${year}&user_key=${WHEEL_SIZE_KEY}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      return NextResponse.json({
        car: { make, model, year },
        sizes: [],
        message: "No tyre data found for this vehicle. Try searching by size below.",
      });
    }

    const json = await res.json() as { data?: unknown[] };
    const data = Array.isArray(json.data) ? json.data : [];
    allSizes = extractSizes(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach the vehicle data service." },
      { status: 503 },
    );
  }

  if (allSizes.length === 0) {
    return NextResponse.json({
      car: { make, model, year },
      sizes: [],
      message: "No tyre data found for this vehicle. Try searching by size below.",
    });
  }

  // 3. Filter against stocked specs (best-effort)
  let specs: LaravelSpecs = {};
  try {
    const specsRes = await fetch(`${LARAVEL_URL}/products/specs`, { cache: "no-store" });
    if (specsRes.ok) {
      const json = await specsRes.json() as { data?: LaravelSpecs };
      specs = json.data ?? {};
    }
  } catch { /* ignore — filterByStock falls back gracefully */ }

  const filtered = filterByStock(allSizes, specs);
  const sizes    = (filtered.length > 0 ? filtered : allSizes).slice(0, 12);

  const inStock  = filtered.length > 0;
  const count    = sizes.length;

  return NextResponse.json({
    car: { make, model, year },
    sizes,
    message: inStock
      ? `${count} OE tyre size${count !== 1 ? "s" : ""} in stock for this vehicle`
      : `${count} OE tyre size${count !== 1 ? "s" : ""} found — click to search our catalogue`,
  });
}
