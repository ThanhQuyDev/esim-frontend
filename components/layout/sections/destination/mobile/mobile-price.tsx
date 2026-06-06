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
  greenBoxLine1: string;
  /** Open the eKYC guide modal (shown only when selectedPlan.isKyc). */
  onOpenEkyc?: () => void;
  lang?: string;
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
  greenBoxLine1,
  onOpenEkyc,
  lang = "vi",
}: MobilePriceProps) {
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
  const perDayPrice = totalDays > 0 ? Math.round(totalPrice / totalDays) : 0;

  const showInlineKyc = !!selectedPlan?.isKyc;

  return (
    <>
      {/* Price Section */}
      <div className="px-4 pt-[15px] pb-[13px] border-b border-[#f3f4f6] mt-3.5 overflow-hidden">
        <div className="flex items-baseline gap-2.5 mb-[5px] flex-wrap">
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
          <div className="flex items-center gap-2 text-sm text-[#374151] font-medium flex-wrap">
            <span>≈ {formatVnd(perDayPrice)}/{dict.daysUnit.toLowerCase().charAt(0) === "d" ? "day" : "ngày"}</span>
            <span className="text-[#e5e7eb]">|</span>
            {/* Full info on PC, truncated on mobile */}
            <span className="text-[#6b7280] text-sm hidden min-[841px]:inline">{planLabel}</span>
            <span className="text-[#6b7280] text-sm min-[841px]:hidden">{planLabel.split("·").slice(0, 2).join("·").trim()}</span>
          </div>
        )}
      </div>

      {/* Green Box (Perks) */}
      <div className="mx-4 my-3.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-3.5 py-[13px] flex flex-col gap-[9px]">
        <div className="flex items-start gap-[9px] text-sm text-[#166534] leading-normal">
          <GreenCheck />
          <span dangerouslySetInnerHTML={{ __html: greenBoxLine1 }} />
        </div>
        <div className="flex items-start gap-[9px] text-sm text-[#166534] leading-normal">
          <GreenCheck />
          <span>{dict.greenBox.line3}</span>
        </div>
      </div>

      {/* Inline KYC banner — shown when the selected plan needs eKYC */}
      {showInlineKyc && onOpenEkyc && (
        <div className="px-4 pb-2.5">
          <button
            type="button"
            onClick={onOpenEkyc}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-[10px] cursor-pointer font-[inherit] text-left"
            style={{
              background: "linear-gradient(135deg, #FFF1F2, #FFF7ED)",
              border: "1.5px solid #FCA5A5",
            }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="9" cy="10" r="2" />
                <path d="M3 20s1-3 6-3 6 3 6 3" />
                <path d="M16 8h3M16 12h3" />
              </svg>
            </span>
            <span className="flex-1">
              <span className="block text-[12.5px] font-extrabold text-[#991B1B]">
                {lang === "en" ? "⚠ Identity verification required" : "⚠ Bắt buộc xác thực danh tính"}
              </span>
              <span className="block text-[11.5px] text-[#B91C1C] mt-px">
                {lang === "en" ? "Tap to view details →" : "Nhấn để xem chi tiết →"}
              </span>
            </span>
            <span className="w-[22px] h-[22px] rounded-full bg-[#DC2626] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>
        </div>
      )}
    </>
  );
}
