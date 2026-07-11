import { getPathname } from "@/i18n/navigation";
import { routing, type Pathnames } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n-config";

/** Non-parameterized route keys (excludes dynamic `/[slug]`-style routes). */
type StaticPathname = Exclude<Pathnames, `${string}[${string}]${string}`>;

function normalizePath(path: string): string {
  let p = path.split("?")[0].split("#")[0].replace(/\/+/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
  return p || "/";
}

const STATIC_SEO_ROUTES: StaticPathname[] = [
  "/",
  "/destinations",
  "/cart",
  "/checkout",
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
  "/terms-of-service",
  "/blog/search",
  "/help-center/categories",
  "/help-center/search",
  "/help-center/support",
  "/help-center/support/success",
];

/**
 * URL path stored in SEO Config (admin CMS), aligned with public routes.
 * vi: localized slug without locale prefix (e.g. `/ma-giam-gia`).
 * en: `/en` + localized path (e.g. `/en/coupon`).
 */
export function getCmsSeoUrlForPage(
  href: StaticPathname,
  locale: Locale
): string {
  const pathname = getPathname({ locale, href });

  if (locale === routing.defaultLocale) {
    return pathname;
  }

  if (pathname === "/") {
    return `/${locale}/home`;
  }

  return `/${locale}${pathname}`;
}

export function getCmsSeoUrlForHome(locale: Locale): string {
  return locale === routing.defaultLocale ? "/home" : `/${locale}/home`;
}

/** Public browser path (no query) for a static route. */
export function getBrowserPathForPage(href: StaticPathname, locale: Locale): string {
  const pathname = getPathname({ locale, href });
  if (locale === routing.defaultLocale) {
    return pathname === "/" ? "/" : pathname;
  }
  if (pathname === "/") {
    return `/${locale}`;
  }
  return `/${locale}${pathname}`;
}

/**
 * Map current request pathname to the SEO Config `url` field used in admin.
 */
export function resolveCmsSeoLookupPath(
  pathname: string,
  locale: Locale
): string {
  const normalized = normalizePath(pathname);

  const homeBrowser = getBrowserPathForPage("/", locale);
  if (normalizePath(homeBrowser) === normalized) {
    return getCmsSeoUrlForHome(locale);
  }

  for (const href of STATIC_SEO_ROUTES) {
    if (href === "/") continue;
    const browser = getBrowserPathForPage(href, locale);
    if (normalizePath(browser) === normalized) {
      return getCmsSeoUrlForPage(href, locale);
    }
  }

  return normalized;
}