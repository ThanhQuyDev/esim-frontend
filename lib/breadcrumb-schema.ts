import { SITE_BASE_URL } from "./hreflang";

/**
 * BreadcrumbList JSON-LD (#051).
 *
 * Extracted from the visual Breadcrumb component so pages that deliberately
 * show no breadcrumb bar — the blog index, the help centre — can still publish
 * the trail, which is what Google reads to draw the path under a search result.
 */

export interface BreadcrumbSchemaItem {
  label: string;
  /** Public path ("/blog") or absolute URL. Omit for the current page. */
  href?: string;
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** "Trang chủ" / "Home", the first crumb of every trail. */
export function homeCrumb(lang: string): BreadcrumbSchemaItem {
  return {
    label: lang === "vi" ? "Trang chủ" : "Home",
    href: lang === "vi" ? "/" : `/${lang}`,
  };
}

/**
 * Build the JSON-LD object. `currentPath` fills in the `item` of a crumb with no
 * href — the last one, which is the page being viewed.
 *
 * Returns null for a trail of fewer than two crumbs: a list containing only
 * "Home" describes no path and Google ignores it, so emitting it is noise.
 */
export function buildBreadcrumbSchema(
  items: BreadcrumbSchemaItem[],
  currentPath: string
): Record<string, unknown> | null {
  if (items.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href ?? currentPath),
    })),
  };
}
