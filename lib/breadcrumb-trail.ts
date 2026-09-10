import { routing } from "@/i18n/routing";
import {
  getBlogCategories,
  getBlogParentsByCategory,
  getDestinationBySlug,
  getRegionBySlug,
} from "./api";
import { categorySlug } from "@/components/layout/sections/blog-page/blog-detail-helpers";
import { fromUrlSlug } from "@/components/layout/sections/help-center/category-config";
import type { BreadcrumbSchemaItem } from "./breadcrumb-schema";

/**
 * Trail for the current URL, resolved server-side (#052).
 *
 * BreadcrumbList JSON-LD used to be emitted by the visual Breadcrumb component,
 * which lives in the page body — the wrong place for it. Building the trail from
 * the pathname instead lets the schema be rendered inside <head>, and gives every
 * page one, whether or not it shows a breadcrumb bar.
 *
 * Labels come from the same dictionary keys and the same helpers the visible
 * breadcrumbs use, so the two never disagree — a mismatch between the visible
 * trail and the marked-up one is exactly what Google flags.
 */

type Dict = Record<string, any>;

/** Route key → dictionary label, plus the route it hangs under. */
const ROUTE_LABELS: Record<string, { key: string; parent?: string }> = {
  "/destinations": { key: "destinations" },
  "/cart": { key: "cart" },
  "/checkout": { key: "checkout" },
  "/review": { key: "review" },
  "/data-calculator": { key: "dataCalculator" },
  "/what-is-esim": { key: "whatIsEsim" },
  "/coupon": { key: "coupon" },
  "/blog": { key: "blog" },
  "/blog/search": { key: "blogSearch", parent: "/blog" },
  "/about-us": { key: "aboutUs" },
  "/press-area": { key: "pressArea" },
  "/help-center": { key: "helpCenter" },
  "/help-center/categories": {
    key: "helpCenterCategories",
    parent: "/help-center",
  },
  "/help-center/search": { key: "helpCenterSearch", parent: "/help-center" },
  "/help-center/support": { key: "helpCenterSupport", parent: "/help-center" },
  "/help-center/support/success": {
    key: "helpCenterSupportSuccess",
    parent: "/help-center/support",
  },
  "/esim-supported-devices": { key: "supportedDevices" },
  "/profile": { key: "profile" },
  "/payment/result": { key: "paymentResult" },
  "/kyc-guide": { key: "kycGuide" },
  "/refer-a-friend": { key: "referFriend" },
  "/terms-of-service": { key: "termsOfService" },
};

/** Public path of a route key in a locale, e.g. "/help-center" → "/ho-tro". */
export function localizedRoutePath(routeKey: string, lang: string): string {
  const entry = (routing.pathnames as Record<string, unknown>)[routeKey];
  const path =
    typeof entry === "string"
      ? entry
      : ((entry as Record<string, string> | undefined)?.[lang] ?? routeKey);
  return lang === routing.defaultLocale ? path : `/${lang}${path}`;
}

function label(dict: Dict, key: string, fallback: string): string {
  return dict?.breadcrumb?.[key] || fallback;
}

/** "esim-nhat-ban" → "Esim nhat ban" — a last resort, never a lie. */
export function readableSlug(slug: string): string {
  const text = decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function crumb(
  dict: Dict,
  routeKey: string,
  lang: string
): BreadcrumbSchemaItem {
  const entry = ROUTE_LABELS[routeKey];
  return {
    label: entry
      ? label(dict, entry.key, routeKey)
      : readableSlug(routeKey.slice(1)),
    href: localizedRoutePath(routeKey, lang),
  };
}

/** The chain of parent crumbs a route hangs under, outermost first. */
function ancestors(routeKey: string, dict: Dict, lang: string) {
  const chain: BreadcrumbSchemaItem[] = [];
  let parent = ROUTE_LABELS[routeKey]?.parent;
  while (parent) {
    chain.unshift(crumb(dict, parent, lang));
    parent = ROUTE_LABELS[parent]?.parent;
  }
  return chain;
}

/** Match a localized path against the route table, static routes only. */
function matchStaticRoute(pathWithoutLocale: string, lang: string): string | null {
  for (const routeKey of Object.keys(ROUTE_LABELS)) {
    if (routeKey.includes("[")) continue;
    const entry = (routing.pathnames as Record<string, unknown>)[routeKey];
    const localized =
      typeof entry === "string"
        ? entry
        : ((entry as Record<string, string> | undefined)?.[lang] ?? routeKey);
    if (localized === pathWithoutLocale) return routeKey;
  }
  return null;
}

/** Name a blog category slug, exactly the way the blog pages resolve it. */
async function blogCategoryName(slug: string, lang: string): Promise<string> {
  try {
    const categories = await getBlogCategories(lang);
    return (
      categories.find((c) => categorySlug(c) === slug) ?? readableSlug(slug)
    );
  } catch {
    return readableSlug(slug);
  }
}

async function blogParentName(
  categoryName: string,
  parentSlug: string,
  lang: string
): Promise<string> {
  try {
    const parentsMap = await getBlogParentsByCategory(lang);
    const parents = parentsMap[categoryName] ?? [];
    return (
      parents.find((p) => categorySlug(p) === parentSlug) ??
      readableSlug(parentSlug)
    );
  } catch {
    return readableSlug(parentSlug);
  }
}

/** Country/region name for a bare slug page, or null when it is neither. */
async function entityName(slug: string, lang: string): Promise<string | null> {
  const destination = await getDestinationBySlug(slug, lang);
  if (destination) {
    return (
      (lang === "vi" ? destination.titleVi : destination.title) ||
      destination.name
    );
  }
  const region = await getRegionBySlug(slug, lang);
  if (region) {
    return (lang === "vi" ? region.titleVi : region.title) || region.name;
  }
  return null;
}

/**
 * Build the trail for a pathname, WITHOUT the "Home" crumb (the caller adds it).
 * An empty array means the page gets no BreadcrumbList — the homepage, and any
 * route this resolver deliberately stays out of.
 */
export async function resolveBreadcrumbTrail(
  pathname: string,
  lang: string,
  dict: Dict
): Promise<BreadcrumbSchemaItem[]> {
  const prefix = lang === routing.defaultLocale ? "" : `/${lang}`;
  const path = prefix && pathname.startsWith(prefix)
    ? pathname.slice(prefix.length) || "/"
    : pathname;
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return [];

  // Test-only harnesses have no place in search results.
  if (segments.includes("test") || segments.includes("topup-test")) return [];

  const staticRoute = matchStaticRoute(path, lang);
  if (staticRoute) {
    return [...ancestors(staticRoute, dict, lang), crumb(dict, staticRoute, lang)];
  }

  const blogRoot = crumb(dict, "/blog", lang);
  const helpRoot = crumb(dict, "/help-center", lang);

  // ── Blog family ───────────────────────────────────────────────────
  if (segments[0] === "blog") {
    if (segments[1] === "author" && segments[2]) {
      return [blogRoot, { label: readableSlug(segments[2]) }];
    }
    if (segments[1] && segments[2]) {
      const categoryName = await blogCategoryName(segments[1], lang);
      return [
        blogRoot,
        { label: categoryName, href: `${blogRoot.href}/${segments[1]}` },
        { label: await blogParentName(categoryName, segments[2], lang) },
      ];
    }
    if (segments[1]) {
      return [blogRoot, { label: await blogCategoryName(segments[1], lang) }];
    }
  }

  // ── Help centre family ────────────────────────────────────────────
  const helpRootSegment = lang === routing.defaultLocale ? "ho-tro" : "help-center";
  if (segments[0] === helpRootSegment) {
    if (segments[1] && segments[2]) {
      return [
        helpRoot,
        { label: fromUrlSlug(segments[1]), href: `${helpRoot.href}/${segments[1]}` },
        { label: fromUrlSlug(segments[2]) },
      ];
    }
    if (segments[1]) {
      return [helpRoot, { label: fromUrlSlug(segments[1]) }];
    }
  }

  // ── Legal pages ───────────────────────────────────────────────────
  if (segments[0] === "phap-ly" || segments[0] === "legal") {
    return [
      { label: label(dict, "legal", "Legal") },
      { label: readableSlug(segments[1] ?? "") },
    ].filter((item) => item.label);
  }

  // ── Domestic eSIM carrier ─────────────────────────────────────────
  if (segments[0] === "esim-noi-dia" || segments[0] === "domestic-esim") {
    return [
      { label: label(dict, "domesticEsim", "eSIM") },
      { label: segments[1] ? readableSlug(segments[1]) : "" },
    ].filter((item) => item.label);
  }

  // ── A bare slug: country or region detail page ────────────────────
  if (segments.length === 1) {
    const name = await entityName(segments[0], lang);
    if (name) {
      return [crumb(dict, "/destinations", lang), { label: name }];
    }
  }

  // Unknown route: name each segment from its slug rather than guessing.
  return segments.map((segment, index) => ({
    label: readableSlug(segment),
    href:
      index < segments.length - 1
        ? `${prefix}/${segments.slice(0, index + 1).join("/")}`
        : undefined,
  }));
}
