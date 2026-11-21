import type { Metadata } from "next";
import {
  getDestinationBySlug,
  getPlansByDestinationSlug,
  getPlansByRegionSlug,
  getRegionBySlug,
  getRegions,
  type PlansByDestinationResponse,
} from "@/lib/api";
import { getSeoMetadata, defaultOgImages } from "@/lib/seo";
import { buildSeoTemplateVars } from "@/lib/seo-vars";
import { getUsdVndRate } from "@/lib/exchange-rate";
import { isPlanSoldOut } from "@/lib/plan-stock";
import { getDictionary } from "@/lib/dictionaries";
import { resolveBreadcrumbTrail } from "@/lib/breadcrumb-trail";
import { buildBreadcrumbSchema, homeCrumb } from "@/lib/breadcrumb-schema";
import { interpolate } from "@/lib/utils";
import type { Locale } from "@/lib/i18n-config";
import { loadPageFaqs } from "@/components/page-faq-schema";
import { buildProductGraph, ORIGIN, type CoverageScope, type GraphPlan } from "./product";
import type { GraphPageKind } from "./page-kind";

/** Groups the page shows; `tiktokHiddenByPrice` are plans it hides. */
const SHOWN = ["dataPlans", "slowUnlimited", "fastUnlimited", "dailyUnlimited", "smsCallEsim", "localEsim"] as const;

export function shownPlans(response: PlansByDestinationResponse | null | undefined): GraphPlan[] {
  if (!response) return [];
  const raw = response as unknown as Record<string, unknown[] | undefined>;
  const seen = new Set<string>();
  const out: GraphPlan[] = [];
  for (const group of SHOWN) {
    const list = (raw[group] ?? (group === "smsCallEsim" ? raw.SmsCallEsim : undefined) ?? []) as (GraphPlan & {
      isActive?: boolean;
      isLocalInventory?: boolean;
      availableStock?: number | null;
    })[];
    for (const plan of list) {
      const key = String(plan.id);
      if (seen.has(key) || plan.isActive === false || isPlanSoldOut(plan as never)) continue;
      seen.add(key);
      out.push(plan);
    }
  }
  return out;
}

function text(value: Metadata["title"] | Metadata["description"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const v = value as { absolute?: string; default?: string };
  return v.absolute ?? v.default ?? "";
}

/** Path of a page in a locale: `/esim-trung-quoc`, `/en/china-esim`. */
function pagePath(slug: string, locale: string): string {
  return locale === "vi" ? `/${slug}` : `/${locale}/${slug}`;
}

/**
 * The @graph of a country or region page (vande-2011 #046), from the same
 * plans, FAQs, SEO title and description the page itself renders.
 */
export async function productPageGraph(
  page: Extract<GraphPageKind, { kind: "destination" | "region" }>,
  locale: string,
  path: string
): Promise<Record<string, unknown> | null> {
  const lang = locale === "en" ? "en" : "vi";
  const dict = await getDictionary(locale as Locale);

  const entity =
    page.kind === "destination"
      ? await getDestinationBySlug(page.slug, locale)
      : await getRegionBySlug(page.slug, locale);
  if (!entity) return null;

  const plansResponse =
    page.kind === "destination"
      ? await getPlansByDestinationSlug(page.slug, locale)
      : await getPlansByRegionSlug(page.slug, locale);

  const name = ((lang === "vi" ? entity.titleVi : entity.title) || entity.name || "").trim();
  const canonicalSlug = (lang === "vi" ? entity.slugVi || entity.slug : entity.slug) || page.slug;
  const url = `${ORIGIN}${pagePath(canonicalSlug, locale)}`;

  // Title and description exactly as the page's metadata builds them.
  const vars = buildSeoTemplateVars({
    name,
    plans: plansResponse,
    lang: locale,
    rate: await getUsdVndRate(),
  });
  const genericSlug =
    page.kind === "destination"
      ? lang === "vi" ? "/destination" : "/en/destination"
      : lang === "vi" ? "/region" : "/en/region";
  const metadata = await getSeoMetadata(
    [pagePath(page.slug, locale), genericSlug],
    {
      title: dict.destinationPage.title.replace("{destination}", name),
      description: dict.destinationPage.subtitle.replace("{destination}", name),
    },
    vars,
    { locale, url: pagePath(canonicalSlug, locale) }
  );

  const intro = interpolate(
    ((lang === "vi" ? entity.descriptionVi : entity.description) ?? "").trim(),
    vars as never
  ) || text(metadata.description);

  const trail = await resolveBreadcrumbTrail(path, locale, dict);
  const crumbs = buildBreadcrumbSchema([homeCrumb(locale), ...trail], path) as {
    itemListElement?: { name: string; item: string }[];
  } | null;

  const productName = lang === "vi" ? `eSIM ${name}` : `${name} eSIM`;
  const image =
    (entity as { avatarUrl?: string | null }).avatarUrl ?? null;

  let region: Parameters<typeof buildProductGraph>[0]["region"] = null;
  let code = page.kind === "destination" ? String((entity as { countryCode?: string }).countryCode || "xx") : canonicalSlug.replace(/(^esim-|-esim$)/g, "");
  if (page.kind === "region") {
    const r = entity as {
      id: number;
      destinations?: { title?: string | null; titleVi?: string | null; name: string; countryCode?: string | null }[];
      destinationCount?: number | null;
      parentId?: number | null;
    };
    const places = (r.destinations ?? []).map((d) => ({
      name: ((lang === "vi" ? d.titleVi : d.title) || d.name).trim(),
      countryCode: d.countryCode ?? null,
    }));
    // Coverage options: this region and the packs under it, as the page lets
    // the reader switch between them.
    const scopes: CoverageScope[] = [];
    const ownPlans = shownPlans(plansResponse);
    const minOf = (list: GraphPlan[]) =>
      Math.min(...list.map((p) => Number(lang === "vi" ? p.vndPrice : p.usdPrice)).filter((n) => n > 0));
    if (ownPlans.length) scopes.push({ name, countries: places.length || Number(r.destinationCount) || 0, from: minOf(ownPlans) });
    const children = await getRegions({ limit: 1000, lang: locale })
      .then((res) => (res.data ?? []).filter((c) => c.parentId === r.id))
      .catch(() => []);
    for (const child of children) {
      const childSlug = (lang === "vi" ? child.slugVi || child.slug : child.slug) || child.slug;
      const childPlans = shownPlans(await getPlansByRegionSlug(childSlug, locale).catch(() => null));
      if (!childPlans.length) continue;
      scopes.push({
        name: ((lang === "vi" ? child.titleVi : child.title) || child.name).trim(),
        countries: Number((child as { destinationCount?: number }).destinationCount) || 0,
        from: minOf(childPlans),
      });
    }
    region = { name, places, scopes };
    code = code || "region";
  }

  return buildProductGraph({
    lang,
    url,
    productName,
    breadcrumbLabel: productName,
    intro,
    title: text(metadata.title) || productName,
    metaDescription: text(metadata.description),
    image,
    ogImage: defaultOgImages(locale)[0].url,
    code,
    plans: shownPlans(plansResponse),
    faqs: await loadPageFaqs(locale, path),
    trail: (crumbs?.itemListElement ?? []).map((c) => ({ name: c.name, item: c.item })),
    region,
  });
}
