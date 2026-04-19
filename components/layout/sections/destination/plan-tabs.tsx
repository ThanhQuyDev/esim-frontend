"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { Plan } from "@/lib/api";
import type { DestinationDict, CategorizedPlans } from "./types";

interface PlanTabsProps {
  plans: CategorizedPlans;
  dict: DestinationDict;
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan, isFixed: boolean) => void;
}

/* ── Pill badge ── */
function PillBadge({ type, label }: { type: "popular" | "best-val" | "discount"; label: string }) {
  const cls = {
    popular: "bg-[#1a1a1a] text-white",
    "best-val": "bg-[#ea580c] text-white",
    discount: "bg-[#b7f2c5] text-[#075f3c]",
  }[type];
  return (
    <span className={`text-[9px] font-bold tracking-wide px-[5px] py-[2px] rounded leading-tight shrink-0 ${cls}`}>
      {label}
    </span>
  );
}

/* ── Small pill (fixed/daily) ── */
function PlanPill({
  plan,
  isSelected,
  onSelect,
  savePercent,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  savePercent: number;
}) {
  return (
    <button
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-full text-[13.5px] font-medium border cursor-pointer transition-colors whitespace-nowrap font-inherit ${
        isSelected
          ? "bg-[#fff7d6] text-[#854d0e] border-[#f5c400] font-semibold"
          : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#f5c400] hover:bg-[#fffde7]"
      }`}
    >
      {plan.name}
      {plan.isActive && plan.isCheapest && <PillBadge type="best-val" label="Rẻ nhất" />}
      {savePercent > 18 && <PillBadge type="discount" label={`–${savePercent}%`} />}
    </button>
  );
}

/* ── Unlimited pill (larger card) ── */
function UnlimitedPill({
  plan,
  isSelected,
  onSelect,
  speedLabel,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  speedLabel: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] border-[1.5px] cursor-pointer transition-all whitespace-nowrap font-inherit min-w-[190px] ${
        isSelected
          ? "bg-[#fffde7] border-[#d1b700] text-[#92400e] shadow-[0_0_0_2px_rgba(251,191,36,0.2)]"
          : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#f5c400] hover:bg-[#fffde7]"
      }`}
    >
      {plan.isCheapest && (
        <span className="absolute -top-2.5 right-2.5 text-[9px] font-bold tracking-wide px-[7px] py-[2px] rounded leading-snug pointer-events-none bg-[#ea580c] text-white">
          Rẻ nhất
        </span>
      )}
      <span className="shrink-0 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path
            stroke={isSelected ? "#d97706" : "#9ca3af"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="m9.996 14.263-.814.919a4.5 4.5 0 1 1 0-6.364l5.636 6.364a4.5 4.5 0 1 0 0-6.364l-.814.92"
          />
        </svg>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className={`text-[13.5px] font-semibold leading-tight ${isSelected ? "text-[#92400e]" : "text-[#374151]"}`}>
          {plan.name}
        </span>
        <span className={`text-[11px] leading-tight transition-colors ${isSelected ? "text-[#d97706]" : "text-[#9ca3af]"}`}>
          → {speedLabel}
        </span>
      </span>
    </button>
  );
}

/* ── Plan section label ── */
function PlanSectionLabel({ label }: { label: string }) {
  return (
    <div className="text-sm font-bold text-[#1a1a1a] mb-2.5 flex items-center gap-[7px]">
      <span className="w-[3px] h-[15px] bg-[#f59e0b] rounded-sm inline-block" />
      {label}
    </div>
  );
}

export function PlanTabs({ plans, dict, selectedPlan, onSelectPlan }: PlanTabsProps) {
  const [speedMode, setSpeedMode] = useState<"normal" | "high">("normal");

  const getSavePercent = (p: Plan) =>
    p.retailPrice > 0 ? Math.round(((p.retailPrice - p.price) / p.retailPrice) * 100) : 0;

  // Split unlimited by speed (mock: first half normal, second half high)
  const unlimitedNormal = plans.unlimited.filter((_, i) => i < Math.ceil(plans.unlimited.length / 2));
  const unlimitedHigh = plans.unlimited.filter((_, i) => i >= Math.ceil(plans.unlimited.length / 2));
  const visibleUnlimited = speedMode === "normal" ? unlimitedNormal : unlimitedHigh;
  const speedLabel = speedMode === "normal" ? "1 Mbps không giới hạn" : "5 Mbps không giới hạn";

  return (
    <Tabs.Root defaultValue="data">
      <Tabs.List className="flex border border-[#e5e7eb] rounded-sm overflow-hidden bg-[#f3f4f6] p-[3px] gap-[3px] mb-[18px]">
        <Tabs.Trigger
          value="data"
          className="flex-1 text-center py-2 px-3 text-[13.5px] font-medium cursor-pointer text-[#6b7280] bg-transparent border-none rounded-sm transition-all whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-[#1a1a1a] data-[state=active]:font-bold data-[state=active]:shadow-sm hover:text-[#1a1a1a] hover:bg-white/60"
        >
          {dict.planTabs.data}
        </Tabs.Trigger>
        <Tabs.Trigger
          value="calls"
          className="flex-1 text-center py-2 px-3 text-[13.5px] font-medium cursor-pointer text-[#6b7280] bg-transparent border-none rounded-sm transition-all whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-[#1a1a1a] data-[state=active]:font-bold data-[state=active]:shadow-sm hover:text-[#1a1a1a] hover:bg-white/60"
        >
          {dict.planTabs.dataCalls}
        </Tabs.Trigger>
      </Tabs.List>

      {/* Data tab */}
      <Tabs.Content value="data">
        {/* Fixed plans */}
        {plans.fixed.length > 0 && (
          <div className="mb-4">
            <PlanSectionLabel label={dict.planSections.fixed} />
            <div className="flex flex-wrap gap-1.5">
              {plans.fixed.map((p) => (
                <PlanPill
                  key={p.id}
                  plan={p}
                  isSelected={selectedPlan?.id === p.id}
                  onSelect={() => onSelectPlan(p, true)}
                  savePercent={getSavePercent(p)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Daily plans */}
        {plans.daily.length > 0 && (
          <div className="mb-4">
            <PlanSectionLabel label={dict.planSections.daily} />
            <div className="flex flex-wrap gap-1.5">
              {plans.daily.map((p) => (
                <PlanPill
                  key={p.id}
                  plan={p}
                  isSelected={selectedPlan?.id === p.id}
                  onSelect={() => onSelectPlan(p, false)}
                  savePercent={getSavePercent(p)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Unlimited plans */}
        {plans.unlimited.length > 0 && (
          <div className="mb-4">
            <PlanSectionLabel label={dict.planSections.unlimited} />
            {/* Speed toggle */}
            <div className="flex border border-[#e5e7eb] rounded-full overflow-hidden mb-4 bg-[#f3f4f6]">
              <button
                onClick={() => setSpeedMode("normal")}
                className={`flex-1 text-center py-[7px] px-2.5 text-[13px] font-medium cursor-pointer border-none transition-all ${
                  speedMode === "normal"
                    ? "bg-white text-[#111827] font-semibold rounded-[18px] m-0.5 shadow-sm"
                    : "bg-transparent text-[#9ca3af]"
                }`}
              >
                {dict.speed.normal}
              </button>
              <button
                onClick={() => setSpeedMode("high")}
                className={`flex-1 text-center py-[7px] px-2.5 text-[13px] font-medium cursor-pointer border-none transition-all ${
                  speedMode === "high"
                    ? "bg-white text-[#111827] font-semibold rounded-[18px] m-0.5 shadow-sm"
                    : "bg-transparent text-[#9ca3af]"
                }`}
              >
                {dict.speed.high}
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5 mt-1">
              {visibleUnlimited.map((p) => (
                <UnlimitedPill
                  key={p.id}
                  plan={p}
                  isSelected={selectedPlan?.id === p.id}
                  onSelect={() => onSelectPlan(p, false)}
                  speedLabel={speedLabel}
                />
              ))}
            </div>
          </div>
        )}
      </Tabs.Content>

      {/* Calls tab */}
      <Tabs.Content value="calls">
        {plans.callsFixed.length > 0 ? (
          <div className="mb-4">
            <PlanSectionLabel label={`${dict.planSections.fixed} (${dict.planTabs.dataCalls})`} />
            <div className="flex flex-wrap gap-1.5">
              {plans.callsFixed.map((p) => (
                <PlanPill
                  key={p.id}
                  plan={p}
                  isSelected={selectedPlan?.id === p.id}
                  onSelect={() => onSelectPlan(p, true)}
                  savePercent={getSavePercent(p)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#6b7280] py-4">{dict.noPlans}</p>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
}
