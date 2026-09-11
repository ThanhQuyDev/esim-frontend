import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { resolveGeoLocaleRedirect } from './i18n/geo-locale';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Visitors outside Vietnam landing on the ambiguous home page get the
  // English homepage instead of the Vietnamese default. Every other URL keeps
  // stating its own language — see `i18n/geo-locale.ts` for why this is
  // limited to `/`.
  const geoRedirect = resolveGeoLocaleRedirect({
    pathname: request.nextUrl.pathname,
    getHeader: (name) => request.headers.get(name),
    getCookie: (name) => request.cookies.get(name)?.value,
  });

  if (geoRedirect) {
    const url = request.nextUrl.clone();
    url.pathname = geoRedirect;
    // 307, never 308: the target depends on who is asking, so it must not be
    // remembered as permanent. `no-store` keeps a CDN from serving one
    // visitor's geo redirect to everyone else.
    const redirect = NextResponse.redirect(url, 307);
    redirect.headers.set('Cache-Control', 'no-store');
    redirect.headers.set('Vary', 'Cookie, User-Agent');
    return redirect;
  }

  const response = handleI18nRouting(request);
  // Expose the current request path to server components so per-page SEO /
  // structured-data lookups know exactly which page is being rendered.
  // next-intl does not set this header on its own.
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    // Match tất cả paths trừ static files, api, _next
    // `go` is also excluded: /go/<code> is the KOL marketing link, rewritten
    // to /api/go/<code> by next.config. Without the exclusion the i18n
    // middleware redirects it to /vi/go/<code> first and the link 404s.
    // `opengraph-image` / `twitter-image` are served straight from
    // app/[locale]; letting the i18n middleware touch them would put a
    // redirect in front of every social-share preview image.
    '/((?!_next|api|go|.*opengraph-image|.*twitter-image|.*\\..*).*)',
  ],
};
