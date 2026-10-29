"use client";
import { useMoney } from "@/lib/money";

import { useMemo, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useDestinations, useRegions } from "@/lib/hooks";
import { optimizeCloudinary } from "@/lib/cdn-image";
import type { Locale } from "@/lib/i18n-config";
import { localizedHref } from "@/lib/route-mapping";
import { localizedSlug } from "@/lib/slug";
import { esimName } from "@/lib/esim-name";
import { LocalCarrierGrid } from "./local-esim/local-carrier-grid";
import { toRegionListItems, variantCountLabel } from "@/lib/region-groups";

interface DestinationsSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

type Tab = "all" | "country" | "region" | "local";

function ChevronDownIcon({ className }: { className?: string }) {
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

export function DestinationsSection({ dict, lang }: DestinationsSectionProps) {
  // Dollars on the English site (doitac-1410 #073).
  const money = useMoney();
  // "Tất cả" first and open, as in trang-chu-tab-esim v3 (vande #089).
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const { data: destinations = [], isLoading: isLoadingDestinations } = useDestinations(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    12
  );

  const { data: regions = [], isLoading: isLoadingRegions } = useRegions(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    12
  );

  const tabs = [
    { key: "all" as const, label: dict.tabs.all ?? (lang === "vi" ? "Tất cả" : "All"), testId: "country-list-tab-chip-all" },
    { key: "country" as const, label: dict.tabs.country, testId: "country-list-tab-chip-country" },
    { key: "region" as const, label: dict.tabs.region, testId: "country-list-tab-chip-region" },
    { key: "local" as const, label: dict.tabs.local, testId: "country-list-tab-chip-local" },
  ];

  const showRegions = activeTab === "region";
  // Same-named regions that differ only by country count collapse into one
  // card linking to the group page (`/esim-chau-a`).
  const regionItems = useMemo(
    () => toRegionListItems(regions, lang),
    [regions, lang]
  );
  const displayItems = showRegions ? regionItems : destinations;
  const isLoading =
    activeTab === "all"
      ? isLoadingRegions || isLoadingDestinations
      : showRegions
        ? isLoadingRegions
        : isLoadingDestinations;
  const localGrid = (
    <LocalCarrierGrid
      lang={lang}
      fromLabel={dict.from}
      emptyLabel={
        lang === "vi"
          ? "Chưa có eSIM nội địa khả dụng."
          : "No domestic eSIMs available yet."
      }
    />
  );

  const card = (item: any, isRegion: boolean, hideOnMobile: boolean) => (
    <div
      key={item.id}
      id={item.code || item.slug || item.id}
      className={hideOnMobile ? "hidden md:block" : undefined}
    >
      <a
        className="align-bottom focus-visible:outline-hidden focus-visible:shadow-focus text-text-primary active:text-text-primary block group ease-out h-full rounded-sm transition-colors hover:text-text-primary hover:bg-bg-tertiary bg-bg-primary"
        href={lang === 'vi' ? `/${localizedSlug(item, lang) || item.code?.toLowerCase()}` : `/${lang}/${localizedSlug(item, lang) || item.code?.toLowerCase()}`}
        data-testid={item.code || item.slug || item.id}
      >
        <div
          className="flex flex-col items-start text-left gap-4 relative border-none p-4 h-full rounded-sm transition-colors hover:text-text-primary hover:bg-gray-100 bg-gray-50"
          data-testid={`${isRegion ? 'region' : 'destination'}-card-${item.code || item.slug || item.id}`}
        >
          <div className="w-full h-full flex gap-4 items-center">
            {/* Flag/Avatar */}
            <div className="w-[36px] h-[36px] relative overflow-hidden shrink-0 rounded-full">
              {(item.flagUrl || item.iconUrl) ? (
                <>
                  <img
                    alt={`${item.name} ${isRegion ? 'avatar' : 'flag'}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover absolute inset-0"
                    width={36}
                    height={36}
                    src={optimizeCloudinary(item.flagUrl || item.iconUrl, { width: 72 })}
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
              <p className="body-lg-medium"> {esimName((lang === "vi" ? item.titleVi : item.title) || item.name, lang)}</p>
              <p className="body-md text-text-tertiary">
                <span className="whitespace-nowrap">
                  {isRegion
                    ? `${item.fromPrice ? `${dict.from} ${money.format(Number(item.fromPrice))} · ` : ""}${item.variantCount > 1
                      ? variantCountLabel(item.variantCount, lang)
                      : `${item.destinationCount} ${item.destinationCount === 1 ? (lang === "vi" ? "quốc gia" : "country") : (lang === "vi" ? "quốc gia" : "countries")}`}`
                    : item.fromPrice
                      ? `${dict.from} ${money.format(Number(item.fromPrice))}`
                      : ""
                  }
                </span>
              </p>
            </div>
            {/* Chevron */}
            <div className="ml-auto">
              <ChevronDownIcon className="mt-1 -rotate-90 pointer-events-none text-text-tertiary" />
            </div>
          </div>
        </div>
      </a>
    </div>
  );

  return (
    <div
      data-section="CountryList"
      data-testid="section-CountryList"
      className="relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="py-16">
        {/* Header */}
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <p className="body-md-medium text-text-disabled mb-4">
                {dict.subtitle}
              </p>
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="heading-xl">{dict.title}</h2>
                <p className="body-md text-text-secondary">{dict.description}</p>
              </div>
            </div>
            {/* Desktop CTA */}
            <div
              className="hidden lg:flex items-end justify-end col-span-4"
              data-testid="section-button-desktop"
            >
              <a
                role="button"
                className="max-md:w-full text-center inline-block text-text-primary bg-bg-accent hover:bg-bg-accent-hover border border-bg-accent hover:border-bg-accent-hover active:bg-bg-accent-active active:border-bg-accent-active box-border !border-[#d1b700] touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7 w-full sm:w-auto"
                data-testid="view-all-destinations-cta"
                href={localizedHref(lang, "destinations")}
              >
                {dict.viewAllDestinations}
              </a>
            </div>
          </div>
        </div>

        {/* Tabs + Grid */}
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div>
              {/* Tab Pills */}
              <div className="mb-10 overflow-x-auto scrollbar-none">
                <div className="relative flex gap-1 w-fit p-1 border border-border-secondary rounded-full">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      data-testid={tab.testId}
                      data-is-active={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative body-sm-medium whitespace-nowrap md:body-md-medium max-md:text-sm max-md:leading-5 px-2 min-[389px]:px-3 min-[440px]:px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full transition-all duration-200 ${activeTab === tab.key
                        ? "bg-bg-dark text-text-primary-on-color"
                        : "text-text-primary hover:bg-bg-secondary"
                        }`}
                    >

                      {/* VN flag on the domestic tab, as in the design (#066); not on phones (v3). */}
                      {tab.key === "local" ? (
                        <span className="inline-flex items-center gap-2">
                          <svg width="21" height="14" viewBox="0 0 30 20" aria-hidden="true" className="rounded-[0.125rem] shrink-0 max-md:hidden">
                            <rect width="30" height="20" fill="#DA251D" />
                            <path d="M15 4.392 16.392 8.676 20.897 8.676 17.252 11.324 18.644 15.608 15 12.96 11.356 15.608 12.748 11.324 9.103 8.676 13.608 8.676Z" fill="#FFDE00" />
                          </svg>
                          {tab.label}
                        </span>
                      ) : (
                        tab.label
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination/Region/Local Grid */}
              {activeTab === "all" && !isLoading ? (
                // Desktop: every region, every country, then domestic; phone:
                // 3 countries and 2 regions (design v3).
                <div id="country-list-items" className="flex flex-col gap-3 lg:gap-6 w-full">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 order-2 md:order-1">
                    {regionItems.map((item: any, index: number) => card(item, true, index >= 2))}
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 order-1 md:order-2">
                    {destinations.map((item: any, index: number) => card(item, false, index >= 3))}
                  </div>
                  <div className="hidden md:block order-3">{localGrid}</div>
                </div>
              ) : activeTab === "local" ? (
                <>
                <p
                  data-testid="local-tab-note"
                  className="flex items-center gap-[0.5625rem] text-[0.875rem] text-[#374151] -mt-6 mb-6"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8h.01M11 12h1v4h1" />
                  </svg>
                  {lang === "vi"
                    ? "Chọn eSIM theo nhà mạng nội địa tại Việt Nam — dành cho thuê bao dùng lâu dài trong nước."
                    : "Pick an eSIM by Vietnamese carrier — for a long-term local subscription."}
                </p>
                {localGrid}
                </>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
                </div>
              ) : (
                <div
                  id="country-list-items"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 w-full"
                >
                  {displayItems.map((item: any, index: number) =>
                    card(item, showRegions, index >= 5),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div
              className="flex justify-center lg:hidden mt-10"
              data-testid="section-button-mobile"
            >
              <a
                role="button"
                className="max-md:w-full text-center inline-block text-text-primary bg-bg-accent hover:bg-bg-accent-hover border border-bg-accent hover:border-bg-accent-hover active:bg-bg-accent-active active:border-bg-accent-active box-border !border-[#d1b700] touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[11px] body-md-medium px-7 w-full sm:w-auto"
                data-testid="view-all-destinations-cta"
                href={localizedHref(lang, "destinations")}
              >
                {dict.viewAllDestinations}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
