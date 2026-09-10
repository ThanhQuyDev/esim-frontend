import { routing } from './routing';

/**
 * Cookie holding the visitor's EXPLICIT language choice (set by the language
 * switcher). While it exists, geo detection never overrides the visitor.
 */
export const LOCALE_CHOICE_COOKIE = 'esimvn_locale';

/** One year — a language preference should outlive a session. */
export const LOCALE_CHOICE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Headers that may carry the visitor's country, in order of trust.
 * Which one exists depends on where the app is deployed (Vercel edge,
 * Cloudflare in front of the VPS, or a custom nginx `geoip` variable). When
 * none is present we simply do nothing — see {@link resolveGeoLocaleRedirect}.
 */
const COUNTRY_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-geo-country',
  'x-country-code',
];

/**
 * Requests we must never geo-redirect. Search engines crawl from foreign IPs,
 * so redirecting them would push the Vietnamese pages — the canonical ones —
 * out of the index.
 */
const BOT_UA =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|embedly|preview|whatsapp|telegram|lighthouse|headlesschrome|pingdom|uptime|monitor/i;

/**
 * Record an explicit language choice so geo detection stops overriding it.
 * Client-side only; a no-op when `document` is unavailable.
 */
export function rememberLocaleChoice(locale: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LOCALE_CHOICE_COOKIE}=${locale}; path=/; max-age=${LOCALE_CHOICE_MAX_AGE}; samesite=lax`;
}

export interface GeoRequestLike {
  pathname: string;
  getHeader: (name: string) => string | null | undefined;
  getCookie: (name: string) => string | null | undefined;
}

/** Country code (upper-case) from whichever geo header the host provides. */
export function readCountry(
  getHeader: GeoRequestLike['getHeader']
): string | null {
  for (const header of COUNTRY_HEADERS) {
    const value = getHeader(header);
    if (value && value.trim() && value.trim() !== 'XX') {
      return value.trim().toUpperCase();
    }
  }
  return null;
}

/** True for a real browser page navigation (not a bot, prefetch or asset). */
export function isHumanNavigation(
  getHeader: GeoRequestLike['getHeader']
): boolean {
  const ua = getHeader('user-agent') || '';
  if (!ua || BOT_UA.test(ua)) return false;

  const accept = getHeader('accept') || '';
  if (!accept.includes('text/html')) return false;

  // Next.js prefetches and RSC payload requests must not be redirected.
  if (getHeader('next-router-prefetch') || getHeader('rsc')) return false;

  const mode = getHeader('sec-fetch-mode');
  if (mode && mode !== 'navigate') return false;

  return true;
}

/**
 * Decide whether a visitor should be sent to the English homepage.
 *
 * Deliberately narrow — it only ever fires on the un-prefixed HOME page:
 *
 * - `/` is the one URL whose language is ambiguous. Every other path already
 *   states its language (`/en/...` is English, anything else is Vietnamese),
 *   and Thọ's note for this task is "fix ngôn ngữ theo url" — so a URL that
 *   already names a language is never overridden.
 * - Deep paths also map to a DIFFERENT English path (`/diem-den` →
 *   `/en/destinations`), so a blind prefix swap would land on a 404.
 * - Vietnamese visitors need no redirect: `vi` is already the default.
 *
 * Returns the path to redirect to, or `null` to leave the request alone.
 * Unknown country ⇒ `null`, so a host without any geo header simply keeps the
 * current behaviour.
 */
export function resolveGeoLocaleRedirect(
  request: GeoRequestLike
): string | null {
  if (request.pathname !== '/') return null;

  // An explicit choice always wins over geo detection.
  const chosen = request.getCookie(LOCALE_CHOICE_COOKIE);
  if (chosen && routing.locales.includes(chosen as never)) return null;

  if (!isHumanNavigation(request.getHeader)) return null;

  const country = readCountry(request.getHeader);
  if (!country) return null;
  if (country === 'VN') return null;

  return '/en';
}
