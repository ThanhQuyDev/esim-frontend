"use client";

import { useLocale } from "next-intl";

import { FALLBACK_USD_VND_RATE } from "@/lib/exchange-rate";
import { formatVnd, useExchangeRate } from "@/lib/hooks";
import { formatUsdPrice, usdFromVnd } from "@/lib/price-locale";

/**
 * Prices as the shopper reads them (doitac-1410 #073): the English site shows
 * dollars at today's rate, the Vietnamese one đồng — the same rule as
 * `formatSalePrice` (#050). Everything is still kept and charged in VND, so
 * `formatVnd` stays at hand for the amount actually paid.
 */
export function useMoney() {
  const locale = useLocale();
  const { data: rate } = useExchangeRate();
  const isUsd = locale !== "vi";
  const usdToVnd = rate && rate > 0 ? rate : FALLBACK_USD_VND_RATE;
  return {
    isUsd,
    usdToVnd,
    /** A VND amount in the shopper's display currency. */
    format: (vnd: number) => {
      const amount = Number(vnd || 0);
      return isUsd ? formatUsdPrice(usdFromVnd(amount, usdToVnd)) : formatVnd(amount);
    },
    formatVnd,
  };
}
