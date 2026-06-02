"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Plan, PlansByDestinationResponse } from "@/lib/api";
import { usePlansBySlug, usePlansByRegionSlug, useRegionBySlug, useDestinationBySlug } from "@/lib/hooks";
import { hasMultidatePlan } from "./types";
import type { DestinationPlansProps } from "./types";
import { ProductCard } from "./product-card";
import { DeviceChecker } from "./device-checker";
import { TrustpilotBar } from "./trustpilot-bar";
import { PriceDisplay, GreenBox } from "./price-display";
import { PlanTabs } from "./plan-tabs";
import { PlanConfig } from "./plan-config";
import { BuyActions } from "./buy-actions";
import { DesktopStickyBar } from "./desktop-sticky-bar";
import { MobileDestinationPlans } from "./mobile-destination-plans";
import { CategoryTabs, type PlanCategory } from "./category-tabs";
import { SimplePlanList } from "./simple-plan-list";
import { EkycModal } from "./ekyc-modal";

const EMPTY_PLANS: PlansByDestinationResponse = {
  dataPlans: [],
  slowUnlimited: [],
  fastUnlimited: [],
  dailyUnlimited: [],
  smsCallEsim: [],
  localEsim: [],
};

/**
 * Merge `localEsim` plans (if any) into the standard plan groups so they appear
 * alongside non-local plans. The groups are picked by plan shape:
 * - Plans with sms/call → smsCallEsim
 * - Plans with `isAbleMultidate` and a fupSpeed (Mbps) → slowUnlimited / fastUnlimited
 * - Daily-unlimited plans (fupSpeed only) → dailyUnlimited
 * - Otherwise → dataPlans (fixed)
 *
 * The `isLocalInventory` flag is preserved so chips render the provider badge.
 */
function mergeLocalInventory(plans: PlansByDestinationResponse): PlansByDestinationResponse {
  const localPool = (plans.localEsim ?? []).map((p) => ({ ...p, isLocalInventory: true }));
  if (localPool.length === 0) return plans;

  const dataPlans = [...plans.dataPlans];
  const slowUnlimited = [...plans.slowUnlimited];
  const fastUnlimited = [...plans.fastUnlimited];
  const dailyUnlimited = [...plans.dailyUnlimited];
  const smsCallEsim = [...(plans.smsCallEsim ?? [])];

  for (const plan of localPool) {
    const hasCallOrSms = Number(plan.call ?? 0) > 0 || Number(plan.sms ?? 0) > 0;
    if (hasCallOrSms) {
      smsCallEsim.push(plan);
      continue;
    }
    if (plan.isAbleMultidate) {
      // daily/unlimited bucket — pick by speed semantics if present
      const fup = (plan.fupSpeed || "").toLowerCase();
      if (fup.includes("mbps")) {
        if (Number(plan.dataMb) > 0) fastUnlimited.push(plan);
        else dailyUnlimited.push(plan);
      } else {
        slowUnlimited.push(plan);
      }
      continue;
    }
    dataPlans.push(plan);
  }

  return {
    dataPlans,
    slowUnlimited,
    fastUnlimited,
    dailyUnlimited,
    smsCallEsim,
    // localEsim no longer used as a tab; keep it empty so consumers don't double-render
    localEsim: [],
  };
}

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
  const { data: rawPlans = EMPTY_PLANS, isLoading } = planSource === "region" ? regionQuery : destQuery;

  // Local-inventory plans are folded into the standard groups (with provider badge).
  const plans = useMemo(() => mergeLocalInventory(rawPlans), [rawPlans]);

  // Server already sends the initial entity. Avoid duplicate detail fetches on first load.
  const regionDetailQuery = useRegionBySlug("", lang);
  const regionData = planSource === "region" ? initialRegion : (regionDetailQuery.data ?? null);

  const destinationDetailQuery = useDestinationBySlug("", lang);
  const destinationData = planSource === "destination" ? destination : (destinationDetailQuery.data ?? null);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [days, setDays] = useState(7);
  const [quantity, setQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState<PlanCategory>("data");
  const [ekycModalOpen, setEkycModalOpen] = useState(false);
  const desktopCtaRef = useRef<HTMLDivElement>(null);

  const hasSmsCallPlans = (plans.smsCallEsim?.length ?? 0) > 0;

  // Determine if the selected plan is a fixed-duration plan (dataPlans) — hides day selector
  const isFixed = useMemo(() => {
    if (!selectedPlan) return false;
    if (activeCategory !== "data") return true;
    return plans.dataPlans.some((p) => p.id === selectedPlan.id);
  }, [selectedPlan, plans, activeCategory]);

  // Flexible days when the selected GB group has any isAbleMultidate plan
  const isFlexibleDays = useMemo(() => {
    if (!selectedPlan) return false;
    if (activeCategory !== "data") return false;
    if (selectedPlan.isAbleMultidate) return true;
    if (plans.slowUnlimited.some((p) => p.id === selectedPlan.id)) {
      return hasMultidatePlan(plans.slowUnlimited, selectedPlan.dataMb);
    }
    if (plans.fastUnlimited.some((p) => p.id === selectedPlan.id)) {
      return hasMultidatePlan(plans.fastUnlimited, selectedPlan.dataMb);
    }
    return false;
  }, [selectedPlan, plans, activeCategory]);

  // Available days for non-flexible plans
  const availableDays = useMemo(() => {
    if (!selectedPlan) return [];
    if (activeCategory !== "data") return [];
    if (selectedPlan.isAbleMultidate) return [];
    if (plans.dataPlans.some((p) => p.id === selectedPlan.id)) {
      const matching = plans.dataPlans.filter((p) => p.dataMb === selectedPlan.dataMb);
      return Array.from(new Set(matching.map((p) => p.durationDays))).sort((a, b) => a - b);
    }
    if (plans.dailyUnlimited.some((p) => p.id === selectedPlan.id)) {
      const matching = plans.dailyUnlimited.filter((p) => p.fupSpeed === selectedPlan.fupSpeed);
      return Array.from(new Set(matching.map((p) => p.durationDays))).sort((a, b) => a - b);
    }
    if (plans.fastUnlimited.some((p) => p.id === selectedPlan.id)) {
      const matching = plans.fastUnlimited.filter((p) => p.dataMb === selectedPlan.dataMb && p.fupSpeed === selectedPlan.fupSpeed);
      return Array.from(new Set(matching.map((p) => p.durationDays))).sort((a, b) => a - b);
    }
    if (plans.slowUnlimited.some((p) => p.id === selectedPlan.id)) {
      const matching = plans.slowUnlimited.filter((p) => p.dataMb === selectedPlan.dataMb && p.fupSpeed === selectedPlan.fupSpeed);
      return Array.from(new Set(matching.map((p) => p.durationDays))).sort((a, b) => a - b);
    }
    return [];
  }, [selectedPlan, plans, activeCategory]);

  // Auto-select first plan when category changes or plans load
  useEffect(() => {
    if (activeCategory === "data") {
      if (!selectedPlan && plans) {
        const first = plans.dataPlans[0] || plans.fastUnlimited[0] || plans.slowUnlimited[0] || plans.dailyUnlimited[0];
        if (first) setSelectedPlan(first);
      }
    } else if (activeCategory === "smsCall") {
      const smsPlans = plans.smsCallEsim ?? [];
      if (smsPlans.length > 0) {
        setSelectedPlan(smsPlans[0]);
      }
    }
  }, [activeCategory, plans]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryChange = (category: PlanCategory) => {
    setActiveCategory(category);
    setSelectedPlan(null);
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    if (!plan.isAbleMultidate) {
      setDays(plan.durationDays);
    }
  };

  const hasAnyPlans =
    plans.dataPlans.length > 0 ||
    plans.fastUnlimited.length > 0 ||
    plans.slowUnlimited.length > 0 ||
    plans.dailyUnlimited.length > 0 ||
    hasSmsCallPlans;

  // Snap days to nearest available when switching between flexible/fixed
  useEffect(() => {
    if (!isFlexibleDays && availableDays.length > 0 && !availableDays.includes(days)) {
      const closest = availableDays.reduce((prev, curr) =>
        Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
      );
      setDays(closest);
    }
  }, [isFlexibleDays, availableDays, days]);

  // Build price label
  const planLabel = useMemo(() => {
    if (!selectedPlan) return "";
    if (isFixed) return `· ${selectedPlan.name}`;
    return `· ${selectedPlan.name} · ${days} ${dict.daysUnit.toLowerCase()}`;
  }, [selectedPlan, isFixed, days, dict]);

  const dataLabel = selectedPlan
    ? `${selectedPlan.dataMb >= 1024 ? `${parseFloat((selectedPlan.dataMb / 1024).toFixed(1))}GB` : `${selectedPlan.dataMb}MB`}/${dict.daysUnit.toLowerCase()}`
    : "1GB/ngày";

  // Compute GreenBox line1 based on plan category
  const greenBoxLine1 = useMemo(() => {
    if (!selectedPlan) return (dict.greenBox as any).line1?.replace("{data}", dataLabel).replace("{fupSpeed}", "384") || "";
    const fupSpeed = selectedPlan.fupSpeed || "1";

    if (plans.dataPlans.some((p) => p.id === selectedPlan.id)) {
      const template = (dict.greenBox as any).line1Fixed || (dict.greenBox as any).line1;
      const rawData = selectedPlan.dataMb >= 1024
        ? `${parseFloat((selectedPlan.dataMb / 1024).toFixed(1))}GB`
        : `${selectedPlan.dataMb}MB`;
      return template
        .replace("{data}", rawData)
        .replace("{days}", String(selectedPlan.durationDays))
        .replace("{fupSpeed}", fupSpeed);
    }
    if (plans.dailyUnlimited.some((p) => p.id === selectedPlan.id)) {
      const template = (dict.greenBox as any).line1UnlimitedHigh || (dict.greenBox as any).line1;
      return template.replace("{data}", dataLabel).replace("{fupSpeed}", fupSpeed);
    }
    if (plans.fastUnlimited.some((p) => p.id === selectedPlan.id)) {
      const template = (dict.greenBox as any).line1Fast || (dict.greenBox as any).line1;
      return template.replace("{data}", dataLabel).replace("{fupSpeed}", fupSpeed);
    }
    const template = (dict.greenBox as any).line1 || "";
    return template.replace("{data}", dataLabel).replace("{fupSpeed}", fupSpeed);
  }, [selectedPlan, plans, dataLabel, dict]);

  // KYC inline banner (shown next to the price block)
  const showInlineKyc = !!selectedPlan?.isKyc;

  return (
    <div className="bg-white overflow-x-hidden max-w-[100vw]">
      {/* ── MOBILE VIEW (≤840px) ── */}
      <div className="min-[841px]:hidden overflow-x-hidden max-w-full">
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
          greenBoxLine1={greenBoxLine1}
          region={regionData}
          destinationData={destinationData}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          hasSmsCallPlans={hasSmsCallPlans}
          onOpenEkyc={() => setEkycModalOpen(true)}
        />
      </div>

      {/* ── DESKTOP VIEW (>840px) ── */}
      <div className="hidden min-[841px]:block">
        <div className="max-w-[1168px] mx-auto px-6 pb-[60px] grid grid-cols-[465px_minmax(0,1fr)] gap-8 items-start max-[1100px]:grid-cols-2 max-[1100px]:px-5 max-[1100px]:gap-6">
          {/* ── LEFT COLUMN — connected ProductCard + DeviceChecker ── */}
          <div className="flex flex-col gap-4 min-w-0">
            {isLoading ? (
              <>
                <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse" />
                <div className="h-[180px] bg-gray-100 rounded-xl animate-pulse" />
              </>
            ) : (
              <>
                <ProductCard
                  destination={destinationData || destination}
                  dict={dict}
                  lang={lang}
                  planSource={planSource}
                  selectedPlan={selectedPlan}
                  region={regionData}
                  onOpenEkyc={() => setEkycModalOpen(true)}
                />
                <DeviceChecker dict={dict} lang={lang} />
              </>
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
            <GreenBox dict={dict} line1Html={greenBoxLine1} />

            {/* Inline KYC warning — clickable, opens the EkycModal */}
            {showInlineKyc && (
              <button
                type="button"
                onClick={() => setEkycModalOpen(true)}
                className="flex items-center gap-3 px-4 py-3 mb-[18px] w-full rounded-xl cursor-pointer transition-all hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(220,38,38,0.18)] font-[inherit] text-left border-[1.5px]"
                style={{
                  background: "linear-gradient(135deg, #FFF1F2, #FFF7ED)",
                  borderColor: "#FCA5A5",
                }}
              >
                <span
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #EF4444, #DC2626)",
                    boxShadow: "0 2px 6px rgba(220,38,38,0.3)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="9" cy="10" r="2" />
                    <path d="M3 20s1-3 6-3 6 3 6 3" />
                    <path d="M16 8h3M16 12h3" />
                  </svg>
                </span>
                <span className="flex-1">
                  <span className="block text-[13.5px] font-extrabold text-[#991B1B]">
                    {lang === "en"
                      ? "⚠ Identity verification required"
                      : "⚠ Bắt buộc xác thực danh tính"}
                  </span>
                  <span className="block text-xs text-[#B91C1C] mt-px">
                    {lang === "en"
                      ? "Tap to view detailed registration guide →"
                      : "Nhấn để xem hướng dẫn chi tiết đăng ký xác thực →"}
                  </span>
                </span>
                <span className="w-7 h-7 rounded-full bg-[#DC2626] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </button>
            )}

            {isLoading ? (
              <div className="py-4">
                <div className="h-[280px] bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : !hasAnyPlans ? (
              <div className="py-8 text-center text-sm text-[#6b7280]">{dict.noPlans}</div>
            ) : (
              <>
                {/* Category Tabs (Data / Data & SMS & Call) — Local Sim removed */}
                <CategoryTabs
                  activeCategory={activeCategory}
                  onCategoryChange={handleCategoryChange}
                  dict={dict}
                  hasSmsCallPlans={hasSmsCallPlans}
                />

                {activeCategory === "data" && (
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
                      selectedPlan={selectedPlan}
                    />
                  </>
                )}

                {activeCategory === "smsCall" && (
                  <>
                    <SimplePlanList
                      plans={plans.smsCallEsim ?? []}
                      selectedPlan={selectedPlan}
                      onSelectPlan={handleSelectPlan}
                      dict={dict}
                    />
                    <PlanConfig
                      days={days}
                      quantity={quantity}
                      onDaysChange={setDays}
                      onQuantityChange={setQuantity}
                      dict={dict}
                      lang={lang}
                      isFlexibleDays={false}
                      availableDays={[]}
                      isFixed={true}
                      selectedPlan={selectedPlan}
                    />
                  </>
                )}
              </>
            )}

            <div ref={desktopCtaRef}>
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

        {/* Desktop Sticky Bar */}
        <DesktopStickyBar
          selectedPlan={selectedPlan}
          days={days}
          quantity={quantity}
          isFixed={isFixed}
          dict={dict}
          lang={lang}
          destination={(destinationData || destination)?.name}
          planLabel={planLabel}
          onQuantityChange={setQuantity}
          ctaRef={desktopCtaRef}
        />
      </div>

      {/* eKYC modal — single instance shared by desktop banner + mobile inline */}
      <EkycModal open={ekycModalOpen} onClose={() => setEkycModalOpen(false)} lang={lang} />
    </div>
  );
}
