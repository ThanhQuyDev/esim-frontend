import { SITE_BASE_URL } from "./hreflang";
import { SITE_NAME } from "./seo";

/**
 * Site-level schema.org markup that was missing (#076): `WebSite` on the homepage
 * (its `Service` is now written by hand in the CMS, vande-2011 #046), and `ItemPage` on the product pages.
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
  const vi = lang === "vi";
  const url = lang === "vi" ? `${SITE_BASE_URL}/` : `${SITE_BASE_URL}/${lang}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_BASE_URL}/#website`,
    name: SITE_NAME,
    // Wording from the SEO team's schema document (vande-2011 #046).
    description: vi
      ? "esim.vn là website chính thức để tìm kiếm điểm đến, so sánh và mua gói eSIM du lịch quốc tế, kích hoạt trong 15 giây qua link ngay sau khi thanh toán."
      : "esim.vn is the official website to find your destination, compare and buy international travel eSIM plans, activated in 15 seconds via a link right after payment.",
    url,
    inLanguage: lang === "vi" ? "vi-VN" : "en",
    publisher: { "@id": `${SITE_BASE_URL}/#organization` },
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
