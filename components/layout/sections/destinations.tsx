"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useDestinations, useRegions } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";
import { localizedHref } from "@/lib/route-mapping";

interface DestinationsSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

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
  const [activeTab, setActiveTab] = useState<"country" | "region" | "ultra">("country");

  const { data: destinations = [], isLoading: isLoadingDestinations } = useDestinations(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    9
  );

  const { data: regions = [], isLoading: isLoadingRegions } = useRegions(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    9
  );

  const tabs = [
    { key: "country" as const, label: dict.tabs.country, testId: "country-list-tab-chip-country" },
    { key: "region" as const, label: dict.tabs.region, testId: "country-list-tab-chip-region" },
  ];

  const showRegions = activeTab === "region";
  const displayItems = showRegions ? regions : destinations;
  const isLoading = showRegions ? isLoadingRegions : isLoadingDestinations;

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
                href={localizedHref(lang, "all-destinations")}
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
                      className={`relative body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full transition-all duration-200 ${activeTab === tab.key
                        ? "bg-bg-dark text-text-primary-on-color"
                        : "text-text-primary hover:bg-bg-secondary"
                        }`}
                    >

                      {tab.label}

                    </button>
                  ))}
                </div>
              </div>

              {/* Destination/Region Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
                </div>
              ) : (
                <div
                  id="country-list-items"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6 w-full"
                >
                  {displayItems.map((item: any, index: number) => (
                    <div
                      key={item.id}
                      id={item.code || item.slug || item.id}
                      className={index >= 5 ? "hidden md:block" : undefined}
                    >
                      <a
                        className="align-bottom focus-visible:outline-hidden focus-visible:shadow-focus text-text-primary active:text-text-primary block group ease-out h-full rounded-sm transition-colors hover:text-text-primary hover:bg-bg-tertiary bg-bg-primary"
                        href={
                          showRegions
                            ? `/${lang}/region/${item.slug}`
                            : `/${lang}/destination/${item.slug || item.code?.toLowerCase()}`
                        }
                        data-testid={item.code || item.slug || item.id}
                      >
                        <div
                          className="flex flex-col items-start text-left gap-4 relative border-none p-4 h-full rounded-sm transition-colors hover:text-text-primary hover:bg-gray-100 bg-gray-50"
                          data-testid={`${showRegions ? 'region' : 'destination'}-card-${item.code || item.slug || item.id}`}
                        >
                          <div className="w-full h-full flex gap-4 items-center">
                            {/* Flag/Avatar */}
                            <div className="w-[36px] h-[36px] relative overflow-hidden shrink-0 rounded-full">
                              {(item.flagUrl || item.iconUrl) ? (
                                <>
                                  <img
                                    alt={`${item.name} ${showRegions ? 'avatar' : 'flag'}`}
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
                              <p className="body-lg-medium"> {(lang === "vi" ? item.titleVi : item.title) || item.name}</p>
                              <p className="body-md text-text-tertiary">
                                <span className="whitespace-nowrap">
                                  {showRegions
                                    ? `${item.fromPrice ? `${dict.from} ${Number(item.fromPrice).toLocaleString("vi-VN")}₫ · ` : ""}${item.destinationCount} ${item.destinationCount === 1 ? (lang === "vi" ? "quốc gia" : "country") : (lang === "vi" ? "quốc gia" : "countries")}`
                                    : item.fromPrice
                                      ? `${dict.from} ${Number(item.fromPrice).toLocaleString("vi-VN")}₫`
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
                  ))}
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
                href={localizedHref(lang, "all-destinations")}
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
