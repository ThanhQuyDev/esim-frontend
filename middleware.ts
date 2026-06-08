import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
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
    '/((?!_next|api|.*\\..*).*)',
  ],
};
