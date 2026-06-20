"use client";

import { useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { useInfiniteDestinations, useRegions } from "@/lib/hooks";
import { useDebounce } from "@/lib/use-debounce";
import type { Locale } from "@/lib/i18n-config";

interface AllDestinationsContentProps {
  dict: Record<string, any>;
  lang: Locale;
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className={className}
    >
      <title>Chevron right</title>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M13.2151 6.8326L8.43758 11.4101C8.27758 11.5451 8.12758 11.6001 8.00008 11.6001C7.87258 11.6001 7.70083 11.5446 7.58533 11.4329L2.78533 6.8326C2.54543 6.6051 2.53763 6.2026 2.76733 5.9851C2.99546 5.74447 3.37683 5.73665 3.61508 5.96713L8.00008 10.1701L12.3851 5.9701C12.6226 5.73962 13.0046 5.74745 13.2328 5.98807C13.4626 6.2026 13.4551 6.6051 13.2151 6.8326Z"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <i
      className={`kitIcon text-center w-[1em] fa-magnifying-glass fa-sharp fa-regular text-[16px] ${className || ""}`}
    />
  );
}

type TabKey = "all" | "country" | "region" | "ultra";

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
  return (
    <div>
      <a
        className="align-bottom focus-visible:outline-hidden focus-visible:shadow-focus text-text-primary active:text-text-primary block group ease-out h-full rounded-sm transition-colors hover:text-text-primary hover:bg-bg-tertiary bg-bg-secondary"
        data-testid={item.countryCode || item.slug || item.id}
        href={lang === 'vi' ? `/${item.slug || item.code?.toLowerCase()}` : `/${lang}/${item.slug || item.code?.toLowerCase()}`}

      >
        <div
          className="flex flex-col items-start text-left gap-4 relative border-none p-4 h-full rounded-sm transition-colors hover:text-text-primary hover:bg-bg-tertiary bg-gray-50 hover:bg-bg-secondary"
          data-testid={`destination-card-${item.countryCode || item.slug || item.id}`}
        >
          <div className="w-full h-full flex gap-4 items-center">
            {/* Flag/Avatar */}
            <div className="w-[36px] h-[36px] relative overflow-hidden shrink-0 rounded-full">
              {item.flagUrl || item.iconUrl ? (
                <>
                  <img
                    alt={`${item.countryCode || item.slug} ${isRegion ? "globe icon" : "flag"}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover absolute inset-0"
                    src={item.flagUrl || item.iconUrl}
                  />
                  <div className="absolute inset-0 rounded-full pointer-events-none border border-[rgba(0,0,0,0.1)]" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
                  <MapPin className="w-4 h-4 text-text-tertiary" />
                </div>
              )}
            </div>
            {/* Name + Info */}
            <div className="flex flex-col gap-0.5">
              <p className="body-lg-medium scroll-mt-20 xl:scroll-mt-24">
                {(lang === "vi" ? item.titleVi : item.title) || item.name}
              </p>
              <p className="body-md text-text-tertiary scroll-mt-20 xl:scroll-mt-24">
                <span className="whitespace-nowrap">
                  {dict.from} {Number(item.fromPrice).toLocaleString("vi-VN") || "20.000"}đ
                </span>
                {item.destinationCount != null && (
                  <>
                    {" "}
                    •{" "}
                    <span className="whitespace-nowrap">
                      {item.destinationCount}{" "}
                      {item.destinationCount === 1
                        ? dict.country
                        : dict.countries}
                    </span>
                  </>
                )}
              </p>
            </div>
            {/* Chevron */}
            <div className="ml-auto">
              <ChevronRightIcon className="mt-1 -rotate-90 pointer-events-none text-text-tertiary" />
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

export function AllDestinationsContent({
  dict,
  lang,
}: AllDestinationsContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
  const regionsFilter =
    debouncedSearch && debouncedSearch.trim()
      ? JSON.stringify({ search: debouncedSearch.trim() })
      : undefined;
  const { data: regions, isLoading: isLoadingRegions } = useRegions(
    regionsFilter,
    "name",
    "ASC"
  );

  const allItems = data?.pages.flatMap((page) => page.data) ?? [];

  const regionItems = (regions ?? []).filter((r: any) => r.isActive);

  const showRegions = activeTab === "region";

  const tabs: { key: TabKey; label: string; badge?: string }[] = [
    { key: "all", label: dict.tabs.all },
    { key: "country", label: dict.tabs.country },
    { key: "region", label: dict.tabs.region },
  ];

  return (
    <div
      data-section="destinations"
      data-testid="section-destinations"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        {/* Header */}
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h1 className="heading-xl scroll-mt-20 xl:scroll-mt-24">
                  {dict.title}
                </h1>
                <p className="body-md text-text-secondary scroll-mt-20 xl:scroll-mt-24 whitespace-nowrap">
                  {dict.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search + Grid */}
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Tab Pills */}
            <div className="mb-10 overflow-x-auto scrollbar-none">
              <div className="relative flex gap-1 w-fit p-1 border border-border-secondary rounded-full">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    data-is-tab="true"
                    data-is-active={activeTab === tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSearchQuery("");
                    }}
                    className={`relative z-[1] body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full min-w-[60px] bg-transparent transition-all duration-200 ${activeTab === tab.key
                      ? "!text-text-primary-on-color !bg-bg-dark hover:bg-inherit transition-[color] delay-250 duration-[0]"
                      : "text-text-primary hover:text-text-primary hover:bg-bg-primary"
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

            {/* Search Input */}
            <div id="input-wrapper" className="relative mb-6">
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
            {isLoading || (isAllTab && isLoadingRegions) ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
              </div>
            ) : allItems.length === 0 &&
              (!isAllTab || regionItems.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
                <MapPin className="w-12 h-12 mb-4" />
                <p className="body-lg-medium">{dict.noResults}</p>
              </div>
            ) : isAllTab ? (
              <>

                {/* Countries section */}
                {allItems.length > 0 && (
                  <div>
                    <h2 className="heading-sm mb-4">{dict.sectionCountries}</h2>
                    <div
                      id="country-list-items"
                      className="grid gap-3 lg:gap-6 w-full md:grid-cols-2 lg:grid-cols-3"
                    >
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
                  </div>
                )}

                {/* Regions section */}
                {regionItems.length > 0 && (
                  <div className="my-10">
                    <h2 className="heading-sm mb-4">{dict.sectionRegions}</h2>
                    <div className="grid gap-3 lg:gap-6 w-full md:grid-cols-2 lg:grid-cols-3">
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
                  </div>
                )}
              </>
            ) : (
              <>
                <div
                  id="country-list-items"
                  className="grid gap-3 lg:gap-6 w-full md:grid-cols-2 lg:grid-cols-3"
                >
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
          </div>
        </div>
      </div>
    </div>
  );
}
