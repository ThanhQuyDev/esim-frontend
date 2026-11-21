import { routing } from "@/i18n/routing";
import { fetchSeoConfigByUrl } from "@/lib/api";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { resolveBreadcrumbTrail } from "@/lib/breadcrumb-trail";
import { buildBreadcrumbSchema, homeCrumb } from "@/lib/breadcrumb-schema";
import type { Locale } from "@/lib/i18n-config";
import { loadPageFaqs } from "@/components/page-faq-schema";
import { breadcrumbNode, faqNode, ORIGIN } from "./product";
import STATIC from "./static-pages.json";

/**
 * The 17 static pages' schema (vande-2011 #046, Drive row 54 "SCHEMA TRANG
 * TINH", DAC-TA-SCHEMA-TRANG-TINH-v1.0.md): one @graph each — the shared
 * Organization and WebSite, the page's own nodes as specified (WebPage /
 * AboutPage / CollectionPage, WebApplication, Service, HowTo…), the page's
 * breadcrumb and, where the page shows questions, its FAQPage.
 */

type Json = Record<string, any>;
const DATA = STATIC as unknown as {
  shared: Record<"vi" | "en", Record<"Organization" | "WebSite", Json>>;
  pages: Record<string, Record<"vi" | "en", Json[]>>;
};

const LEGAL: Record<string, string> = {
  "chinh-sach-hoan-tien": "refund-policy",
  "chinh-sach-giao-hang": "delivery-policy",
  "dieu-khoan-dieu-kien": "terms-of-service",
  "chinh-sach-bao-mat": "privacy-policy",
};

/** The spec's key for a public path, or null when it is not one of the 17. */
export function staticSchemaKey(locale: string, path: string): string | null {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const rest = (prefix && path.startsWith(prefix) ? path.slice(prefix.length) : path) || "/";
  const legal = rest.match(/^\/(?:phap-ly|legal)\/([^/]+)$/);
  if (legal) {
    const vi = Object.keys(LEGAL).find((k) => k === legal[1] || LEGAL[k] === legal[1]);
    return vi ? `legal:${vi}` : null;
  }
  for (const [key, entry] of Object.entries(routing.pathnames as Record<string, string | Record<string, string>>)) {
    if (!DATA.pages[key]) continue;
    const localized = typeof entry === "string" ? entry : entry[locale] ?? key;
    if (localized === rest) return key;
  }
  return null;
}

export async function staticPageGraph(key: string, locale: string, path: string): Promise<Json | null> {
  const lang = locale === "en" ? "en" : "vi";
  const page = DATA.pages[key]?.[lang];
  if (!page) return null;
  const nodes: Json[] = JSON.parse(JSON.stringify(page));
  const main = nodes[0];
  const url: string = main.url;

  // Title and description as the page's SEO record states them, when it has
  // one: the schema's name must read like the <title>.
  const cmsKey = key.startsWith("legal:") ? null : getCmsSeoUrlForPage(key as never, lang as Locale);
  const seo = cmsKey ? await fetchSeoConfigByUrl(cmsKey).catch(() => null) : null;
  if (seo?.metaTitle) main.name = seo.metaTitle;
  if (seo?.metaDescription) main.description = seo.metaDescription;

  // FAQPage: the questions the page shows (from the CMS), else the spec's own.
  const faqIndex = nodes.findIndex((n) => n["@type"] === "FAQPage");
  const shown = await loadPageFaqs(locale, path);
  const fromCms = shown.length ? faqNode(shown, lang, url) : null;
  if (fromCms) {
    if (faqIndex >= 0) nodes.splice(faqIndex, 1, fromCms);
    else nodes.push(fromCms);
    main.hasPart = [...(main.hasPart ?? []).filter((p: Json) => p["@id"] !== `${url}#faq`), { "@id": `${url}#faq` }];
  } else if (faqIndex < 0 && main.hasPart) {
    main.hasPart = main.hasPart.filter((p: Json) => p["@id"] !== `${url}#faq`);
    if (!main.hasPart.length) delete main.hasPart;
  }

  const dict = await getDictionary(locale as Locale);
  const trail = await resolveBreadcrumbTrail(path, locale, dict);
  const crumbs = buildBreadcrumbSchema([homeCrumb(locale), ...trail], path) as {
    itemListElement?: { name: string; item: string }[];
  } | null;
  const breadcrumb = crumbs?.itemListElement?.length
    ? breadcrumbNode(url, crumbs.itemListElement.map((c) => ({ name: c.name, item: c.item })))
    : null;

  const shared = DATA.shared[lang];
  return {
    "@context": "https://schema.org",
    "@graph": [shared.Organization, shared.WebSite, ...nodes, ...(breadcrumb ? [breadcrumb] : [])],
  };
}

export { ORIGIN };
