"use client";

import { useState } from "react";
import { Search, Info, MapPin, Loader2 } from "lucide-react";
import { useTopDestinations, useSearchDestinations, useRegions, useSearchRegions } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import type { Locale } from "@/lib/i18n-config";
import { localizedHref } from "@/lib/route-mapping";

interface DestinationDropdownDict {
  subtitle?: string;
  title?: string;
  description?: string;
  tabs?: { country?: string; region?: string; ultraPlan?: string };
  from?: string;
  viewAllDestinations?: string;
  new?: string;
}

interface DestinationDropdownProps {
  lang: Locale;
  dict?: DestinationDropdownDict;
  onClose: () => void;
}

type TabType = "top10" | "country" | "region" | "ultra";

/* Fallback translations when dict is not provided */
const FALLBACK: Record<string, DestinationDropdownDict> = {
  vi: {
    subtitle: "Bạn đang đi du lịch đến đâu?",
    tabs: { country: "Quốc gia", region: "Khu vực" },
    from: "Từ",
    viewAllDestinations: "Xem tất cả điểm đến",
    new: "Mới",
  },
  en: {
    subtitle: "Where are you travelling to?",
    tabs: { country: "Country", region: "Region" },
    from: "From",
    viewAllDestinations: "View All Destinations",
    new: "New",
  },
};

export function DestinationDropdown({ lang, dict, onClose }: DestinationDropdownProps) {
  const t = { ...FALLBACK[lang] || FALLBACK.en, ...dict };
  const [activeTab, setActiveTab] = useState<TabType>("top10");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const hasSearch = debouncedSearch.length > 0;

  // Fetch destinations
  const { data: topDestinations = [], isLoading: isLoadingTop } = useTopDestinations(10);
  const { data: searchDestinations = [], isLoading: isSearchingDestinations } = useSearchDestinations(
    debouncedSearch,
    hasSearch
  );

  // Fetch regions
  const { data: regions = [], isLoading: isLoadingRegions } = useRegions(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    20
  );
  const { data: searchRegions = [], isLoading: isSearchingRegions } = useSearchRegions(
    debouncedSearch,
    hasSearch
  );

  // Determine which data to show
  const showRegionsTab = activeTab === "region" && !hasSearch;
  const showTop10Tab = activeTab === "top10" && !hasSearch;
  const showSearchResults = hasSearch;
  const isLoading = hasSearch
    ? (isSearchingDestinations || isSearchingRegions)
    : (showRegionsTab ? isLoadingRegions : (showTop10Tab ? (isLoadingTop || isLoadingRegions) : isLoadingTop));

  // Combined Top 10 list: mix countries and regions together
  const top10Combined = (() => {
    if (!showTop10Tab) return [];
    const countryItems = topDestinations.map((d: any) => ({ ...d, _type: "destination" as const }));
    const regionItems = regions.map((r: any) => ({ ...r, _type: "region" as const }));
    return [...countryItems, ...regionItems].slice(0, 10);
  })();

  const tabs = [
    { key: "top10" as const, label: "Top 10" },
    { key: "country" as const, label: t.tabs?.country || "Country" },
    { key: "region" as const, label: t.tabs?.region || "Region" },
  ];

  /* Format price with locale */
  const formatPrice = (price: number | string) => {
    const num = Number(price);
    if (!num || isNaN(num)) return null;
    return `${num.toLocaleString("vi-VN")}₫`;
  };

  return (
    <div
      data-testid="destinations-dropdown"
      className="header-dropdown absolute w-full px-6 top-full left-0 rounded-b-md bg-white shadow-[0_8px_12px_-6px_rgba(149,157,165,0.2)] lg:block"
    >
      <div className="flex flex-col max-w-[1600px] mx-auto">
        <div className="w-full border-t border-border-secondary py-6">
          <div className="relative w-full max-lg:mb-8">
            {/* Search Input */}
            <div id="input-wrapper" className="relative mb-1 lg:mb-6">
              <input
                data-testid="search-input"
                placeholder={t.subtitle || "Where are you travelling to?"}
                autoComplete="off"
                className="body-sm max-lg:body-md bg-bg-secondary outline-hidden appearance-none w-full leading-md py-[12.5px] pl-4 pr-12 text-text-primary placeholder-text-tertiary border border-border-primary active:border-border-focus focus:border-border-focus transition-colors rounded-full focus:bg-white cursor-pointer"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center rounded-full h-8 w-8 bg-brand-black">
                <Search className="w-3 h-3 text-primary-on-color" />
              </div>
            </div>

            {/* Tab Pills */}
            {!debouncedSearch && (
              <div className="hidden lg:block mb-6">
                <div className="relative flex gap-1 w-fit p-1 border border-border-secondary rounded-full">
                  {tabs.map((tab: any) => (
                    <button
                      key={tab.key}
                      data-is-tab="true"
                      data-is-active={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full transition-all duration-200 min-w-[60px] ${activeTab === tab.key
                        ? "bg-bg-dark text-text-primary-on-color"
                        : "text-text-primary hover:bg-bg-secondary"
                        }`}
                    >
                      {tab.badge ? (
                        <span className="flex items-center gap-2">
                          {tab.label}
                          <span className="text-center whitespace-nowrap rounded-full inline-block bg-bg-accent text-text-primary py-0.5 px-2 body-2xs-medium">
                            {tab.badge}
                          </span>
                        </span>
                      ) : (
                        tab.label
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="w-full max-lg:absolute max-lg:z-40 max-lg:border max-lg:border-border-secondary max-lg:rounded-sm max-lg:shadow-[0_4px_12px_0_rgba(0,0,0,0.2)] max-lg:bg-bg-secondary max-lg:p-4 max-lg:hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 text-text-tertiary animate-spin" />
                </div>
              ) : showSearchResults ? (
                /* Search Results - Show both Destinations and Regions */
                <div className="space-y-6 max-h-[400px] overflow-auto">
                  {/* Destinations Section */}
                  {searchDestinations.length > 0 && (
                    <div>
                      <h3 className="body-md-medium text-text-primary mb-3 px-3">
                        {lang === "vi" ? "Điểm đến" : "Destinations"}
                      </h3>
                      <div className="grid gap-6 lg:gap-4 w-full lg:grid-cols-3 xl:grid-cols-5">
                        {searchDestinations.map((dest: any) => (
                          <a
                            key={dest.id}
                            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus rounded-sm w-full block group lg:p-3 lg:hover:bg-bg-primary"
                            data-testid={dest.code}
                            href={`/${lang}/destination/${dest.slug || dest.code?.toLowerCase()}`}
                          >
                            <div className="flex flex-row gap-2">
                              <div className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-text-primary">
                                <div className="w-[24px] h-[24px] relative overflow-hidden shrink-0 rounded-full">
                                  {dest.flagUrl ? (
                                    <>
                                      <img
                                        alt={`${dest.code} flag`}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                        src={dest.flagUrl}
                                      />
                                      <div className="absolute inset-0 border rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]" />
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
                                      <MapPin className="w-3 h-3 text-text-tertiary" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="body-sm-medium text-text-primary text-left">{(lang === "vi" ? dest.titleVi : dest.title) || dest.name}</p>
                                <p className="body-xs text-text-tertiary text-left">
                                  <span className="whitespace-nowrap">
                                    {t.from} {formatPrice(dest.minPrice || dest.fromPrice)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regions Section */}
                  {searchRegions.length > 0 && (
                    <div>
                      <h3 className="body-md-medium text-text-primary mb-3 px-3">
                        {t.tabs?.region || (lang === "vi" ? "Khu vực" : "Regions")}
                      </h3>
                      <div className="grid gap-6 lg:gap-4 w-full lg:grid-cols-3 xl:grid-cols-5">
                        {searchRegions.map((region: any) => (
                          <a
                            key={region.id}
                            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus rounded-sm w-full block group lg:p-3 lg:hover:bg-bg-primary"
                            data-testid={region.slug}
                            href={`/${lang}/region/${region.slug}`}
                          >
                            <div className="flex flex-row gap-2">
                              <div className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-text-primary">
                                <div className="w-[24px] h-[24px] relative overflow-hidden shrink-0 rounded-full">
                                  {region.iconUrl ? (
                                    <>
                                      <img
                                        alt={`${region.name} avatar`}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover"
                                        src={region.iconUrl}
                                      />
                                      <div className="absolute inset-0 border rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]" />
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
                                      <MapPin className="w-3 h-3 text-text-tertiary" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="body-sm-medium text-text-primary text-left">{(lang === "vi" ? region.titleVi : region.title) || region.name}</p>
                                <p className="body-xs text-text-tertiary text-left">
                                  <span className="whitespace-nowrap">
                                    {[
                                      formatPrice(region.fromPrice) ? `${t.from} ${formatPrice(region.fromPrice)}` : null,
                                      `${region.destinationCount} ${lang === "vi" ? "quốc gia" : (region.destinationCount === 1 ? "country" : "countries")}`
                                    ].filter(Boolean).join(" · ")}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {searchDestinations.length === 0 && searchRegions.length === 0 && (
                    <div className="flex items-center justify-center h-40">
                      <p className="body-md text-text-tertiary">
                        {lang === "vi" ? "Không tìm thấy kết quả" : "No results found"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab Results - Show Destinations, Regions, or Combined Top 10 */
                <div className="h-40">
                  {(() => {
                    const tabItems = showTop10Tab ? top10Combined : (showRegionsTab ? regions : topDestinations);
                    if (tabItems.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <p className="body-md text-text-tertiary">
                            {showRegionsTab
                              ? (lang === "vi" ? "Không tìm thấy khu vực" : "No regions found")
                              : (lang === "vi" ? "Không tìm thấy điểm đến" : "No destinations found")
                            }
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="grid gap-6 lg:gap-4 w-full lg:grid-cols-3 xl:grid-cols-5 max-h-40 overflow-auto">
                        {tabItems.map((item: any) => {
                          const isRegionItem = showRegionsTab || item._type === "region";
                          return (
                            <a
                              key={`${item._type || 'dest'}-${item.id}`}
                              className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus rounded-sm w-full block group lg:p-3 lg:hover:bg-bg-primary"
                              data-testid={item.code || item.slug}
                              href={
                                isRegionItem
                                  ? `/${lang}/region/${item.slug}`
                                  : `/${lang}/destination/${item.slug || item.code?.toLowerCase()}`
                              }
                            >
                              <div className="flex flex-row gap-2">
                                <div className="flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-text-primary">
                                  <div className="w-[24px] h-[24px] relative overflow-hidden shrink-0 rounded-full">
                                    {(item.flagUrl || item.iconUrl) ? (
                                      <>
                                        <img
                                          alt={`${item.name} ${isRegionItem ? 'avatar' : 'flag'}`}
                                          loading="lazy"
                                          decoding="async"
                                          className="w-full h-full object-cover"
                                          src={item.flagUrl || item.iconUrl}
                                        />
                                        <div className="absolute inset-0 border rounded-full pointer-events-none border-[rgba(0,0,0,0.1)]" />
                                      </>
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
                                        <MapPin className="w-3 h-3 text-text-tertiary" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="body-sm-medium text-text-primary text-left">{(lang === "vi" ? item.titleVi : item.title) || item.name}</p>
                                    {showTop10Tab && isRegionItem && (
                                      <span className="text-center whitespace-nowrap rounded-full inline-block bg-blue-100 text-blue-700 py-0 px-1.5 body-2xs-medium">
                                        {lang === "vi" ? "Khu vực" : "Region"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="body-xs text-text-tertiary text-left">
                                    <span className="whitespace-nowrap">
                                      {isRegionItem
                                        ? [
                                          formatPrice(item.fromPrice) ? `${t.from} ${formatPrice(item.fromPrice)}` : null,
                                          `${item.destinationCount} ${lang === "vi" ? "quốc gia" : (item.destinationCount === 1 ? "country" : "countries")}`
                                        ].filter(Boolean).join(" · ")
                                        : formatPrice(item.fromPrice)
                                          ? `${t.from} ${formatPrice(item.fromPrice)}`
                                          : ""
                                      }
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-border-secondary py-6">
          <div className="flex flex-row gap-2 items-center">
            <Info className="w-3 h-3 text-text-primary" />
            <a
              className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus body-sm-medium text-text-primary hover:text-text-secondary"
              data-testid="secondary-cta"
              href={`/${lang}/esim-supported-devices`}
            >
              {lang === "vi" ? "Thiết bị của bạn có tương thích eSIM không?" : "Is your device eSIM compatible?"}
            </a>
          </div>
          <a
            role="button"
            className="max-md:w-full text-center inline-block text-primary-on-color bg-bg-dark hover:bg-neutral-800 border border-border-primary hover:border-neutral-800 active:bg-bg-dark active:text-primary-on-color box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[5.5px] body-sm-medium px-6"
            data-testid="primary-cta"
            href={localizedHref(lang, "all-destinations")}
          >
            {t.viewAllDestinations || "View All Destinations"}
          </a>
        </div>
      </div>
    </div>
  );
}
