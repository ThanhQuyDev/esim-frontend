"use client";

import { useState } from "react";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "./types";
import { calcTotalVndPrice, getFixedVndPrice } from "./types";
import { CalendarModal } from "./calendar-modal";

interface PlanConfigProps {
  days: number;
  quantity: number;
  onDaysChange: (d: number) => void;
  onQuantityChange: (q: number) => void;
  dict: DestinationDict;
  lang: string;
  isFlexibleDays: boolean;
  availableDays: number[];
  isFixed: boolean;
  /** Selected plan — used to compute the calendar modal's price summary. */
  selectedPlan?: Plan | null;
}

const QUICK_DAYS = [3, 5, 7, 10, 15, 20, 30, 180, 365];

export function PlanConfig({
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
}: PlanConfigProps) {
  const [calOpen, setCalOpen] = useState(false);
  const showDaysSelector = !isFixed;
  const dayOptions = isFlexibleDays ? QUICK_DAYS : availableDays;

  // Per-day VND used by the calendar modal's bottom summary.
  // For flexible (multidate) plans the price is per day already; otherwise we
  // approximate with current totalPrice / current days.
  const unitVndPricePerDay = (() => {
    if (!selectedPlan) return 0;
    if (isFixed) return getFixedVndPrice(selectedPlan) / Math.max(1, selectedPlan.durationDays);
    if (isFlexibleDays) return calcTotalVndPrice(selectedPlan, 1);
    return calcTotalVndPrice(selectedPlan, days) / Math.max(1, days);
  })();

  return (
    <div className="my-5 border-t border-[#e5e7eb] pt-5">
      {/* Step 2 label */}
      <div className="text-[15px] font-bold text-[#111] mb-2.5 flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-[#111] text-white rounded-full text-xs font-extrabold shrink-0">2</span>
        {lang === "en" ? "Your options" : "Tùy chọn của bạn"}
      </div>

      <div className="grid grid-cols-2 gap-5 items-start mb-3.5">
        {/* Days selector */}
        {showDaysSelector && (
          <div>
            <label className="text-xs font-bold tracking-[0.07em] uppercase block mb-2">{dict.daysLabel}</label>
            <button
              type="button"
              onClick={() => isFlexibleDays && setCalOpen(true)}
              disabled={!isFlexibleDays}
              className={`w-full flex items-center justify-between px-1 border-[1.5px] border-[#e5e7eb] rounded-[30px] bg-white h-[42px] transition-colors ${isFlexibleDays ? "cursor-pointer hover:border-[#9ca3af]" : "cursor-default"}`}
            >
              <span className="w-9 h-9 shrink-0" />
              <span className="flex-1 text-center text-sm font-semibold">
                {days} {dict.daysUnit}
              </span>
              <span className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer m-[3px] transition-colors hover:bg-[#e5e7eb] shrink-0">
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="12" height="10" rx="1.5" stroke="#111" strokeWidth="1.3" />
                  <path d="M4 1v3M10 1v3M1 7h12" stroke="#111" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* Quantity stepper */}
        <div>
          <label className="text-xs font-bold tracking-[0.07em] uppercase block mb-2">{dict.quantity}</label>
          <div className="flex items-center border-[1.5px] border-[#e5e7eb] rounded-[30px] h-[42px]">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-9 h-9 border-none rounded-full bg-[#f9fafb] text-lg font-semibold cursor-pointer flex items-center justify-center font-[inherit] text-[#111] mx-[3px] shrink-0 transition-colors hover:bg-[#e5e7eb] active:bg-[#c8ccd1]"
            >
              −
            </button>
            <span className="text-sm font-semibold flex-1 text-center">
              {quantity} {dict.esimUnit}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-9 h-9 border-none rounded-full bg-[#f9fafb] text-lg font-semibold cursor-pointer flex items-center justify-center font-[inherit] text-[#111] mx-[3px] shrink-0 transition-colors hover:bg-[#e5e7eb] active:bg-[#c8ccd1]"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Day chips — below the grid */}
      {showDaysSelector && (
        <div className="flex gap-[7px] flex-wrap">
          {dayOptions.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDaysChange(d)}
              className={`h-[34px] min-w-[34px] px-[11px] flex items-center justify-center border-[1.5px] rounded-full text-xs font-semibold cursor-pointer font-[inherit] transition-colors ${
                days === d
                  ? "border-[#F5C518] bg-[#FEF9E7] text-[#111]"
                  : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#111]"
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
