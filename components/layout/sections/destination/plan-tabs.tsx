"use client";

import { useState, useMemo, useEffect } from "react";
import type { Plan } from "@/lib/api";
import type { DestinationDict, CategorizedPlans } from "./types";
import { getUniqueDataMb, findBestPlan, getUniqueFupSpeeds } from "./types";
import { PlanTagBadges, ProviderBadge } from "./plan-badges";

interface PlanTabsProps {
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

/* ── Small chip for fixed plans — shows data / days + tags + provider ── */
function PlanChip({
  plan,
  isSelected,
  onSelect,
  lang,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  lang: string;
}) {
  const label = `${formatDataLabel(Number(plan.dataMb))} – ${plan.durationDays} ${lang === "en" ? "days" : "ngày"}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`inline-flex items-center gap-[7px] px-[15px] py-[9px] rounded-[30px] text-[13.5px] font-medium border-[1.5px] cursor-pointer transition-colors whitespace-nowrap font-[inherit] ${isSelected
        ? "bg-white text-[#1a1a1a] border-[#1a1a1a] font-semibold shadow-[0_0_0_1px_#1a1a1a]"
        : "bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f3f4f6] hover:border-[#9ca3af]"
        }`}
    >
      {label}
      <PlanTagBadges tags={plan.tags as string[] | undefined} lang={lang} />
      {plan.discount != null && plan.discount > 0 && (
        <span className="text-[11px] font-bold tracking-wide px-[5px] py-[2px] rounded leading-tight shrink-0 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
          –{Number(plan.discount).toFixed()}%
        </span>
      )}
      <ProviderBadge plan={plan} />
    </button>
  );
}

/* ── GB chip for daily plan groups (delegates tag rendering to the best plan in the group) ── */
function GbChip({
  gb,
  isSelected,
  onSelect,
  bestPlan,
  lang,
}: {
  gb: number;
  isSelected: boolean;
  onSelect: () => void;
  bestPlan?: Plan | null;
  lang: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`inline-flex items-center gap-[7px] px-[15px] py-[9px] rounded-[30px] text-[13.5px] font-medium border-[1.5px] cursor-pointer transition-colors whitespace-nowrap font-[inherit] ${isSelected
        ? "bg-white text-[#1a1a1a] border-[#1a1a1a] font-semibold shadow-[0_0_0_1px_#1a1a1a]"
        : "bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f3f4f6] hover:border-[#9ca3af]"
        }`}
    >
      {formatDataLabel(gb)}/{lang === "en" ? "day" : "ngày"}
      {bestPlan && <PlanTagBadges tags={bestPlan.tags as string[] | undefined} lang={lang} />}
      {bestPlan?.discount != null && bestPlan.discount > 0 && (
        <span className="text-[11px] font-bold tracking-wide px-[5px] py-[2px] rounded leading-tight shrink-0 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
          –{Number(bestPlan.discount).toFixed()}%
        </span>
      )}
      {bestPlan && <ProviderBadge plan={bestPlan} />}
    </button>
  );
}

/* ── Plan section label with step number ── */
function PlanSectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-[7px] mb-[11px]">
      <span className="flex items-center text-[#6b7280]">{icon}</span>
      <span className="text-xs font-bold text-[#6b7280] uppercase tracking-[0.07em]">{label}</span>
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
  lang,
}: {
  plans: Plan[];
  days: number;
  onSelectPlan: (plan: Plan) => void;
  isActive: boolean;
  selectedGb: number;
  onGbChange: (gb: number) => void;
  lang: string;
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
      <div className="flex flex-wrap gap-2">
        {uniqueGbs.map((gb) => {
          const best = findBestPlan(plans, gb, days);
          return (
            <GbChip
              key={gb}
              gb={gb}
              isSelected={isActive && selectedGb === gb}
              onSelect={() => handleGbChange(gb)}
              bestPlan={best}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Unlimited pill (larger card) — shows infinity icon + main/hint labels + tags ── */
function UnlimitedPill({
  plan,
  isSelected,
  onSelect,
  mainLabel,
  hintLabel,
  lang,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  mainLabel: string;
  hintLabel: string;
  lang: string;
}) {
  // For the floating top badge slot, prefer the first marketing tag, fall back to discount
  const tags = (plan.tags as string[] | undefined) || [];
  const firstTag = tags.length > 0 ? tags[0] : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] border-[1.5px] cursor-pointer transition-all font-[inherit] min-w-[190px] ${isSelected
        ? "border-[#111] text-[#111] shadow-[0_0_0_1px_#111]"
        : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#9ca3af] hover:bg-[#f9fafb]"
        }`}
    >
      {/* Floating top-right badge slot */}
      {(firstTag || (plan.discount != null && plan.discount > 0)) && (
        <span
          className="absolute -top-[9px] right-2.5 pointer-events-none flex gap-1 items-center"
          style={{ pointerEvents: "none" }}
        >
          {firstTag ? (
            <PlanTagBadges tags={[firstTag]} lang={lang} />
          ) : (
            <span className="text-[11px] font-bold tracking-wide px-[7px] py-[2px] rounded leading-snug bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
              –{Number(plan.discount!).toFixed()}%
            </span>
          )}
        </span>
      )}

      <span className="shrink-0 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
          <path
            stroke={isSelected ? "#111" : "#9ca3af"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="m9.996 14.263-.814.919a4.5 4.5 0 1 1 0-6.364l5.636 6.364a4.5 4.5 0 1 0 0-6.364l-.814.92"
          />
        </svg>
      </span>
      <span className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className={`text-[13.5px] font-semibold leading-tight ${isSelected ? "text-[#111]" : "text-[#374151]"}`}>
          {mainLabel}
        </span>
        <span className={`text-[13px] leading-tight transition-colors ${isSelected ? "text-[#374151]" : "text-[#6b7280]"}`}>
          {hintLabel}
        </span>
      </span>
      <ProviderBadge plan={plan} />
    </button>
  );
}

type ActiveSection = "fixed" | "daily" | "unlimited";

export function PlanTabs({ plans, dict, selectedPlan, onSelectPlan, days }: PlanTabsProps) {
  const [speedTab, setSpeedTab] = useState<"normal" | "high">("normal");
  const [activeSection, setActiveSection] = useState<ActiveSection>("fixed");
  const [dailyGb, setDailyGb] = useState<number>(0);
  const [normalGb, setNormalGb] = useState<number>(0);
  const [highSpeedFup, setHighSpeedFup] = useState<string>("");

  const lang = (dict.daysUnit?.toLowerCase().startsWith("d") ? "en" : "vi");

  const hasDataPlans = plans.dataPlans.length > 0;
  const hasSlowUnlimited = plans.slowUnlimited.length > 0;
  const hasFastUnlimited = plans.fastUnlimited.length > 0;
  const hasDailyUnlimited = plans.dailyUnlimited.length > 0;
  const hasUnlimited = hasFastUnlimited || hasDailyUnlimited;

  const uniqueNormalGbs = useMemo(() => getUniqueDataMb(plans.fastUnlimited), [plans.fastUnlimited]);
  const uniqueHighFupSpeeds = useMemo(() => getUniqueFupSpeeds(plans.dailyUnlimited), [plans.dailyUnlimited]);

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

  useEffect(() => {
    if (hasDailyUnlimited && highSpeedFup === "" && uniqueHighFupSpeeds.length > 0) {
      setHighSpeedFup(uniqueHighFupSpeeds[0]);
    }
  }, [hasDailyUnlimited, uniqueHighFupSpeeds, highSpeedFup]);

  // When days change externally, re-pick best plan for active section
  useEffect(() => {
    if (activeSection === "daily" && hasSlowUnlimited && dailyGb > 0) {
      const best = findBestPlan(plans.slowUnlimited, dailyGb, days);
      if (best) onSelectPlan(best);
    } else if (activeSection === "unlimited" && speedTab === "normal" && hasFastUnlimited && normalGb > 0) {
      const best = findBestPlan(plans.fastUnlimited, normalGb, days);
      if (best) onSelectPlan(best);
    } else if (activeSection === "unlimited" && speedTab === "high" && hasDailyUnlimited && highSpeedFup) {
      const match = plans.dailyUnlimited.find((p) => p.fupSpeed === highSpeedFup && p.durationDays === days);
      if (match) onSelectPlan(match);
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

  /* Section label with step number */
  const StepLabel = () => (
    <div className="text-[15px] font-bold text-[#111] mb-2.5 flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-6 h-6 bg-[#111] text-white rounded-full text-xs font-extrabold shrink-0">1</span>
      {lang === "en" ? "Pick a plan" : "Chọn gói cước"}
    </div>
  );

  return (
    <div>
      <StepLabel />

      {/* ── Fixed Plan (dataPlans) ── */}
      {hasDataPlans && (
        <div className="mb-[18px]">
          <PlanSectionLabel
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
              <PlanChip
                key={p.id}
                plan={p}
                isSelected={activeSection === "fixed" && selectedPlan?.id === p.id}
                onSelect={() => handleSelectFixed(p)}
                lang={lang}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Daily Plan (slowUnlimited) — only GB pills, days from PlanConfig ── */}
      {hasSlowUnlimited && (
        <div className="mb-[18px]">
          <PlanSectionLabel
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label={dict.planSections.daily}
          />
          <GbSelector
            plans={plans.slowUnlimited}
            days={days}
            onSelectPlan={handleSelectDaily}
            isActive={activeSection === "daily"}
            selectedGb={dailyGb}
            onGbChange={setDailyGb}
            lang={lang}
          />
        </div>
      )}

      {/* ── Unlimited (fastUnlimited + dailyUnlimited) with Normal/High Speed tabs ── */}
      {hasUnlimited && (
        <div className="mb-[18px]">
          <PlanSectionLabel
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <path d="M9.996 14.263l-.814.919a4.5 4.5 0 1 1 0-6.364l5.636 6.364a4.5 4.5 0 1 0 0-6.364l-.814.92" />
              </svg>
            }
            label={dict.planSections.unlimited}
          />

          <div className="flex border-[1.5px] border-[#e5e7eb] rounded-[30px] bg-[#f9fafb] p-[3px] gap-[3px] mb-4">
            {hasFastUnlimited && (
              <button
                type="button"
                onClick={() => setSpeedTab("normal")}
                className={`flex-1 text-center py-[7px] px-2.5 text-[13.5px] font-medium cursor-pointer border-none rounded-[30px] transition-all font-[inherit] ${speedTab === "normal"
                  ? "bg-white text-[#111] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                  : "bg-transparent text-[#6b7280] hover:bg-white hover:text-[#374151]"
                  }`}
              >
                {dict.speed.normal}
              </button>
            )}
            {hasDailyUnlimited && (
              <button
                type="button"
                onClick={() => setSpeedTab("high")}
                className={`flex-1 text-center py-[7px] px-2.5 text-[13.5px] font-medium cursor-pointer border-none rounded-[30px] transition-all font-[inherit] ${speedTab === "high"
                  ? "bg-white text-[#111] font-bold shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                  : "bg-transparent text-[#6b7280] hover:bg-white hover:text-[#374151]"
                  }`}
              >
                {dict.speed.high}
              </button>
            )}
          </div>

          {/* Normal Speed: fastUnlimited — deduplicated by dataMb */}
          {speedTab === "normal" && hasFastUnlimited && (
            <div className="flex flex-wrap gap-2.5">
              {uniqueNormalGbs.map((gb) => {
                const best = findBestPlan(plans.fastUnlimited, gb, days) || plans.fastUnlimited[0];
                return (
                  <UnlimitedPill
                    key={gb}
                    plan={best}
                    isSelected={activeSection === "unlimited" && normalGb === gb}
                    onSelect={() => {
                      setNormalGb(gb);
                      const p = findBestPlan(plans.fastUnlimited, gb, days);
                      if (p) handleSelectUnlimited(p);
                    }}
                    mainLabel={`${formatDataLabel(gb)}/${lang === "en" ? "day" : "ngày"} ${dict.speed.high.toLowerCase()}`}
                    hintLabel={lang === "en" ? "→ 1 Mbps unlimited" : "→ 1 Mbps không giới hạn"}
                    lang={lang}
                  />
                );
              })}
            </div>
          )}

          {/* High Speed: dailyUnlimited — grouped by fupSpeed */}
          {speedTab === "high" && hasDailyUnlimited && (
            <div className="flex flex-wrap gap-2.5">
              {uniqueHighFupSpeeds.map((fup) => {
                const match = plans.dailyUnlimited.find((p) => p.fupSpeed === fup) || plans.dailyUnlimited[0];
                return (
                  <UnlimitedPill
                    key={fup}
                    plan={match}
                    isSelected={activeSection === "unlimited" && highSpeedFup === fup}
                    onSelect={() => {
                      setHighSpeedFup(fup);
                      if (match) handleSelectUnlimited(match);
                    }}
                    mainLabel={`${fup} ${dict.speed.high.toLowerCase()}`}
                    hintLabel={lang === "en" ? "→ Unlimited data" : "→ Không giới hạn data"}
                    lang={lang}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
