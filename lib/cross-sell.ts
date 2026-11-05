import type { Destination, Region } from "./api";
import type { Locale } from "./i18n-config";
import { esimName } from "./esim-name";
import { localizedSlug } from "./slug";

/** One card of "Xem eSIM cho các điểm đến khác" (vande-0411 #068). */
export interface CrossItem {
  key: string;
  href: string;
  title: string;
  /** Round country flag, or a region's map icon. */
  imageUrl?: string | null;
  countryCode?: string | null;
  /** "Từ 58.000₫" on a country. */
  fromPrice?: number | null;
  /** "18 điểm đến · có Trung Quốc" on a region. */
  countryCount?: number | null;
  includes?: string | null;
}

type Place = Pick<Destination, "id" | "slug" | "slugVi" | "name" | "title" | "titleVi"> &
  Partial<Pick<Destination, "flagUrl" | "countryCode" | "isPopular" | "isActive" | "fromPrice">>;

const nameOf = (place: Pick<Place, "name" | "title" | "titleVi">, lang: Locale) =>
  (lang === "vi" ? place.titleVi : place.title) || place.name;

const hrefOf = (slug: string, lang: Locale) => (lang === "vi" ? `/${slug}` : `/${lang}/${slug}`);

const countryItem = (place: Place, lang: Locale, priced: Map<number, Place>): CrossItem => {
  const full = priced.get(Number(place.id)) ?? place;
  return {
    key: `d${place.id}`,
    href: hrefOf(localizedSlug(place as never, lang) || place.slug, lang),
    title: esimName(nameOf(place, lang), lang),
    imageUrl: full.flagUrl,
    countryCode: full.countryCode,
    fromPrice: full.fromPrice == null ? null : Number(full.fromPrice),
  };
};

/** Popular countries first, then those with a price, leaving out `excludeId`. */
function pickCountries(places: Place[], priced: Map<number, Place>, count: number, excludeId?: number) {
  return places
    .filter((p) => Number(p.id) !== excludeId && p.isActive !== false)
    .map((p) => ({ place: p, full: priced.get(Number(p.id)) ?? p }))
    .sort(
      (a, b) =>
        Number(!!b.full.isPopular) - Number(!!a.full.isPopular) ||
        Number(!!b.full.fromPrice) - Number(!!a.full.fromPrice)
    )
    .slice(0, count)
    .map((x) => x.place);
}

/**
 * A country page, as in the design: two neighbours from its smallest region,
 * then that region. Neighbours are popular countries when it has no region.
 */
export function crossForCountry(
  country: Place,
  region: (Region & { destinations?: Place[] }) | null,
  allCountries: Place[],
  lang: Locale
): CrossItem[] {
  const priced = new Map(allCountries.map((c) => [Number(c.id), c]));
  // From its region first, then popular countries when that region is small.
  const fromRegion = pickCountries(region?.destinations ?? [], priced, 2, Number(country.id));
  const seen = new Set(fromRegion.map((c) => Number(c.id)));
  const more = pickCountries(
    allCountries.filter((c) => !seen.has(Number(c.id))),
    priced,
    2 - fromRegion.length,
    Number(country.id)
  );
  const items = [...fromRegion, ...more].map((c) => countryItem(c, lang, priced));
  if (region) {
    items.push({
      key: `r${region.id}`,
      href: hrefOf(localizedSlug(region as never, lang) || region.slug, lang),
      title: esimName(nameOf(region, lang), lang),
      imageUrl: region.iconUrl,
      countryCount: region.destinationCount ?? region.destinations?.length ?? null,
      includes: nameOf(country, lang),
    });
  }
  return items;
}

/** A region page: its best-known countries. */
export function crossForRegion(
  region: Region & { destinations?: Place[] },
  allCountries: Place[],
  lang: Locale
): CrossItem[] {
  const priced = new Map(allCountries.map((c) => [Number(c.id), c]));
  return pickCountries(region.destinations ?? [], priced, 3).map((c) => countryItem(c, lang, priced));
}
