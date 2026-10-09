/**
 * Serve product pages as ONE layout per device (#001, test round 4).
 *
 * The destination/region page used to ship the desktop AND the mobile layout
 * in the same HTML and hide one with CSS. Each layout carries its own <h1>, so
 * SEO tools counted two h1 tags on every product page. The customer asked for
 * the server to return only the version that fits the device.
 *
 * The page is prerendered, so it cannot read the User-Agent itself. Instead
 * the middleware rewrites phones to a sibling route, `/<locale>/<slug>/m-view`,
 * which renders the same page with only the mobile layout. The address bar
 * keeps the original URL; the variant route is never linked and is 404 when
 * requested directly, so search engines only ever see the canonical URL.
 */

/** Internal path segment of the mobile variant (`app/[locale]/[slug]/m-view`). */
export const MOBILE_VARIANT_SEGMENT = "m-view";

/**
 * First-level folders of `app/[locale]` other than `[slug]`. A one-segment
 * internal path that is one of these is a static page, not a product page,
 * and must not be rewritten. Kept in step with the folders by
 * `e2e/device-variant.spec.ts`.
 */
export const STATIC_TOP_LEVEL_ROUTES = new Set([
  "about-us",
  "affiliate",
  "blog",
  "cart",
  "check-esim",
  "checkout",
  "confirm-email",
  "confirm-new-email",
  "coupon",
  "data-calculator",
  "destinations",
  "esim-noi-dia",
  "esim-supported-devices",
  "help-center",
  "kyc-guide",
  "legal",
  "password-change",
  "payment",
  "press-area",
  "profile",
  "refer-a-friend",
  "review",
  "terms-of-service",
  "what-is-esim",
]);

const MOBILE_UA = /Mobi|Android.+Mobile|iPhone|iPod|Opera Mini|IEMobile|BlackBerry|webOS/i;

/** Phones get the mobile layout; desktops and tablets the desktop one. */
export function isMobileUserAgent(userAgent: string | null | undefined): boolean {
  return !!userAgent && MOBILE_UA.test(userAgent);
}

/**
 * The internal path a phone should be served for `internalPath` (the path the
 * request resolves to after locale routing, e.g. `/vi/esim-dai-loan`), or
 * null when the page has no device variant.
 */
export function mobileVariantPath(internalPath: string): string | null {
  const m = internalPath.match(/^\/(vi|en)\/([^/]+)\/?$/);
  if (!m) return null;
  const [, locale, slug] = m;
  if (STATIC_TOP_LEVEL_ROUTES.has(slug)) return null;
  return `/${locale}/${slug}/${MOBILE_VARIANT_SEGMENT}`;
}

/** True for a direct request to the variant route, which must 404. */
export function isDirectVariantRequest(pathname: string): boolean {
  return pathname
    .replace(/\/$/, "")
    .split("/")
    .includes(MOBILE_VARIANT_SEGMENT);
}
