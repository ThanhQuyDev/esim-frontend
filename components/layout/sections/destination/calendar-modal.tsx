"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "./modal";
import { formatVnd } from "@/lib/hooks";
import { roundVndToThousands } from "@/lib/utils";

interface CalendarModalProps {
  open: boolean;
  onClose: () => void;
  /** Current selected days, used to seed default end date when modal opens. */
  initialDays: number;
  /** Called with the new days count after user confirms. */
  onConfirm: (days: number) => void;
  /** Total price in VND for the current plan/quantity over `initialDays`. Used for per-day breakdown. */
  unitVndPricePerDay?: number;
  /** Quantity of eSIMs (used in the bottom-summary total). */
  quantity: number;
  lang: string;
}

const VI_MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const EN_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const VI_WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}

function formatShortDate(d: Date, lang: string): string {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return lang === "en"
    ? `${month}/${day}/${year}`
    : `${day}/${month}/${year}`;
}

interface MonthGridProps {
  year: number;
  month: number;
  selS: Date | null;
  selE: Date | null;
  today: Date;
  onPick: (d: Date) => void;
  weekdays: string[];
}

function MonthGrid({ year, month, selS, selE, today, onPick, weekdays }: MonthGridProps) {
  const firstDow = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells: { key: string; node: React.ReactNode }[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ key: `pad-${i}`, node: <div /> });
  }
  for (let n = 1; n <= totalDays; n++) {
    const cur = new Date(year, month, n);
    const past = cur < today;
    const isStart = isSameDay(cur, selS);
    const isEnd = isSameDay(cur, selE);
    const inRange = !!(selS && selE && cur > selS && cur < selE);
    const isToday = isSameDay(cur, today);

    let cls = "w-full aspect-square justify-self-center flex items-center justify-center text-[13px] font-medium border-none cursor-pointer transition-colors ";
    let bgColor = "transparent";
    let textColor = "#374151";
    let borderRadius = "50%";

    if (past) {
      cls += " text-[#D1D5DB] pointer-events-none";
    } else if (isStart && isEnd) {
      bgColor = "#1a1a1a";
      textColor = "#fff";
      cls += " font-bold";
    } else if (isStart) {
      bgColor = "#1a1a1a";
      textColor = "#fff";
      borderRadius = "50% 0 0 50%";
      cls += " font-bold";
    } else if (isEnd) {
      bgColor = "#1a1a1a";
      textColor = "#fff";
      borderRadius = "0 50% 50% 0";
      cls += " font-bold";
    } else if (inRange) {
      bgColor = "#DBEAFE";
      textColor = "#1D4ED8";
      borderRadius = "0";
    } else if (isToday) {
      textColor = "#d97706";
      cls += " font-bold";
    }

    cells.push({
      key: `d-${n}`,
      node: (
        <button
          type="button"
          disabled={past}
          onClick={() => !past && onPick(cur)}
          className={cls}
          style={{
            background: bgColor,
            color: past ? "#D1D5DB" : textColor,
            borderRadius,
            maxWidth: "40px",
          }}
        >
          {n}
        </button>
      ),
    });
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {weekdays.map((w) => (
          <span key={w} className="text-[11.5px] font-bold text-[#6B7280] text-center py-[3px]">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-px">
        {cells.map((c) => (
          <div key={c.key}>{c.node}</div>
        ))}
      </div>
    </div>
  );
}

/**
 * Two-month calendar modal with bottom price summary, matching the HTML reference.
 * User picks start, then end. Days delta is sent to onConfirm.
 */
export function CalendarModal({
  open,
  onClose,
  initialDays,
  onConfirm,
  unitVndPricePerDay = 0,
  quantity,
  lang,
}: CalendarModalProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [base, setBase] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(1);
    return d;
  });
  const [selS, setSelS] = useState<Date | null>(null);
  const [selE, setSelE] = useState<Date | null>(null);
  const [step, setStep] = useState<0 | 1>(0); // 0 = picking start, 1 = picking end

  // Reset state every time modal opens
  useEffect(() => {
    if (!open) return;
    const b = new Date(today);
    b.setDate(1);
    setBase(b);
    setSelS(null);
    setSelE(null);
    setStep(0);
  }, [open, today]);

  const days = useMemo(() => {
    if (!selS || !selE) return 0;
    const ms = selE.getTime() - selS.getTime();
    return Math.max(1, Math.round(ms / 86_400_000));
  }, [selS, selE]);

  const monthNames = lang === "en" ? EN_MONTH_NAMES : VI_MONTH_NAMES;
  const weekdays = lang === "en" ? EN_WEEKDAYS : VI_WEEKDAYS;

  const m0 = useMemo(() => ({ y: base.getFullYear(), m: base.getMonth() }), [base]);
  const m1 = useMemo(() => {
    const d = new Date(base);
    d.setMonth(d.getMonth() + 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  }, [base]);

  const t0Title = lang === "en" ? `${monthNames[m0.m]} ${m0.y}` : `${monthNames[m0.m]} năm ${m0.y}`;
  const t1Title = lang === "en" ? `${monthNames[m1.m]} ${m1.y}` : `${monthNames[m1.m]} năm ${m1.y}`;

  const headerTitle = lang === "en" ? "Pick the dates for your plan" : "Chọn ngày bạn muốn lên kế hoạch";
  const tipText = lang === "en"
    ? "Your plan starts when you arrive at your destination and activate the eSIM."
    : "Gói cước sẽ bắt đầu khi bạn đến điểm đến và kích hoạt eSIM.";
  const confirmLabel = lang === "en" ? "Confirm" : "Xác nhận";
  const askStartLabel = lang === "en" ? "Pick your trip start date" : "Chọn ngày bắt đầu chuyến đi";
  const askEndLabel = lang === "en" ? "Pick your trip end date" : "Chọn ngày kết thúc chuyến đi";
  const planLabel = lang === "en" ? `${days}-day plan` : `Kế hoạch ${days} ngày`;
  const dayUnit = lang === "en" ? (days === 1 ? "day" : "days") : "ngày";
  const totalLabel = lang === "en" ? "Total:" : "Tổng:";

  const canPrev = (() => {
    const now = new Date(today);
    now.setDate(1);
    return base > now;
  })();

  const handlePick = (d: Date) => {
    if (step === 0) {
      setSelS(d);
      setSelE(null);
      setStep(1);
    } else {
      if (selS && d <= selS) {
        // Reset start if user picks earlier date as end
        setSelE(selS);
        setSelS(d);
      } else {
        setSelE(d);
      }
      setStep(0);
    }
  };

  const handleConfirm = () => {
    if (selS && selE && days > 0) {
      onConfirm(days);
    } else if (initialDays > 0) {
      onConfirm(initialDays);
    }
    onClose();
  };

  // Bottom summary
  const totalVnd = days > 0 ? roundVndToThousands(unitVndPricePerDay * days * quantity) : 0;
  const perDayVnd = days > 0 ? roundVndToThousands(totalVnd / days) : 0;

  const summaryTitle = !selS
    ? askStartLabel
    : !selE
    ? askEndLabel
    : `${planLabel}  |  ${formatShortDate(selS, lang)} – ${formatShortDate(selE, lang)}`;

  return (
    <Modal open={open} onClose={onClose} zIndex={700} ariaLabel={headerTitle}>
      <div
        className="bg-white flex flex-col overflow-hidden"
        style={{
          width: "min(840px, calc(100vw - 32px))",
          height: "min(600px, calc(100vh - 32px))",
          borderRadius: "20px",
          boxShadow: "0 28px 80px rgba(0,0,0,0.22)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-9 pt-[22px] pb-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-extrabold tracking-[-0.4px] text-[#111]">{headerTitle}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 border-[1.5px] border-[#E5E7EB] rounded-full bg-[#F9FAFB] cursor-pointer flex items-center justify-center text-[#374151] transition-colors hover:bg-[#1a1a1a] hover:border-[#1a1a1a] hover:text-white shrink-0"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[10px] text-[13px]" style={{ background: "#FFFBEB", color: "#92400E" }}>
            <span className="text-lg leading-none">👆</span>
            <span>{tipText}</span>
          </div>
        </div>

        {/* Body — two months side by side */}
        <div
          className="grid flex-1 px-8 pt-1 min-h-0 overflow-hidden"
          style={{ gridTemplateColumns: "1fr 48px 1fr" }}
        >
          {/* Left month */}
          <div className="overflow-y-auto">
            <div className="flex items-center py-1.5 pb-2.5 gap-2">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => {
                  const next = new Date(base);
                  next.setMonth(next.getMonth() - 1);
                  setBase(next);
                }}
                className="w-[34px] h-[34px] rounded-full bg-[#1a1a1a] border-none cursor-pointer flex items-center justify-center text-white shrink-0 transition-colors hover:bg-[#333] disabled:opacity-25 disabled:pointer-events-none"
                aria-label="Previous month"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="flex-1 text-[15px] font-bold text-[#111] text-center">{t0Title}</span>
              <div style={{ width: 34 }} />
            </div>
            <MonthGrid
              year={m0.y}
              month={m0.m}
              selS={selS}
              selE={selE}
              today={today}
              onPick={handlePick}
              weekdays={weekdays}
            />
          </div>

          {/* Divider */}
          <div className="flex items-stretch justify-center">
            <div className="w-px bg-[#E5E7EB] my-2" />
          </div>

          {/* Right month */}
          <div className="overflow-y-auto">
            <div className="flex items-center py-1.5 pb-2.5 gap-2">
              <div style={{ width: 34 }} />
              <span className="flex-1 text-[15px] font-bold text-[#111] text-center">{t1Title}</span>
              <button
                type="button"
                onClick={() => {
                  const next = new Date(base);
                  next.setMonth(next.getMonth() + 1);
                  setBase(next);
                }}
                className="w-[34px] h-[34px] rounded-full bg-[#1a1a1a] border-none cursor-pointer flex items-center justify-center text-white shrink-0 transition-colors hover:bg-[#333]"
                aria-label="Next month"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <MonthGrid
              year={m1.y}
              month={m1.m}
              selS={selS}
              selE={selE}
              today={today}
              onPick={handlePick}
              weekdays={weekdays}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-9 py-3 pb-[22px] gap-5 shrink-0"
          style={{ borderTop: "1px solid #E5E7EB" }}
        >
          <div className="flex flex-col gap-[3px] min-w-0">
            <div className="text-[15px] font-bold text-[#111] min-h-[22px]" dangerouslySetInnerHTML={{ __html: summaryTitle.replace(/\b(\d+)-day plan|Kế hoạch \d+ ngày/, (m) => `<strong>${m}</strong>`) }} />
            <div className="text-[13px] text-[#6B7280] min-h-[18px] flex items-center gap-1.5 flex-wrap">
              {selS && selE && days > 0 && unitVndPricePerDay > 0 && (
                <>
                  {totalLabel}{" "}
                  <span className="font-bold text-[#111]">{formatVnd(totalVnd)}</span>
                  {" ÷ "}
                  {days} {dayUnit}{" = "}
                  <span className="font-bold text-[#16A34A]">{formatVnd(perDayVnd)}/{dayUnit}</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selS || !selE}
            className="px-8 py-3 rounded-full text-sm font-bold cursor-pointer font-[inherit] text-[#111] whitespace-nowrap shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#fff500", border: "1px solid #d1b700" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
