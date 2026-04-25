"use client";

import type { Plan } from "@/lib/api";
import type { DestinationDict } from "./types";
import { calcTotalVndPrice, calcTotalVndRetailPrice } from "./types";
import { formatVnd } from "@/lib/hooks";

interface PriceDisplayProps {
  selectedPlan: Plan | null;
  days: number;
  quantity: number;
  dict: DestinationDict;
  isFixed: boolean;
  planLabel: string;
}

export function PriceDisplay({
  selectedPlan,
  days,
  quantity,
  dict,
  isFixed,
  planLabel,
}: PriceDisplayProps) {
  if (!selectedPlan) {
    return (
      <div className="mb-3.5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[30px] font-extrabold text-[#1a1a1a] tracking-tight">—</span>
        </div>
        <span className="text-[13.5px] text-[#6b7280] block min-h-[22px]">{planLabel}</span>
      </div>
    );
  }

  // Calculate total VND price directly from plan.vndPrice
  let totalPrice: number;
  let totalRetail: number;

  if (isFixed) {
    // dataPlans & dailyUnlimited: vndPrice is for the whole package
    totalPrice = Number(selectedPlan.vndPrice) * quantity;
    const price = Number(selectedPlan.price);
    const retailPrice = Number(selectedPlan.retailPrice);
    const vndRetail = price > 0 ? Math.round((Number(selectedPlan.vndPrice) * retailPrice) / price / 1000) * 1000 : 0;
    totalRetail = vndRetail * quantity;
  } else {
    // slowUnlimited & fastUnlimited: use calcTotalVndPrice (handles isAbleMultidate)
    totalPrice = calcTotalVndPrice(selectedPlan, days) * quantity;
    totalRetail = calcTotalVndRetailPrice(selectedPlan, days) * quantity;
  }

  const savePercent = totalRetail > 0 ? Math.round(((totalRetail - totalPrice) / totalRetail) * 100) : 0;

  return (
    <div className="mb-3.5">
      <div className="flex items-baseline gap-2 mb-1 flex-nowrap">
        <span className="text-[30px] font-extrabold text-[#1a1a1a] tracking-tight shrink-0">
          {formatVnd(totalPrice)}
        </span>
        {totalRetail > totalPrice && (
          <>
            <span className="text-base text-[#9ca3af] line-through font-medium shrink-0">
              {formatVnd(totalRetail)}
            </span>
            <span className="inline-flex items-center bg-[#fef9e7] text-[#a16207] text-[11px] font-semibold px-[7px] py-[3px] rounded-[5px] border border-[#fde68a] shrink-0">
              {dict.save.replace("{percent}", String(savePercent))}
            </span>
          </>
        )}
      </div>
      <span className="text-[13.5px] text-[#6b7280] block min-h-[22px]">
        {planLabel}
      </span>
    </div>
  );
}

/* ── Green feature box ── */
interface GreenBoxProps {
  dict: DestinationDict;
  dataLabel: string;
}

const GreenCheck = () => (
  <svg className="shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />
    <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function GreenBox({ dict, dataLabel }: GreenBoxProps) {
  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-sm px-3.5 py-2.5 mb-4">
      <div className="flex items-start gap-[7px] text-sm text-[#166534] leading-normal mb-1.5">
        <GreenCheck />
        <span dangerouslySetInnerHTML={{ __html: dict.greenBox.line1.replace("{data}", dataLabel) }} />
      </div>
      <div className="flex items-start gap-[7px] text-sm text-[#166534] leading-normal mb-1.5">
        <GreenCheck />
        <span>{dict.greenBox.line2}</span>
      </div>
      <div className="flex items-start gap-[7px] text-sm text-[#166534] leading-normal">
        <GreenCheck />
        <span>{dict.greenBox.line3}</span>
      </div>
    </div>
  );
}
