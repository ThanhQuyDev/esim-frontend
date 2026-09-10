import type { Destination, Region } from "./api";
import type { Locale } from "./i18n-config";
import { toRegionListItems, type RegionListItem } from "./region-groups";

/**
 * Regional / global eSIM suggestions for a country page (#043).
 *
 * The country payload carries the regions it belongs to, but only as bare refs
 * (id + slug + icon). Country count and "from" price live on the region list, so
 * the two are joined by id here — no new endpoint needed.
 */

/** How many suggestions a country page shows. */
export const MAX_REGION_SUGGESTIONS = 3;

/**
 * Regions covering `destination`, cheapest-to-join first, collapsed the same way
 * every other region list is (same-named variants become one card, see
 * lib/region-groups.ts).
 *
 * Ordered by how many countries the pack covers, so a genuinely regional pack is
 * offered before a global one — the smaller pack is the cheaper answer for a
 * traveller visiting two neighbours.
 */
export function buildRegionSuggestions(
  destination: Pick<Destination, "regions">,
  allRegions: Region[],
  lang: Locale,
  limit: number = MAX_REGION_SUGGESTIONS
): RegionListItem[] {
  const memberIds = new Set((destination.regions ?? []).map((r) => Number(r.id)));
  if (memberIds.size === 0) return [];

  const covering = allRegions.filter(
    (region) => region.isActive !== false && memberIds.has(Number(region.id))
  );
  if (covering.length === 0) return [];

  return toRegionListItems(covering, lang)
    .sort(
      (a, b) =>
        (a.destinationCount ?? 0) - (b.destinationCount ?? 0) ||
        a.id - b.id
    )
    .slice(0, limit);
}
