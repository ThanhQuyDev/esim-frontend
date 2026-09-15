"use client";

import { useState, type KeyboardEvent } from "react";
import { DestinationPlans } from "@/components/layout/sections/destination/destination-plans";
import type { DestinationDict } from "@/components/layout/sections/destination/types";
import type { Region } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import { countryCountLabel, regionAsDestination } from "@/lib/region-groups";
import { localizedSlug } from "@/lib/slug";

interface RegionVariantTabsProps {
  /** Variants of one region group, fewest countries first. */
  members: Region[];
  lang: Locale;
  dict: DestinationDict;
  /** Localized "Từ" / "From" label. */
  fromLabel: string;
  /** Variant to open first (a variant page's own slug); defaults to the first. */
  initialSlug?: string;
}

/**
 * Same-named regions that differ only by how many countries they cover
 * ("eSIM Châu Á" 13 vs 20 countries), shown as tabs over ONE plan picker.
 *
 * Switching a tab swaps the plans in place — no navigation, the URL stays what
 * the customer opened (#004). `DestinationPlans` is keyed by the variant, so
 * the selected plan, days and quantity start fresh for each pack instead of
 * carrying over a plan that the other pack does not sell.
 */
export function RegionVariantTabs({
  members,
  lang,
  dict,
  fromLabel,
  initialSlug,
}: RegionVariantTabsProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      members.findIndex((m) => localizedSlug(m, lang) === initialSlug)
    )
  );

  const active = members[activeIndex] ?? members[0];
  if (!active) return null;
  const activeSlug = localizedSlug(active, lang);
  const tabId = (member: Region) =>
    `region-variant-tab-${localizedSlug(member, lang)}`;

  // Arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + step + members.length) % members.length;
    setActiveIndex(next);
    document.getElementById(tabId(members[next]))?.focus();
  };

  return (
    <>
      {members.length > 1 && (
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto pt-4 pb-2">
            <p
              id="region-variant-tabs-label"
              className="text-[.875rem] font-medium text-[#555] mb-2"
            >
              {lang === "vi"
                ? "Chọn theo số lượng quốc gia"
                : "Choose by number of countries"}
            </p>
            <div
              role="tablist"
              aria-labelledby="region-variant-tabs-label"
              data-testid="region-variant-tabs"
              onKeyDown={onKeyDown}
              className="flex w-fit max-w-full overflow-x-auto border border-[#EFEFEF] rounded-full bg-[#F7F7F7] p-[3px] gap-[3px]"
            >
              {members.map((member, index) => {
                const selected = index === activeIndex;
                const slug = localizedSlug(member, lang);
                const price = Number(member.fromPrice);

                return (
                  <button
                    key={member.id}
                    id={tabId(member)}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="region-variant-panel"
                    tabIndex={selected ? 0 : -1}
                    data-testid={`region-variant-tab-${slug}`}
                    onClick={() => setActiveIndex(index)}
                    className={`shrink-0 text-center py-2 px-4 cursor-pointer border-none rounded-full transition-all font-[inherit] whitespace-nowrap ${
                      selected
                        ? "bg-[#111] text-white"
                        : "bg-transparent text-[#555] hover:bg-[#e0e0e0] hover:text-[#111]"
                    }`}
                  >
                    <span className="block text-[.875rem] font-medium">
                      {countryCountLabel(member.destinationCount ?? 0, lang)}
                    </span>
                    {Number.isFinite(price) && price > 0 && (
                      <span
                        className={`block text-[.75rem] ${
                          selected ? "text-white/70" : "text-[#888]"
                        }`}
                      >
                        {fromLabel} {price.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div
        role={members.length > 1 ? "tabpanel" : undefined}
        id="region-variant-panel"
        aria-labelledby={members.length > 1 ? tabId(active) : undefined}
      >
        <DestinationPlans
          key={active.id}
          destination={regionAsDestination(active)}
          slug={activeSlug}
          dict={dict}
          lang={lang}
          planSource="region"
          initialRegion={active}
        />
      </div>
    </>
  );
}
