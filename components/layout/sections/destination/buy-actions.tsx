"use client";

import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "./types";
import { calcTotalPrice, calcTotalVndPrice } from "./types";
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
      totalPrice = Number(selectedPlan.vndPrice) * quantity;
    } else {
      totalPrice = calcTotalVndPrice(selectedPlan, days) * quantity;
    }
  }

  const handleAddToCart = async () => {
    if (!selectedPlan) return;
    const unitPrice = isFixed ? Number(selectedPlan.price) : calcTotalPrice(selectedPlan, days);
    const unitVndPrice = isFixed ? Number(selectedPlan.vndPrice) : calcTotalVndPrice(selectedPlan, days);
    await addItem(
      {
        id: String(selectedPlan.id),
        name: selectedPlan.name || `eSIM ${destination || ""}`.trim(),
        description: `${selectedPlan.dataGb} GB / ${isFixed ? selectedPlan.durationDays : days} days`,
        price: unitPrice,
        vndPrice: unitVndPrice,
        destination: destination,
        dataGb: Number(selectedPlan.dataGb),
        durationDays: isFixed ? selectedPlan.durationDays : days,
      },
      quantity
    );
    router.push(`/${lang}/cart`);
  };

  const deviceLink = lang === "vi" ? "/vi/thiet-bi-ho-tro-esim" : `/${lang}/esim-supported-devices`;

  return (
    <>
      {/* CTA buttons */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={handleAddToCart}
          className="w-full py-3 rounded-full border-[1.5px] border-[#1a1a1a] bg-white text-sm font-semibold cursor-pointer text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
        >
          {dict.addToCart}
        </button>
        <button
          onClick={handleAddToCart}
          className="w-full py-[13px] rounded-full border-[1.5px] border-[#d1b700] bg-[#fff500] text-[15px] font-bold cursor-pointer text-black transition-all hover:bg-[#d1b700] hover:border-[#d1b700]"
        >
          {dict.buyNow} — {selectedPlan ? formatVnd(totalPrice) : "—"}
        </button>
      </div>

      {/* Trust row */}
      <div className="flex items-center justify-center gap-4 py-2.5 my-3 border-t border-b border-[#efefef] flex-wrap">
        <div className="flex items-center gap-[5px] text-[13px] text-[#6b7280]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 6s6-2.5 6-6V4L8 1.5z" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5.5 8l1.8 1.8L10.5 6" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.trust.secure}
        </div>
        <div className="flex items-center gap-[5px] text-[13px] text-[#6b7280]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M3 9V7a5 5 0 0 1 10 0v2" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="1.5" y="9" width="3" height="4" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.1" />
            <rect x="11.5" y="9" width="3" height="4" rx="1.5" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.1" />
            <path d="M14.5 13v.5a2 2 0 0 1-2 2H9" stroke="#16a34a" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          {dict.trust.support}
        </div>
        <div className="flex items-center gap-[5px] text-[13px] text-[#6b7280]">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 8a5.5 5.5 0 1 0 1-3.1" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M2.5 3.5V6H5" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {dict.trust.refund}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="pt-2.5 flex gap-1.5 items-start">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 mt-0.5">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="#6b7280" strokeWidth="1.1" />
          <path d="M6.5 5.5v3.5M6.5 4v.5" stroke="#6b7280" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
        <div className="text-[13px] text-[#6b7280] leading-relaxed">
          {dict.disclaimer}{" "}
          <a href={deviceLink} className="text-[#3b82f6] font-medium">
            {dict.disclaimerLink}
          </a>
        </div>
      </div>
    </>
  );
}
