import { routing } from "@/i18n/routing";
import type { Locale } from "./i18n-config";

/**
 * Which FAQ context URLs a page asks for, in priority order (#054).
 *
 * The CMS attaches FAQs to a URL, and different pages were written against
 * slightly different conventions for that URL — the localized path, the CMS SEO
 * path (`/home` for the homepage), or `/{locale}` + the English route. All of
 * them are tried here so the auto-generated FAQPage schema finds the same FAQs
 * the visible block renders; the schema is only valid if it matches what the
 * reader sees.
 */

/** The route's English path, which some CMS records use as their key. */
function englishRoutePath(pathname: string, locale: Locale): string | null {
  for (const [routeKey, entry] of Object.entries(routing.pathnames)) {
    if (routeKey.includes("[")) continue;
    const localized =
      typeof entry === "string"
        ? entry
        : ((entry as Record<string, string>)[locale] ?? routeKey);
    if (localized === pathname) {
      const english =
        typeof entry === "string"
          ? entry
          : ((entry as Record<string, string>).en ?? routeKey);
      return `/${locale}${english}`;
    }
  }
  return null;
}

export function faqCandidateUrls(opts: {
  /** Request path, locale prefix included, no query. */
  pathname: string;
  locale: Locale;
  /** Set for a country/region page, which also has blanket FAQs to fall back on. */
  entityType?: "destination" | "region" | null;
  /**
   * The country/region's own slugs (`slugVi`, `slug`). The CMS keys FAQs by the
   * Vietnamese page path and tells the languages apart with a `language` field,
   * so the English page `/en/esim-china` keeps its English FAQs under
   * `/esim-trung-quoc`. Without these keys the English page never found its own
   * FAQs and fell back to the blanket ones — or showed none (#019).
   */
  entitySlugs?: (string | null | undefined)[];
}): string[] {
  const { pathname, locale, entityType, entitySlugs } = opts;
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const withoutPrefix =
    localePrefix && pathname.startsWith(localePrefix)
      ? pathname.slice(localePrefix.length) || "/"
      : pathname;

  const candidates = [
    // The page's own FAQs always win over anything shared. For every route but
    // the homepage this IS the CMS key (vi stores the bare localized path, en
    // stores it with the `/en` prefix — both identical to the request path).
    pathname,
    // The homepage is the exception: the CMS stores it as `/home`.
    withoutPrefix === "/" ? `${localePrefix}/home` : null,
    englishRoutePath(withoutPrefix, locale),
    // The same page under each of its slugs, still ahead of anything shared.
    ...(entitySlugs ?? [])
      .filter((slug): slug is string => !!slug)
      .flatMap((slug) => [
        `/${slug}`,
        localePrefix ? `${localePrefix}/${slug}` : null,
      ]),
    // Blanket FAQs, last: only reached when the page has none of its own.
    entityType ? `${localePrefix}/${entityType}` : null,
    entityType ? `/${entityType}` : null,
  ];

  return candidates.filter(
    (url, index): url is string =>
      !!url && candidates.indexOf(url) === index
  );
}
