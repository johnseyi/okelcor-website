/**
 * lib/price.ts
 *
 * Locale-correct price formatting for the public storefront.
 *
 * The catalogue previously rendered every price as `€{n.toFixed(2)}` — a hard
 * `€` glyph, always symbol-first, always `.` as the decimal separator. That is
 * wrong in three of the four locales the site already ships:
 *
 *   en  €1,234.56      de  1.234,56 €      fr  1 234,56 €      es  1.234,56 €
 *
 * For a distributor whose whole proposition is serving every market, quoting
 * prices in one country's notation undercuts the message on every product tile.
 *
 * Scope note — this formats, it does not convert. Backend prices are EUR and
 * there is no FX rate source, so inventing a converted number would be worse
 * than useless on a B2B quote. `currency` is honoured when the backend supplies
 * one (admin orders already carry EUR/USD), otherwise EUR. When an FX endpoint
 * lands, conversion belongs here and nowhere else.
 */

import type { Locale } from "@/lib/translations";

/**
 * Site locale → the BCP-47 tag used for number formatting.
 * `en` maps to en-IE rather than en-US: English-language euro conventions,
 * which is what an English-reading buyer in Okelcor's markets expects.
 */
const NUMBER_LOCALE: Record<Locale, string> = {
  en: "en-IE",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

export function numberLocale(locale: Locale): string {
  return NUMBER_LOCALE[locale] ?? "en-IE";
}

export type PriceOptions = {
  /** ISO 4217 code. Defaults to EUR. */
  currency?: string | null;
  /** Drop the decimals — used for large aggregate figures. */
  compact?: boolean;
};

/**
 * Format a price for display. Returns an em dash for null/NaN so callers never
 * need their own empty-state branch.
 */
export function formatPrice(
  amount: number | string | null | undefined,
  locale: Locale,
  options: PriceOptions = {}
): string {
  if (amount == null || amount === "") return "—";
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return "—";

  const currency = options.currency || "EUR";
  const fractionDigits = options.compact ? 0 : 2;

  try {
    return new Intl.NumberFormat(numberLocale(locale), {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(n);
  } catch {
    // Unknown currency code — degrade to "EUR 1234.56" rather than throwing.
    return `${currency} ${n.toFixed(fractionDigits)}`;
  }
}

/** Plain number formatting (quantities, weights) in the visitor's locale. */
export function formatNumber(
  value: number | null | undefined,
  locale: Locale,
  maximumFractionDigits = 0
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat(numberLocale(locale), { maximumFractionDigits }).format(value);
  } catch {
    return String(value);
  }
}
