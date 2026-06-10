"use client";

import { useState } from "react";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "../types";
import { calcTotalVndPrice, getFixedVndPrice } from "../types";
import { CalendarModal } from "../calendar-modal";

interface MobilePlanConfigProps {
  days: number;
  quantity: number;
  onDaysChange: (d: number) => void;
  onQuantityChange: (q: number) => void;
  dict: DestinationDict;
  lang: string;
  isFlexibleDays: boolean;
  availableDays: number[];
  isFixed: boolean;
  selectedPlan?: Plan | null;
}

const QUICK_DAYS = [3, 5, 7, 10, 15, 20, 30, 180, 365];

export function MobilePlanConfig({
  days,
  quantity,
  onDaysChange,
  onQuantityChange,
  dict,
  lang,
  isFlexibleDays,
  availableDays,
  isFixed,
  selectedPlan,
}: MobilePlanConfigProps) {
  const [calOpen, setCalOpen] = useState(false);
  const dayOptions = isFlexibleDays ? QUICK_DAYS : availableDays;
  const isLocalEsim = selectedPlan?.isLocalInventory 

  const unitVndPricePerDay = (() => {
    if (!selectedPlan) return 0;
    if (isFixed) return getFixedVndPrice(selectedPlan) / Math.max(1, selectedPlan.durationDays);
    if (isFlexibleDays) return calcTotalVndPrice(selectedPlan, 1);
    return calcTotalVndPrice(selectedPlan, days) / Math.max(1, days);
  })();

  return (
    <div className="px-4 py-[18px] border-t-[7px] border-[#f3f4f6]">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-sm font-extrabold flex items-center justify-center shrink-0">
          2
        </span>
        <span className="text-base font-medium text-[#1a1a1a]">
          {lang === "en" ? "Your options" : "Tùy chọn của bạn"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.07em] text-[#6b7280] mb-[9px]">
            {dict.daysLabel}
          </div>
          <button
            type="button"
            onClick={() => isFlexibleDays && setCalOpen(true)}
            disabled={isFixed || !isFlexibleDays}
            className={`w-full flex items-center justify-between px-1 border rounded-[30px] h-[50px] ${
              isFixed
                ? "border-[#e5e7eb] bg-[#f9fafb] cursor-not-allowed opacity-60"
                : isFlexibleDays
                  ? "border-[#e5e7eb] cursor-pointer"
                  : "border-[#e5e7eb] bg-[#f9fafb] cursor-default"
            }`}
          >
            <span className="w-[38px] shrink-0" />
            <span className="flex-1 text-center text-base font-semibold">
              {days} {dict.daysUnit}
            </span>
            <span className={`w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 ${
              isFixed || !isFlexibleDays ? "opacity-40" : ""
            }`}>
              <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="#374151" strokeWidth="1.4" />
                <path d="M5 1.5v3M11 1.5v3M1.5 7.5h13" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        </div>

        <div>
          <div className="text-sm font-medium uppercase tracking-[0.07em] text-[#6b7280] mb-[9px]">
            {dict.quantity}
          </div>
          <div className="flex items-center justify-between border border-[#e5e7eb] rounded-[30px] h-[50px] px-1">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 border-none rounded-full bg-[#f9fafb] text-[22px] font-semibold cursor-pointer flex items-center justify-center font-[inherit] text-[#1a1a1a] shrink-0 transition-colors active:bg-[#c8ccd1]"
            >
              −
            </button>
            <span className="text-base font-semibold flex-1 text-center">
              {quantity} {dict.esimUnit}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 border-none rounded-full bg-[#f9fafb] text-[22px] font-semibold cursor-pointer flex items-center justify-center font-[inherit] text-[#1a1a1a] shrink-0 transition-colors active:bg-[#c8ccd1]"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {(!isFixed || isLocalEsim) && dayOptions.length > 0 && (
        <div className="flex gap-[7px] flex-wrap mb-5">
          {dayOptions.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDaysChange(d)}
              className={`h-[38px] min-w-[38px] px-[11px] flex items-center justify-center border rounded-[30px] text-base font-semibold cursor-pointer font-[inherit] transition-colors ${
                days === d
                  ? "border-[#F5C518] bg-[#FEF9E7] text-[#1a1a1a]"
                  : "border-[#e5e7eb] bg-white text-[#374151] active:bg-[#fde68a] active:border-[#d97706]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {isFlexibleDays && (
        <CalendarModal
          open={calOpen}
          onClose={() => setCalOpen(false)}
          initialDays={days}
          onConfirm={(d) => onDaysChange(d)}
          unitVndPricePerDay={unitVndPricePerDay}
          quantity={quantity}
          lang={lang}
        />
      )}
    </div>
  );
}
