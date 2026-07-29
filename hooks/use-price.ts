"use client";

/**
 * hooks/use-price.ts
 *
 * Binds lib/price formatting to the visitor's active locale so components can
 * write `price(product.price)` instead of threading the locale through props.
 */

import { useCallback } from "react";
import { useLanguage } from "@/context/language-context";
import { formatPrice, formatNumber, type PriceOptions } from "@/lib/price";

export function usePrice() {
  const { locale } = useLanguage();

  const price = useCallback(
    (amount: number | string | null | undefined, options?: PriceOptions) =>
      formatPrice(amount, locale, options),
    [locale]
  );

  const number = useCallback(
    (value: number | null | undefined, maximumFractionDigits = 0) =>
      formatNumber(value, locale, maximumFractionDigits),
    [locale]
  );

  return { price, number, locale };
}
