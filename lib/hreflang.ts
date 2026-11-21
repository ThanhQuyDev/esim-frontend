import { routing } from "@/i18n/routing";

/**
 * The public origin of this deployment. Same source as `app/sitemap.ts` and
 * `app/robots.ts`, so canonical, hreflang, sitemap and every referral link
 * agree — a hardcoded "https://esim.vn" sent beta's links to production.
 */
export const SITE_BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://esim.vn";

/** Same pairs as the policy content and i18n/lang-switch.ts. */
const LEGAL_SLUG_PAIRS: Array<{ vi: string; en: string }> = [
  { vi: "chinh-sach-hoan-tien", en: "refund-policy" },
  { vi: "chinh-sach-giao-hang", en: "delivery-policy" },
  { vi: "dieu-khoan-dieu-kien", en: "terms-of-service" },
  { vi: "chinh-sach-bao-mat", en: "privacy-policy" },
];

/**
 * Canonical only, no hreflang: a page whose other-language version has no
 * content (blog categories and author pages, vande-2011 #045). Declaring an
 * empty or 404 page as the translation makes Google drop the pair.
 */
export function canonicalOnly(rawPathname: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const path = (rawPathname || "/").replace(/\/$/, "") || "/";
  return { canonical: `${SITE_BASE_URL}${path === "/" ? "" : path}`, languages: {} };
}

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
  // Home: `https://esim.vn` and `https://esim.vn/en` — `/en/` redirects to
  // `/en`, so it must not be what hreflang and canonical name (vande-2011
  // #045, hreflang-html-fix.csv).
  if (publicPath === "/") return `${SITE_BASE_URL}${prefix}`;
  return `${SITE_BASE_URL}${prefix}${publicPath}`;
}

function patternRegex(pattern: string): { re: RegExp; names: string[] } {
  const names: string[] = [];
  const body = pattern
    .split("/")
    .map((part) => {
      const m = part.match(/^\[([^\]]+)\]$/);
      if (!m) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      names.push(m[1]);
      return "([^/]+)";
    })
    .join("/");
  return { re: new RegExp(`^${body}/?$`), names };
}

/** The route key and values of a dynamic path whose words are localized. */
function matchDynamicRoute(
  publicPath: string,
  locale: string
): { key: string; params: Record<string, string> } | null {
  for (const key of Object.keys(pathnames)) {
    if (!key.includes("[")) continue;
    const entry = pathnames[key];
    // Same pattern in every language: a prefix swap is already right.
    if (typeof entry === "string") continue;
    const values = routing.locales.map((l) => localizedValue(entry, l));
    if (values.every((v) => v === values[0])) continue;
    const { re, names } = patternRegex(localizedValue(entry, locale));
    const m = publicPath.match(re);
    if (!m) continue;
    const params: Record<string, string> = {};
    names.forEach((name, i) => (params[name] = m[i + 1]));
    return { key, params };
  }
  return null;
}

function fillPattern(pattern: string, params: Record<string, string>): string {
  return pattern.replace(/\[([^\]]+)\]/g, (_, name: string) => params[name] ?? "");
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

  // A legal page has its own slug per language (/phap-ly/chinh-sach-hoan-tien
  // ⇄ /en/legal/refund-policy): pair them, rather than swapping the prefix
  // onto a path that does not exist (vande-2011 #045).
  const legal = publicPath.match(/^\/(?:phap-ly|legal)\/([^/]+)\/?$/);
  const pair = legal
    ? LEGAL_SLUG_PAIRS.find((p) => p.vi === legal[1] || p.en === legal[1])
    : undefined;
  if (pair) {
    languages.vi = `${SITE_BASE_URL}/phap-ly/${pair.vi}`;
    languages.en = `${SITE_BASE_URL}/en/legal/${pair.en}`;
    languages["x-default"] = languages.vi;
    return { canonical: languages[currentLocale], languages };
  }

  // A dynamic route whose words differ per language (/ho-tro/[slug] ⇄
  // /help-center/[slug]): fill the other language's pattern with the same
  // values, instead of a prefix swap onto a path that only redirects
  // (vande-2011 #045).
  const dynamic = internalKey ? null : matchDynamicRoute(publicPath, currentLocale);

  for (const locale of routing.locales) {
    const localePublicPath = internalKey
      ? localizedValue(pathnames[internalKey], locale)
      : dynamic
        ? fillPattern(localizedValue(pathnames[dynamic.key], locale), dynamic.params)
        : publicPath; // same slug and words across locales
    languages[locale] = withPrefix(locale, localePublicPath);
  }

  // x-default points at the Vietnamese (default-locale) version.
  languages["x-default"] = languages[routing.defaultLocale];

  return {
    canonical: languages[currentLocale],
    languages,
  };
}
