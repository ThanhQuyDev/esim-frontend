"use client";
import { useMoney } from "@/lib/money";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDestinations, useRegions } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";
import { localizedHref } from "@/lib/route-mapping";
import { localizedSlug } from "@/lib/slug";
import { placeName } from "@/lib/esim-name";
import { LocalCarrierGrid } from "./local-esim/local-carrier-grid";
import { rankedRegionItems, toRegionListItems } from "@/lib/region-groups";
import {
  DestinationMark,
  PickerCardLink,
  PickerTabs,
  destinationSub,
} from "./destination-picker/destination-picker";

interface DestinationsSectionProps {
  dict: Record<string, any>;
  lang: Locale;
}

type Tab = "country" | "region" | "local";

export function DestinationsSection({ dict, lang }: DestinationsSectionProps) {
  // Dollars on the English site (doitac-1410 #073).
  const money = useMoney();
  // Three tabs on the home page; "Tất cả" lives on the all-destinations page
  // (vande-0411 #071).
  const [activeTab, setActiveTab] = useState<Tab>("country");

  const { data: destinations = [], isLoading: isLoadingDestinations } = useDestinations(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    12
  );

  // A featured parent with its packs, and featured regions with no parent. A
  // featured pack shows on its parent's page instead (vande-0411 #073).
  const { data: regions = [], isLoading: isLoadingRegions } = useRegions(
    JSON.stringify({ featuredTop: true }),
    "name",
    "ASC",
    100
  );

  // The five a phone shows, as the admin picked them (vande-1411 #021). Until
  // some are picked the phone shows the first five of the list.
  const { data: mobileDestinations = [] } = useDestinations(
    JSON.stringify({ mobileHome: true, isActive: true }),
    "mobileHomeRank",
    "ASC",
    5
  );
  const { data: mobileRegions = [] } = useRegions(
    JSON.stringify({ mobileHome: true, isActive: true }),
    "name",
    "ASC",
    100
  );

  const tabs = [
    { key: "country" as const, label: dict.tabs.country, testId: "country-list-tab-chip-country" },
    { key: "region" as const, label: dict.tabs.region, testId: "country-list-tab-chip-region" },
    { key: "local" as const, label: dict.tabs.local, testId: "country-list-tab-chip-local" },
  ];

  const showRegions = activeTab === "region";
  // Same-named regions that differ only by country count collapse into one
  // card linking to the group page (`/esim-chau-a`).
  const regionItems = useMemo(
    () => toRegionListItems(regions, lang).slice(0, 12),
    [regions, lang]
  );
  const displayItems = showRegions ? regionItems : destinations;
  const mobileRegionItems = useMemo(
    () => rankedRegionItems(mobileRegions, lang).slice(0, 5),
    [mobileRegions, lang]
  );
  // In the admin's order; the list endpoint does not read a sort from here.
  const mobileCountryItems = useMemo(
    () =>
      [...mobileDestinations]
        .sort((x: any, y: any) => (x.mobileHomeRank ?? 99) - (y.mobileHomeRank ?? 99))
        .slice(0, 5),
    [mobileDestinations]
  );
  const mobileItems = showRegions ? mobileRegionItems : mobileCountryItems;
  const picked = mobileItems.length > 0;

  const card = (item: any, index: number, phone: boolean) => (
    <div
      key={item.id}
      id={phone ? undefined : item.code || item.slug || item.id}
      // A phone shows the admin's five (vande-1411 #021), or the first five.
      className={phone ? undefined : picked || index >= 5 ? "dp-hide-m" : undefined}
      data-testid={`${showRegions ? "region" : "destination"}-card-${phone ? "m-" : ""}${item.code || item.slug || item.id}`}
    >
      <PickerCardLink
        href={`${lang === "vi" ? "" : `/${lang}`}/${localizedSlug(item, lang) || item.code?.toLowerCase()}`}
        testId={`${phone ? "m-" : ""}${item.code || item.slug || item.id}`}
        mark={<DestinationMark item={item} isRegion={showRegions} />}
        // The place alone, "Việt Nam" (vande-1411 #021).
        name={placeName((lang === "vi" ? item.titleVi : item.title) || item.name)}
        sub={destinationSub(item, showRegions, lang, dict.from, money.format)}
      />
    </div>
  );
  const isLoading = showRegions ? isLoadingRegions : isLoadingDestinations;

  return (
    <div
      data-section="CountryList"
      data-testid="section-CountryList"
      className="dp-home relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="dp-wrap">
        {/* The heading and the button as on esim.vn (vande-1411 #021). */}
        <div className="grid sm:gap-x-8 grid-cols-12 mb-10 text-text-primary">
          <div className="col-span-12 md:col-span-8">
            <p className="body-md-medium text-text-disabled mb-4">{dict.subtitle}</p>
            <div className="grid grid-cols-1 gap-y-6">
              <h2 className="heading-xl">{dict.title}</h2>
              <p className="body-md text-text-secondary">{dict.description}</p>
            </div>
          </div>
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

        <PickerTabs
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
          label={lang === "vi" ? "Loại eSIM" : "eSIM type"}
        />

        <div role="tabpanel">
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
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
            </div>
          ) : (
            <>
              <div id="country-list-items" className="dp-p">
                {displayItems.map((item: any, index: number) => card(item, index, false))}
              </div>
              {picked && (
                <div className="dp-p dp-only-m" data-testid="mobile-home-picks">
                  {mobileItems.map((item: any, index: number) => card(item, index, true))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-center lg:hidden mt-10">
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
  );
}
