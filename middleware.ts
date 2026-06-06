import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";
import { resolveInternalPath, routeMap } from "./lib/route-mapping";

/**
 * Valid slug pattern: lowercase letters, digits, and hyphens only.
 * This prevents path traversal and double-encoding attacks.
 */
const VALID_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidSlug(raw: string): boolean {
  // Decode first to catch %2e%2e (..) and other encoded attacks
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return false;
  }
  return VALID_SLUG_RE.test(decoded);
}

function getLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2).toLowerCase());
    for (const lang of preferred) {
      if (i18n.locales.includes(lang as any)) {
        return lang;
      }
    }
  }

  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static files, api routes, and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return;
  }

  // === LEGACY ROUTE REDIRECTS (301 Permanent) ===
  // Redirect /:locale/destination/:slug → /:locale/:slug
  // Redirect /:locale/region/:slug      → /:locale/:slug

  const legacyMatch = pathname.match(
    /^\/([a-z]{2})\/(destination|region)\/(.+)$/
  );
  if (legacyMatch) {
    const [, locale, , rawSlug] = legacyMatch;

    // Validate locale is in the allowlist
    if (!i18n.locales.includes(locale as any)) {
      // Unknown locale — let the locale redirect logic below handle it
      // (fall through)
    } else if (isValidSlug(rawSlug)) {
      // Build the new URL, preserving query string
      const newPathname = `/${locale}/${rawSlug}`;
      const newUrl = new URL(newPathname, request.url);
      newUrl.search = search; // preserve query string

      return NextResponse.redirect(newUrl, 301);
    }
    // If the slug is invalid, fall through and let Next.js 404 naturally
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to locale-prefixed path
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // --- Localized URL rewriting ---
  // Extract locale and the rest of the path
  const segments = pathname.split("/"); // ['', locale, slug, ...rest]
  const locale = segments[1];
  const publicSlug = segments[2];

  if (!publicSlug) {
    // root locale page — set header for structured data
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  // Check if the public slug maps to a different internal path
  const internalPath = resolveInternalPath(locale, publicSlug);

  if (internalPath && internalPath !== publicSlug) {
    // Rewrite: keep the rest of the path intact (for sub-routes like /ho-tro/huong-dan)
    const rest = segments.slice(3).join("/");
    const newPathname = `/${locale}/${internalPath}${rest ? `/${rest}` : ""}`;
    request.nextUrl.pathname = newPathname;
    const response = NextResponse.rewrite(request.nextUrl);
    response.headers.set("x-pathname", pathname);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
