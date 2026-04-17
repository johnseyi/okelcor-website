import { NextRequest, NextResponse } from "next/server";

// ── Env ───────────────────────────────────────────────────────────────────────

const RAPIDAPI_KEY  = process.env.RAPIDAPI_KEY  ?? "";
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST ?? "cars-by-api-ninjas.p.rapidapi.com";

const LARAVEL_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

// ── Types ─────────────────────────────────────────────────────────────────────

type VehicleClass = "compact" | "sedan" | "suv" | "truck";

interface CarApiEntry {
  make?:            string;
  model?:           string;
  year?:            number;
  class?:           string;
  cylinders?:       number;
  displacement?:    number;
  drive?:           string;
  fuel_type?:       string;
  transmission?:    string;
  combination_mpg?: number;
}

interface LaravelSpecs {
  widths?:       string[];
  heights?:      string[];
  rims?:         string[];
  load_indexes?: string[];
  speed_ratings?: string[];
}

// ── Vehicle-class → size candidates ──────────────────────────────────────────
//
// Each class carries ordered candidate sizes from most to least common.
// We intersect these against the sizes actually stocked (from /products/specs).

const SIZE_MAP: Record<VehicleClass, string[]> = {
  compact: [
    "185/65R15", "195/65R15", "205/55R16", "195/55R16",
    "205/60R16", "185/60R15", "195/60R15", "175/65R14",
    "205/45R17", "215/45R17",
  ],
  sedan: [
    "205/55R16", "215/55R17", "225/50R17", "205/60R16",
    "215/60R16", "225/55R17", "205/65R15", "215/50R17",
    "235/45R18", "225/45R18",
  ],
  suv: [
    "225/65R17", "235/60R18", "245/60R18", "255/55R19",
    "235/65R17", "265/60R18", "245/65R17", "255/60R18",
    "275/55R19", "265/50R20",
  ],
  truck: [
    "265/70R17", "275/65R18", "265/65R17", "285/65R18",
    "255/70R17", "275/70R18", "245/75R16", "265/75R16",
    "285/70R17", "305/65R18",
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Infer a broad vehicle class from the data the Cars API returns.
 * The `class` field (e.g. "compact car", "midsize car", "SUV", "pickup truck")
 * is the primary signal; drive, cylinders and displacement are fallbacks.
 */
function inferVehicleClass(car: CarApiEntry): VehicleClass {
  const cls         = (car.class        ?? "").toLowerCase();
  const drive       = (car.drive        ?? "").toLowerCase();
  const cylinders   = car.cylinders    ?? 4;
  const displacement = car.displacement ?? 2.0;

  if (cls.includes("pickup") || cls.includes("truck"))                     return "truck";
  if (cls.includes("suv") || cls.includes("van") || cls.includes("mini")) return "suv";

  // AWD / 4WD + bigger engine → SUV territory
  if ((drive === "awd" || drive === "4wd") && (cylinders >= 6 || displacement >= 2.5))
    return "suv";

  if (cls.includes("compact") || displacement < 1.8 || cylinders <= 3)    return "compact";
  if (cls.includes("large")   || cylinders >= 8    || displacement >= 4.0) return "truck";

  return "sedan"; // midsize, full-size, sports, etc.
}

/** Parse a size string like "205/55R16" into its three numeric components. */
function parseSize(size: string): { width: number; height: number; rim: number } | null {
  const m = size.match(/^(\d+)\/(\d+)[Rr](\d+)$/);
  return m ? { width: +m[1], height: +m[2], rim: +m[3] } : null;
}

/**
 * Intersect candidate sizes with what the Laravel /products/specs endpoint
 * reports as actually stocked. Falls back to the raw candidate list when
 * the specs endpoint is unavailable or returns no data.
 */
function filterByStock(candidates: string[], specs: LaravelSpecs): string[] {
  const hasSpecs =
    specs.widths?.length   ||
    specs.heights?.length  ||
    specs.rims?.length;

  if (!hasSpecs) return candidates;

  const wSet = new Set(specs.widths  ?? []);
  const hSet = new Set(specs.heights ?? []);
  const rSet = new Set(specs.rims    ?? []);

  return candidates.filter((size) => {
    const p = parseSize(size);
    if (!p) return false;
    return (
      (!wSet.size || wSet.has(String(p.width)))  &&
      (!hSet.size || hSet.has(String(p.height))) &&
      (!rSet.size || rSet.has(String(p.rim)))
    );
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse + validate request body
  let make = "", model = "", year = 0;
  try {
    const body = await req.json() as { make?: unknown; model?: unknown; year?: unknown };
    make  = typeof body.make  === "string" ? body.make.trim()  : "";
    model = typeof body.model === "string" ? body.model.trim() : "";
    year  = typeof body.year  === "number" ? body.year
          : typeof body.year  === "string" ? parseInt(body.year, 10)
          : 0;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!make || !model || !year) {
    return NextResponse.json(
      { error: "make, model, and year are required" },
      { status: 400 },
    );
  }

  if (!RAPIDAPI_KEY) {
    return NextResponse.json(
      { error: "Car lookup is not configured (missing RAPIDAPI_KEY)" },
      { status: 503 },
    );
  }

  // 2. Fetch car details from RapidAPI Cars by API-Ninjas
  let carData: CarApiEntry | null = null;
  try {
    const rapidRes = await fetch(
      `https://cars-by-api-ninjas.p.rapidapi.com/v1/cars?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}&limit=1`,
      {
        headers: {
          "X-RapidAPI-Key":  RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
        cache: "no-store",
      },
    );

    if (rapidRes.ok) {
      const json = await rapidRes.json() as CarApiEntry[] | CarApiEntry;
      carData = Array.isArray(json) ? (json[0] ?? null) : json;
    }
  } catch {
    // carData stays null — handled below
  }

  if (!carData) {
    return NextResponse.json(
      {
        car: null,
        suggested_sizes: [],
        message: "No tyre data found for this vehicle. Try searching by size below.",
      },
      { status: 200 },
    );
  }

  // 3. Fetch stocked specs from Laravel (best-effort — won't block the response)
  let specs: LaravelSpecs = {};
  try {
    const specsRes = await fetch(`${LARAVEL_URL}/products/specs`, { cache: "no-store" });
    if (specsRes.ok) {
      const json = await specsRes.json() as { data?: LaravelSpecs };
      specs = json.data ?? {};
    }
  } catch {
    // specs stays {} — filterByStock falls back to raw candidates
  }

  // 4. Determine vehicle class and produce suggested sizes
  const vehicleClass = inferVehicleClass(carData);
  const candidates   = SIZE_MAP[vehicleClass];
  const filtered     = filterByStock(candidates, specs);
  // Return up to 8 sizes; prefer filtered list, fall back to raw candidates
  const suggested_sizes = (filtered.length >= 2 ? filtered : candidates).slice(0, 8);

  // 5. Return structured response
  return NextResponse.json({
    car: {
      make:    carData.make        ?? make,
      model:   carData.model       ?? model,
      year:    carData.year        ?? year,
      class:   carData.class       ?? null,
      drive:   carData.drive       ?? null,
      fuel_type:   carData.fuel_type   ?? null,
      cylinders:   carData.cylinders   ?? null,
      displacement: carData.displacement ?? null,
      transmission: carData.transmission ?? null,
      combination_mpg: carData.combination_mpg ?? null,
    },
    vehicle_class:  vehicleClass,
    suggested_sizes,
    message: `Showing common tyre sizes for this vehicle class`,
  });
}
