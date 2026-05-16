import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n-config";
import { resolveInternalPath, routeMap } from "./lib/route-mapping";

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
  const { pathname } = request.nextUrl;

  // Skip static files, api routes, and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return;
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

  if (!publicSlug) return; // root locale page, no rewrite needed

  // Check if the public slug maps to a different internal path
  const internalPath = resolveInternalPath(locale, publicSlug);

  if (internalPath && internalPath !== publicSlug) {
    // Rewrite: keep the rest of the path intact (for sub-routes like /ho-tro/huong-dan)
    const rest = segments.slice(3).join("/");
    const newPathname = `/${locale}/${internalPath}${rest ? `/${rest}` : ""}`;
    request.nextUrl.pathname = newPathname;
    return NextResponse.rewrite(request.nextUrl);
  }

  return;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
