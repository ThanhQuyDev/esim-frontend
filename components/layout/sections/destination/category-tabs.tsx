"use client";

import type { DestinationDict } from "./types";

/**
 * Category tabs — Local Sim was removed because local-inventory plans are now
 * folded into the existing groups and shown via a provider badge on each chip.
 */
export type PlanCategory = "data" | "smsCall";

interface CategoryTabsProps {
  activeCategory: PlanCategory;
  onCategoryChange: (category: PlanCategory) => void;
  dict: DestinationDict;
  hasSmsCallPlans: boolean;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  dict,
  hasSmsCallPlans,
}: CategoryTabsProps) {
  const tabs: { key: PlanCategory; label: string; visible: boolean }[] = [
    { key: "data", label: dict.planTabs.data, visible: true },
    { key: "smsCall", label: dict.planTabs.dataCalls, visible: hasSmsCallPlans },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);
  if (visibleTabs.length <= 1) return null;

  return (
    <div className="flex border border-[#EFEFEF] rounded-full bg-[#F7F7F7] p-[3px] gap-[3px] mb-5">
      {visibleTabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onCategoryChange(tab.key)}
          className={`flex-1 text-center py-2 px-3 text-[.875rem] font-medium cursor-pointer border-none rounded-full transition-all font-[inherit] whitespace-nowrap ${
            activeCategory === tab.key
              ? "bg-[#111] text-white font-medium"
              : "bg-transparent text-[#888] hover:bg-[#e0e0e0] hover:text-[#111]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
