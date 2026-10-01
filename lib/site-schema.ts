import { SITE_BASE_URL } from "./hreflang";
import { SITE_NAME } from "./seo";

/**
 * Site-level schema.org markup that was missing (#076): `WebSite` and `Service`
 * on the homepage, and `ItemPage` on the product pages.
 *
 * Only facts the site can stand behind go in. Schema is a statement to search
 * engines about what this page is, and a field that overstates — a search box the
 * site does not have, a rating nobody gave — is both wrong and a policy problem.
 */

type Json = Record<string, unknown>;

/**
 * `WebSite` tells Google the site's own name, which is what it uses for the site
 * name shown in results instead of guessing from the domain.
 *
 * Deliberately no `potentialAction` / `SearchAction`: that markup claims a
 * site-wide search box, and this site only has search inside the blog and the
 * help centre. Pointing it at `/blog/search` would send someone looking for an
 * eSIM into a list of articles.
 */
export function buildWebSiteSchema(lang: string): Json {
  const url = lang === "vi" ? `${SITE_BASE_URL}/` : `${SITE_BASE_URL}/${lang}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_BASE_URL}/#website`,
    name: SITE_NAME,
    url,
    inLanguage: lang === "vi" ? "vi-VN" : "en",
    publisher: { "@id": `${SITE_BASE_URL}/#organization` },
  };
}

/**
 * `Service` describes what is actually sold, which `Product` on a destination
 * page does not: each of those is one data package, not the business.
 *
 * `areaServed` is left off rather than listed: coverage is per package and runs to
 * two hundred-odd countries, so any short list here would be wrong.
 */
export function buildServiceSchema(lang: string): Json {
  const vi = lang === "vi";

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_BASE_URL}/#service`,
    name: vi ? "eSIM du lịch quốc tế và eSIM nội địa" : "Travel and domestic eSIM",
    serviceType: vi ? "Cung cấp eSIM dữ liệu" : "eSIM data service",
    description: vi
      ? "Mua eSIM dữ liệu cho hơn 200 quốc gia và eSIM nội địa Việt Nam, nhận mã QR qua email ngay sau khi thanh toán."
      : "Buy data eSIMs for 200+ countries and domestic Vietnamese eSIMs, with the QR code delivered by email as soon as payment clears.",
    provider: { "@id": `${SITE_BASE_URL}/#organization` },
    url: vi ? `${SITE_BASE_URL}/` : `${SITE_BASE_URL}/${lang}`,
  };
}

/**
 * `ItemPage` says "this page is about one item", which is what a destination or
 * region page is. It sits alongside the `Product` already emitted there (#051)
 * and points at it rather than repeating it.
 */
export function buildItemPageSchema(input: {
  path: string;
  name: string;
  description?: string | null;
  lang: string;
}): Json {
  const url = `${SITE_BASE_URL}${input.path}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "@id": `${url}#itempage`,
    url,
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    inLanguage: input.lang === "vi" ? "vi-VN" : "en",
    isPartOf: { "@id": `${SITE_BASE_URL}/#website` },
  };
}
