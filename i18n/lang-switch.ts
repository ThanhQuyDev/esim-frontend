/**
 * Helpers for switching locale safely with `next-intl`'s pathname-based routing.
 *
 * `usePathname()` from `@/i18n/navigation` returns the internal pathname
 * template (e.g. `/blog/[slug]`). Calling `router.replace(template, { locale })`
 * without `params` throws:
 *   "Insufficient params provided for localized pathname."
 *
 * For most dynamic routes we don't have the original params on the client (and
 * the localized slug usually differs anyway), so we redirect to a safe parent
 * path in the new locale instead. Destination/region pages are the exception:
 * they use the same public slug across locales, so we can preserve the current
 * public pathname and only add/remove the locale prefix.
 */

import { routing } from "./routing";

/**
 * Map of dynamic pathname templates to their safe parent fallback path.
 * Keys are the internal templates as defined in `i18n/routing.ts`.
 */
export const DYNAMIC_ROUTE_FALLBACKS: Record<string, string> = {
  '/[slug]': '/',
  '/blog/[slug]': '/blog',
  '/blog/[slug]/[parent]': '/blog',
  '/help-center/[slug]': '/help-center',
  '/help-center/[slug]/[parent]': '/help-center',
};

/**
 * Resolve the pathname to navigate to when the user switches locale.
 * Returns the fallback parent path for dynamic routes, otherwise the same
 * pathname (which next-intl can re-localize on its own).
 */
export function resolveLangSwitchPath(pathname: string): string {
  return DYNAMIC_ROUTE_FALLBACKS[pathname] ?? pathname;
}

/**
 * Preserve a public dynamic slug while switching locale.
 *
 * Example:
 * - current `vi` public path `/thailand` + target `en` → `/en/thailand`
 * - current `en` public path `/en/thailand` + target `vi` → `/thailand`
 */
export function resolveDynamicLangSwitchPath(
  currentPublicPathname: string,
  currentLocale: string,
  targetLocale: string
): string {
  const currentPrefix = `/${currentLocale}`;
  let pathname = currentPublicPathname || "/";

  if (pathname === currentPrefix) {
    pathname = "/";
  } else if (pathname.startsWith(`${currentPrefix}/`)) {
    pathname = pathname.slice(currentPrefix.length) || "/";
  }

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  if (targetLocale === routing.defaultLocale) {
    return pathname;
  }

  return pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;
}
