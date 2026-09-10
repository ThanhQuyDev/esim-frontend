import type { PlansByDestinationResponse } from "./api";
import { summarizePlanFacts } from "./how-it-works";
import { interpolate } from "./utils";
import {
  formatSalePrice,
  formatUsdPrice,
  formatVndPrice,
  salePriceCurrency,
  salePriceNumber,
  usdFromVnd,
} from "./price-locale";

/**
 * Template variables a CMS SEO record can use (#047).
 *
 * `${name}` already existed. The rest describe the plans of the country/region
 * being viewed, so one shared record ("/destination") can say what a page
 * actually sells — "eSIM ${name} chỉ từ ${fromPrice}" — and a Product schema can
 * carry a real Offer price instead of a hardcoded one.
 *
 * Prices are VND only. `plan.price` means USD for some providers and VND for
 * others (#037), so a USD variable would be wrong for part of the catalogue;
 * dual-currency display is its own task.
 */

export interface SeoTemplateVars {
  /** Indexed so the object can be passed straight to `interpolate`. */
  [key: string]: string | undefined;
  name?: string;
  /**
   * Cheapest plan in the reader's own currency: "120.000đ" on a Vietnamese page,
   * "$4.71" on an English one (#050).
   */
  fromPrice?: string;
  /** Always VND, for copy that needs the dong figure regardless of locale. */
  fromPriceVnd?: string;
  /** Always USD, converted at the live rate. */
  fromPriceUsd?: string;
  /** Bare number for schema.org `price`, in the same currency as `fromPrice`. */
  fromPriceNumber?: string;
  /** ISO currency for schema.org `priceCurrency` — VND on vi, USD elsewhere. */
  currency?: string;
  planCount?: string;
  /** "1GB – 20GB". */
  dataRange?: string;
  /** "3 – 30 ngày". */
  dayRange?: string;
}

/** Every variable name the CMS may use, for documentation and validation. */
export const SEO_TEMPLATE_VAR_NAMES = [
  "name",
  "fromPrice",
  "fromPriceVnd",
  "fromPriceUsd",
  "fromPriceNumber",
  "currency",
  "planCount",
  "dataRange",
  "dayRange",
] as const;

/**
 * Build the variables for one country/region page. Anything unknown is left out
 * rather than defaulted, so `applySeoVars` can tell "no data" from "zero".
 */
export function buildSeoTemplateVars(opts: {
  name?: string | null;
  plans?: PlansByDestinationResponse | null;
  lang: string;
  /** USD → VND rate for the English price. Falls back to the shared constant. */
  rate?: number;
}): SeoTemplateVars {
  const vars: SeoTemplateVars = {};
  if (opts.name) vars.name = opts.name;

  const facts = summarizePlanFacts(opts.plans, opts.lang);
  if (!facts) return vars;

  vars.planCount = String(facts.planCount);
  if (facts.dataRange) vars.dataRange = facts.dataRange;
  if (facts.dayRange) vars.dayRange = facts.dayRange;
  if (facts.fromPriceVnd > 0) {
    const vnd = facts.fromPriceVnd;
    vars.fromPrice = formatSalePrice(vnd, opts.lang, opts.rate);
    vars.fromPriceVnd = formatVndPrice(vnd);
    vars.fromPriceUsd = formatUsdPrice(usdFromVnd(vnd, opts.rate));
    // Bare number in the same currency — schema.org rejects "120.000đ".
    vars.fromPriceNumber = salePriceNumber(vnd, opts.lang, opts.rate);
    vars.currency = salePriceCurrency(opts.lang);
  }
  return vars;
}

/**
 * Substitute the variables into a CMS string.
 *
 * `stripUnresolved` blanks out any `${…}` we have no value for. Meta text keeps
 * the placeholder visible (an admin will notice the typo), but JSON-LD must not:
 * a leftover `"price": "${fromPrice}"` would publish a nonsense price to Google,
 * so there it becomes an empty string, which crawlers simply ignore.
 */
export function applySeoVars(
  value: string | null | undefined,
  vars: SeoTemplateVars,
  opts: { stripUnresolved?: boolean } = {}
): string {
  if (!value) return "";
  const filled = interpolate(value, vars);
  return opts.stripUnresolved ? filled.replace(/\$\{\w+\}/g, "") : filled;
}
