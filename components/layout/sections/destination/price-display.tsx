"use client";

import type { Plan } from "@/lib/api";
import type { DestinationDict } from "./types";
import { calcTotalVndPrice, calcTotalVndRetailPrice, getFixedVndPrice } from "./types";
import { formatVnd } from "@/lib/hooks";
import { roundVndToThousands } from "@/lib/utils";

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
      <div className="mb-2">
        <div className="flex items-baseline gap-2.5 mb-2">
          <span className="text-4xl font-extrabold text-[#111] tracking-[-1px]">—</span>
        </div>
        <span className="text-[13px] text-[#6b7280] block min-h-[22px]">{planLabel}</span>
      </div>
    );
  }

  // Calculate total VND price directly from plan.vndPrice
  let totalPrice: number;
  let totalRetail: number;

  if (isFixed) {
    totalPrice = getFixedVndPrice(selectedPlan) * quantity;
    // Retail is the original undiscounted price when discount exists, otherwise derived from retailPrice
    if (selectedPlan.discount != null && selectedPlan.discount > 0) {
      totalRetail = Number(selectedPlan.vndPrice) * quantity;
    } else {
      const price = Number(selectedPlan.price);
      const retailPrice = Number(selectedPlan.retailPrice);
      const vndRetail = price > 0 ? roundVndToThousands((Number(selectedPlan.vndPrice) * retailPrice) / price) : 0;
      totalRetail = vndRetail * quantity;
    }
  } else {
    totalPrice = calcTotalVndPrice(selectedPlan, days) * quantity;
    totalRetail = calcTotalVndRetailPrice(selectedPlan, days) * quantity;
  }

  const savePercent = totalRetail > 0 ? Math.round(((totalRetail - totalPrice) / totalRetail) * 100) : 0;

  // Calculate per-day cost
  const totalDays = isFixed ? selectedPlan.durationDays : days;
  const perDayPrice = totalDays > 0 ? roundVndToThousands(totalPrice / totalDays) : 0;

  return (
    <div className="mb-2">
      <div className="flex items-baseline gap-2.5 mb-[5px]">
        <span className="text-4xl font-extrabold text-[#111] tracking-[-1px]">
          {formatVnd(totalPrice)}
        </span>
        {totalRetail > totalPrice && (
          <>
            <span className="text-base text-[#6b7280] line-through font-medium">
              {formatVnd(totalRetail)}
            </span>
            <span className="px-[9px] py-[3px] bg-[#FEE2E2] text-[#dc2626] rounded-[5px] text-xs font-bold">
              -{savePercent}%
            </span>
          </>
        )}
      </div>
      {perDayPrice > 0 && totalDays > 1 && !isFixed && (
        <div className="flex items-center gap-2 text-[13px] text-[#374151] font-medium flex-wrap">
          <span>≈ {formatVnd(perDayPrice)}/{dict.daysUnit.toLowerCase().charAt(0) === "d" ? "day" : "ngày"}</span>
          <span className="text-[#e5e7eb]">|</span>
          {/* Full info on PC, truncated on mobile */}
          <span className="text-[#6b7280] text-[13px] hidden min-[841px]:inline">{planLabel}</span>
          <span className="text-[#6b7280] text-[13px] min-[841px]:hidden">{planLabel.split("·").slice(0, 2).join("·").trim()}</span>
        </div>
      )}
    </div>
  );
}

/* ── Green feature box ── */
interface GreenBoxProps {
  dict: DestinationDict;
  line1Html: string;
}

const GreenCheck = () => (
  <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="#dcfce7" />
    <path d="M4 7l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function GreenBox({ dict, line1Html }: GreenBoxProps) {
  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3.5 py-[13px] mb-[18px] flex flex-col gap-[9px]">
      <div className="flex items-start gap-[9px] text-sm text-[#166534] leading-normal">
        <GreenCheck />
        <span dangerouslySetInnerHTML={{ __html: line1Html }} />
      </div>
      <div className="flex items-start gap-[9px] text-sm text-[#166534] leading-normal">
        <GreenCheck />
        <span>{dict.greenBox.line3}</span>
      </div>
    </div>
  );
}
