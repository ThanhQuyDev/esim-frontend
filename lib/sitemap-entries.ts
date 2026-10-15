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

/**
 * The six blocks of the reference sitemap (common-issue #004, file mẫu
 * `sitemap-chuan`), in its order; each renders under its own comment header.
 */
export const SITEMAP_GROUPS = {
  static: "TRANG TĨNH / STATIC PAGES",
  country: "TRANG QUỐC GIA (1 nước)",
  region: "GÓI ĐA QUỐC GIA / KHU VỰC",
  domestic: "ESIM NỘI ĐỊA",
  blog: "BLOG",
  help: "TRUNG TÂM TRỢ GIÚP",
} as const;
export type SitemapGroup = keyof typeof SITEMAP_GROUPS;

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export type SitemapEntry = MetadataRoute.Sitemap[number] & { group?: SitemapGroup };

/**
 * changefreq / priority for every static route, as the reference file sets
 * them. Routes the reference does not list (check-esim, install-guide, legal)
 * get the values of the closest page it does.
 */
export const STATIC_ROUTE_SEO: Record<string, [ChangeFrequency, number]> = {
  "/": ["daily", 1.0],
  "/destinations": ["weekly", 0.8],
  "/review": ["monthly", 0.7],
  "/data-calculator": ["weekly", 0.6],
  "/check-esim": ["monthly", 0.5],
  "/what-is-esim": ["weekly", 0.7],
  "/install-guide": ["monthly", 0.6],
  "/coupon": ["daily", 0.8],
  "/blog": ["daily", 0.8],
  "/about-us": ["monthly", 0.6],
  "/press-area": ["monthly", 0.5],
  "/help-center": ["monthly", 0.6],
  "/esim-supported-devices": ["weekly", 0.7],
  "/kyc-guide": ["monthly", 0.6],
  "/refer-a-friend": ["monthly", 0.6],
  "/affiliate": ["monthly", 0.6],
  "/affiliate/register": ["monthly", 0.5],
  "/terms-of-service": ["yearly", 0.3],
};

/** changefreq / priority for the catalogue groups (reference file). */
export const GROUP_SEO: Record<Exclude<SitemapGroup, "static">, [ChangeFrequency, number]> = {
  country: ["weekly", 0.7],
  region: ["weekly", 0.85],
  domestic: ["weekly", 0.75],
  blog: ["weekly", 0.7],
  help: ["monthly", 0.6],
};
/** A popular country is pushed up, as the reference does for its top 34. */
export const POPULAR_COUNTRY_PRIORITY = 0.9;

export const SITEMAP_LOCALES = ["vi", "en"] as const;
export type SitemapLocale = (typeof SITEMAP_LOCALES)[number];

/** Public, crawlable static routes. */
export const STATIC_ROUTES = [
  "/",
  "/destinations",
  "/review",
  "/data-calculator",
  // Self-service eSIM lookup (#003): the form is worth indexing; a lookup link
  // carries a token and is never linked from the site itself.
  "/check-esim",
  "/what-is-esim",
  "/install-guide",
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
  /**
   * Refund, delivery, privacy and terms pages (#048). Their slug differs per
   * language (`/phap-ly/chinh-sach-hoan-tien`, `/en/legal/refund-policy`).
   */
  legalPolicies?: { urlSlug: { vi: string; en: string } }[] | null;
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

  const push = (
    entry: SitemapEntry | null,
    group: SitemapGroup,
    [changeFrequency, priority]: [ChangeFrequency, number]
  ) => {
    if (!entry || seen.has(entry.url)) return;
    seen.add(entry.url);
    entries.push({ ...entry, group, changeFrequency, priority });
  };

  for (const route of STATIC_ROUTES) {
    push(
      entryFor(baseUrl, (locale) => path(locale, route), lastModified),
      "static",
      STATIC_ROUTE_SEO[route] ?? ["monthly", 0.5]
    );
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
      ),
      "country",
      destination?.isPopular
        ? [GROUP_SEO.country[0], POPULAR_COUNTRY_PRIORITY]
        : GROUP_SEO.country
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
      ),
      "region",
      GROUP_SEO.region
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
      ),
      "blog",
      GROUP_SEO.blog
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
      ),
      "help",
      GROUP_SEO.help
    );
  }

  // The legal pages were published but never listed (#048).
  for (const policy of sources.legalPolicies ?? []) {
    push(
      entryFor(baseUrl, (locale) => {
        const slug = policy?.urlSlug?.[locale]?.trim();
        return slug ? path(locale, "/legal/[slug]", { slug }) : null;
      }),
      "static",
      STATIC_ROUTE_SEO["/terms-of-service"]
    );
  }

  for (const carrier of sources.carriers ?? []) {
    const provider = carrier?.provider?.trim();
    if (!provider) continue;
    push(
      entryFor(baseUrl, (locale) =>
        path(locale, "/esim-noi-dia/[carrier]", { carrier: provider })
      ),
      "domestic",
      GROUP_SEO.domestic
    );
  }

  return entries;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** `2026-09-11`: the reference file dates pages, it does not time them. */
function dateOnly(value: string | Date | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/**
 * The sitemap as XML, laid out like the reference file (common-issue #004):
 *   • styled by `/sitemap.xsl`, so opening it in a browser shows a table;
 *   • grouped under the six comment headers, in the reference's order;
 *   • every language version is its own `<url>`, each carrying the full set of
 *     alternates plus `x-default` (the Vietnamese page);
 *   • `lastmod` as a date, then `changefreq` and `priority`.
 */
export function renderSitemapXml(entries: SitemapEntry[]): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const group of Object.keys(SITEMAP_GROUPS) as SitemapGroup[]) {
    const inGroup = entries.filter((entry) => (entry.group ?? "static") === group);
    if (inGroup.length === 0) continue;
    lines.push(`  <!-- ============ ${SITEMAP_GROUPS[group]} ============ -->`);

    for (const entry of inGroup) {
      const languages = (entry.alternates?.languages ?? {}) as Record<string, string>;
      const xDefault = languages.vi ?? entry.url;
      const locs = Object.values(languages).length ? Object.values(languages) : [entry.url];
      const lastmod = dateOnly(entry.lastModified as string | Date | undefined);

      for (const loc of locs) {
        lines.push("  <url>", `    <loc>${escapeXml(loc)}</loc>`);
        for (const [lang, href] of Object.entries(languages)) {
          lines.push(
            `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(href)}"/>`
          );
        }
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefault)}"/>`
        );
        if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
        if (entry.changeFrequency) lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
        if (entry.priority !== undefined) {
          // 1 → "1.0", 0.85 → "0.85", as the reference writes them.
          const priority = Number.isInteger(entry.priority)
            ? entry.priority.toFixed(1)
            : String(entry.priority);
          lines.push(`    <priority>${priority}</priority>`);
        }
        lines.push("  </url>");
      }
    }
  }

  lines.push("</urlset>", "");
  return lines.join("\n");
}
