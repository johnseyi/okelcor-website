"use client";

/**
 * components/shop/tyre-passport.tsx
 *
 * Per-batch condition traceability for used stock — the feature
 * docs/BACKEND_NOTE_premium_ux.md §2 identified as Okelcor's genuine
 * differentiator: Tire Rack, SimpleTire and ATD don't sell graded used tyres,
 * so none of them solve this, but it's exactly what a buyer of used stock
 * needs before committing.
 *
 * Backend returns `tyre_batch` as null until ops captures an inspection, so
 * this renders nothing at all rather than a card full of blanks. Individual
 * fields are independently optional too — a batch with only a grade and a
 * photo shows exactly those two.
 *
 * `condition_grade` is deliberately a free string, not an enum: no grading
 * scale is fixed yet, so it is displayed verbatim rather than mapped to a
 * scale this component would be inventing.
 */

import { ShieldCheck, Gauge, CalendarCheck, Factory } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { parseDotCode } from "@/lib/tyre-specs";
import type { Product } from "./data";

type Batch = NonNullable<Product["tyre_batch"]>;

function hasAnything(b: Batch): boolean {
  return Boolean(
    b.condition_grade ||
      b.tread_depth_mm != null ||
      b.dot_code ||
      b.inspection_date ||
      (b.inspection_photos && b.inspection_photos.length > 0)
  );
}

/** Locale-aware date, falling back to the raw string if it won't parse. */
function formatDate(value: string, locale: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  try {
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(d);
  } catch {
    return value;
  }
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof ShieldCheck;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon size={14} strokeWidth={2.1} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
        <p className="mt-0.5 text-[0.9rem] font-semibold text-ink">{children}</p>
      </div>
    </div>
  );
}

export default function TyrePassport({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const { t, locale } = useLanguage();
  const batch = product.tyre_batch;

  if (!batch || !hasAnything(batch)) return null;

  const dot = parseDotCode(batch.dot_code);
  const photos = batch.inspection_photos ?? [];

  return (
    <section className={`panel overflow-hidden ${className}`} aria-label={t.passport.title}>
      <header className="border-b border-hairline bg-linear-to-r from-brand-soft to-card px-5 py-3.5">
        <h3 className="text-[0.92rem] font-bold tracking-tight text-ink">{t.passport.title}</h3>
        <p className="mt-0.5 text-[0.7rem] font-medium text-ink-faint">{t.passport.subtitle}</p>
      </header>

      {/* Self-sizing: two columns once the card itself is wide enough */}
      <div className="@container">
        <div className="grid grid-cols-1 gap-4 px-5 py-5 @md:grid-cols-2">
          {batch.condition_grade && (
            <Field icon={ShieldCheck} label={t.passport.conditionGrade}>
              {batch.condition_grade}
            </Field>
          )}

          {batch.tread_depth_mm != null && (
            <Field icon={Gauge} label={t.passport.treadDepth}>
              <span className="tabular-nums">{batch.tread_depth_mm} mm</span>
            </Field>
          )}

          {batch.dot_code && (
            <Field icon={Factory} label={t.passport.dotCode}>
              <span className="tabular-nums">{batch.dot_code}</span>
              {/* Decoded WWYY — the number a used-tyre buyer actually reads */}
              {dot && (
                <span className="ml-1.5 font-normal text-ink-muted">
                  · {t.passport.manufactured} {t.passport.weekAbbr} {dot.week}, {dot.year}
                </span>
              )}
            </Field>
          )}

          {batch.inspection_date && (
            <Field icon={CalendarCheck} label={t.passport.inspected}>
              {formatDate(batch.inspection_date, locale)}
            </Field>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <footer className="border-t border-hairline bg-page/60 px-5 py-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink-faint">
            {t.passport.photos}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {photos.map((src, i) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-hairline transition hover:border-brand/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- inspection photos are arbitrary remote URLs; next/image would need per-host remote config */}
                <img
                  src={src}
                  alt={`${t.passport.photos} ${i + 1}`}
                  loading="lazy"
                  className="size-20 object-cover transition-transform duration-300 hover:scale-105"
                />
              </a>
            ))}
          </div>
        </footer>
      )}
    </section>
  );
}
