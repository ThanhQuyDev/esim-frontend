"use client";

import { useState, useMemo, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { differenceInDays, addDays, eachDayOfInterval } from "date-fns";
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

export function CalendarPicker({
  days,
  onDaysChange,
  dict,
  lang,
  defaultOpen = false,
}: CalendarPickerProps & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  const locale = lang === "vi" ? vi : enUS;
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Selected end date (user picks this)
  const [endDate, setEndDate] = useState<Date>(() => addDays(today, days));

  // Sync endDate when days prop changes externally (quick day pills)
  useEffect(() => {
    setEndDate(addDays(today, days));
  }, [days, today]);

  // Highlight range from today to endDate
  const highlightedDays = useMemo(() => {
    if (!endDate) return [];
    return eachDayOfInterval({ start: addDays(today, 1), end: endDate });
  }, [today, endDate]);

  const handleSelect = (selected: Date | undefined) => {
    if (!selected) return;
    const diff = differenceInDays(selected, today);
    if (diff > 0) {
      setEndDate(selected);
    }
  };

  const handleConfirm = () => {
    const diff = differenceInDays(endDate, today);
    if (diff > 0) {
      onDaysChange(diff);
    }
    setOpen(false);
  };

  const selectedDays = differenceInDays(endDate, today);

  const rangeText = `${today.toLocaleDateString(lang)} → ${endDate.toLocaleDateString(lang)} (${selectedDays} ${dict.daysUnit.toLowerCase()})`;

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
          <div className="text-xs text-[#6b7280] mb-2 text-center">
            {dict.calSelectEnd}
          </div>
          <DayPicker
            mode="single"
            selected={endDate}
            onSelect={handleSelect}
            locale={locale}
            disabled={{ before: addDays(today, 1) }}
            showOutsideDays
            today={today}
            modifiers={{ highlighted: highlightedDays }}
            modifiersStyles={{
              highlighted: { backgroundColor: "#fef9c3", color: "#854d0e", borderRadius: "50%" },
              today: { color: "#d97706", fontWeight: "bold" },
              selected: { backgroundColor: "#1a1a1a", color: "#fff", fontWeight: "bold", borderRadius: "50%" },
            }}
            styles={{
              month_grid: { borderCollapse: "separate", borderSpacing: "2px", width: "100%" },
              day: { width: "36px", height: "36px", textAlign: "center" as const, padding: 0 },
              day_button: {
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
                background: "transparent",
              },
              weekday: { fontSize: "12px", fontWeight: 600, color: "#6b7280", padding: "4px 0" },
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
              {dict.calConfirm} {selectedDays > 0 && `(${selectedDays} ${dict.daysUnit.toLowerCase()})`}
            </button>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
