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
  region?: Region | null;
  destinationData?: Destination | null;
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
  region,
  destinationData,
}: MobileDestinationPlansProps) {
  const ctaRef = useRef<HTMLDivElement>(null);
  const resolvedDestination = destinationData || destination;

  const hasAnyPlans =
    plans.dataPlans.length > 0 ||
    plans.slowUnlimited.length > 0 ||
    plans.fastUnlimited.length > 0 ||
    plans.dailyUnlimited.length > 0;

  return (
    <div className="bg-white">
      {/* 1. Hero */}
      <MobileHero destination={resolvedDestination} dict={dict} />

      {/* 2. Price + Green Box */}
      <MobilePrice
        selectedPlan={selectedPlan}
        days={days}
        quantity={quantity}
        dict={dict}
        isFixed={isFixed}
        planLabel={planLabel}
        dataLabel={dataLabel}
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
      />
    </div>
  );
}
