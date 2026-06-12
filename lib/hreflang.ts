import { routing } from "@/i18n/routing";

export const SITE_BASE_URL = "https://esim.vn";

type LocalizedAlternates = {
  canonical: string;
  languages: Record<string, string>;
};

const pathnames = routing.pathnames as Record<
  string,
  string | Record<string, string>
>;

function localizedValue(
  entry: string | Record<string, string>,
  locale: string
): string {
  if (typeof entry === "string") return entry;
  return entry[locale] ?? entry[routing.defaultLocale] ?? "/";
}

function withPrefix(locale: string, publicPath: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  // Home route: keep a trailing slash so canonical matches the sitemap
  // (sitemap emits `https://esim.vn/` for the home route).
  if (publicPath === "/") return `${SITE_BASE_URL}${prefix}/`;
  return `${SITE_BASE_URL}${prefix}${publicPath}`;
}

/**
 * Build hreflang alternates + canonical for the current request path.
 *
 * `rawPathname` is the public (already-localized) path from the `x-pathname`
 * request header, e.g. `/`, `/en`, `/gio-hang`, `/en/cart`, `/japan`.
 *
 * Strategy:
 *  - Detect the current locale from the prefix.
 *  - Strip the prefix to get the locale-specific public path.
 *  - If that path matches a static localized route in `routing.pathnames`,
 *    emit each locale's own localized URL (handles `/gio-hang` ⇄ `/en/cart`).
 *  - Otherwise (dynamic routes like `/[slug]`, `/blog/[slug]`, which share the
 *    same slug across locales) just swap the locale prefix.
 */
export function buildLanguageAlternates(
  rawPathname: string
): LocalizedAlternates {
  const pathname = rawPathname || "/";

  const currentLocale = pathname === "/en" || pathname.startsWith("/en/")
    ? "en"
    : routing.defaultLocale;

  // Public path without the locale prefix.
  let publicPath =
    currentLocale === "en" ? pathname.replace(/^\/en/, "") : pathname;
  if (publicPath === "") publicPath = "/";

  // Try to resolve a static internal route by matching the current locale's
  // localized value against the public path.
  const internalKey = Object.keys(pathnames).find(
    (key) => localizedValue(pathnames[key], currentLocale) === publicPath
  );

  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    const localePublicPath = internalKey
      ? localizedValue(pathnames[internalKey], locale)
      : publicPath; // dynamic route: same slug across locales
    languages[locale] = withPrefix(locale, localePublicPath);
  }

  // x-default points at the Vietnamese (default-locale) version.
  languages["x-default"] = languages[routing.defaultLocale];

  return {
    canonical: languages[currentLocale],
    languages,
  };
}
