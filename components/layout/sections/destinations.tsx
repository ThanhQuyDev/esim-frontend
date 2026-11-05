"use client";
import { useMoney } from "@/lib/money";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDestinations, useRegions } from "@/lib/hooks";
import type { Locale } from "@/lib/i18n-config";
import { localizedHref } from "@/lib/route-mapping";
import { localizedSlug } from "@/lib/slug";
import { esimName } from "@/lib/esim-name";
import { LocalCarrierGrid } from "./local-esim/local-carrier-grid";
import { toRegionListItems } from "@/lib/region-groups";
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

  const { data: regions = [], isLoading: isLoadingRegions } = useRegions(
    JSON.stringify({ isPopular: true }),
    "name",
    "ASC",
    12
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
    () => toRegionListItems(regions, lang),
    [regions, lang]
  );
  const displayItems = showRegions ? regionItems : destinations;
  const isLoading = showRegions ? isLoadingRegions : isLoadingDestinations;

  return (
    <div
      data-section="CountryList"
      data-testid="section-CountryList"
      className="dp-home relative scroll-mt-20 xl:scroll-mt-24"
    >
      <div className="dp-wrap">
        <div className="dp-hd">
          <div>
            <p className="dp-eb">{dict.subtitle}</p>
            <h2 className="dp-h">{dict.title}</h2>
            <p className="dp-sub">{dict.description}</p>
          </div>
          <a
            className="dp-cta dp-cta-top"
            data-testid="view-all-destinations-cta"
            href={localizedHref(lang, "destinations")}
          >
            {dict.viewAllDestinations}
          </a>
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
            <div id="country-list-items" className="dp-p">
              {displayItems.map((item: any, index: number) => (
                <div
                  key={item.id}
                  id={item.code || item.slug || item.id}
                  // Five on a phone, as in the mobile design.
                  className={index >= 5 ? "dp-hide-m" : undefined}
                  data-testid={`${showRegions ? "region" : "destination"}-card-${item.code || item.slug || item.id}`}
                >
                  <PickerCardLink
                    href={`${lang === "vi" ? "" : `/${lang}`}/${localizedSlug(item, lang) || item.code?.toLowerCase()}`}
                    testId={item.code || item.slug || item.id}
                    mark={<DestinationMark item={item} isRegion={showRegions} />}
                    name={esimName((lang === "vi" ? item.titleVi : item.title) || item.name, lang)}
                    sub={destinationSub(item, showRegions, lang, dict.from, money.format)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <a
          className="dp-cta dp-cta-bottom"
          data-testid="view-all-destinations-cta"
          href={localizedHref(lang, "destinations")}
        >
          {dict.viewAllDestinations}
        </a>
      </div>
    </div>
  );
}
