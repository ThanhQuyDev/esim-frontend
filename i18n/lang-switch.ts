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
  '/legal/[slug]': '/',
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
/**
 * The page's own address in another language, from its
 * `<link rel="alternate" hreflang>` (vande-2011 #014). A destination's English
 * slug is its own (esim-thai-lan ↔ thailand-esim): swapping only the locale
 * prefix landed on /en/esim-thai-lan, and the address bar kept a slug that
 * was not the page's until a reload. Same-site paths only; null when absent.
 */
export function alternatePathFromDocument(
  targetLocale: string,
  doc: Pick<Document, "querySelectorAll"> | undefined = typeof document ===
  "undefined"
    ? undefined
    : document,
  origin: string = typeof window === "undefined" ? "" : window.location.origin
): string | null {
  if (!doc) return null;
  const links = Array.from(
    doc.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')
  );
  const link = links.find(
    (l) => (l.getAttribute("hreflang") || "").toLowerCase() === targetLocale
  );
  const href = link?.getAttribute("href");
  if (!href) return null;
  try {
    // Only the path is kept, so another host is never followed.
    const url = new URL(href, origin || "http://localhost");
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function resolveDynamicLangSwitchPath(
  currentPublicPathname: string,
  currentLocale: string,
  targetLocale: string
): string {
  // The page says where its other language lives (vande-2011 #014).
  const alternate = alternatePathFromDocument(targetLocale);
  if (alternate) return alternate;

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

/**
 * Legal policy slug pairs, keyed by canonical id. The legal route uses a
 * different slug per locale (vi keeps the Vietnamese slug, en uses an English
 * one), so a plain prefix swap is not enough — we map vi↔en explicitly.
 *
 * Kept in sync with `components/layout/sections/legal/content/*` `urlSlug`.
 * Duplicated here (rather than imported) to keep the heavy policy content out
 * of the client bundle that the navbar/lang-switcher ship on every page.
 */
const LEGAL_SLUG_PAIRS: Array<{ vi: string; en: string }> = [
  { vi: "chinh-sach-hoan-tien", en: "refund-policy" },
  { vi: "chinh-sach-giao-hang", en: "delivery-policy" },
  { vi: "dieu-khoan-dieu-kien", en: "terms-of-service" },
  { vi: "chinh-sach-bao-mat", en: "privacy-policy" },
];

/**
 * Resolve the target path when switching locale on a legal policy page.
 *
 * Extracts the current slug from the public pathname (`/phap-ly/{slug}` for vi,
 * `/en/legal/{slug}` for en), maps it to the target locale's slug, and rebuilds
 * the localized path. Falls back to the legal section root if the slug is
 * unknown.
 */
export function resolveLegalLangSwitchPath(
  currentPublicPathname: string,
  targetLocale: string
): string {
  const segments = (currentPublicPathname || "").split("/").filter(Boolean);
  const currentSlug = segments[segments.length - 1] ?? "";

  const pair = LEGAL_SLUG_PAIRS.find(
    (p) => p.vi === currentSlug || p.en === currentSlug
  );

  if (!pair) {
    // Unknown slug — go to a safe locale-appropriate landing.
    return targetLocale === routing.defaultLocale ? "/" : `/${targetLocale}`;
  }

  return targetLocale === "en"
    ? `/en/legal/${pair.en}`
    : `/phap-ly/${pair.vi}`;
}
