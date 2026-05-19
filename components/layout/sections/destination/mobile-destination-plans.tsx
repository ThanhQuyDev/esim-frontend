"use client";

import { useRef } from "react";
import type { Plan, PlansByDestinationResponse, Destination, Region } from "@/lib/api";
import type { DestinationDict } from "./types";
import { MobileHero } from "./mobile/mobile-hero";
import { MobilePrice } from "./mobile/mobile-price";
import { MobilePlanTabs } from "./mobile/mobile-plan-tabs";
import { MobilePlanConfig } from "./mobile/mobile-plan-config";
import { MobileCta } from "./mobile/mobile-cta";
import { MobileFeatures } from "./mobile/mobile-features";
import { MobileStickyBar } from "./mobile/mobile-sticky-bar";
import { CategoryTabs, type PlanCategory } from "./category-tabs";
import { SimplePlanList } from "./simple-plan-list";

export interface MobileDestinationPlansProps {
  destination: Destination;
  plans: PlansByDestinationResponse;
  isLoading: boolean;
  selectedPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
  days: number;
  quantity: number;
  onDaysChange: (d: number) => void;
  onQuantityChange: (q: number) => void;
  dict: DestinationDict;
  lang: string;
  planSource: "destination" | "region";
  isFixed: boolean;
  isFlexibleDays: boolean;
  availableDays: number[];
  planLabel: string;
  dataLabel: string;
  greenBoxLine1: string;
  region?: Region | null;
  destinationData?: Destination | null;
  activeCategory: PlanCategory;
  onCategoryChange: (category: PlanCategory) => void;
  hasSmsCallPlans: boolean;
  /** Open the shared eKYC guide modal. */
  onOpenEkyc?: () => void;
}

export function MobileDestinationPlans({
  destination,
  plans,
  isLoading,
  selectedPlan,
  onSelectPlan,
  days,
  quantity,
  onDaysChange,
  onQuantityChange,
  dict,
  lang,
  planSource,
  isFixed,
  isFlexibleDays,
  availableDays,
  planLabel,
  dataLabel,
  greenBoxLine1,
  region,
  destinationData,
  activeCategory,
  onCategoryChange,
  hasSmsCallPlans,
  onOpenEkyc,
}: MobileDestinationPlansProps) {
  const ctaRef = useRef<HTMLDivElement>(null);
  const resolvedDestination = destinationData || destination;

  const hasAnyPlans =
    plans.dataPlans.length > 0 ||
    plans.slowUnlimited.length > 0 ||
    plans.fastUnlimited.length > 0 ||
    plans.dailyUnlimited.length > 0 ||
    (plans.smsCallEsim?.length ?? 0) > 0;

  // Inline KYC warning state — shown when the selected plan requires verification
  const showInlineKyc = !!selectedPlan?.isKyc;

  return (
    <div className="bg-white overflow-x-hidden max-w-full">
      {/* 1. Hero */}
      <MobileHero
        destination={resolvedDestination}
        dict={dict}
        lang={lang}
        region={region}
        operatorName={selectedPlan?.operatorName}
      />

      {/* 2. Price + Green Box + inline KYC banner */}
      <MobilePrice
        selectedPlan={selectedPlan}
        days={days}
        quantity={quantity}
        dict={dict}
        isFixed={isFixed}
        planLabel={planLabel}
        dataLabel={dataLabel}
        greenBoxLine1={greenBoxLine1}
        onOpenEkyc={onOpenEkyc}
        lang={lang}
      />

      {/* 3-4. Plan selection + Config */}
      {isLoading ? (
        <div className="py-4 px-4 space-y-4">
          {/* Full-area skeleton for plan tabs + config */}
          <div className="h-[200px] bg-gray-100 rounded-xl animate-pulse" />
          {/* Skeleton for eSIM info / features */}
          <div className="h-[300px] bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : !hasAnyPlans ? (
        <div className="py-8 text-center text-sm text-[#6b7280]">{dict.noPlans}</div>
      ) : (
        <>
          {/* Category Tabs (Data / Data & SMS & Call / Local Sim) */}
          <div className="px-4 pt-2">
            <CategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={onCategoryChange}
              dict={dict}
              hasSmsCallPlans={hasSmsCallPlans}
            />
          </div>

          {/* Plan selection based on active category */}
          {activeCategory === "data" && (
            <>
              {/* 5. Choose Plan */}
              <MobilePlanTabs
                plans={plans}
                dict={dict}
                selectedPlan={selectedPlan}
                onSelectPlan={onSelectPlan}
                days={days}
              />

              {/* 6. Customize */}
              <MobilePlanConfig
                days={days}
                quantity={quantity}
                onDaysChange={onDaysChange}
                onQuantityChange={onQuantityChange}
                dict={dict}
                lang={lang}
                isFlexibleDays={isFlexibleDays}
                availableDays={availableDays}
                isFixed={isFixed}
              />
            </>
          )}

          {activeCategory === "smsCall" && (
            <>
              <div className="px-4 pt-2">
                <SimplePlanList
                  plans={plans.smsCallEsim ?? []}
                  selectedPlan={selectedPlan}
                  onSelectPlan={onSelectPlan}
                  dict={dict}
                />
              </div>
              <MobilePlanConfig
                days={days}
                quantity={quantity}
                onDaysChange={onDaysChange}
                onQuantityChange={onQuantityChange}
                dict={dict}
                lang={lang}
                isFlexibleDays={false}
                availableDays={[]}
                isFixed={true}
              />
            </>
          )}

        </>
      )}

      {/* 7. CTA + Trust */}
      <div ref={ctaRef}>
        <MobileCta
          selectedPlan={selectedPlan}
          days={days}
          quantity={quantity}
          isFixed={isFixed}
          dict={dict}
          lang={lang}
          destination={resolvedDestination?.name}
        />
      </div>

      {/* 8-12. Features, Delivery, Device Checker, Disclaimer */}
      {!isLoading && (
        <MobileFeatures
          destination={resolvedDestination}
          dict={dict}
          lang={lang}
          planSource={planSource}
          selectedPlan={selectedPlan}
          region={region}
          onOpenEkyc={onOpenEkyc}
        />
      )}

      {/* Sticky bottom bar */}
      <MobileStickyBar
        selectedPlan={selectedPlan}
        days={days}
        quantity={quantity}
        isFixed={isFixed}
        dict={dict}
        lang={lang}
        destination={resolvedDestination?.name}
        planLabel={planLabel}
        onQuantityChange={onQuantityChange}
        ctaRef={ctaRef}
        onOpenEkyc={onOpenEkyc}
      />
    </div>
  );
}
