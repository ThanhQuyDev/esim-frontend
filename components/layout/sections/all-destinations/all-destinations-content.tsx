"use client";
import { useMoney } from "@/lib/money";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Loader2, X } from "lucide-react";
import { useInfiniteDestinations, useRegions } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import type { Locale } from "@/lib/i18n-config";
import { localizedSlug } from "@/lib/slug";
import { LocalCarrierGrid } from "@/components/layout/sections/local-esim/local-carrier-grid";
import { useMatchedLocalCarriers } from "@/components/layout/sections/local-esim/local-carrier-search";
import { toRegionListItems } from "@/lib/region-groups";
import {
  DestinationMark,
  PickerCardLink,
  PickerTabs,
  destinationSub,
} from "@/components/layout/sections/destination-picker/destination-picker";
import { esimName } from "@/lib/esim-name";

interface AllDestinationsContentProps {
  dict: Record<string, any>;
  lang: Locale;
}

type TabKey = "all" | "country" | "region" | "local";

function DestinationCard({
  item,
  lang,
  dict,
  isRegion,
}: {
  item: any;
  lang: Locale;
  dict: Record<string, any>;
  isRegion: boolean;
}) {
  // Dollars on the English site (doitac-1410 #073).
  const money = useMoney();
  const key = item.countryCode || item.slug || item.id;
  return (
    <div data-testid={`destination-card-${key}`}>
      <PickerCardLink
        href={`${lang === "vi" ? "" : `/${lang}`}/${localizedSlug(item, lang) || item.code?.toLowerCase()}`}
        testId={key}
        mark={<DestinationMark item={item} isRegion={isRegion} />}
        name={esimName((lang === "vi" ? item.titleVi : item.title) || item.name, lang)}
        sub={destinationSub(item, isRegion, lang, dict.from, money.format)}
      />
    </div>
  );
}

export function AllDestinationsContent({
  dict,
  lang,
}: AllDestinationsContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  // Seeded from ?q= so a search started elsewhere — the 404 page, for one —
  // arrives here with the term already applied instead of an empty box (#093).
  const initialQuery = useSearchParams().get("q") ?? "";
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // On the "all" tab, show both regions and countries as separate sections.
  const isAllTab = activeTab === "all";

  // Map tab to the hook's tab param for the (infinite) destination list.
  const hookTab = activeTab === "region" ? "region" : "country";

  const {
    data,
    isLoading,
  } = useInfiniteDestinations(hookTab, debouncedSearch);

  // Regions for the "all" tab (and the dedicated "region" tab keeps using the
  // infinite list above). useRegions returns the full active region list.
  // `isActive` is filtered server-side so inactive regions never eat into the
  // page of results the customer gets back.
  const regionsFilter = JSON.stringify(
    debouncedSearch && debouncedSearch.trim()
      ? { search: debouncedSearch.trim(), isActive: true }
      : { isActive: true }
  );
  const { data: regions, isLoading: isLoadingRegions } = useRegions(
    regionsFilter,
    "name",
    "ASC"
  );

  // Domestic eSIM matches for the current query. Searching "việt nam" /
  // "esim nội địa" / a carrier name surfaces them alongside the destinations,
  // instead of leaving the customer on an empty "no results" screen.
  const { matches: localMatches } = useMatchedLocalCarriers(debouncedSearch);
  const showLocalMatches = activeTab !== "local" && localMatches.length > 0;

  const rawItems = data?.pages.flatMap((page) => page.data) ?? [];

  const showRegions = activeTab === "region";

  // Same-named regions that differ only by country count collapse into one
  // card linking to the group page (`/esim-chau-a`). Applies to the dedicated
  // "Khu vực" tab (which pages through /regions) and to the regions section of
  // the "Tất cả" tab alike.
  // Not memoized: `rawItems` is rebuilt by flatMap on every render anyway, so
  // a memo here would never hit.
  const allItems = showRegions
    ? toRegionListItems(rawItems as any, lang)
    : rawItems;

  const regionItems = useMemo(
    () => toRegionListItems((regions ?? []).filter((r: any) => r.isActive), lang),
    [regions, lang]
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: dict.tabs.all },
    { key: "country", label: dict.tabs.country },
    { key: "region", label: dict.tabs.region },
    { key: "local", label: dict.tabs.local },
  ];

  return (
    <div
      data-section="destinations"
      data-testid="section-destinations"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="dp-wrap">
        <div className="dp-hd">
          <div className="min-w-0">
            <h1 className="dp-h break-words">{dict.title}</h1>
            <p className="dp-sub break-words">{dict.description}</p>
          </div>
        </div>

        <PickerTabs
          tabs={tabs}
          active={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setSearchQuery("");
          }}
          label={lang === "vi" ? "Loại eSIM" : "eSIM type"}
        />

            {/* Search Input */}
            <div id="input-wrapper" className={`relative mb-6 ${activeTab === "local" ? "hidden" : ""}`}>
              <input
                data-testid="search-input"
                placeholder={dict.searchPlaceholder}
                autoComplete="off"
                className="outline-hidden appearance-none w-full leading-md py-[11px] px-4 text-text-primary placeholder-text-tertiary border border-border-secondary hover:border-border-focus focus-visible:outline-none transition rounded-sm pl-12 pr-10"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                name="search-input"
                aria-label={dict.searchPlaceholder}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute top-4 left-5 text-text-tertiary"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-bg-secondary rounded-full text-text-tertiary hover:text-text-primary transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Destination Grid */}
            {activeTab === "local" ? (
              <LocalCarrierGrid
                lang={lang}
                fromLabel={dict.from}
                emptyLabel={
                  lang === "vi"
                    ? "Chưa có eSIM nội địa khả dụng."
                    : "No domestic eSIMs available yet."
                }
              />
            ) : (
              <>
                {/* Domestic eSIM matches ("việt nam", "esim nội địa", a carrier
                    name) — rendered above the destination results. */}
                {showLocalMatches && (
                  <div className="mb-10">
                    <h2 className="heading-sm mb-4">
                      {lang === "vi" ? "eSIM nội địa" : "Domestic eSIM"}
                    </h2>
                    <LocalCarrierGrid
                      lang={lang}
                      fromLabel={dict.from}
                      emptyLabel=""
                      carriers={localMatches}
                    />
                  </div>
                )}
                {isLoading || (isAllTab && isLoadingRegions) ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
                </div>
              ) : allItems.length === 0 &&
                (!isAllTab || regionItems.length === 0) ? (
                showLocalMatches ? null : (
                <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
                  <MapPin className="w-12 h-12 mb-4" />
                  <p className="body-lg-medium">{dict.noResults}</p>
                </div>
                )
              ) : isAllTab ? (
                // Countries, then regions, then domestic (vande-0411 #071).
                <div className="dp-stack">
                  {allItems.length > 0 && (
                    <div id="country-list-items" className="dp-p">
                      {allItems.map((item: any) => (
                        <DestinationCard
                          key={`country-${item.id}`}
                          item={item}
                          lang={lang}
                          dict={dict}
                          isRegion={false}
                        />
                      ))}
                    </div>
                  )}
                  {regionItems.length > 0 && (
                    <div className="dp-p">
                      {regionItems.map((item: any) => (
                        <DestinationCard
                          key={`region-${item.id}`}
                          item={item}
                          lang={lang}
                          dict={dict}
                          isRegion
                        />
                      ))}
                    </div>
                  )}
                  {/* While searching, the matches above stand in for this. */}
                  {!debouncedSearch.trim() && (
                    <LocalCarrierGrid lang={lang} fromLabel={dict.from} emptyLabel="" />
                  )}
                </div>
              ) : (
                <>
                  <div id="country-list-items" className="dp-p">
                    {allItems.map((item: any) => (
                      <DestinationCard
                        key={item.id}
                        item={item}
                        lang={lang}
                        dict={dict}
                        isRegion={showRegions}
                      />
                    ))}
                  </div>

                </>
              )}
              </>
            )}
      </div>
    </div>
  );
}
