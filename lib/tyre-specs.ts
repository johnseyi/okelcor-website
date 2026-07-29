/**
 * lib/tyre-specs.ts
 *
 * Tyre service-description decoding — load index → kg, speed symbol → km/h.
 *
 * Products carry a `spec` string like "91V" or "154/150 K" that today renders
 * verbatim on the card and detail page. To a wholesale buyer that string is
 * meaningful; to everyone else it is noise. Decoding it at the decision point
 * costs nothing (the data is already there) and is the difference between a
 * catalogue and a distributor's catalogue.
 *
 * Values are the ISO / ETRTO standard tables. They are fixed by standard, not
 * by supplier, so hardcoding them here is correct — there is no backend field
 * to wait for.
 */

/** Load index → maximum load per tyre in kilograms (ISO 4000-1 / ETRTO). */
const LOAD_INDEX_KG: Record<number, number> = {
  50: 190, 51: 195, 52: 200, 53: 206, 54: 212, 55: 218, 56: 224, 57: 230,
  58: 236, 59: 243, 60: 250, 61: 257, 62: 265, 63: 272, 64: 280, 65: 290,
  66: 300, 67: 307, 68: 315, 69: 325, 70: 335, 71: 345, 72: 355, 73: 365,
  74: 375, 75: 387, 76: 400, 77: 412, 78: 425, 79: 437, 80: 450, 81: 462,
  82: 475, 83: 487, 84: 500, 85: 515, 86: 530, 87: 545, 88: 560, 89: 580,
  90: 600, 91: 615, 92: 630, 93: 650, 94: 670, 95: 690, 96: 710, 97: 730,
  98: 750, 99: 775, 100: 800, 101: 825, 102: 850, 103: 875, 104: 900,
  105: 925, 106: 950, 107: 975, 108: 1000, 109: 1030, 110: 1060, 111: 1090,
  112: 1120, 113: 1150, 114: 1180, 115: 1215, 116: 1250, 117: 1285, 118: 1320,
  119: 1360, 120: 1400, 121: 1450, 122: 1500, 123: 1550, 124: 1600, 125: 1650,
  126: 1700, 127: 1750, 128: 1800, 129: 1850, 130: 1900, 131: 1950, 132: 2000,
  133: 2060, 134: 2120, 135: 2180, 136: 2240, 137: 2300, 138: 2360, 139: 2430,
  140: 2500, 141: 2575, 142: 2650, 143: 2725, 144: 2800, 145: 2900, 146: 3000,
  147: 3075, 148: 3150, 149: 3250, 150: 3350, 151: 3450, 152: 3550, 153: 3650,
  154: 3750, 155: 3875, 156: 4000, 157: 4125, 158: 4250, 159: 4375, 160: 4500,
};

/** Speed symbol → maximum speed in km/h. */
const SPEED_SYMBOL_KMH: Record<string, number> = {
  F: 80, G: 90, J: 100, K: 110, L: 120, M: 130, N: 140, P: 150, Q: 160,
  R: 170, S: 180, T: 190, U: 200, H: 210, V: 240, W: 270, Y: 300,
};

/**
 * Service descriptions can be single ("91V") or dual-fitment ("154/150 K",
 * used on TBR where the tyre carries a different load single vs. twinned).
 * Accepts optional whitespace and lower case.
 */
const SPEC_RE = /^\s*(\d{2,3})(?:\/(\d{2,3}))?\s*([A-Z]{1,2})?\s*$/i;

export type TyreServiceDescription = {
  /** Load index for single fitment. */
  loadIndex: number;
  /** Load index for dual/twinned fitment, when the tyre quotes one. */
  loadIndexDual?: number;
  /** Max load per tyre, single fitment, in kg. Undefined if index is off-table. */
  loadKg?: number;
  /** Max load per tyre, dual fitment, in kg. */
  loadKgDual?: number;
  /** Speed symbol as written, e.g. "V". */
  speedSymbol?: string;
  /** Max speed in km/h. Undefined if the symbol is unrecognised. */
  speedKmh?: number;
};

/**
 * Parse a service description. Returns null when the string is not a service
 * description at all — callers fall back to rendering the raw `spec`, so an
 * unparseable value is never worse than today's behaviour.
 */
export function parseServiceDescription(spec?: string | null): TyreServiceDescription | null {
  if (!spec) return null;
  const m = SPEC_RE.exec(spec);
  if (!m) return null;

  const loadIndex = Number(m[1]);
  if (!Number.isFinite(loadIndex)) return null;

  const loadIndexDual = m[2] ? Number(m[2]) : undefined;
  const speedSymbol = m[3] ? m[3].toUpperCase() : undefined;

  return {
    loadIndex,
    loadIndexDual,
    loadKg: LOAD_INDEX_KG[loadIndex],
    loadKgDual: loadIndexDual != null ? LOAD_INDEX_KG[loadIndexDual] : undefined,
    speedSymbol,
    speedKmh: speedSymbol ? SPEED_SYMBOL_KMH[speedSymbol] : undefined,
  };
}

export function loadIndexToKg(index?: number | null): number | undefined {
  if (index == null) return undefined;
  return LOAD_INDEX_KG[index];
}

export function speedSymbolToKmh(symbol?: string | null): number | undefined {
  if (!symbol) return undefined;
  return SPEED_SYMBOL_KMH[symbol.toUpperCase()];
}

/**
 * Tyre class under Regulation (EU) 2020/740 — determines which label elements
 * apply (ice grip is C1 only; C3 uses a different wet-grip scale).
 *   C1 — passenger car   C2 — light truck / van   C3 — truck & bus
 */
export type TyreClass = "C1" | "C2" | "C3";

/** Best-effort class from the product `type` field used across the catalogue. */
export function tyreClassFromType(type?: string | null): TyreClass | undefined {
  if (!type) return undefined;
  const t = type.trim().toUpperCase();
  if (t === "PCR" || t === "PASSENGER") return "C1";
  if (t === "LT" || t === "VAN" || t === "LIGHT TRUCK") return "C2";
  if (t === "TBR" || t === "TRUCK" || t === "BUS") return "C3";
  return undefined;
}

/**
 * Rim diameter in inches, parsed from a size designation ("315/80 R22.5").
 * Used by the container-load estimator to bucket tyres by physical size.
 */
export function rimDiameterFromSize(size?: string | null): number | undefined {
  if (!size) return undefined;
  const m = /R\s*(\d{2}(?:\.\d)?)/i.exec(size.replace(/\s+/g, ""));
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}
