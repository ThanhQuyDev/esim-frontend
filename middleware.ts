import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match tất cả paths trừ static files, api, _next
    '/((?!_next|api|.*\\..*).*)',
  ],
};
