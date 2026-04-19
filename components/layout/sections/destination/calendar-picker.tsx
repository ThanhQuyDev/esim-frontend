"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { differenceInDays } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import * as Popover from "@radix-ui/react-popover";
import type { DestinationDict } from "./types";
import "react-day-picker/style.css";

interface CalendarPickerProps {
  days: number;
  onDaysChange: (d: number) => void;
  dict: DestinationDict;
  lang: string;
}

export function CalendarPicker({ days, onDaysChange, dict, lang }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});

  const locale = lang === "vi" ? vi : enUS;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSelect = (selected: { from?: Date; to?: Date } | undefined) => {
    if (!selected) return;
    setRange(selected);
  };

  const handleConfirm = () => {
    if (range.from && range.to) {
      const diff = differenceInDays(range.to, range.from);
      if (diff > 0) onDaysChange(diff);
    }
    setOpen(false);
  };

  const rangeText =
    range.from && range.to
      ? `${range.from.toLocaleDateString(lang)} → ${range.to.toLocaleDateString(lang)} (${differenceInDays(range.to, range.from)} ${dict.daysUnit.toLowerCase()})`
      : dict.calSelectStart;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="w-9 flex items-center justify-center bg-[#f9fafb] border-l border-[#e5e7eb] cursor-pointer hover:bg-[#f0f0f0] transition-colors shrink-0"
          title={dict.calSelectStart}
          aria-label={dict.calSelectStart}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="3" width="12" height="10" rx="1.5" stroke="#9ca3af" strokeWidth="1.2" />
            <path d="M4 1v3M10 1v3M1 7h12" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white rounded-[14px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[300] w-[340px]"
          sideOffset={8}
          align="end"
        >
          <DayPicker
            mode="range"
            selected={range.from && range.to ? { from: range.from, to: range.to } : undefined}
            onSelect={handleSelect as any}
            locale={locale}
            disabled={{ before: today }}
            showOutsideDays
            classNames={{
              root: "text-sm",
              day: "w-9 h-9 rounded-full text-[13px] font-medium text-[#374151] hover:bg-[#f0f0f0] flex items-center justify-center cursor-pointer",
              today: "text-[#d97706] font-bold",
              selected: "bg-[#1a1a1a] text-white font-bold",
              range_middle: "bg-[#fef08a] text-[#854d0e]",
              chevron: "text-[#374151]",
            }}
          />
          <div className="text-xs text-[#6b7280] mt-2.5 text-center min-h-4">{rangeText}</div>
          <div className="flex gap-2 mt-3.5 justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer bg-transparent border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
            >
              {dict.calClose}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer bg-[#fff500] border-[1.5px] border-[#d1b700] text-black hover:bg-[#d1b700] transition-colors"
            >
              {dict.calConfirm}
            </button>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
