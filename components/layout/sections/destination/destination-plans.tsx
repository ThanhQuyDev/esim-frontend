"use client";

import { useState, useMemo, useEffect } from "react";
import type { Plan, PlansByDestinationResponse } from "@/lib/api";
import { usePlansBySlug, usePlansByRegionSlug, useRegionBySlug, useDestinationBySlug } from "@/lib/hooks";
import type { DestinationPlansProps } from "./types";
import { ProductHero } from "./product-hero";
import { ProductInfo } from "./product-info";
import { TrustpilotBar } from "./trustpilot-bar";
import { PriceDisplay, GreenBox } from "./price-display";
import { PlanTabs } from "./plan-tabs";
import { PlanConfig } from "./plan-config";
import { BuyActions } from "./buy-actions";
import { MobileDestinationPlans } from "./mobile-destination-plans";

const EMPTY_PLANS: PlansByDestinationResponse = {
  dataPlans: [],
  slowUnlimited: [],
  fastUnlimited: [],
  dailyUnlimited: [],
};

export function DestinationPlans({ destination, slug, dict, lang, planSource = "destination", initialPlans, initialRegion }: DestinationPlansProps) {
  const destQuery = usePlansBySlug(
    planSource === "destination" ? slug : "",
    lang,
    planSource === "destination" ? (initialPlans ?? undefined) : undefined
  );
  const regionQuery = usePlansByRegionSlug(
    planSource === "region" ? slug : "",
    lang,
    planSource === "region" ? (initialPlans ?? undefined) : undefined
  );
  const { data: plans = EMPTY_PLANS, isLoading } = planSource === "region" ? regionQuery : destQuery;

  // Server already sends the initial entity. Avoid duplicate detail fetches on first load.
  const regionDetailQuery = useRegionBySlug("", lang);
  const regionData = planSource === "region" ? initialRegion : (regionDetailQuery.data ?? null);

  const destinationDetailQuery = useDestinationBySlug("", lang);
  const destinationData = planSource === "destination" ? destination : (destinationDetailQuery.data ?? null);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [days, setDays] = useState(7);
  const [quantity, setQuantity] = useState(1);

  // Determine if the selected plan is a fixed-duration plan (dataPlans)
  const isFixed = useMemo(() => {
    if (!selectedPlan) return false;
    return plans.dataPlans.some((p) => p.id === selectedPlan.id);
  }, [selectedPlan, plans]);

  // Determine if the plan supports flexible days (unlimited plans)
  const isFlexibleDays = useMemo(() => {
    if (!selectedPlan) return false;
    return !plans.dataPlans.some((p) => p.id === selectedPlan.id);
  }, [selectedPlan, plans]);

  // Available days for fixed plans
  const availableDays = useMemo(() => {
    if (!selectedPlan) return [];
    const matching = plans.dataPlans.filter((p) => p.dataMb === selectedPlan.dataMb);
    return Array.from(new Set(matching.map((p) => p.durationDays))).sort((a, b) => a - b);
  }, [selectedPlan, plans]);

  // Auto-select first plan
  useEffect(() => {
    if (!selectedPlan && plans) {
      const first = plans.dataPlans[0] || plans.fastUnlimited[0] || plans.slowUnlimited[0] || plans.dailyUnlimited[0];
      if (first) setSelectedPlan(first);
    }
  }, [plans, selectedPlan]);

  // Handle plan selection
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (plans.dataPlans.some((p) => p.id === plan.id)) {
      setDays(plan.durationDays);
    }
  };

  // Check if plans have any data
  const hasAnyPlans = plans.dataPlans.length > 0 || plans.fastUnlimited.length > 0 || plans.slowUnlimited.length > 0 || plans.dailyUnlimited.length > 0;

  // Snap days to nearest available when switching between flexible/fixed
  useEffect(() => {
    if (!isFlexibleDays && availableDays.length > 0 && !availableDays.includes(days)) {
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
  const dataLabel = selectedPlan
    ? `${selectedPlan.dataMb >= 1024 ? `${parseFloat((selectedPlan.dataMb / 1024).toFixed(1))}GB` : `${selectedPlan.dataMb}MB`}/${dict.daysUnit.toLowerCase()}`
    : "1GB/ngày";

  return (
    <div className="bg-white">
      {/* ── MOBILE VIEW (≤840px) ── */}
      <div className="min-[841px]:hidden">
        <MobileDestinationPlans
          destination={destinationData || destination}
          plans={plans}
          isLoading={isLoading}
          selectedPlan={selectedPlan}
          onSelectPlan={handleSelectPlan}
          days={days}
          quantity={quantity}
          onDaysChange={setDays}
          onQuantityChange={setQuantity}
          dict={dict}
          lang={lang}
          planSource={planSource}
          isFixed={isFixed}
          isFlexibleDays={isFlexibleDays}
          availableDays={availableDays}
          planLabel={planLabel}
          dataLabel={dataLabel}
          region={regionData}
          destinationData={destinationData}
        />
      </div>

      {/* ── DESKTOP VIEW (>840px) ── */}
      <div className="hidden min-[841px]:block">
        <div className="max-w-[1200px] mx-auto px-6 pb-[60px] grid grid-cols-[465px_minmax(0,1fr)] gap-8 items-start max-[1100px]:grid-cols-2 max-[1100px]:px-5 max-[1100px]:gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-4 min-w-0">
            <ProductHero destination={destinationData || destination} dict={dict} />
            {isLoading ? (
              <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />
            ) : (
              <ProductInfo
                destination={destinationData || destination}
                dict={dict}
                lang={lang}
                planSource={planSource}
                selectedPlan={selectedPlan}
                region={regionData}
              />
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="min-w-0 pt-1">
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
              <div className="py-4">
                {/* Full-area skeleton for plan tabs + config */}
                <div className="h-[280px] bg-gray-100 rounded-xl animate-pulse" />
              </div>
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
              destination={(destinationData || destination)?.name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
