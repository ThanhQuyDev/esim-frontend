"use client";

import type { Plan } from "@/lib/api";
import type { DestinationDict } from "./types";
import { PlanTagBadges, ProviderBadge } from "./plan-badges";

interface SimplePlanListProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
  dict: DestinationDict;
}

function formatDataLabel(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return Number.isInteger(gb) ? `${gb}GB` : `${parseFloat(gb.toFixed(1))}GB`;
  }
  return `${mb}MB`;
}

/**
 * Simple plan list for SMS/Call eSIM and Local SIM categories.
 * Displays plans as selectable chips with data + duration info, marketing tags,
 * and provider badge when `isLocalInventory` is set.
 */
export function SimplePlanList({ plans, selectedPlan, onSelectPlan, dict }: SimplePlanListProps) {
  if (plans.length === 0) {
    return <div className="py-8 text-center text-base text-[#6b7280]">{dict.noPlans}</div>;
  }
  const lang = dict.daysUnit?.toLowerCase().startsWith("d") ? "en" : "vi";

  return (
    <div>
      <div className="text-[15px] font-medium text-[#111] mb-2.5 flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-[#111] text-white rounded-full text-sm font-extrabold shrink-0">1</span>
        {lang === "en" ? "Pick a plan" : "Chọn gói cước"}
      </div>
      <div className="flex flex-wrap gap-2">
        {plans.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const dataStr = formatDataLabel(Number(plan.dataMb));
          const label = `${dataStr} – ${plan.durationDays} ${dict.daysUnit.toLowerCase()}`;

          return (
            <button
              type="button"
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              className={`inline-flex items-center gap-[7px] px-[15px] py-[9px] rounded-[30px] text-[13.5px] font-medium border-[1.5px] cursor-pointer transition-colors whitespace-nowrap font-[inherit] ${
                isSelected
                  ? "bg-white text-[#1a1a1a] border-[#1a1a1a] font-semibold shadow-[0_0_0_1px_#1a1a1a]"
                  : "bg-white text-[#374151] border-[#e5e7eb] hover:bg-[#f3f4f6] hover:border-[#9ca3af]"
              }`}
            >
              {label}
              <PlanTagBadges tags={plan.tags as string[] | undefined} lang={lang} />
              {plan.sms != null && plan.sms > 0 && (
                <span className="text-[11px] font-medium tracking-wide px-[5px] py-[2px] rounded leading-tight shrink-0 bg-[#dbeafe] text-[#1e40af]">
                  SMS
                </span>
              )}
              {plan.call != null && plan.call > 0 && (
                <span className="text-[11px] font-medium tracking-wide px-[5px] py-[2px] rounded leading-tight shrink-0 bg-[#ede9fe] text-[#5b21b6]">
                  Call
                </span>
              )}
              {plan.discount != null && plan.discount > 0 && (
                <span className="text-[11px] font-medium tracking-wide px-[5px] py-[2px] rounded leading-tight shrink-0 bg-[#dcfce7] text-[#166534] border border-[#BBF7D0]">
                  –{Number(plan.discount).toFixed()}%
                </span>
              )}
              <ProviderBadge plan={plan} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
