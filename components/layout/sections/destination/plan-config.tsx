"use client";

import type { DestinationDict } from "./types";
import { LazyCalendarPicker } from "./calendar-picker-lazy";

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
  const showDaysSelector = !isFixed;
  const dayOptions = isFlexibleDays ? QUICK_DAYS : availableDays;

  return (
    <div className="mb-5">
      {/* Step 2 label */}
      <div className="text-[15px] font-bold text-[#111] mb-2.5 flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-[#111] text-white rounded-full text-xs font-extrabold shrink-0">2</span>
        {dict.daysLabel ? dict.daysLabel.replace(/^\d+\.\s*/, "") : "Tùy chọn của bạn"}
      </div>

      <div className="grid grid-cols-2 gap-5 items-start mb-3.5">
        {/* Days selector */}
        {showDaysSelector && (
          <div>
            <label className="text-xs font-bold tracking-[0.07em] uppercase block mb-2">{dict.daysLabel}</label>
            <div className="flex items-center justify-between px-1 border-[1.5px] border-[#e5e7eb] rounded-[30px] cursor-pointer bg-white h-[42px] transition-colors hover:border-[#9ca3af]">
              <span className="w-9 h-9 shrink-0" />
              <span className="flex-1 text-center text-sm font-semibold">
                {days} {dict.daysUnit}
              </span>
              {isFlexibleDays ? (
                <LazyCalendarPicker days={days} onDaysChange={onDaysChange} dict={dict} lang={lang} />
              ) : (
                <span className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer m-[3px] transition-colors hover:bg-[#e5e7eb] shrink-0">
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="10" rx="1.5" stroke="#111" strokeWidth="1.3" />
                    <path d="M4 1v3M10 1v3M1 7h12" stroke="#111" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quantity stepper */}
        <div>
          <label className="text-xs font-bold tracking-[0.07em] uppercase block mb-2">{dict.quantity}</label>
          <div className="flex items-center border-[1.5px] border-[#e5e7eb] rounded-[30px] h-[42px]">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-9 h-9 border-none rounded-full bg-[#f9fafb] text-lg font-semibold cursor-pointer flex items-center justify-center font-[inherit] text-[#111] mx-[3px] shrink-0 transition-colors hover:bg-[#e5e7eb] active:bg-[#c8ccd1]"
            >
              −
            </button>
            <span className="text-sm font-semibold flex-1 text-center">
              {quantity} {dict.esimUnit}
            </span>
            <button
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
              onClick={() => onDaysChange(d)}
              className={`h-[34px] min-w-[34px] px-[11px] flex items-center justify-center border-[1.5px] rounded-full text-xs font-semibold cursor-pointer font-[inherit] transition-colors ${
                days === d
                  ? "border-[#F5C518] bg-[#FEF9E7] text-[#111]"
                  : "border-[#e5e7eb] bg-white text-[#374151] hover:border-[#111] active:bg-[#fde68a] active:border-[#d97706]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
