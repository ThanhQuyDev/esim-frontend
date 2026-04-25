"use client";

import { useState, useMemo, useEffect } from "react";
import type { Plan, PlansByDestinationResponse } from "@/lib/api";
import { usePlansBySlug, usePlansByRegionSlug } from "@/lib/hooks";
import type { DestinationPlansProps } from "./types";
import { ProductHero } from "./product-hero";
import { ProductInfo } from "./product-info";
import { TrustpilotBar } from "./trustpilot-bar";
import { PriceDisplay, GreenBox } from "./price-display";
import { PlanTabs } from "./plan-tabs";
import { PlanConfig } from "./plan-config";
import { BuyActions } from "./buy-actions";

const EMPTY_PLANS: PlansByDestinationResponse = {
  dataPlans: [],
  slowUnlimited: [],
  fastUnlimited: [],
  dailyUnlimited: [],
};

export function DestinationPlans({ destination, slug, dict, lang, planSource = "destination" }: DestinationPlansProps) {
  const destQuery = usePlansBySlug(planSource === "destination" ? slug : "", lang);
  const regionQuery = usePlansByRegionSlug(planSource === "region" ? slug : "", lang);
  const { data: plans = EMPTY_PLANS, isLoading } = planSource === "region" ? regionQuery : destQuery;

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [days, setDays] = useState(7);
  const [quantity, setQuantity] = useState(1);

  const hasAnyPlans =
    plans.dataPlans.length > 0 ||
    plans.slowUnlimited.length > 0 ||
    plans.fastUnlimited.length > 0 ||
    plans.dailyUnlimited.length > 0;

  // Auto-select first plan when data loads
  useMemo(() => {
    if (!selectedPlan && hasAnyPlans) {
      if (plans.dataPlans.length > 0) {
        setSelectedPlan(plans.dataPlans[0]);
      } else if (plans.dailyUnlimited.length > 0) {
        setSelectedPlan(plans.dailyUnlimited[0]);
      } else if (plans.slowUnlimited.length > 0) {
        setSelectedPlan(plans.slowUnlimited[0]);
      } else if (plans.fastUnlimited.length > 0) {
        setSelectedPlan(plans.fastUnlimited[0]);
      }
    }
  }, [hasAnyPlans]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  // Determine if selected plan is a "fixed" type (price is total for the package)
  // dataPlans & dailyUnlimited = fixed (price is for the whole package)
  // slowUnlimited & fastUnlimited = per-day pricing (user picks GB + days, price/durationDays * days)
  const isFixed = useMemo(() => {
    if (!selectedPlan) return false;
    const isInDataPlans = plans.dataPlans.some((p) => p.id === selectedPlan.id);
    const isInDailyUnlimited = plans.dailyUnlimited.some((p) => p.id === selectedPlan.id);
    return isInDataPlans || isInDailyUnlimited;
  }, [selectedPlan, plans]);

  // Determine if the current selection supports flexible days (calendar picker)
  // or only fixed durationDays options
  const { isFlexibleDays, availableDays } = useMemo(() => {
    if (!selectedPlan || isFixed) {
      return { isFlexibleDays: false, availableDays: [] as number[] };
    }
    // Find sibling plans (same category + same dataGb)
    const isInSlow = plans.slowUnlimited.some((p) => p.id === selectedPlan.id);
    const categoryPlans = isInSlow ? plans.slowUnlimited : plans.fastUnlimited;
    const sameGb = categoryPlans.filter((p) => Number(p.dataGb) === Number(selectedPlan.dataGb));

    const hasMultidate = sameGb.some((p) => p.isAbleMultidate);
    if (hasMultidate) {
      return { isFlexibleDays: true, availableDays: [] as number[] };
    }
    // Only fixed durationDays available
    const daysSet = new Set(sameGb.map((p) => p.durationDays));
    return { isFlexibleDays: false, availableDays: Array.from(daysSet).sort((a, b) => a - b) };
  }, [selectedPlan, isFixed, plans]);

  // Auto-correct days when switching to non-flexible plan
  useEffect(() => {
    if (!isFlexibleDays && availableDays.length > 0 && !availableDays.includes(days)) {
      // Pick the closest available day
      const closest = availableDays.reduce((prev, curr) =>
        Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
      );
      setDays(closest);
    }
  }, [isFlexibleDays, availableDays]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build price label
  const planLabel = useMemo(() => {
    if (!selectedPlan) return "";
    if (isFixed) return `· ${selectedPlan.name}`;
    return `· ${selectedPlan.name} · ${days} ${dict.daysUnit.toLowerCase()}`;
  }, [selectedPlan, isFixed, days, dict]);

  // Data label for green box
  const dataLabel = selectedPlan ? `${selectedPlan.dataGb}GB/${dict.daysUnit.toLowerCase()}` : "1GB/ngày";

  return (
    <div className="bg-white pt-6">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-[465px_minmax(0,1fr)] gap-x-8 items-start max-[1100px]:grid-cols-2 max-[1100px]:px-5 max-[1100px]:gap-x-6 max-[840px]:grid-cols-1 max-[840px]:px-4">
        {/* ── LEFT COLUMN ── */}
        <div className="min-w-0 max-[840px]:border-b max-[840px]:border-[#e5e7eb] max-[840px]:pb-6 max-[840px]:mb-6">
          <ProductHero destination={destination} dict={dict} />
          <ProductInfo destination={destination} dict={dict} />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="min-w-0">
          <TrustpilotBar dict={dict} />
          <PriceDisplay
            selectedPlan={selectedPlan}
            days={days}
            quantity={quantity}
            dict={dict}
            isFixed={isFixed}
            planLabel={planLabel}
          />
          <GreenBox dict={dict} dataLabel={dataLabel} />

          {isLoading ? (
            <div className="py-8 text-center text-sm text-[#6b7280]">Loading plans...</div>
          ) : !hasAnyPlans ? (
            <div className="py-8 text-center text-sm text-[#6b7280]">{dict.noPlans}</div>
          ) : (
            <>
              <PlanTabs
                plans={plans}
                dict={dict}
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
                days={days}
              />
              <div className="h-px bg-[#f3f4f6] my-4" />
              <PlanConfig
                days={days}
                quantity={quantity}
                onDaysChange={setDays}
                onQuantityChange={setQuantity}
                dict={dict}
                lang={lang}
                isFlexibleDays={isFlexibleDays}
                availableDays={availableDays}
                isFixed={isFixed}
              />
            </>
          )}

          <BuyActions
            selectedPlan={selectedPlan}
            days={days}
            quantity={quantity}
            isFixed={isFixed}
            dict={dict}
            lang={lang}
            destination={destination?.name}
          />
        </div>
      </div>
    </div>
  );
}
