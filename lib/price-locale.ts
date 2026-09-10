import { FALLBACK_USD_VND_RATE } from "./exchange-rate";

/**
 * "Sale price" in the reader's own currency (#050).
 *
 * Prices are stored and charged in VND. Vietnamese copy shows "48.000đ"; English
 * copy has to show the same amount as USD — "$1.88" — converted at the live rate,
 * or an English page ends up quoting dong to readers who cannot price it.
 *
 * Conversion (not `plan.usdPrice`) is deliberate: the USD figure must always be
 * the VND the customer actually pays, so the two never contradict each other.
 */

export function usdFromVnd(
  vnd: number,
  rate: number = FALLBACK_USD_VND_RATE
): number {
  if (!(vnd > 0) || !(rate > 0)) return 0;
  return Math.round((vnd / rate) * 100) / 100;
}

export function formatVndPrice(vnd: number): string {
  return `${Math.round(vnd).toLocaleString("vi-VN")}đ`;
}

export function formatUsdPrice(usd: number): string {
  return `$${usd.toFixed(2)}`;
}

/**
 * The price as the given locale should read it. Anything other than Vietnamese
 * gets USD, since VND is only meaningful to a Vietnamese reader.
 */
export function formatSalePrice(
  vnd: number,
  lang: string,
  rate: number = FALLBACK_USD_VND_RATE
): string {
  if (!(vnd > 0)) return "";
  if (lang === "vi") return formatVndPrice(vnd);
  return formatUsdPrice(usdFromVnd(vnd, rate));
}

/** ISO code for the currency `formatSalePrice` used, for schema.org. */
export function salePriceCurrency(lang: string): "VND" | "USD" {
  return lang === "vi" ? "VND" : "USD";
}

/** Bare number in the locale's currency, for schema.org `price`. */
export function salePriceNumber(
  vnd: number,
  lang: string,
  rate: number = FALLBACK_USD_VND_RATE
): string {
  if (!(vnd > 0)) return "";
  return lang === "vi"
    ? String(Math.round(vnd))
    : usdFromVnd(vnd, rate).toFixed(2);
}
