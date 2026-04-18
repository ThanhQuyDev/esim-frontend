"use client";

import { Wifi, Calendar, Zap, RefreshCw } from "lucide-react";
import type { Plan } from "@/lib/api";
import { useExchangeRate, convertUsdToVnd, formatVnd } from "@/lib/hooks";

interface PlanCardProps {
  plan: Plan;
  dict: Record<string, any>;
  isCheapest?: boolean;
  onBuy: (plan: Plan) => void;
}

export function PlanCard({ plan, dict, isCheapest, onBuy }: PlanCardProps) {
  const { data: usdToVndRate = 25_500 } = useExchangeRate();

  const priceUsd = Number(plan.price) || 0;
  const retailPriceUsd = Number(plan.retailPrice) || 0;
  const dataGb = Number(plan.dataGb) || 0;
  const durationDays = Number(plan.durationDays) || 1;

  const priceVnd = convertUsdToVnd(priceUsd, usdToVndRate);
  const retailPriceVnd = convertUsdToVnd(retailPriceUsd, usdToVndRate);

  const savePercent =
    retailPriceUsd > priceUsd
      ? Math.round(((retailPriceUsd - priceUsd) / retailPriceUsd) * 100)
      : 0;

  const dataLabel =
    dataGb >= 9999 ? dict.unlimited : `${dataGb} GB`;

  const daysLabel =
    durationDays === 1
      ? `1 ${dict.day}`
      : `${durationDays} ${dict.days}`;

  const pricePerDayVnd = convertUsdToVnd(priceUsd / durationDays, usdToVndRate);

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-shadow hover:shadow-lg ${
        isCheapest
          ? "border-bg-accent bg-white ring-2 ring-bg-accent"
          : "border-border-primary bg-white"
      }`}
    >
      {/* Badges */}
      {(isCheapest || plan.topUp) && (
        <div className="flex gap-2 px-5 pt-4">
          {isCheapest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bg-accent px-3 py-1 text-xs font-semibold text-text-primary">
              <Zap className="h-3 w-3" />
              {dict.bestValue}
            </span>
          )}
          {plan.topUp && (
            <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary px-3 py-1 text-xs font-medium text-text-secondary">
              <RefreshCw className="h-3 w-3" />
              {dict.topUp}
            </span>
          )}
        </div>
      )}

      {/* Plan details */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        {/* Data */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary">
            <Wifi className="h-5 w-5 text-text-primary" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary">{dict.data}</p>
            <p className="text-lg font-bold text-text-primary">{dataLabel}</p>
          </div>
        </div>

        {/* Validity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary">
            <Calendar className="h-5 w-5 text-text-primary" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary">{dict.validity}</p>
            <p className="text-lg font-bold text-text-primary">{daysLabel}</p>
          </div>
        </div>

        {/* Price */}
        <div className="mt-auto pt-4 border-t border-border-primary">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-text-primary">
              {formatVnd(priceVnd)}
            </span>
            {savePercent > 0 && (
              <>
                <span className="text-sm text-text-tertiary line-through">
                  {formatVnd(retailPriceVnd)}
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  {dict.totalSave.replace("{percent}", String(savePercent))}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-text-tertiary">
            {formatVnd(pricePerDayVnd)}
            {dict.perDay}
          </p>
        </div>
      </div>

      {/* Buy button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onBuy(plan)}
          className="w-full rounded-full bg-bg-dark py-3 text-sm font-semibold text-text-primary-on-color transition-colors hover:bg-bg-brand-black active:opacity-90"
        >
          {dict.buyNow}
        </button>
      </div>
    </div>
  );
}
