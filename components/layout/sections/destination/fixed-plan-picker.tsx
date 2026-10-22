"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Plan } from "@/lib/api";
import { useMoney } from "@/lib/money";
import { calcTotalVndPrice } from "./types";
import { PlanTagBadges, ProviderBadge } from "./plan-badges";

/**
 * "Gói cố định" of a country page, laid out like the region page (#067): one
 * chip per data size, and the number of days picked in a dropdown under the
 * chips, with each option's price. A country such as Japan has ~150 fixed
 * plans; one chip per "size – days" pair buried the buy button.
 */

interface Tier {
  dataMb: number;
  /** One plan per number of days, shortest first. */
  plans: Plan[];
}

function formatDataLabel(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return Number.isInteger(gb) ? `${gb}GB` : `${parseFloat(gb.toFixed(1))}GB`;
  }
  return `${mb}MB`;
}

/** Plans grouped by data size; of two plans with the same days, the cheaper one. */
function groupTiers(plans: Plan[]): Tier[] {
  const bySize = new Map<number, Map<number, Plan>>();
  for (const p of plans) {
    const mb = Number(p.dataMb);
    const byDays = bySize.get(mb) ?? new Map<number, Plan>();
    const kept = byDays.get(p.durationDays);
    if (!kept || calcTotalVndPrice(p, p.durationDays) < calcTotalVndPrice(kept, kept.durationDays)) {
      byDays.set(p.durationDays, p);
    }
    bySize.set(mb, byDays);
  }
  return Array.from(bySize.entries())
    .sort(([a], [b]) => a - b)
    .map(([dataMb, byDays]) => ({
      dataMb,
      plans: Array.from(byDays.values()).sort((a, b) => a.durationDays - b.durationDays),
    }));
}

function maxDiscount(plans: Plan[]): number {
  return plans.reduce((m, p) => Math.max(m, Number(p.discount) || 0), 0);
}

function DaySelect({
  tier,
  selected,
  onSelect,
  lang,
  mobile,
}: {
  tier: Tier;
  selected: Plan;
  onSelect: (plan: Plan) => void;
  lang: string;
  mobile: boolean;
}) {
  const money = useMoney();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const dayWord = (d: number) => (lang === "en" ? (d === 1 ? "day" : "days") : "ngày");

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", off);
    return () => document.removeEventListener("click", off);
  }, [open]);

  const price = (p: Plan) => calcTotalVndPrice(p, p.durationDays);
  const single = tier.plans.length === 1;

  return (
    <div className="mt-3 rounded-[12px] bg-[#f9fafb] p-3" data-testid="fixed-day-select">
      <div className={`mb-2 font-medium text-[#111] ${mobile ? "text-[15px]" : "text-[.875rem]"}`}>
        {lang === "en"
          ? `How many days for ${formatDataLabel(tier.dataMb)}?`
          : `Tổng ${formatDataLabel(tier.dataMb)} dùng trong bao nhiêu ngày?`}
      </div>
      <div className="relative" ref={box}>
        <button
          type="button"
          disabled={single}
          aria-haspopup="listbox"
          aria-expanded={open}
          data-testid="fixed-day-button"
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className={`flex w-full items-center justify-between gap-3 rounded-[30px] border border-[#e5e7eb] bg-white px-4 font-[inherit] text-[#111] transition-colors enabled:hover:border-[#9ca3af] disabled:cursor-default ${mobile ? "py-3 text-base" : "py-2.5 text-[.9375rem]"}`}
        >
          <span className="font-medium">
            {selected.durationDays} {dayWord(selected.durationDays)}
          </span>
          <span className="ml-auto text-[#6b7280] tabular-nums">{money.format(price(selected))}</span>
          {!single && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={`shrink-0 text-[#6b7280] transition-transform ${open ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
        {open && (
          <ul
            role="listbox"
            aria-label={lang === "en" ? "Number of days" : "Số ngày dùng"}
            data-testid="fixed-day-list"
            className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-[300px] overflow-y-auto rounded-[12px] border border-[#e5e7eb] bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          >
            {tier.plans.map((p) => {
              const isSel = p.id === selected.id;
              const total = price(p);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    data-testid="fixed-day-option"
                    data-plan-id={p.id}
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 rounded-[8px] px-3 py-2.5 text-left font-[inherit] ${mobile ? "text-[15px]" : "text-[.875rem]"} ${isSel ? "bg-[#f3f4f6] font-semibold text-[#111]" : "text-[#374151] hover:bg-[#f9fafb]"}`}
                  >
                    <span className="min-w-[64px]">
                      {p.durationDays} {dayWord(p.durationDays)}
                    </span>
                    <PlanTagBadges tags={p.tags as string[] | undefined} lang={lang} />
                    {p.discount != null && p.discount > 0 && (
                      <span className="shrink-0 rounded border border-[#BBF7D0] bg-[#DCFCE7] px-[5px] py-[2px] text-[11px] font-medium leading-tight text-[#166534]">
                        –{Number(p.discount).toFixed()}%
                      </span>
                    )}
                    <ProviderBadge plan={p} />
                    <span className="ml-auto text-right tabular-nums">
                      {money.format(total)}
                      {p.durationDays > 1 && (
                        <span className="block text-[11.5px] font-normal text-[#9ca3af]">
                          ≈ {money.format(Math.round(total / p.durationDays))}/{lang === "en" ? "day" : "ngày"}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function FixedPlanPicker({
  plans,
  selectedPlan,
  isActive,
  onSelect,
  lang,
  mobile = false,
}: {
  plans: Plan[];
  selectedPlan: Plan | null;
  /** The selected plan is one of these fixed plans. */
  isActive: boolean;
  onSelect: (plan: Plan) => void;
  lang: string;
  mobile?: boolean;
}) {
  const tiers = useMemo(() => groupTiers(plans), [plans]);
  const current = isActive ? selectedPlan : null;
  const activeTier = current ? tiers.find((t) => t.dataMb === Number(current.dataMb)) : undefined;
  // The chosen plan itself may have been dropped as the dearer duplicate.
  const shown = activeTier
    ? activeTier.plans.find((p) => p.id === current!.id) ??
      activeTier.plans.find((p) => p.durationDays === current!.durationDays) ??
      activeTier.plans[0]
    : null;

  /** A size's plan: the same days as now when it has them, else its shortest. */
  const planFor = (tier: Tier): Plan => {
    if (tier === activeTier && shown) return shown;
    return (current && tier.plans.find((p) => p.durationDays === current.durationDays)) || tier.plans[0];
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tiers.map((tier) => {
          const plan = planFor(tier);
          const isSel = tier === activeTier;
          const disc = maxDiscount(tier.plans);
          return (
            <button
              key={tier.dataMb}
              type="button"
              onClick={() => onSelect(plan)}
              data-testid="plan-chip"
              data-plan-id={plan.id}
              aria-pressed={isSel}
              className={`inline-flex cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-[30px] border font-[inherit] font-medium transition-colors ${mobile ? "px-[18px] py-2.5 text-base" : "px-[15px] py-[9px] text-[.875rem]"} ${
                isSel
                  ? "border-[#1a1a1a] bg-white font-semibold text-[#1a1a1a] shadow-[0_0_0_1px_#1a1a1a]"
                  : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#9ca3af] hover:bg-[#f3f4f6]"
              }`}
            >
              {formatDataLabel(tier.dataMb)}
              <PlanTagBadges tags={plan.tags as string[] | undefined} lang={lang} />
              {disc > 0 && (
                <span className="shrink-0 rounded border border-[#BBF7D0] bg-[#DCFCE7] px-[5px] py-[2px] text-[11px] font-medium leading-tight tracking-wide text-[#166534]">
                  {tier.plans.length > 1 ? (lang === "en" ? "up to " : "đến ") : ""}–{disc.toFixed()}%
                </span>
              )}
              <ProviderBadge plan={plan} />
            </button>
          );
        })}
      </div>
      {activeTier && shown && (
        <DaySelect tier={activeTier} selected={shown} onSelect={onSelect} lang={lang} mobile={mobile} />
      )}
    </div>
  );
}
