import type { Destination, Region } from "./api";
import type { Locale } from "./i18n-config";
import { localizedSlug } from "./slug";
import { normalizeSearchTerm } from "./text";

/**
 * Grouping of same-named regions that differ only by how many countries they
 * cover — e.g. "eSIM Châu Á" sold as a 13-country pack and as a 20-country
 * pack. The storefront lists ONE card per group (`/esim-chau-a`); the group
 * page then lets the customer pick a variant (`/esim-chau-a-13-quoc-gia`).
 */
export interface RegionGroup {
  /** Normalized grouping key (accent-free base title). */
  key: string;
  /** Base label as shown to the customer, e.g. "eSIM Châu Á". */
  label: string;
  /** Slug of the group landing page, e.g. "esim-chau-a". */
  slug: string;
  /** Variants, cheapest country-count first. */
  members: Region[];
  /** Cheapest `fromPrice` across the variants, when any is known. */
  fromPrice: number | null;
  /** Icon/avatar of the first variant that has one. */
  iconUrl: string | null;
}

/** Title a region card shows — same precedence the storefront already uses. */
export function regionDisplayTitle(
  region: Pick<Region, "name" | "title" | "titleVi">,
  lang: Locale
): string {
  return (lang === "vi" ? region.titleVi : region.title) || region.name;
}

/**
 * A trailing country-count, in either language and with or without brackets:
 * "eSIM Châu Á 13 quốc gia", "Asia (20 countries)", "Châu Á - 13 nước".
 * Matched against the ALREADY normalized (accent-free, lowercased) title.
 */
const COUNT_SUFFIX = /[\s\-–—(]*\d+\s*(?:quoc gia|nuoc|countries|country)\s*\)?\s*$/;

/**
 * Key that decides which regions belong together: the displayed title with any
 * trailing country-count removed. Two regions named exactly "eSIM Châu Á" group
 * together, and so do "eSIM Châu Á 13 quốc gia" / "eSIM Châu Á 20 quốc gia" —
 * the CMS is free to use either naming convention.
 */
export function regionGroupKey(
  region: Pick<Region, "name" | "title" | "titleVi">,
  lang: Locale
): string {
  const normalized = normalizeSearchTerm(regionDisplayTitle(region, lang));
  return normalized.replace(COUNT_SUFFIX, "").trim() || normalized;
}

/** Same as {@link regionGroupKey} but keeping the original casing/accents. */
function baseLabel(
  region: Pick<Region, "name" | "title" | "titleVi">,
  lang: Locale
): string {
  const title = regionDisplayTitle(region, lang);
  // Strip the suffix from the display title by locating it on the normalized
  // twin: normalisation never changes length (accents are combining marks that
  // were folded away only after NFD), so fall back to the full title whenever
  // the two disagree instead of cutting in the wrong place.
  const normalized = normalizeSearchTerm(title);
  const stripped = normalized.replace(COUNT_SUFFIX, "").trim();
  if (!stripped || stripped === normalized) return title;

  const words = title.trim().split(/\s+/);
  const strippedWords = stripped.split(" ").length;
  return words.slice(0, strippedWords).join(" ") || title;
}

/**
 * Slug for the group landing page: the segments every variant's slug starts
 * with. `esim-chau-a-13-quoc-gia` + `esim-chau-a-20-quoc-gia` → `esim-chau-a`.
 *
 * Compared segment by segment (never character by character) so `esim-chau-au`
 * can never be shortened into a prefix of `esim-chau-a`. Falls back to the
 * first variant's own slug when the variants share no common prefix, which
 * keeps the card pointing at a page that actually exists.
 */
export function regionGroupSlug(slugs: string[]): string {
  if (slugs.length === 0) return "";
  if (slugs.length === 1) return slugs[0];

  const parts = slugs.map((s) => s.split("-"));
  const shared: string[] = [];
  for (let i = 0; i < parts[0].length; i++) {
    const segment = parts[0][i];
    if (parts.every((p) => p[i] === segment)) shared.push(segment);
    else break;
  }

  return shared.length > 0 ? shared.join("-") : slugs[0];
}

function memberCount(region: Region): number {
  return region.destinationCount ?? 0;
}

/**
 * Collapse same-named regions into groups, preserving the order in which the
 * groups first appear. A region with no same-named sibling comes back as a
 * one-member group, so callers can render every group the same way.
 */
export function groupRegions(regions: Region[], lang: Locale): RegionGroup[] {
  const byKey = new Map<string, RegionGroup>();

  for (const region of regions) {
    const key = regionGroupKey(region, lang);
    const existing = byKey.get(key);
    if (existing) {
      existing.members.push(region);
    } else {
      byKey.set(key, {
        key,
        label: baseLabel(region, lang),
        slug: "",
        members: [region],
        fromPrice: null,
        iconUrl: null,
      });
    }
  }

  return Array.from(byKey.values()).map((group) => {
    group.members.sort((a, b) => memberCount(a) - memberCount(b));
    group.slug = regionGroupSlug(
      group.members.map((m) => localizedSlug(m, lang)).filter(Boolean)
    );
    const prices = group.members
      .map((m) => Number(m.fromPrice))
      .filter((p) => Number.isFinite(p) && p > 0);
    group.fromPrice = prices.length > 0 ? Math.min(...prices) : null;
    const withIcon = group.members.find((m) => m.avatarUrl || m.iconUrl);
    group.iconUrl = withIcon?.avatarUrl ?? withIcon?.iconUrl ?? null;
    return group;
  });
}

/**
 * A region-shaped card item, so list UIs can render a group and a plain region
 * through the same markup. `variantCount > 1` means the card stands for a
 * group and links to the group landing page instead of a single region.
 */
export interface RegionListItem extends Region {
  variantCount: number;
}

/**
 * Collapse a region list for display: same-named regions become one card
 * pointing at the group slug, everything else passes through untouched.
 */
export function toRegionListItems(
  regions: Region[],
  lang: Locale
): RegionListItem[] {
  return groupRegions(regions, lang).map((group) => {
    const [first] = group.members;
    if (group.members.length === 1) return { ...first, variantCount: 1 };

    const icon = group.iconUrl ?? undefined;
    return {
      ...first,
      name: group.label,
      title: group.label,
      titleVi: group.label,
      slug: group.slug,
      slugVi: group.slug,
      avatarUrl: icon,
      iconUrl: icon,
      fromPrice: group.fromPrice,
      // Widest pack, so the card promises at least what the customer can get.
      destinationCount: Math.max(
        ...group.members.map((m) => m.destinationCount ?? 0)
      ),
      variantCount: group.members.length,
    };
  });
}

/** "13 quốc gia" / "13 countries" — the label that tells the packs apart. */
export function countryCountLabel(count: number, lang: Locale): string {
  if (lang === "vi") return `${count} quốc gia`;
  return `${count} ${count === 1 ? "country" : "countries"}`;
}

/** A region in the Destination shape the shared plan components expect. */
export function regionAsDestination(region: Region): Destination {
  return {
    id: region.id,
    name: region.name,
    slug: region.slug,
    countryCode: "",
    avatarUrl: region.avatarUrl,
    title: region.title,
    titleVi: region.titleVi,
    description: region.description,
    descriptionVi: region.descriptionVi,
    isPopular: false,
    isActive: region.isActive,
    createdAt: region.createdAt,
    updatedAt: region.updatedAt,
  };
}

/** Subtitle fragment for a grouped card: "3 lựa chọn" / "3 options". */
export function variantCountLabel(count: number, lang: Locale): string {
  if (lang === "vi") return `${count} lựa chọn`;
  return `${count} option${count === 1 ? "" : "s"}`;
}

/**
 * Find the group a slug addresses. Matches the group landing slug
 * (`esim-chau-a`) as well as any variant slug, so a variant page can show its
 * siblings. Returns `null` when the slug belongs to no multi-variant group.
 */
export function findRegionGroupBySlug(
  regions: Region[],
  slug: string,
  lang: Locale
): RegionGroup | null {
  const groups = groupRegions(regions, lang).filter(
    (g) => g.members.length > 1
  );

  return (
    groups.find(
      (g) =>
        g.slug === slug ||
        g.members.some((m) => localizedSlug(m, lang) === slug)
    ) ?? null
  );
}
