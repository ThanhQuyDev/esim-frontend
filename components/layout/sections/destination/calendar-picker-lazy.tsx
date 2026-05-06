"use client";

import { useState, type ComponentType } from "react";
import type { DestinationDict } from "./types";

interface CalendarPickerProps {
  days: number;
  onDaysChange: (d: number) => void;
  dict: DestinationDict;
  lang: string;
  defaultOpen?: boolean;
}

function CalendarTriggerButton({
  dict,
  onClick,
  isLoading,
}: {
  dict: DestinationDict;
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <button
      type="button"
      className="w-9 flex items-center justify-center bg-[#f9fafb] border-l border-[#e5e7eb] cursor-pointer hover:bg-[#f0f0f0] transition-colors shrink-0 disabled:cursor-wait disabled:opacity-70"
      title={dict.calSelectStart}
      aria-label={dict.calSelectStart}
      aria-busy={isLoading}
      disabled={isLoading}
      onClick={onClick}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="12" height="10" rx="1.5" stroke="#9ca3af" strokeWidth="1.2" />
        <path d="M4 1v3M10 1v3M1 7h12" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function LazyCalendarPicker(props: Omit<CalendarPickerProps, "defaultOpen">) {
  const [Picker, setPicker] = useState<ComponentType<CalendarPickerProps> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openOnLoad, setOpenOnLoad] = useState(false);

  const loadPicker = async () => {
    if (Picker || isLoading) return;

    setIsLoading(true);
    setOpenOnLoad(true);

    const mod = await import("./calendar-picker");
    setPicker(() => mod.CalendarPicker);
    setIsLoading(false);
  };

  if (Picker) {
    return <Picker {...props} defaultOpen={openOnLoad} />;
  }

  return (
    <CalendarTriggerButton
      dict={props.dict}
      isLoading={isLoading}
      onClick={loadPicker}
    />
  );
}
