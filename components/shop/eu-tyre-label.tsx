"use client";

/**
 * components/shop/eu-tyre-label.tsx
 *
 * EU tyre label — Regulation (EU) 2020/740 — rendered two ways:
 *
 *   <EuLabelChips />  compact grade pills for the product card / compare table
 *   <EuTyreLabelPanel /> the full graded panel for the product detail page
 *
 * The printed label uses a stepped arrow chart (A shortest/best → E longest).
 * We keep that structure — it is what a buyer recognises — but rebuild it in
 * the site's own visual language instead of photocopying the PDF artwork.
 *
 * Both render nothing at all when the product carries no label data, so pages
 * that have not been backfilled read exactly as they do today.
 *
 * Tailwind v4 notes: sizing is driven by container queries (`@container` +
 * `@card-md:`), so the same component is correct in the 4-up shop grid, the
 * related-products rail and the compare modal without a viewport breakpoint.
 */

import { Fuel, CloudRain, Volume2, Snowflake, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import {
  type EuTyreLabel,
  type LabelGrade,
  type NoiseClass,
  LABEL_GRADES,
  GRADE_COLOR,
  gradeTextColor,
  noiseColor,
  hasEuLabel,
  eprelUrl,
} from "@/lib/eu-tyre-label";

/* ── Compact: grade pills, for the product card ──────────────────────────── */

function Pill({ grade, icon: Icon, title }: { grade: LabelGrade; icon: typeof Fuel; title: string }) {
  return (
    <span
      title={title}
      aria-label={`${title}: ${grade}`}
      className="inline-flex items-center gap-1 rounded-md py-0.5 pl-1 pr-1.5 text-[0.68rem] font-bold tabular-nums"
      style={{ backgroundColor: GRADE_COLOR[grade], color: gradeTextColor(grade) }}
    >
      <Icon size={11} strokeWidth={2.4} aria-hidden="true" />
      {grade}
    </span>
  );
}

export function EuLabelChips({ label, className = "" }: { label?: EuTyreLabel | null; className?: string }) {
  const { t } = useLanguage();
  if (!hasEuLabel(label) || !label) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {label.fuel_efficiency && (
        <Pill grade={label.fuel_efficiency} icon={Fuel} title={t.tyreLabel.fuelEfficiency} />
      )}
      {label.wet_grip && <Pill grade={label.wet_grip} icon={CloudRain} title={t.tyreLabel.wetGrip} />}
      {label.rolling_noise_db != null && (
        <span
          title={t.tyreLabel.noise}
          aria-label={`${t.tyreLabel.noise}: ${label.rolling_noise_db} dB`}
          className="inline-flex items-center gap-1 rounded-md bg-ink/[0.06] py-0.5 pl-1 pr-1.5 text-[0.68rem] font-bold tabular-nums text-ink-muted"
        >
          <Volume2 size={11} strokeWidth={2.4} aria-hidden="true" />
          {label.rolling_noise_db} dB
        </span>
      )}
      {label.snow_grip && (
        <span
          title={t.tyreLabel.snowGrip}
          aria-label={t.tyreLabel.snowGrip}
          className="inline-flex items-center rounded-md bg-sky-100 p-1 text-sky-700"
        >
          <Snowflake size={11} strokeWidth={2.6} aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

/* ── Full panel: the graded arrow chart, for the product detail page ─────── */

/**
 * The regulated A→E ladder. The active class is rendered at full colour and
 * full width; the rest stay as faint reference rungs so the buyer can see
 * where this tyre sits on the scale rather than just reading a letter.
 */
function GradeLadder({
  active,
  icon: Icon,
  title,
}: {
  active: LabelGrade;
  icon: typeof Fuel;
  title: string;
}) {
  const { t } = useLanguage();

  return (
    <div className="@container">
      <div className="flex items-center gap-2 text-ink-muted">
        <Icon size={15} strokeWidth={2} aria-hidden="true" />
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em]">{title}</span>
      </div>

      <div className="mt-3 flex items-end gap-4">
        {/* The class letter, in its regulated colour */}
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-[1.5rem] font-extrabold leading-none"
          style={{ backgroundColor: GRADE_COLOR[active], color: gradeTextColor(active) }}
        >
          {active}
        </span>

        {/* Stepped rungs — A shortest through E longest, as on the printed label */}
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          {LABEL_GRADES.map((g, i) => {
            const isActive = g === active;
            return (
              <div key={g} className="flex items-center gap-1.5">
                <span
                  className={`text-[0.6rem] font-bold tabular-nums ${
                    isActive ? "text-ink" : "text-ink-faint/50"
                  }`}
                >
                  {g}
                </span>
                <span
                  className="h-[5px] rounded-full transition-[width,background-color] duration-500 ease-premium"
                  style={{
                    width: `${34 + i * 14}%`,
                    backgroundColor: isActive ? GRADE_COLOR[g] : "rgba(23,26,32,0.07)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-[0.68rem] font-medium text-ink-faint">{t.tyreLabel.bestClass}</p>
    </div>
  );
}

function NoiseBlock({ db, cls }: { db?: number | null; cls?: NoiseClass | null }) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center gap-2 text-ink-muted">
        <Volume2 size={15} strokeWidth={2} aria-hidden="true" />
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em]">{t.tyreLabel.noise}</span>
      </div>

      <div className="mt-3 flex items-end gap-4">
        {db != null && (
          <span className="flex items-baseline gap-1 text-ink">
            <span className="font-mono text-[1.8rem] font-extrabold leading-none tracking-tight">{db}</span>
            <span className="text-[0.78rem] font-bold text-ink-muted">dB</span>
          </span>
        )}

        {/* Three sound-wave bars — the filled count is the noise class */}
        {cls && (
          <span className="flex items-end gap-1" aria-label={`${t.tyreLabel.noise}: ${cls}`}>
            {(["A", "B", "C"] as const).map((c, i) => {
              const filled = ["A", "B", "C"].indexOf(cls) >= i;
              return (
                <span
                  key={c}
                  className="w-2.5 rounded-sm"
                  style={{
                    height: `${11 + i * 7}px`,
                    backgroundColor: filled ? noiseColor(cls) : "rgba(23,26,32,0.09)",
                  }}
                />
              );
            })}
          </span>
        )}
      </div>

      {cls && (
        <p className="mt-2 text-[0.68rem] font-medium text-ink-faint">
          {t.tyreLabel.classLabel} {cls}
        </p>
      )}
    </div>
  );
}

export function EuTyreLabelPanel({ label, className = "" }: { label?: EuTyreLabel | null; className?: string }) {
  const { t } = useLanguage();
  if (!hasEuLabel(label) || !label) return null;

  const eprel = eprelUrl(label.eprel_id);
  const hasPictograms = label.snow_grip || label.ice_grip;

  return (
    <section
      className={`panel overflow-hidden ${className}`}
      aria-label={t.tyreLabel.title}
    >
      {/* Header — subtle brand-tinted wash via v4 `bg-linear-*` */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-linear-to-r from-brand-soft to-card px-5 py-3.5">
        <div>
          <h3 className="text-[0.92rem] font-bold tracking-tight text-ink">{t.tyreLabel.title}</h3>
          <p className="mt-0.5 text-[0.7rem] font-medium text-ink-faint">{t.tyreLabel.regulation}</p>
        </div>
        {eprel && (
          <a
            href={eprel}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-card px-3 py-1.5 text-[0.72rem] font-semibold text-ink-muted transition hover:border-brand/40 hover:text-brand"
          >
            {t.tyreLabel.eprel}
            <ExternalLink size={11} strokeWidth={2.4} aria-hidden="true" />
          </a>
        )}
      </header>

      {/* Graded classes — self-sizing via container query, not viewport */}
      <div className="@container">
        <div className="grid grid-cols-1 gap-6 px-5 py-5 @md:grid-cols-3 @md:gap-5">
          {label.fuel_efficiency && (
            <GradeLadder active={label.fuel_efficiency} icon={Fuel} title={t.tyreLabel.fuelEfficiency} />
          )}
          {label.wet_grip && (
            <GradeLadder active={label.wet_grip} icon={CloudRain} title={t.tyreLabel.wetGrip} />
          )}
          {(label.rolling_noise_db != null || label.rolling_noise_class) && (
            <NoiseBlock db={label.rolling_noise_db} cls={label.rolling_noise_class} />
          )}
        </div>
      </div>

      {/* Severe-weather pictograms */}
      {hasPictograms && (
        <footer className="flex flex-wrap gap-x-6 gap-y-3 border-t border-hairline bg-page/60 px-5 py-4">
          {label.snow_grip && (
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <Snowflake size={16} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.78rem] font-bold text-ink">{t.tyreLabel.snowGrip}</p>
                <p className="text-[0.68rem] text-ink-faint">{t.tyreLabel.snowDesc}</p>
              </div>
            </div>
          )}
          {label.ice_grip && (
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Snowflake size={16} strokeWidth={2.4} aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.78rem] font-bold text-ink">{t.tyreLabel.iceGrip}</p>
                <p className="text-[0.68rem] text-ink-faint">{t.tyreLabel.iceDesc}</p>
              </div>
            </div>
          )}
        </footer>
      )}
    </section>
  );
}
