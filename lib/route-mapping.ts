/**
 * Route mapping: maps public-facing localized URL slugs to internal folder paths.
 *
 * The app uses a single internal folder structure (e.g. `app/[lang]/all-destinations/page.tsx`)
 * but exposes different URL slugs per locale (e.g. `/vi/diem-den` vs `/en/destinations`).
 *
 * The middleware rewrites incoming localized URLs → internal paths.
 * The `localizedHref` helper generates outgoing links with the correct slug.
 */

export type RouteEntry = {
  /** Internal folder path (without leading slash, without [lang]) */
  internal: string;
  /** Public slug per locale (without leading slash) */
  slugs: Record<string, string>;
};

/**
 * Static route map based on url.md spec.
 * Dynamic routes (blog/[slug], destination/[slug], help-center/[...slug]) are excluded —
 * they keep their existing paths.
 */
export const routeMap: RouteEntry[] = [
  {
    internal: "all-destinations",
    slugs: { vi: "diem-den", en: "destinations" },
  },
  {
    internal: "cart",
    slugs: { vi: "gio-hang", en: "cart" },
  },
  {
    internal: "checkout",
    slugs: { vi: "thanh-toan", en: "checkout" },
  },
  {
    internal: "thiet-bi-ho-tro-esim",
    slugs: { vi: "thiet-bi-ho-tro-esim", en: "esim-supported-devices" },
  },
  {
    internal: "review",
    slugs: { vi: "danh-gia", en: "review" },
  },
  {
    internal: "cong-cu-tinh-data",
    slugs: { vi: "cong-cu-tinh-data", en: "data-usage-calculator" },
  },
  {
    internal: "what-is-esim",
    slugs: { vi: "huong-dan-cai-dat-esim", en: "how-to-install-esim" },
  },
  {
    internal: "blog",
    slugs: { vi: "blog", en: "blog" },
  },
  {
    internal: "about-us",
    slugs: { vi: "ve-chung-toi", en: "about-us" },
  },
  {
    internal: "profile",
    slugs: { vi: "tai-khoan", en: "my-account" },
  },
  {
    internal: "help-center",
    slugs: { vi: "tro-giup", en: "help-center" },
  },
];

/**
 * Given a locale and a public slug, return the internal path (or null if no match).
 * Used by middleware to rewrite requests.
 */
export function resolveInternalPath(
  locale: string,
  publicSlug: string
): string | null {
  for (const entry of routeMap) {
    const expected = entry.slugs[locale];
    if (expected && publicSlug === expected) {
      return entry.internal;
    }
  }
  return null;
}

/**
 * Given a locale and an internal folder path, return the public slug.
 * Used to generate <Link href> values.
 */
export function localizedSlug(locale: string, internal: string): string {
  for (const entry of routeMap) {
    if (entry.internal === internal) {
      return entry.slugs[locale] || internal;
    }
  }
  return internal;
}

/**
 * Build a full localized href: `/${locale}/${publicSlug}`
 */
export function localizedHref(locale: string, internal: string): string {
  const slug = localizedSlug(locale, internal);
  return `/${locale}/${slug}`;
}
