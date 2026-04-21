"use client";

import type { DestinationDict } from "./types";
import { CalendarPicker } from "./calendar-picker";

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
}

const QUICK_DAYS = [3, 5, 7, 10, 15, 20, 30, 180, 365];

export function PlanConfig({ days, quantity, onDaysChange, onQuantityChange, dict, lang, isFlexibleDays, availableDays, isFixed }: PlanConfigProps) {
  // For fixed plans (dataPlans, dailyUnlimited), don't show days selector at all
  const showDaysSelector = !isFixed;

  // Day pills: flexible → QUICK_DAYS, fixed → only availableDays
  const dayOptions = isFlexibleDays ? QUICK_DAYS : availableDays;

  return (
    <div className="grid grid-cols-2 gap-4 mb-4 items-start max-[540px]:grid-cols-1">
      {/* Days selector — only for non-fixed plans */}
      {showDaysSelector && (
        <div>
          <div className="text-[13px] font-semibold text-[#374151] mb-1.5">{dict.daysLabel}</div>
          <div className="flex items-stretch border border-[#e5e7eb] rounded-lg overflow-hidden h-9">
            <div className="flex-1 text-center text-[13.5px] font-semibold text-[#1a1a1a] flex items-center justify-center px-2">
              {days} {dict.daysUnit}
            </div>
            {/* Calendar picker only for flexible (isAbleMultidate) plans */}
            {isFlexibleDays && (
              <CalendarPicker days={days} onDaysChange={onDaysChange} dict={dict} lang={lang} />
            )}
          </div>
          {/* Day pills */}
          <div className="flex gap-[5px] mt-1.5 overflow-x-auto scrollbar-hide flex-nowrap w-full">
            {dayOptions.map((d) => (
              <button
                key={d}
                onClick={() => onDaysChange(d)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors whitespace-nowrap ${
                  days === d
                    ? "bg-[#fff7d6] text-[#854d0e] border-[#f5c400] font-semibold"
                    : "bg-white text-[#374151] border-[#e5e7eb] hover:border-[#f5c400] hover:bg-[#fffde7]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity stepper */}
      <div>
        <div className="text-[13px] font-semibold text-[#374151] mb-1.5">{dict.quantity}</div>
        <div className="flex items-stretch border border-[#e5e7eb] rounded-lg overflow-hidden h-9">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-9 flex items-center justify-center bg-[#f9fafb] border-none cursor-pointer text-xl font-medium text-[#1a1a1a] shrink-0 border-r border-[#e5e7eb] hover:bg-[#f0f0f0] transition-colors"
          >
            −
          </button>
          <div className="flex-1 text-center text-[13.5px] font-semibold text-[#1a1a1a] flex items-center justify-center">
            {quantity} {dict.esimUnit}
          </div>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-9 flex items-center justify-center bg-[#f9fafb] border-none cursor-pointer text-xl font-medium text-[#1a1a1a] shrink-0 border-l border-[#e5e7eb] hover:bg-[#f0f0f0] transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
