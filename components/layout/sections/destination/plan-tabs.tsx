"use client";

import { useState, useMemo, useEffect } from "react";
import type { Plan } from "@/lib/api";
import type { DestinationDict, CategorizedPlans } from "./types";
import { getUniqueDataMb, findBestPlan } from "./types";

interface PlanTabsProps {
  plans: CategorizedPlans;
  dict: DestinationDict;
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
  days: number;
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

/* ── Format dataMb for display ── */
function formatDataLabel(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return Number.isInteger(gb) ? `${gb}GB` : `${parseFloat(gb.toFixed(1))}GB`;
  }
  return `${mb}MB`;
}

/* ── Small pill for fixed plans — shows data / days ── */
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
  const label = `${formatDataLabel(Number(plan.dataMb))} / ${plan.durationDays} days`;

  return (
    <button
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-full text-[13.5px] font-medium border cursor-pointer transition-colors whitespace-nowrap font-inherit ${isSelected
        ? "bg-[#fff7d6] text-[#854d0e] border-[#f5c400] font-semibold"
        : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#f5c400] hover:bg-[#fffde7]"
        }`}
    >
      {label}
      {savePercent > 18 && <PillBadge type="discount" label={`–${savePercent}%`} />}
    </button>
  );
}

/* ── GB pill ── */
function GbPill({
  gb,
  isSelected,
  onSelect,
}: {
  gb: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`inline-flex items-center gap-1.5 px-3 py-[7px] rounded-full text-[13.5px] font-medium border cursor-pointer transition-colors whitespace-nowrap font-inherit ${isSelected
        ? "bg-[#fff7d6] text-[#854d0e] border-[#f5c400] font-semibold"
        : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#f5c400] hover:bg-[#fffde7]"
        }`}
    >
      {formatDataLabel(gb)}/day
    </button>
  );
}

/* ── Plan section label ── */
function PlanSectionLabel({ label, isActive }: { label: string; isActive?: boolean }) {
  return (
    <div className="text-sm font-bold mb-2.5 flex items-center gap-[7px] text-[#1a1a1a]">
      <span className={`w-[3px] h-[15px] rounded-sm inline-block bg-[#f59e0b]`} />
      {label}
    </div>
  );
}

/* ── GB-only selector (days come from shared PlanConfig) ── */
function GbSelector({
  plans,
  days,
  onSelectPlan,
  isActive,
  selectedGb,
  onGbChange,
}: {
  plans: Plan[];
  days: number;
  onSelectPlan: (plan: Plan) => void;
  isActive: boolean;
  selectedGb: number;
  onGbChange: (gb: number) => void;
}) {
  const uniqueGbs = useMemo(() => getUniqueDataMb(plans), [plans]);

  const handleGbChange = (gb: number) => {
    onGbChange(gb);
    const best = findBestPlan(plans, gb, days);
    if (best) onSelectPlan(best);
  };

  if (uniqueGbs.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {uniqueGbs.map((gb) => (
          <GbPill
            key={gb}
            gb={gb}
            isSelected={isActive && selectedGb === gb}
            onSelect={() => handleGbChange(gb)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Unlimited pill (larger card) — shows infinity icon + main/hint labels ── */
function UnlimitedPill({
  plan,
  isSelected,
  onSelect,
  mainLabel,
  hintLabel,
  badge,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  mainLabel: string;
  hintLabel: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] border-[1.5px] cursor-pointer transition-all whitespace-nowrap font-inherit min-w-[140px] ${isSelected
        ? "bg-[#fffde7] border-[#d1b700] text-[#92400e] shadow-[0_0_0_2px_rgba(251,191,36,0.2)]"
        : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#f5c400] hover:bg-[#fffde7]"
        }`}
    >
      {badge && (
        <span className="absolute -top-2.5 right-2.5 text-[9px] font-bold tracking-wide px-[7px] py-[2px] rounded leading-snug pointer-events-none bg-[#1a1a1a] text-white">
          {badge}
        </span>
      )}

      <span className="shrink-0 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
          <g clipPath="url(#ci1)">
            <path
              stroke={isSelected ? "#d97706" : "#9ca3af"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="m9.996 14.263-.814.919a4.5 4.5 0 1 1 0-6.364l5.636 6.364a4.5 4.5 0 1 0 0-6.364l-.814.92"
            />
          </g>
          <defs><clipPath id="ci1"><path fill="#fff" d="M0 0h24v24H0z" /></clipPath></defs>
        </svg>
      </span>
      <span className="flex flex-col gap-0.5">
        <span className={`text-[13.5px] font-semibold leading-tight ${isSelected ? "text-[#92400e]" : "text-[#374151]"}`}>
          {mainLabel}
        </span>
        <span className={`text-[11px] leading-tight transition-colors ${isSelected ? "text-[#d97706]" : "text-[#9ca3af]"}`}>
          {hintLabel}
        </span>
      </span>
    </button>
  );
}

type ActiveSection = "fixed" | "daily" | "unlimited";

export function PlanTabs({ plans, dict, selectedPlan, onSelectPlan, days }: PlanTabsProps) {
  const [speedTab, setSpeedTab] = useState<"normal" | "high">("normal");
  const [activeSection, setActiveSection] = useState<ActiveSection>("fixed");
  const [dailyGb, setDailyGb] = useState<number>(0);
  const [normalGb, setNormalGb] = useState<number>(0);

  const getSavePercent = (p: Plan) =>
    p.retailPrice > 0 ? Math.round(((p.retailPrice - p.price) / p.retailPrice) * 100) : 0;

  const hasDataPlans = plans.dataPlans.length > 0;
  const hasSlowUnlimited = plans.slowUnlimited.length > 0;
  const hasFastUnlimited = plans.fastUnlimited.length > 0;
  const hasDailyUnlimited = plans.dailyUnlimited.length > 0;
  const hasUnlimited = hasFastUnlimited || hasDailyUnlimited;

  const uniqueNormalGbs = useMemo(() => getUniqueDataMb(plans.fastUnlimited), [plans.fastUnlimited]);

  // Initialize GB selections
  useEffect(() => {
    if (hasSlowUnlimited && dailyGb === 0) {
      const gbs = getUniqueDataMb(plans.slowUnlimited);
      if (gbs.length > 0) setDailyGb(gbs[0]);
    }
  }, [hasSlowUnlimited, plans.slowUnlimited, dailyGb]);

  useEffect(() => {
    if (hasFastUnlimited && normalGb === 0 && uniqueNormalGbs.length > 0) {
      setNormalGb(uniqueNormalGbs[0]);
    }
  }, [hasFastUnlimited, uniqueNormalGbs, normalGb]);

  // When days change externally, re-pick best plan for active section
  useEffect(() => {
    if (activeSection === "daily" && hasSlowUnlimited && dailyGb > 0) {
      const best = findBestPlan(plans.slowUnlimited, dailyGb, days);
      if (best) onSelectPlan(best);
    } else if (activeSection === "unlimited" && speedTab === "normal" && hasFastUnlimited && normalGb > 0) {
      const best = findBestPlan(plans.fastUnlimited, normalGb, days);
      if (best) onSelectPlan(best);
    }
  }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle selecting a plan from a specific section
  const handleSelectFixed = (plan: Plan) => {
    setActiveSection("fixed");
    onSelectPlan(plan);
  };

  const handleSelectDaily = (plan: Plan) => {
    setActiveSection("daily");
    onSelectPlan(plan);
  };

  const handleSelectUnlimited = (plan: Plan) => {
    setActiveSection("unlimited");
    onSelectPlan(plan);
  };

  return (
    <div>
      {/* ── Fixed Plan (dataPlans) ── */}
      {hasDataPlans && (
        <div className="mb-4">
          <PlanSectionLabel label={dict.planSections.fixed} isActive={activeSection === "fixed"} />
          <div className="flex flex-wrap gap-1.5">
            {plans.dataPlans.map((p) => (
              <PlanPill
                key={p.id}
                plan={p}
                isSelected={activeSection === "fixed" && selectedPlan?.id === p.id}
                onSelect={() => handleSelectFixed(p)}
                savePercent={getSavePercent(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Daily Plan (slowUnlimited) — only GB pills, days from PlanConfig ── */}
      {hasSlowUnlimited && (
        <div className="mb-4">
          <PlanSectionLabel label={dict.planSections.daily} isActive={activeSection === "daily"} />
          <GbSelector
            plans={plans.slowUnlimited}
            days={days}
            onSelectPlan={handleSelectDaily}
            isActive={activeSection === "daily"}
            selectedGb={dailyGb}
            onGbChange={setDailyGb}
          />
        </div>
      )}

      {/* ── Unlimited (fastUnlimited + dailyUnlimited) with Normal/High Speed tabs ── */}
      {hasUnlimited && (
        <div className="mb-4">
          <PlanSectionLabel label={dict.planSections.unlimited} isActive={activeSection === "unlimited"} />

          {/* Speed tabs */}
          <div className="flex border border-[#e5e7eb] rounded-full overflow-hidden mb-4 bg-[#f3f4f6]">
            {hasFastUnlimited && (
              <button
                onClick={() => setSpeedTab("normal")}
                className={`flex-1 text-center py-[7px] px-2.5 text-[13px] font-medium cursor-pointer border-none transition-all ${speedTab === "normal"
                  ? "bg-white text-[#111827] font-semibold rounded-[18px] m-0.5 shadow-sm"
                  : "bg-transparent text-[#9ca3af]"
                  }`}
              >
                {dict.speed.normal}
              </button>
            )}
            {hasDailyUnlimited && (
              <button
                onClick={() => setSpeedTab("high")}
                className={`flex-1 text-center py-[7px] px-2.5 text-[13px] font-medium cursor-pointer border-none transition-all ${speedTab === "high"
                  ? "bg-white text-[#111827] font-semibold rounded-[18px] m-0.5 shadow-sm"
                  : "bg-transparent text-[#9ca3af]"
                  }`}
              >
                {dict.speed.high}
              </button>
            )}
          </div>

          {/* Normal Speed: fastUnlimited — deduplicated by dataMb */}
          {speedTab === "normal" && hasFastUnlimited && (
            <div className="flex flex-wrap gap-2.5 mt-1">
              {uniqueNormalGbs.map((gb) => {
                const best = findBestPlan(plans.fastUnlimited, gb, days);
                return (
                  <UnlimitedPill
                    key={gb}
                    plan={best || plans.fastUnlimited[0]}
                    isSelected={activeSection === "unlimited" && normalGb === gb}
                    onSelect={() => {
                      setNormalGb(gb);
                      const p = findBestPlan(plans.fastUnlimited, gb, days);
                      if (p) handleSelectUnlimited(p);
                    }}
                    mainLabel={`${formatDataLabel(gb)}/day high speed`}
                    hintLabel="1 Mbps unlimited"
                  />
                );
              })}
            </div>
          )}

          {/* High Speed: dailyUnlimited — simple plan cards */}
          {speedTab === "high" && hasDailyUnlimited && (
            <div className="flex flex-wrap gap-2.5 mt-1">
              {plans.dailyUnlimited.map((p) => (
                <UnlimitedPill
                  key={p.id}
                  plan={p}
                  isSelected={activeSection === "unlimited" && selectedPlan?.id === p.id}
                  onSelect={() => handleSelectUnlimited(p)}
                  mainLabel={`${p.durationDays} days highspeed`}
                  hintLabel="5 Mbps unlimited"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
