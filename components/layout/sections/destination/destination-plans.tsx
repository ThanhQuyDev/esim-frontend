"use client";

import { useState, useMemo } from "react";
import type { Plan } from "@/lib/api";
import { usePlansBySlug, useExchangeRate } from "@/lib/hooks";
import type { DestinationPlansProps } from "./types";
import { categorizePlans } from "./types";
import { ProductHero } from "./product-hero";
import { ProductInfo } from "./product-info";
import { TrustpilotBar } from "./trustpilot-bar";
import { PriceDisplay, GreenBox } from "./price-display";
import { PlanTabs } from "./plan-tabs";
import { PlanConfig } from "./plan-config";
import { BuyActions } from "./buy-actions";

export function DestinationPlans({ destination, slug, dict, lang }: DestinationPlansProps) {
  const { data: plans = [], isLoading } = usePlansBySlug(slug, lang);
  const { data: rate = 25500 } = useExchangeRate();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [days, setDays] = useState(7);
  const [quantity, setQuantity] = useState(1);

  const categorized = useMemo(() => categorizePlans(plans), [plans]);

  // Auto-select first daily plan when plans load
  useMemo(() => {
    if (!selectedPlan && plans.length > 0) {
      const cat = categorizePlans(plans);
      if (cat.daily.length > 0) {
        setSelectedPlan(cat.daily[0]);
        setIsFixed(false);
      } else if (cat.fixed.length > 0) {
        setSelectedPlan(cat.fixed[0]);
        setIsFixed(true);
      }
    }
  }, [plans, selectedPlan]);

  const handleSelectPlan = (plan: Plan, fixed: boolean) => {
    setSelectedPlan(plan);
    setIsFixed(fixed);
  };

  // Build price label
  const planLabel = useMemo(() => {
    if (!selectedPlan) return "";
    if (isFixed) return `· ${dict.planSections.fixed}: ${selectedPlan.name}`;
    return `· ${dict.planSections.daily}: ${selectedPlan.name} · ${days} ${dict.daysUnit.toLowerCase()}`;
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
            rate={rate}
            dict={dict}
            isFixed={isFixed}
            planLabel={planLabel}
          />
          <GreenBox dict={dict} dataLabel={dataLabel} />

          {isLoading ? (
            <div className="py-8 text-center text-sm text-[#6b7280]">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#6b7280]">{dict.noPlans}</div>
          ) : (
            <>
              <PlanTabs
                plans={categorized}
                dict={dict}
                selectedPlan={selectedPlan}
                onSelectPlan={handleSelectPlan}
              />
              <div className="h-px bg-[#f3f4f6] my-4" />
              <PlanConfig
                days={days}
                quantity={quantity}
                onDaysChange={setDays}
                onQuantityChange={setQuantity}
                dict={dict}
                lang={lang}
              />
            </>
          )}

          <BuyActions
            selectedPlan={selectedPlan}
            days={days}
            quantity={quantity}
            rate={rate}
            isFixed={isFixed}
            dict={dict}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
