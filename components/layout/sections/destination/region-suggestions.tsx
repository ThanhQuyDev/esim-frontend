import Link from "next/link";
import { ChevronRight, Globe, MapPin } from "lucide-react";
import { localizedSlug } from "@/lib/slug";
import { variantCountLabel, type RegionListItem } from "@/lib/region-groups";
import type { Locale } from "@/lib/i18n-config";

export interface RegionSuggestionsDict {
  /** "{name}" → the country currently being viewed. */
  title: string;
  subtitle: string;
  /** Reused from the destination list: "Từ" / "From". */
  from: string;
  country: string;
  countries: string;
  viewPlans: string;
}

interface RegionSuggestionsProps {
  /** Regions/global packs covering this country, already grouped and sorted. */
  items: RegionListItem[];
  /** Localized country name, for the heading. */
  countryName: string;
  dict: RegionSuggestionsDict;
  lang: Locale;
}

/**
 * "Buy a regional or global eSIM instead" suggestions on a country page (#043).
 *
 * A traveller looking at Japan may well be visiting Korea next; a regional pack
 * is one plan instead of two. The country's own regions come from the
 * destination payload, so nothing is suggested that doesn't actually cover it.
 *
 * Placed directly above the "how it works" steps, per the task.
 */
export function RegionSuggestions({
  items,
  countryName,
  dict,
  lang,
}: RegionSuggestionsProps) {
  if (items.length === 0) return null;

  return (
    <section
      data-section="RegionSuggestions"
      data-testid="region-suggestions"
      className="px-4 py-10 sm:px-0"
    >
      <h2 className="heading-md mb-1.5 text-text-primary">
        {dict.title.replace("{name}", countryName)}
      </h2>
      <p className="body-md mb-5 text-text-secondary">{dict.subtitle}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const slug = localizedSlug(item, lang);
          const href = lang === "vi" ? `/${slug}` : `/${lang}/${slug}`;
          const icon = item.iconUrl || item.avatarUrl;
          const count = item.destinationCount ?? 0;

          return (
            <Link
              key={item.id}
              href={href}
              data-testid={`region-suggestion-${slug}`}
              className="group flex items-center gap-3.5 rounded-xl border border-[#e5e7eb] bg-white p-3.5 transition-colors hover:border-[#9ca3af] hover:bg-[#f9fafb]"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-bg-secondary">
                {icon ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    alt=""
                    loading="lazy"
                    decoding="async"
                    src={icon}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {count >= 50 ? (
                      <Globe className="h-4 w-4 text-text-tertiary" />
                    ) : (
                      <MapPin className="h-4 w-4 text-text-tertiary" />
                    )}
                  </span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-text-primary">
                  {(lang === "vi" ? item.titleVi : item.title) || item.name}
                </span>
                <span className="block text-[13px] text-text-tertiary">
                  {count > 0 && (
                    <>
                      {count} {count === 1 ? dict.country : dict.countries}
                    </>
                  )}
                  {count > 0 && item.fromPrice ? " • " : ""}
                  {item.fromPrice ? (
                    <span className="whitespace-nowrap">
                      {dict.from}{" "}
                      {Number(item.fromPrice).toLocaleString("vi-VN")}đ
                    </span>
                  ) : null}
                  {item.variantCount > 1 && (
                    <> • {variantCountLabel(item.variantCount, lang)}</>
                  )}
                </span>
              </span>

              <span className="ml-auto flex shrink-0 items-center gap-1 text-[13px] font-medium text-text-secondary">
                <span className="hidden sm:inline">{dict.viewPlans}</span>
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
