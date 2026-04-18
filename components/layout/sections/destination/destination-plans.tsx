"use client";

import { useState, useMemo } from "react";
import { Loader2, ChevronRight, Check, X, AlertTriangle, Star, ShieldCheck, Info, Clock } from "lucide-react";
import Link from "next/link";
import { usePlansByDestination, useExchangeRate, convertUsdToVnd, formatVnd } from "@/lib/hooks";
import type { Destination, Plan } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

interface DestinationPlansProps {
  destination: Destination;
  dict: Record<string, any>;
  lang: Locale;
}

function categorizePlans(plans: Plan[]) {
  const fixed: Plan[] = [];
  const daily: Plan[] = [];
  const unlimited: Plan[] = [];

  for (const plan of plans) {
    const dataGb = Number(plan.dataGb) || 0;
    const name = (plan.name || "").toLowerCase();

    if (dataGb >= 9999 || name.includes("unlimited") || name.includes("không giới hạn")) {
      unlimited.push(plan);
    } else if (name.includes("/ngày") || name.includes("/day") || name.includes("daily")) {
      daily.push(plan);
    } else {
      fixed.push(plan);
    }
  }

  return { fixed, daily, unlimited };
}

function PlanPill({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const dataGb = Number(plan.dataGb) || 0;
  const days = Number(plan.durationDays) || 0;
  const label = dataGb >= 9999
    ? `∞ – ${days} ngày`
    : `${dataGb} GB – ${days} ngày`;

  return (
    <button
      onClick={onSelect}
      className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
        isSelected
          ? "border-bg-dark bg-bg-dark text-white"
          : "border-border-secondary bg-white text-text-primary hover:border-border-focus"
      }`}
    >
      {label}
    </button>
  );
}

function UnlimitedPill({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const dataGb = Number(plan.dataGb) || 0;
  const label = dataGb >= 9999 ? "∞" : `${dataGb} GB`;

  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm border transition-all text-left ${
        isSelected
          ? "border-bg-dark bg-bg-dark text-white"
          : "border-border-secondary bg-white text-text-primary hover:border-border-focus"
      }`}
    >
      <span className="text-lg font-bold shrink-0">∞</span>
      <span className="w-px h-6 bg-current opacity-20 shrink-0" />
      <span className="flex flex-col">
        <span className="font-semibold">{label}/ngày tốc độ cao</span>
        <span className={`text-xs ${isSelected ? "text-white/70" : "text-text-tertiary"}`}>
          → 1 Mbps không giới hạn
        </span>
      </span>
    </button>
  );
}

function FeatureRow({ label, value, isYes }: { label: string; value: string; isYes: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-primary last:border-b-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`flex items-center gap-1.5 text-sm font-medium ${isYes ? "text-green-600" : "text-red-500"}`}>
        {isYes ? (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
            <Check className="w-3 h-3" />
          </span>
        ) : (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
            <X className="w-3 h-3" />
          </span>
        )}
        {value}
      </span>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-bg-dark" />
        <span className="text-sm font-bold text-text-primary uppercase tracking-wide">{title}</span>
      </div>
      <div className="bg-white rounded-xl border border-border-primary">
        {children}
      </div>
    </div>
  );
}

export function DestinationPlans({ destination, dict, lang }: DestinationPlansProps) {
  const { data: plans = [], isLoading } = usePlansByDestination(destination.id, lang);
  const { data: usdToVndRate = 25_500 } = useExchangeRate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [days, setDays] = useState(2);
  const [quantity, setQuantity] = useState(1);
  const [countriesOpen, setCountriesOpen] = useState(false);

  const { fixed, daily, unlimited } = useMemo(() => categorizePlans(plans), [plans]);

  // Auto-select first plan
  const activePlan = selectedPlan || daily[0] || fixed[0] || unlimited[0] || null;

  const priceUsd = activePlan ? Number(activePlan.price) || 0 : 0;
  const retailPriceUsd = activePlan ? Number(activePlan.retailPrice) || 0 : 0;
  const totalPriceVnd = convertUsdToVnd(priceUsd * days * quantity, usdToVndRate);
  const totalRetailVnd = convertUsdToVnd(retailPriceUsd * days * quantity, usdToVndRate);
  const savePercent = retailPriceUsd > priceUsd
    ? Math.round(((retailPriceUsd - priceUsd) / retailPriceUsd) * 100)
    : 0;

  const dayOptions = [2, 7, 10, 15, 30];

  const handleBuy = () => {
    if (!activePlan) return;
    window.location.href = `/${lang}/payment/result?planId=${activePlan.id}&destinationId=${destination.id}&days=${days}&qty=${quantity}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div className="lg:col-span-7">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#ffd89b] via-[#ffb88a] to-[#ff9a8b] h-48 sm:h-56 mb-6">
              {destination.avatarUrl ? (
                <img
                  src={destination.avatarUrl}
                  alt={destination.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {destination.flagUrl && (
                    <img
                      src={destination.flagUrl}
                      alt={destination.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                    />
                  )}
                </div>
              )}
              {/* Hero tag */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Check className="w-3 h-3" />
                {dict.heroTag}
              </div>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
              {dict.title.replace("{destination}", destination.name)}
            </h1>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              {dict.subtitle.replace("{destination}", destination.name)}
            </p>

            {/* Country expand row */}
            {destination.description && (
              <div>
                <button
                  onClick={() => setCountriesOpen(!countriesOpen)}
                  className="flex items-center gap-2 w-full py-3 text-sm"
                >
                  <span className="text-blue-600 font-medium hover:underline">
                    {dict.viewCountries.replace("{count}", "18")}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-text-tertiary transition-transform ${countriesOpen ? "rotate-90" : ""}`} />
                </button>
                {countriesOpen && (
                  <div className="bg-white rounded-xl border border-border-primary p-4 mb-4">
                    <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">
                      {dict.supportedCountries.replace("{count}", "18")}
                    </p>
                    <p className="text-sm text-text-secondary">{destination.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Carriers */}
            <InfoBlock title={dict.carriers.title}>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-text-secondary">{dict.carriers.domestic}</span>
                <div className="flex gap-2 flex-wrap justify-end">
                  <span className="text-xs bg-bg-secondary px-2.5 py-1 rounded-full font-medium">4G/5G</span>
                </div>
              </div>
            </InfoBlock>

            {/* Features */}
            <InfoBlock title={dict.features.title}>
              <div className="px-4">
                <FeatureRow label={dict.features.hotspot} value={dict.features.yes} isYes={true} />
                <FeatureRow label={dict.features.calls} value={dict.features.no} isYes={false} />
                <FeatureRow label={dict.features.localNumber} value={dict.features.no} isYes={false} />
                <FeatureRow label={dict.features.ekyc} value={dict.features.no} isYes={false} />
                <FeatureRow label={dict.features.topup} value={dict.features.yes} isYes={true} />
              </div>
            </InfoBlock>

            {/* Delivery & Activation */}
            <InfoBlock title={dict.delivery.title}>
              <div className="px-4">
                <div className="flex items-center justify-between py-3 border-b border-border-primary">
                  <span className="text-sm text-text-secondary">{dict.delivery.deliveryTime}</span>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {dict.delivery.instant}
                    </span>
                    <span className="text-xs text-text-tertiary">{dict.delivery.instantDesc}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-text-secondary">{dict.delivery.activationPeriod}</span>
                  <span className="text-sm text-text-primary">{dict.delivery.activationDesc}</span>
                </div>
              </div>
            </InfoBlock>

            {/* Note */}
            <div className="mt-6 flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>{dict.note.title}</strong> {dict.note.text}
              </p>
            </div>
          </div>

          {/* ═══════════ RIGHT COLUMN ═══════════ */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-border-primary p-6 shadow-sm">

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 text-text-tertiary animate-spin" />
                  </div>
                ) : plans.length === 0 ? (
                  <p className="text-center text-text-tertiary py-8">{dict.noPlans}</p>
                ) : (
                  <>
                    {/* Price display */}
                    {activePlan && (
                      <div className="mb-5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-text-primary">
                            {formatVnd(totalPriceVnd)}
                          </span>
                          {savePercent > 0 && (
                            <>
                              <span className="text-sm text-text-tertiary line-through">
                                {formatVnd(totalRetailVnd)}
                              </span>
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                {dict.save.replace("{percent}", String(savePercent))}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary mt-1">
                          · {activePlan.name} · {days} {dict.daysUnit}
                        </p>
                      </div>
                    )}

                    {/* Green feature box */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 space-y-2.5">
                      {[
                        { text: activePlan ? `${Number(activePlan.dataGb)}GB/ngày tốc độ cao` : "" },
                        { text: dict.heroTag },
                        { text: dict.features.hotspot },
                      ].filter(f => f.text).map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-green-800">
                          <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                          <span>{f.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Plan type tabs */}
                    <div className="flex gap-1 p-1 bg-bg-secondary rounded-full mb-5">
                      <button className="flex-1 py-2 text-xs font-semibold rounded-full bg-bg-dark text-white text-center">
                        {dict.planTabs.data}
                      </button>
                      <button className="flex-1 py-2 text-xs font-medium rounded-full text-text-tertiary text-center hover:text-text-primary">
                        {dict.planTabs.dataCalls}
                      </button>
                    </div>

                    {/* Fixed plans */}
                    {fixed.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">
                          {dict.planSections.fixed}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {fixed.map((plan) => (
                            <PlanPill
                              key={plan.id}
                              plan={plan}
                              isSelected={activePlan?.id === plan.id}
                              onSelect={() => setSelectedPlan(plan)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Daily plans */}
                    {daily.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">
                          {dict.planSections.daily}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {daily.map((plan) => (
                            <PlanPill
                              key={plan.id}
                              plan={plan}
                              isSelected={activePlan?.id === plan.id}
                              onSelect={() => setSelectedPlan(plan)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unlimited plans */}
                    {unlimited.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">
                          {dict.planSections.unlimited}
                        </p>
                        <div className="flex flex-col gap-2">
                          {unlimited.map((plan) => (
                            <UnlimitedPill
                              key={plan.id}
                              plan={plan}
                              isSelected={activePlan?.id === plan.id}
                              onSelect={() => setSelectedPlan(plan)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="h-px bg-border-primary my-5" />

                    {/* Days & Quantity config */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Days */}
                      <div>
                        <p className="text-xs font-semibold text-text-primary mb-2">{dict.daysLabel}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {dayOptions.map((d) => (
                            <button
                              key={d}
                              onClick={() => setDays(d)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                days === d
                                  ? "border-bg-dark bg-bg-dark text-white"
                                  : "border-border-secondary bg-white text-text-primary hover:border-border-focus"
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <p className="text-xs font-semibold text-text-primary mb-2">{dict.quantity}</p>
                        <div className="flex items-center border border-border-secondary rounded-lg overflow-hidden">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-sm font-medium text-text-primary">
                            {quantity} {dict.esimUnit}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3 py-2 text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleBuy}
                        disabled={!activePlan}
                        className="w-full py-3.5 rounded-full bg-bg-dark text-white text-sm font-bold transition-colors hover:bg-bg-brand-black active:opacity-90 disabled:opacity-50"
                      >
                        {dict.buyNow} — {formatVnd(totalPriceVnd)}
                      </button>
                      <button className="w-full py-3 rounded-full border-2 border-bg-dark text-text-primary text-sm font-semibold transition-colors hover:bg-bg-secondary">
                        {dict.addToCart}
                      </button>
                    </div>

                    {/* Trust row */}
                    <div className="flex items-center justify-center gap-6 mt-5 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {dict.trust.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        {dict.trust.secure}
                      </span>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex gap-2 mt-5 text-xs text-text-tertiary">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <p>
                        {dict.disclaimer}{" "}
                        <Link
                          href={`/${lang}/esim-supported-devices`}
                          className="text-blue-600 hover:underline"
                        >
                          {dict.disclaimerLink}
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
