import type { MetadataRoute } from "next";
import type { Blog, Destination, HelpCenterArticle, LocalCarrier, Region } from "./api";

/**
 * What goes in the sitemap (#091).
 *
 * There was a sitemap, but it listed fifteen static routes and nothing else —
 * every country page, region page, blog post, help article and domestic-eSIM
 * carrier page was missing, which is the entire catalogue and the whole reason
 * to publish one.
 *
 * Two rules the old file also broke:
 *   • cart, checkout and profile do not belong in a sitemap. They are
 *     transactional or sign-in-only, so pointing crawlers at them burns crawl
 *     budget on pages that cannot rank.
 *   • every URL should carry its language alternates, so Google reads the
 *     Vietnamese and English versions as one page in two languages.
 */

export type SitemapEntry = MetadataRoute.Sitemap[number];

export const SITEMAP_LOCALES = ["vi", "en"] as const;
export type SitemapLocale = (typeof SITEMAP_LOCALES)[number];

/** Public, crawlable static routes. */
export const STATIC_ROUTES = [
  "/",
  "/destinations",
  "/review",
  "/data-calculator",
  "/what-is-esim",
  "/coupon",
  "/blog",
  "/about-us",
  "/press-area",
  "/help-center",
  "/esim-supported-devices",
  "/kyc-guide",
  "/refer-a-friend",
  // Affiliate programme: pages people are meant to find by searching (#095).
  "/affiliate",
  "/affiliate/register",
  "/terms-of-service",
] as const;

/**
 * Routes deliberately left out: a cart or a checkout has nothing to index, and
 * the profile area is behind a login, so a crawler only ever sees the sign-in
 * screen.
 */
export const EXCLUDED_ROUTES = ["/cart", "/checkout", "/payment", "/profile"] as const;

export interface SitemapSources {
  destinations?: Destination[] | null;
  regions?: Region[] | null;
  blogs?: Blog[] | null;
  helpArticles?: HelpCenterArticle[] | null;
  carriers?: LocalCarrier[] | null;
}

export interface BuildSitemapOptions {
  baseUrl: string;
  /**
   * Localized public path for a route key, per locale — the same keys
   * next-intl knows (`/blog/[slug]`, `/esim-noi-dia/[carrier]`, …), with the
   * params filled in. Returning null drops the entry.
   */
  path: (
    locale: SitemapLocale,
    key: string,
    params?: Record<string, string>
  ) => string | null;
  lastModified?: Date;
}

/** `vi` is the default locale and carries no prefix; others are prefixed. */
export function localePrefix(locale: SitemapLocale): string {
  return locale === "vi" ? "" : `/${locale}`;
}

function absolute(baseUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, "")}${normalized === "/" ? "" : normalized}` || baseUrl;
}

/**
 * One sitemap row: the Vietnamese URL, with both languages as alternates.
 *
 * `pathFor` returns the FINAL path for a locale, locale prefix included.
 * next-intl's `getPathname` already prefixes (`/en/blog/x`); the old sitemap
 * added a second one and published `/en/en/...` to Google (#091).
 */
export function entryFor(
  baseUrl: string,
  pathFor: (locale: SitemapLocale) => string | null | undefined,
  lastModified?: Date | string | null
): SitemapEntry | null {
  const languages: Record<string, string> = {};
  let canonical: string | null = null;

  for (const locale of SITEMAP_LOCALES) {
    const path = pathFor(locale);
    if (!path) continue;
    const url = absolute(baseUrl, path);
    languages[locale] = url;
    if (locale === "vi") canonical = url;
  }

  // No Vietnamese variant (English-only content): the English URL is canonical.
  if (!canonical) {
    const first = Object.values(languages)[0];
    if (!first) return null;
    canonical = first;
  }

  const parsedDate = lastModified ? new Date(lastModified) : undefined;
  return {
    url: canonical,
    ...(parsedDate && !Number.isNaN(parsedDate.getTime())
      ? { lastModified: parsedDate }
      : {}),
    alternates: { languages },
  };
}

/** Slug an entity uses in a given locale (`slugVi` on Vietnamese pages). */
export function entitySlug(
  entity: { slug?: string | null; slugVi?: string | null },
  locale: SitemapLocale
): string | null {
  const value = locale === "vi" ? entity.slugVi || entity.slug : entity.slug;
  return value?.trim() || null;
}

/** Article/blog slug, which is the same string in both languages. */
function plainSlug(entity: { slug?: string | null }): string | null {
  return entity.slug?.trim() || null;
}

export function buildSitemap(
  sources: SitemapSources,
  { baseUrl, path, lastModified }: BuildSitemapOptions
): MetadataRoute.Sitemap {
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();

  const push = (entry: SitemapEntry | null) => {
    if (!entry || seen.has(entry.url)) return;
    seen.add(entry.url);
    entries.push(entry);
  };

  for (const route of STATIC_ROUTES) {
    push(entryFor(baseUrl, (locale) => path(locale, route), lastModified));
  }

  // Country and region pages live at the site root: /esim-nhat-ban, /en/japan.
  for (const destination of sources.destinations ?? []) {
    if (destination?.isActive === false) continue;
    push(
      entryFor(
        baseUrl,
        (locale) => {
          const slug = entitySlug(destination, locale);
          return slug ? `${localePrefix(locale)}/${slug}` : null;
        },
        destination?.updatedAt
      )
    );
  }

  for (const region of sources.regions ?? []) {
    if (region?.isActive === false) continue;
    push(
      entryFor(
        baseUrl,
        (locale) => {
          const slug = entitySlug(region, locale);
          return slug ? `${localePrefix(locale)}/${slug}` : null;
        },
        region?.updatedAt
      )
    );
  }

  for (const blog of sources.blogs ?? []) {
    if (blog?.isPublished === false) continue;
    const slug = plainSlug(blog);
    if (!slug) continue;
    push(
      entryFor(
        baseUrl,
        (locale) => path(locale, "/blog/[slug]", { slug }),
        blog?.updatedAt
      )
    );
  }

  for (const article of sources.helpArticles ?? []) {
    const slug = plainSlug(article);
    if (!slug) continue;
    push(
      entryFor(
        baseUrl,
        (locale) => path(locale, "/help-center/[slug]", { slug }),
        article?.updatedAt
      )
    );
  }

  for (const carrier of sources.carriers ?? []) {
    const provider = carrier?.provider?.trim();
    if (!provider) continue;
    push(
      entryFor(baseUrl, (locale) =>
        path(locale, "/esim-noi-dia/[carrier]", { carrier: provider })
      )
    );
  }

  return entries;
}
