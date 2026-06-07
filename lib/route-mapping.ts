/**
 * Route mapping helpers — compatibility layer over next-intl pathnames.
 *
 * With next-intl, routing is handled by:
 *   - middleware.ts (next-intl/middleware)
 *   - i18n/routing.ts (defineRouting with pathnames)
 *
 * This file provides a thin `localizedHref` for components that haven't yet
 * migrated to `import { Link } from "@/i18n/navigation"` and `getPathname()`.
 */

import { routing } from "@/i18n/routing";

type PathnameKey = keyof typeof routing.pathnames;

/**
 * Build a localized href: `/${locale}/{localizedSlug}` for non-default locale,
 * or `/{localizedSlug}` for default locale (vi).
 *
 * @param locale  Current locale string (e.g., "vi", "en")
 * @param key     Internal pathname key without leading slash (e.g., "help-center", "cart")
 */
export function localizedHref(locale: string, key: string): string {
  // Normalize: strip leading slash, add it back after resolution
  const normalizedKey = key.startsWith("/") ? key : `/${key}`;

  const pathnames = routing.pathnames as Record<string, Record<string, string> | string>;
  const entry = pathnames[normalizedKey];

  let publicPath: string;

  if (typeof entry === "object" && entry !== null && locale in entry) {
    publicPath = entry[locale];
  } else if (typeof entry === "string") {
    publicPath = entry;
  } else {
    // Fallback: use the key itself, strip leading slash for URL
    publicPath = normalizedKey;
  }

  // Remove leading slash for concatenation
  publicPath = publicPath.replace(/^\//, "");

  if (locale === routing.defaultLocale) {
    return `/${publicPath}`;
  }
  return `/${locale}/${publicPath}`;
}

// Keep legacy exports for backward compatibility
export type RouteEntry = {
  internal: string;
  slugs: Record<string, string>;
};

export const routeMap: RouteEntry[] = [];

export function resolveInternalPath(_locale: string, _publicSlug: string): string | null {
  return null;
}

export function localizedSlug(_locale: string, _internal: string): string {
  return _internal;
}
