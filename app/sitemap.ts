import { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import {
  getBlogs,
  getDestinations,
  getLocalCarriers,
  getRegions,
  fetchHelpCenterArticles,
} from "@/lib/api";
import { buildSitemap, type SitemapSources } from "@/lib/sitemap-entries";
import { LEGAL_POLICIES } from "@/components/layout/sections/legal";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://esim.vn";

/** Regenerate daily; the catalogue does not change by the minute. */
export const revalidate = 86_400;

/** Enough to cover the catalogue; the APIs cap their own page sizes anyway. */
const CATALOGUE_LIMIT = 1000;
const CONTENT_LIMIT = 500;

/**
 * The sitemap has to be published even when an upstream call fails: an empty
 * section is a smaller problem than a 500 where the sitemap should be.
 */
async function safely<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, regions, blogs, helpArticles, carriers] = await Promise.all([
    safely(() => getDestinations({ limit: CATALOGUE_LIMIT }).then((r) => r.data), []),
    safely(() => getRegions({ limit: CATALOGUE_LIMIT }).then((r) => r.data), []),
    safely(() => getBlogs({ limit: CONTENT_LIMIT }).then((r) => r.data), []),
    safely(() => fetchHelpCenterArticles().then((r) => r.data), []),
    safely(() => getLocalCarriers(), []),
  ]);

  const sources: SitemapSources = {
    destinations,
    regions,
    blogs,
    helpArticles,
    carriers,
    legalPolicies: LEGAL_POLICIES,
  };

  return buildSitemap(sources, {
    baseUrl,
    // next-intl owns the localized path for every route key, dynamic ones
    // included — so `/blog/x` becomes `/en/blog/x` and a carrier page picks
    // up its English path (`/domestic-esim/...`) automatically.
    path: (locale, key, params) => {
      try {
        const href = params
          ? ({ pathname: key, params } as never)
          : (key as never);
        return getPathname({ locale, href });
      } catch {
        // An unknown key must not take the whole sitemap down.
        return null;
      }
    },
    lastModified: new Date(),
  });
}
