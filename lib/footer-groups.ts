import { pickLocalizedTitle, type Footer as ApiFooter } from "./api";

/**
 * Footer columns from the CMS rows (#088).
 *
 * A footer row's LINK text has always been bilingual (`title`/`titleVi`), but
 * the heading it sits under did not: `categories` was one string, shown as-is
 * in both languages AND used as the grouping key. So an admin who wrote
 * "Sản phẩm" on some rows and "Products" on others got two columns holding
 * half the links each, and an English visitor read a Vietnamese heading.
 *
 * Rows now group by the default heading (`categories`) — one stable key
 * regardless of language — while the heading rendered comes from
 * `categoriesVi` on the Vietnamese site.
 */

export interface FooterLinkItem {
  id: string;
  label: string;
  href: string;
  iconUrl: string | null;
}

export interface FooterColumnItem {
  /** Grouping key: the default heading, case-folded. Not shown. */
  key: string;
  /** Heading as this locale reads it. */
  title: string;
  links: FooterLinkItem[];
}

/** Heading for the reader's language, mirroring `pickLocalizedTitle`. */
export function pickLocalizedCategory(
  item: { categories?: string | null; categoriesVi?: string | null },
  locale?: string
): string {
  if (locale === "vi") return (item.categoriesVi || item.categories || "").trim();
  return (item.categories || item.categoriesVi || "").trim();
}

/**
 * Link target for the reader's language (#043): the English site has its own
 * URLs, so `urlEn` wins there; `url` is the Vietnamese one and the fallback.
 */
export function pickLocalizedUrl(
  item: { url?: string | null; urlEn?: string | null },
  locale?: string
): string {
  const vi = (item.url || "").trim();
  if (locale === "vi") return vi;
  return (item.urlEn || "").trim() || vi;
}

/** The column a row belongs to, regardless of which language it was typed in. */
export function footerColumnKey(item: {
  categories?: string | null;
  categoriesVi?: string | null;
}): string {
  const raw = (item.categories || item.categoriesVi || "").trim();
  return raw.toLowerCase();
}

const FOLLOW_US_KEYS = new Set(["follow us", "theo dõi", "theo doi"]);

/**
 * Group the CMS rows into footer columns, in `sortOrder` then creation order,
 * with the social column pinned last.
 */
export function buildFooterColumns(
  footerLinks: ApiFooter[] | null | undefined,
  lang: string,
  fallbackHeading: string
): FooterColumnItem[] {
  const grouped = new Map<string, FooterColumnItem>();

  const ordered = [...(footerLinks ?? [])].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
      String(a.createdAt).localeCompare(String(b.createdAt))
  );

  for (const footerLink of ordered) {
    const label = pickLocalizedTitle(footerLink, lang).trim();
    const href = pickLocalizedUrl(footerLink, lang);
    if (!label || !href) continue;

    const key = footerColumnKey(footerLink) || "__default__";
    const heading = pickLocalizedCategory(footerLink, lang) || fallbackHeading;

    const column = grouped.get(key);
    if (column) {
      // A later row may carry the translated heading the first one lacked.
      if (!column.title) column.title = heading;
      column.links.push({
        id: footerLink.id,
        label,
        href,
        iconUrl: footerLink.iconUrl || null,
      });
      continue;
    }

    grouped.set(key, {
      key,
      title: heading,
      links: [
        {
          id: footerLink.id,
          label,
          href,
          iconUrl: footerLink.iconUrl || null,
        },
      ],
    });
  }

  const columns = Array.from(grouped.values());

  // "Follow us" is the social row; it reads last wherever it was entered.
  return [
    ...columns.filter((c) => !FOLLOW_US_KEYS.has(c.key)),
    ...columns.filter((c) => FOLLOW_US_KEYS.has(c.key)),
  ];
}
