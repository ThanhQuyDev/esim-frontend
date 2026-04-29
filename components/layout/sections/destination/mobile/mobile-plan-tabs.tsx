"use client";

import { useState, useMemo, useEffect } from "react";
import type { Plan } from "@/lib/api";
import type { DestinationDict, CategorizedPlans } from "../types";
import { getUniqueDataMb, findBestPlan } from "../types";

interface MobilePlanTabsProps {
  plans: CategorizedPlans;
  dict: DestinationDict;
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
  days: number;
}

/* ── Format dataMb for display ── */
function formatDataLabel(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return Number.isInteger(gb) ? `${gb}GB` : `${parseFloat(gb.toFixed(1))}GB`;
  }
  return `${mb}MB`;
}

/* ── Chip badge ── */
function ChipBadge({ type, label }: { type: "pop" | "disc" | "bv"; label: string }) {
  const cls = {
    pop: "bg-[#1a1a1a] text-white",
    disc: "bg-[#dcfce7] text-[#166534]",
    bv: "bg-[#dc2626] text-white",
  }[type];
  return (
    <span className={`text-[10px] font-bold px-[7px] py-[2px] rounded leading-[1.4] whitespace-nowrap ${cls}`}>
      {label}
    </span>
  );
}

/* ── Plan chip (fixed plans) ── */
function MobilePlanChip({
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
  const label = `${formatDataLabel(Number(plan.dataMb))} – ${plan.durationDays} ngày`;

  return (
    <button
      onClick={onSelect}
      className={`inline-flex items-center gap-[7px] px-[18px] py-2.5 rounded-[30px] text-sm font-medium border-[1.5px] cursor-pointer transition-colors whitespace-nowrap font-[inherit] ${
        isSelected
          ? "bg-white text-[#1a1a1a] border-[#1a1a1a] font-semibold shadow-[0_0_0_1px_#1a1a1a]"
          : "bg-white text-[#374151] border-[#e5e7eb] active:bg-[#f3f4f6]"
      }`}
    >
      {label}
      {savePercent > 18 && <ChipBadge type="disc" label={`–${savePercent}%`} />}
    </button>
  );
}

/* ── GB chip (daily plans) ── */
function MobileGbChip({
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
      className={`inline-flex items-center gap-[7px] px-[18px] py-2.5 rounded-[30px] text-sm font-medium border-[1.5px] cursor-pointer transition-colors whitespace-nowrap font-[inherit] ${
        isSelected
          ? "bg-white text-[#1a1a1a] border-[#1a1a1a] font-semibold shadow-[0_0_0_1px_#1a1a1a]"
          : "bg-white text-[#374151] border-[#e5e7eb] active:bg-[#f3f4f6]"
      }`}
    >
      {formatDataLabel(gb)}/ngày
    </button>
  );
}

/* ── Unlimited pill ── */
function MobileUnlimitedPill({
  isSelected,
  onSelect,
  mainLabel,
  hintLabel,
  badge,
}: {
  isSelected: boolean;
  onSelect: () => void;
  mainLabel: string;
  hintLabel: string;
  badge?: { type: "pop" | "disc" | "bv"; label: string };
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex items-center w-full px-4 py-3.5 rounded-[14px] border-[1.5px] cursor-pointer transition-all font-[inherit] ${
        isSelected
          ? "border-[#1a1a1a] shadow-[0_0_0_1px_#1a1a1a]"
          : "bg-white border-[#e5e7eb] active:border-[#9ca3af]"
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-[11px] right-3 text-[10px] font-bold px-[9px] py-[3px] rounded-[5px] leading-[1.4] whitespace-nowrap z-[1] ${
            badge.type === "pop"
              ? "bg-[#1a1a1a] text-white"
              : badge.type === "bv"
              ? "bg-[#dc2626] text-white"
              : "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]"
          }`}
        >
          {badge.label}
        </span>
      )}

      {/* Icon */}
      <span className="w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0 mr-3.5">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path
            d="M9.996 14.263l-.814.919a4.5 4.5 0 1 1 0-6.364l5.636 6.364a4.5 4.5 0 1 0 0-6.364l-.814.92"
            stroke={isSelected ? "#1a1a1a" : "#6b7280"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="flex items-baseline min-w-0 overflow-hidden whitespace-nowrap">
        <span className={`text-sm font-medium shrink-0 ${isSelected ? "text-[#1a1a1a] font-semibold" : "text-[#374151]"}`}>
          {mainLabel}
        </span>
        <span className="text-sm text-[#6b7280] mx-1 shrink-0">→</span>
        <span className="text-xs text-[#6b7280] overflow-hidden text-ellipsis">{hintLabel}</span>
      </span>
    </button>
  );
}

/* ── Section header ── */
function PlanGroupHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-[7px] mb-[11px]">
      <span className="flex items-center text-[#6b7280]">{icon}</span>
      <span className="text-xs font-bold text-[#6b7280] uppercase tracking-[0.07em]">{label}</span>
    </div>
  );
}

type ActiveSection = "fixed" | "daily" | "unlimited";

export function MobilePlanTabs({ plans, dict, selectedPlan, onSelectPlan, days }: MobilePlanTabsProps) {
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

  // Re-pick best plan when days change
  useEffect(() => {
    if (activeSection === "daily" && hasSlowUnlimited && dailyGb > 0) {
      const best = findBestPlan(plans.slowUnlimited, dailyGb, days);
      if (best) onSelectPlan(best);
    } else if (activeSection === "unlimited" && speedTab === "normal" && hasFastUnlimited && normalGb > 0) {
      const best = findBestPlan(plans.fastUnlimited, normalGb, days);
      if (best) onSelectPlan(best);
    }
  }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="px-4 py-[18px] border-t-[7px] border-[#f3f4f6]">
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
          1
        </span>
        <span className="text-[15px] font-bold text-[#1a1a1a]">{dict.planTabs.data}</span>
      </div>

      {/* Main tabs (Data / Data+Calls) - placeholder for future use */}
      {/* Currently only showing Data tab content */}

      {/* ── Fixed Plans (dataPlans) ── */}
      {hasDataPlans && (
        <div className="mb-5">
          <PlanGroupHeader
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            label={dict.planSections.fixed}
          />
          <div className="flex flex-wrap gap-2">
            {plans.dataPlans.map((p) => (
              <MobilePlanChip
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

      {/* ── Daily Plans (slowUnlimited) ── */}
      {hasSlowUnlimited && (
        <div className="mb-5">
          <PlanGroupHeader
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label={dict.planSections.daily}
          />
          <div className="flex flex-wrap gap-2">
            {getUniqueDataMb(plans.slowUnlimited).map((gb) => (
              <MobileGbChip
                key={gb}
                gb={gb}
                isSelected={activeSection === "daily" && dailyGb === gb}
                onSelect={() => {
                  setDailyGb(gb);
                  const best = findBestPlan(plans.slowUnlimited, gb, days);
                  if (best) handleSelectDaily(best);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Unlimited (fastUnlimited + dailyUnlimited) ── */}
      {hasUnlimited && (
        <div className="mb-5">
          <PlanGroupHeader
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <path d="M9.996 14.263l-.814.919a4.5 4.5 0 1 1 0-6.364l5.636 6.364a4.5 4.5 0 1 0 0-6.364l-.814.92" />
              </svg>
            }
            label={dict.planSections.unlimited}
          />

          {/* Speed tabs */}
          <div className="flex border-[1.5px] border-[#e5e7eb] rounded-[30px] bg-[#f9fafb] p-[3px] gap-[3px] mb-[5px]">
            {hasFastUnlimited && (
              <button
                onClick={() => setSpeedTab("normal")}
                className={`flex-1 text-center py-[9px] px-1.5 text-sm font-medium cursor-pointer border-none rounded-[30px] transition-all font-[inherit] ${
                  speedTab === "normal"
                    ? "bg-white text-[#1a1a1a] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                    : "bg-transparent text-[#6b7280]"
                }`}
              >
                {dict.speed.normal}
              </button>
            )}
            {hasDailyUnlimited && (
              <button
                onClick={() => setSpeedTab("high")}
                className={`flex-1 text-center py-[9px] px-1.5 text-sm font-medium cursor-pointer border-none rounded-[30px] transition-all font-[inherit] ${
                  speedTab === "high"
                    ? "bg-white text-[#1a1a1a] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.1)]"
                    : "bg-transparent text-[#6b7280]"
                }`}
              >
                {dict.speed.high}
              </button>
            )}
          </div>

          {/* Normal Speed pills */}
          {speedTab === "normal" && hasFastUnlimited && (
            <div className="flex flex-col gap-3 pt-2.5">
              {uniqueNormalGbs.map((gb, idx) => {
                const badge =
                  idx === 0
                    ? { type: "pop" as const, label: "Phổ biến" }
                    : idx === uniqueNormalGbs.length - 1
                    ? { type: "bv" as const, label: "Rẻ nhất" }
                    : undefined;
                return (
                  <MobileUnlimitedPill
                    key={gb}
                    isSelected={activeSection === "unlimited" && normalGb === gb}
                    onSelect={() => {
                      setNormalGb(gb);
                      const p = findBestPlan(plans.fastUnlimited, gb, days);
                      if (p) handleSelectUnlimited(p);
                    }}
                    mainLabel={`${formatDataLabel(gb)}/ngày tốc độ cao`}
                    hintLabel="1 Mbps không giới hạn"
                    badge={badge}
                  />
                );
              })}
            </div>
          )}

          {/* High Speed pills */}
          {speedTab === "high" && hasDailyUnlimited && (
            <div className="flex flex-col gap-3 pt-2.5">
              {plans.dailyUnlimited.map((p, idx) => {
                const badge =
                  idx === 0
                    ? { type: "pop" as const, label: "Phổ biến" }
                    : idx === plans.dailyUnlimited.length - 1
                    ? { type: "bv" as const, label: "Rẻ nhất" }
                    : undefined;
                return (
                  <MobileUnlimitedPill
                    key={p.id}
                    isSelected={activeSection === "unlimited" && selectedPlan?.id === p.id}
                    onSelect={() => handleSelectUnlimited(p)}
                    mainLabel={`${p.durationDays} ngày tốc độ cao`}
                    hintLabel="5 Mbps không giới hạn"
                    badge={badge}
                  />
                );
              })}
            </div>
          )}

          {/* Unlimited note */}
          <p className="text-[13px] text-[#6b7280] mt-2.5 leading-normal">
            {dict.unlimitedHint}
          </p>
        </div>
      )}
    </div>
  );
}
