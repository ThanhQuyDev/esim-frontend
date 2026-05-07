"use client";

import type { Plan } from "@/lib/api";
import type { DestinationDict } from "../types";
import { calcTotalVndPrice, calcTotalVndRetailPrice, getFixedVndPrice } from "../types";
import { formatVnd } from "@/lib/hooks";
import { roundVndToThousands } from "@/lib/utils";

interface MobilePriceProps {
  selectedPlan: Plan | null;
  days: number;
  quantity: number;
  dict: DestinationDict;
  isFixed: boolean;
  planLabel: string;
  dataLabel: string;
}

const GreenCheck = () => (
  <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" fill="#dcfce7" />
    <path
      d="M4 7l2 2 4-4"
      stroke="#16a34a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function MobilePrice({
  selectedPlan,
  days,
  quantity,
  dict,
  isFixed,
  planLabel,
  dataLabel,
}: MobilePriceProps) {
  // Calculate prices
  let totalPrice = 0;
  let totalRetail = 0;

  if (selectedPlan) {
    if (isFixed) {
      totalPrice = getFixedVndPrice(selectedPlan) * quantity;
      if (selectedPlan.discount != null && selectedPlan.discount > 0) {
        totalRetail = Number(selectedPlan.vndPrice) * quantity;
      } else {
        const price = Number(selectedPlan.price);
        const retailPrice = Number(selectedPlan.retailPrice);
        const vndRetail =
          price > 0
            ? roundVndToThousands((Number(selectedPlan.vndPrice) * retailPrice) / price)
            : 0;
        totalRetail = vndRetail * quantity;
      }
    } else {
      totalPrice = calcTotalVndPrice(selectedPlan, days) * quantity;
      totalRetail = calcTotalVndRetailPrice(selectedPlan, days) * quantity;
    }
  }

  const savePercent =
    totalRetail > 0 ? Math.round(((totalRetail - totalPrice) / totalRetail) * 100) : 0;
  const totalDays = selectedPlan ? (isFixed ? selectedPlan.durationDays : days) : 0;
  const perDayPrice = totalDays > 0 ? roundVndToThousands(totalPrice / totalDays) : 0;

  return (
    <>
      {/* Price Section */}
      <div className="px-4 pt-[15px] pb-[13px] border-b border-[#f3f4f6] mt-3.5">
        <div className="flex items-baseline gap-2.5 mb-[5px]">
          <span className="text-[34px] font-extrabold text-[#1a1a1a] tracking-[-1px]">
            {selectedPlan ? formatVnd(totalPrice) : "—"}
          </span>
          {totalRetail > totalPrice && (
            <>
              <span className="text-base text-[#6b7280] line-through">
                {formatVnd(totalRetail)}
              </span>
              <span className="px-[9px] py-[3px] bg-[#fee2e2] text-[#dc2626] rounded-[5px] text-xs font-bold">
                -{savePercent}%
              </span>
            </>
          )}
        </div>
        {perDayPrice > 0 && totalDays > 1 && (
          <div className="flex items-center gap-2 text-[13px] text-[#374151]">
            <span>≈ {formatVnd(perDayPrice)}/ngày</span>
            <span className="text-[#e5e7eb]">|</span>
            <span className="text-[#6b7280]">{planLabel}</span>
          </div>
        )}
      </div>

      {/* Green Box (Perks) */}
      <div className="mx-4 my-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3.5 py-[13px] flex flex-col gap-[9px]">
        <div className="flex items-start gap-[9px] text-sm text-[#166534] leading-normal">
          <GreenCheck />
          <span
            dangerouslySetInnerHTML={{
              __html: dict.greenBox.line1.replace("{data}", dataLabel),
            }}
          />
        </div>
        <div className="flex items-start gap-[9px] text-sm text-[#166534] leading-normal">
          <GreenCheck />
          <span>{dict.greenBox.line2}</span>
        </div>
        <div className="flex items-start gap-[9px] text-sm text-[#166534] leading-normal">
          <GreenCheck />
          <span>{dict.greenBox.line3}</span>
        </div>
      </div>
    </>
  );
}
