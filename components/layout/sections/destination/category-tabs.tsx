"use client";

import type { DestinationDict } from "./types";

export type PlanCategory = "data" | "smsCall" | "localSim";

interface CategoryTabsProps {
  activeCategory: PlanCategory;
  onCategoryChange: (category: PlanCategory) => void;
  dict: DestinationDict;
  hasSmsCallPlans: boolean;
  hasLocalSimPlans: boolean;
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  dict,
  hasSmsCallPlans,
  hasLocalSimPlans,
}: CategoryTabsProps) {
  const tabs: { key: PlanCategory; label: string; visible: boolean }[] = [
    { key: "data", label: dict.planTabs.data, visible: true },
    { key: "smsCall", label: dict.planTabs.dataCalls, visible: hasSmsCallPlans },
    { key: "localSim", label: dict.planTabs.localSim, visible: hasLocalSimPlans },
  ];

  const visibleTabs = tabs.filter((t) => t.visible);

  // Don't render if only one tab is visible
  if (visibleTabs.length <= 1) return null;

  return (
    <div className="flex border-[1.5px] border-[#e5e7eb] rounded-sm bg-[#f9fafb] p-[3px] gap-[3px] mb-5">
      {visibleTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onCategoryChange(tab.key)}
          className={`flex-1 text-center py-[9px] px-3 text-[13.5px] font-medium cursor-pointer border-none rounded-sm transition-all font-[inherit] whitespace-nowrap ${
            activeCategory === tab.key
              ? "bg-white text-[#111] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
              : "bg-transparent text-[#6b7280] hover:bg-white hover:text-[#374151]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
