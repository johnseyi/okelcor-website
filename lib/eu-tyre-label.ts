/**
 * lib/eu-tyre-label.ts
 *
 * EU tyre label — Regulation (EU) 2020/740.
 *
 * Every tyre placed on the EU market must be accompanied by this label. It is
 * the single most recognised trust artifact in the tyre trade, and Okelcor —
 * an EU-established, REX-registered distributor — currently shows none of it.
 *
 * Three graded classes plus two pictograms:
 *
 *   Fuel efficiency   A–E   rolling resistance; A is best
 *   Wet grip          A–E   wet braking; A is best
 *   External noise    A–C   plus the measured value in dB(A); A is quietest
 *   Snow grip         3PMSF pictogram — legally required for winter use in DE/AT
 *   Ice grip          pictogram, C1 (passenger) tyres only
 *
 * Every field is optional. Where the backend supplies nothing, the label simply
 * does not render — the page reads exactly as it does today. See
 * docs/BACKEND_NOTE_eu_tyre_label.md for the field contract.
 */

export const LABEL_GRADES = ["A", "B", "C", "D", "E"] as const;
export type LabelGrade = (typeof LABEL_GRADES)[number];

export const NOISE_CLASSES = ["A", "B", "C"] as const;
export type NoiseClass = (typeof NOISE_CLASSES)[number];

export type EuTyreLabel = {
  /** Rolling-resistance class, A (best) → E. */
  fuel_efficiency?: LabelGrade | null;
  /** Wet-braking class, A (best) → E. */
  wet_grip?: LabelGrade | null;
  /** Measured external rolling noise in dB(A). */
  rolling_noise_db?: number | null;
  /** Noise class A (quietest) → C. */
  rolling_noise_class?: NoiseClass | null;
  /** Three-Peak Mountain Snowflake — severe snow performance. */
  snow_grip?: boolean | null;
  /** Ice grip pictogram — C1 tyres only. */
  ice_grip?: boolean | null;
  /** EPREL database registration id — the label's QR code target. */
  eprel_id?: string | null;
};

/**
 * The regulated A→E colour ramp reproduced on the printed label. These are
 * published, fixed colours — not a design choice — so they are applied as
 * inline styles from this constant rather than as utility classes.
 *
 * The same values are declared as `--color-grade-*` in globals.css `@theme`,
 * where a designer reading the token layer will find them. That declaration is
 * documentation: Tailwind tree-shakes theme keys no class references, so the
 * runtime source of truth for the rendered colour is this object.
 */
export const GRADE_COLOR: Record<LabelGrade, string> = {
  A: "#009e4b",
  B: "#7ab929",
  C: "#f9dd0b",
  D: "#f7a70c",
  E: "#e63329",
};

/** C and D sit on yellow/amber — they need dark text to stay legible. */
export function gradeTextColor(grade: LabelGrade): string {
  return grade === "C" || grade === "D" ? "#171a20" : "#ffffff";
}

export function noiseColor(cls: NoiseClass): string {
  return { A: "#009e4b", B: "#7ab929", C: "#f7a70c" }[cls];
}

/** True when there is at least one field worth rendering. */
export function hasEuLabel(label?: EuTyreLabel | null): boolean {
  if (!label) return false;
  return Boolean(
    label.fuel_efficiency ||
      label.wet_grip ||
      label.rolling_noise_db != null ||
      label.rolling_noise_class ||
      label.snow_grip ||
      label.ice_grip
  );
}

/** Public EPREL product page for the QR/"view registration" link. */
export function eprelUrl(id?: string | null): string | null {
  if (!id) return null;
  return `https://eprel.ec.europa.eu/screen/product/tyres/${encodeURIComponent(id)}`;
}

/**
 * Narrow an untrusted backend value to a grade. Backends drift; a stray "a" or
 * "F" should degrade to "no data" rather than render an invalid class.
 */
export function toGrade(value: unknown): LabelGrade | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  return (LABEL_GRADES as readonly string[]).includes(v) ? (v as LabelGrade) : null;
}

export function toNoiseClass(value: unknown): NoiseClass | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  return (NOISE_CLASSES as readonly string[]).includes(v) ? (v as NoiseClass) : null;
}

/**
 * Normalise whatever the product endpoint returns into an EuTyreLabel.
 * Tolerates both a nested `eu_label` object and flat top-level columns, since
 * the backend contract is not finalised — whichever shape ships, this reads it.
 */
export function readEuLabel(source: Record<string, unknown> | null | undefined): EuTyreLabel | null {
  if (!source) return null;
  const nested = (source.eu_label ?? source) as Record<string, unknown>;

  const noiseDbRaw = nested.rolling_noise_db ?? nested.rolling_noise ?? nested.noise_db;
  const noiseDb = typeof noiseDbRaw === "number" ? noiseDbRaw : Number(noiseDbRaw);

  const label: EuTyreLabel = {
    fuel_efficiency: toGrade(nested.fuel_efficiency ?? nested.fuel_class),
    wet_grip: toGrade(nested.wet_grip ?? nested.wet_grip_class),
    rolling_noise_db: Number.isFinite(noiseDb) && noiseDb > 0 ? noiseDb : null,
    rolling_noise_class: toNoiseClass(nested.rolling_noise_class ?? nested.noise_class),
    snow_grip: nested.snow_grip === true || nested.three_pmsf === true,
    ice_grip: nested.ice_grip === true,
    eprel_id: typeof nested.eprel_id === "string" ? nested.eprel_id : null,
  };

  return hasEuLabel(label) ? label : null;
}
