"use client";

import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "./types";
import { calcTotalPrice, calcTotalVndPrice, getFixedPrice, getFixedVndPrice } from "./types";
import { formatVnd, useCart } from "@/lib/hooks";

interface BuyActionsProps {
  selectedPlan: Plan | null;
  days: number;
  quantity: number;
  isFixed: boolean;
  dict: DestinationDict;
  lang: string;
  destination?: string;
}

export function BuyActions({ selectedPlan, days, quantity, isFixed, dict, lang, destination }: BuyActionsProps) {
  const router = useRouter();
  const { addItem } = useCart();

  let totalPrice = 0;
  if (selectedPlan) {
    if (isFixed) {
      totalPrice = getFixedVndPrice(selectedPlan) * quantity;
    } else {
      totalPrice = calcTotalVndPrice(selectedPlan, days) * quantity;
    }
  }

  const handleAddToCart = async () => {
    if (!selectedPlan) return;
    const unitPrice = isFixed ? getFixedPrice(selectedPlan) : calcTotalPrice(selectedPlan, days);
    const unitVndPrice = isFixed ? getFixedVndPrice(selectedPlan) : calcTotalVndPrice(selectedPlan, days);
    const originalVndPrice = isFixed ? Number(selectedPlan.vndPrice) : Number(selectedPlan.vndPrice) * days;
    await addItem(
      {
        id: String(selectedPlan.id),
        name: selectedPlan.name || `eSIM ${destination || ""}`.trim(),
        description: `${selectedPlan.dataMb >= 1024 ? `${parseFloat((selectedPlan.dataMb / 1024).toFixed(1))} GB` : `${selectedPlan.dataMb} MB`} / ${isFixed ? selectedPlan.durationDays : days} days`,
        price: unitPrice,
        vndPrice: unitVndPrice,
        destination: destination,
        dataMb: Number(selectedPlan.dataMb),
        durationDays: isFixed ? selectedPlan.durationDays : days,
        ...(selectedPlan.discount != null && selectedPlan.discount > 0 ? { discount: selectedPlan.discount, originalVndPrice } : {}),
      },
      quantity
    );
    router.push(`/${lang}/cart`);
  };

  const deviceLink = lang === "vi" ? "/vi/thiet-bi-ho-tro-esim" : `/${lang}/esim-supported-devices`;

  return (
    <>
      {/* CTA buttons — grid layout matching HTML reference */}
      <div className="grid grid-cols-[1fr_1.4fr] gap-2.5 mb-3">
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-2 py-[13px] rounded-[30px] border border-[#111] bg-white text-sm font-semibold cursor-pointer text-[#111] font-[inherit] transition-all hover:bg-[#111] hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          {dict.addToCart}
        </button>
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center py-[13px] rounded-[30px] border border-[#d1b700] bg-[#fff500] text-sm font-bold cursor-pointer font-[inherit] transition-all hover:bg-[#d1b700]"
        >
          {dict.buyNow} — {selectedPlan ? formatVnd(totalPrice) : "—"}
        </button>
      </div>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-4 py-3 my-3 border-t border-b border-[#efefef]">
        <div className="flex items-center gap-[5px] text-[12.5px] text-[#374151] font-medium whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 6s6-2.5 6-6V4L8 1.5z" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5.5 8l1.8 1.8L10.5 6" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.trust.secure}
        </div>
        <div className="flex items-center gap-[5px] text-[12.5px] text-[#374151] font-medium whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M3 9V7a5 5 0 0 1 10 0v2" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="1.5" y="9" width="3" height="4" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.1" />
            <rect x="11.5" y="9" width="3" height="4" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.1" />
          </svg>
          {dict.trust.support}
        </div>
        <div className="flex items-center gap-[5px] text-[12.5px] text-[#374151] font-medium whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 8a5.5 5.5 0 1 0 1-3.1" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M2.5 3.5V6H5" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.trust.refund}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-1.5 items-start text-[13px] text-[#6b7280] leading-normal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span>
          {dict.disclaimer}{" "}
          <a href={deviceLink} className="text-[#111] font-semibold underline">
            {dict.disclaimerLink}
          </a>
        </span>
      </div>
    </>
  );
}
