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

type SelectionStep = "start" | "end";

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

  // Two-step selection: start date then end date
  const [step, setStep] = useState<SelectionStep>("start");
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(() => addDays(today, days));

  // Sync when days prop changes externally (quick day pills)
  useEffect(() => {
    setStartDate(today);
    setEndDate(addDays(today, days));
  }, [days, today]);

  // Reset step when popover opens
  useEffect(() => {
    if (open) {
      setStep("start");
    }
  }, [open]);

  // Highlight range between start and end
  const highlightedDays = useMemo(() => {
    if (!startDate || !endDate || endDate <= startDate) return [];
    return eachDayOfInterval({ start: addDays(startDate, 1), end: addDays(endDate, -1) });
  }, [startDate, endDate]);

  const handleSelect = (selected: Date | undefined) => {
    if (!selected) return;

    if (step === "start") {
      // Selecting start date
      setStartDate(selected);
      // Reset end date to start + current days
      setEndDate(addDays(selected, days));
      setStep("end");
    } else {
      // Selecting end date — must be after start date
      if (selected > startDate) {
        setEndDate(selected);
      }
    }
  };

  const handleConfirm = () => {
    const diff = differenceInDays(endDate, startDate);
    if (diff > 0) {
      onDaysChange(diff);
    }
    setOpen(false);
  };

  const selectedDays = differenceInDays(endDate, startDate);

  const formatDate = (date: Date) => date.toLocaleDateString(lang);
  const rangeText = `${formatDate(startDate)} → ${formatDate(endDate)} (${selectedDays} ${dict.daysUnit.toLowerCase()})`;

  const stepLabel = step === "start" ? dict.calSelectStart : dict.calSelectEnd;

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
          className="bg-white rounded-[14px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[300] w-[340px] animate-slide-up"
          sideOffset={8}
          align="end"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-full transition-colors ${
                step === "start"
                  ? "bg-[#111] text-white"
                  : "bg-[#f3f4f6] text-[#6b7280] cursor-pointer hover:bg-[#e5e7eb]"
              }`}
              onClick={() => setStep("start")}
            >
              {dict.calSelectStart}
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className={`text-sm font-semibold px-2.5 py-1 rounded-full transition-colors ${
                step === "end"
                  ? "bg-[#111] text-white"
                  : "bg-[#f3f4f6] text-[#6b7280] cursor-pointer hover:bg-[#e5e7eb]"
              }`}
              onClick={() => step === "end" || startDate ? setStep("end") : undefined}
            >
              {dict.calSelectEnd}
            </span>
          </div>

          <DayPicker
            mode="single"
            selected={step === "start" ? startDate : endDate}
            onSelect={handleSelect}
            locale={locale}
            disabled={step === "start" ? { before: today } : { before: addDays(startDate, 1) }}
            showOutsideDays
            today={today}
            modifiers={{
              highlighted: highlightedDays,
              rangeStart: startDate ? [startDate] : [],
              rangeEnd: endDate ? [endDate] : [],
            }}
            modifiersStyles={{
              highlighted: { backgroundColor: "#fef9c3", color: "#854d0e", borderRadius: "50%" },
              today: { color: "#d97706", fontWeight: "bold" },
              selected: { backgroundColor: "#1a1a1a", color: "#fff", fontWeight: "bold", borderRadius: "50%" },
              rangeStart: { backgroundColor: "#22c55e", color: "#fff", fontWeight: "bold", borderRadius: "50%" },
              rangeEnd: { backgroundColor: "#1a1a1a", color: "#fff", fontWeight: "bold", borderRadius: "50%" },
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
          <div className="text-sm text-[#6b7280] mt-2.5 text-center min-h-4">{rangeText}</div>
          <div className="flex gap-2 mt-3.5 justify-end">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer bg-transparent border border-[#e5e7eb] text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
            >
              {dict.calClose}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer bg-[#fff500] border-[1.5px] border-[#d1b700] text-black hover:bg-[#d1b700] transition-colors"
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
