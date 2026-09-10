import type { Plan, PlansByDestinationResponse } from "./api";
import { isPlanSoldOut } from "./plan-stock";
import { formatDataCompact } from "./utils";
import { SITE_BASE_URL } from "./hreflang";

/**
 * Product + Offer JSON-LD for a country/region page (#051).
 *
 * One Offer per plan actually on sale, with the VND price, the data allowance and
 * the duration — so a search result can show the real "từ …đ" instead of nothing,
 * and the price stays right as the catalogue changes, because it is generated
 * from the same plans the page renders.
 */

const PLAN_GROUPS = [
  "localEsim",
  "dataPlans",
  "fastUnlimited",
  "slowUnlimited",
  "dailyUnlimited",
  "smsCallEsim",
] as const;

/**
 * Offers are capped: a region page can carry hundreds of plans, and a JSON-LD
 * block that size would bloat every HTML response for no crawling benefit. The
 * AggregateOffer still reports the true count and price range.
 */
export const MAX_SCHEMA_OFFERS = 50;

/** "3GB / 30 ngày" — the same shape the plan chips use. */
function offerName(plan: Plan, lang: string): string {
  const dayUnit = lang === "en" ? "days" : "ngày";
  const data =
    Number(plan.dataMb) > 0
      ? formatDataCompact(Number(plan.dataMb))
      : lang === "en"
        ? "Unlimited"
        : "Không giới hạn";
  return `${data} / ${plan.durationDays} ${dayUnit}`;
}

function toOffer(plan: Plan, lang: string, url: string) {
  const properties: Record<string, unknown>[] = [];
  if (Number(plan.dataMb) > 0) {
    properties.push({
      "@type": "PropertyValue",
      name: lang === "en" ? "Data" : "Dung lượng",
      value: formatDataCompact(Number(plan.dataMb)),
    });
  }
  if (Number(plan.durationDays) > 0) {
    properties.push({
      "@type": "PropertyValue",
      name: lang === "en" ? "Duration" : "Số ngày",
      value: Number(plan.durationDays),
      unitCode: "DAY",
    });
  }

  return {
    "@type": "Offer",
    name: offerName(plan, lang),
    price: String(Math.round(Number(plan.vndPrice))),
    priceCurrency: "VND",
    // Local-inventory plans really can run out; API providers never do.
    availability: isPlanSoldOut(plan)
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock",
    url,
    ...(properties.length > 0 ? { additionalProperty: properties } : {}),
  };
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Build the Product schema, or null when there is nothing to describe. A Product
 * without an Offer is rejected by Google's rich-result checks, so a page with no
 * priced plan gets no schema rather than an invalid one.
 */
export function buildProductSchema(opts: {
  name: string;
  /** Public path or absolute URL of the page. */
  url: string;
  description?: string | null;
  image?: string | null;
  plans: PlansByDestinationResponse | null | undefined;
  lang: string;
}): Record<string, unknown> | null {
  if (!opts.plans || !opts.name) return null;

  const url = absoluteUrl(opts.url);
  const priced = PLAN_GROUPS.flatMap((group) => opts.plans?.[group] ?? []).filter(
    (plan) => Number(plan.vndPrice) > 0
  );
  if (priced.length === 0) return null;

  const prices = priced.map((plan) => Math.round(Number(plan.vndPrice)));
  const offers = priced
    .slice()
    .sort((a, b) => Number(a.vndPrice) - Number(b.vndPrice))
    .slice(0, MAX_SCHEMA_OFFERS)
    .map((plan) => toOffer(plan, opts.lang, url));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    url,
    ...(opts.description ? { description: opts.description } : {}),
    ...(opts.image ? { image: opts.image } : {}),
    brand: { "@type": "Brand", name: "esim.vn" },
    category: opts.lang === "en" ? "Travel eSIM" : "eSIM du lịch",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "VND",
      lowPrice: String(Math.min(...prices)),
      highPrice: String(Math.max(...prices)),
      // The true number of plans, even when the Offer list is capped.
      offerCount: priced.length,
      offers,
    },
  };
}

/**
 * Whether a CMS-authored schema block already declares a Product. When it does,
 * the generated one is skipped: two Products on one page make Google pick
 * arbitrarily between them.
 */
export function hasProductSchema(cmsBlock: string | null | undefined): boolean {
  if (!cmsBlock) return false;
  return /"@type"\s*:\s*"Product"/i.test(cmsBlock);
}
