"use client";

import type { DestinationDict } from "../types";
import { CalendarPicker } from "../calendar-picker";

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
}: MobilePlanConfigProps) {
  const showDaysSelector = !isFixed;
  const dayOptions = isFlexibleDays ? QUICK_DAYS : availableDays;

  return (
    <div className="px-4 py-[18px] border-t-[7px] border-[#f3f4f6]">
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
          2
        </span>
        <span className="text-[15px] font-bold text-[#1a1a1a]">
          {dict.daysLabel ? dict.daysLabel.replace(/^\d+\.\s*/, "") : "Tùy chọn của bạn"}
        </span>
      </div>

      {/* Grid: Days + Quantity */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        {/* Days selector */}
        {showDaysSelector && (
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.07em] text-[#6b7280] mb-[9px]">
              {dict.daysLabel}
            </div>
            <div className="flex items-center justify-between px-1 border-[1.5px] border-[#e5e7eb] rounded-[30px] h-[50px] cursor-pointer">
              <span className="w-[38px] shrink-0" />
              <span className="flex-1 text-center text-[15px] font-semibold">
                {days} {dict.daysUnit}
              </span>
              {isFlexibleDays ? (
                <CalendarPicker days={days} onDaysChange={onDaysChange} dict={dict} lang={lang} />
              ) : (
                <span className="w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0">
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="#374151" strokeWidth="1.4" />
                    <path d="M5 1.5v3M11 1.5v3M1.5 7.5h13" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quantity stepper */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.07em] text-[#6b7280] mb-[9px]">
            {dict.quantity}
          </div>
          <div className="flex items-center justify-between border-[1.5px] border-[#e5e7eb] rounded-[30px] h-[50px] px-1">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 border-none rounded-full bg-[#f9fafb] text-[22px] font-semibold cursor-pointer flex items-center justify-center font-[inherit] text-[#1a1a1a] shrink-0 transition-colors active:bg-[#c8ccd1]"
            >
              −
            </button>
            <span className="text-[15px] font-semibold flex-1 text-center">
              {quantity} {dict.esimUnit}
            </span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-10 h-10 border-none rounded-full bg-[#f9fafb] text-[22px] font-semibold cursor-pointer flex items-center justify-center font-[inherit] text-[#1a1a1a] shrink-0 transition-colors active:bg-[#c8ccd1]"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Day chips */}
      {showDaysSelector && dayOptions.length > 0 && (
        <div className="flex gap-[7px] flex-wrap mb-5">
          {dayOptions.map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={`h-[38px] min-w-[38px] px-[11px] flex items-center justify-center border-[1.5px] rounded-[30px] text-sm font-semibold cursor-pointer font-[inherit] transition-colors ${
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
    </div>
  );
}
