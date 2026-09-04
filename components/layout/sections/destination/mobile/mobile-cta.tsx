"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { localizedHref } from "@/lib/route-mapping";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "../types";
import { calcTotalPrice, calcTotalVndPrice, getFixedPrice, getFixedVndPrice } from "../types";
import { formatVnd, useCart } from "@/lib/hooks";
import { CartConfirmDialog } from "../cart-confirm-dialog";

interface MobileCtaProps {
  selectedPlan: Plan | null;
  days: number;
  quantity: number;
  isFixed: boolean;
  dict: DestinationDict;
  lang: string;
  destination?: string;
}

export function MobileCta({
  selectedPlan,
  days,
  quantity,
  isFixed,
  dict,
  lang,
  destination,
}: MobileCtaProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [showConfirm, setShowConfirm] = useState(false);

  let totalPrice = 0;
  if (selectedPlan) {
    if (isFixed) {
      totalPrice = getFixedVndPrice(selectedPlan) * quantity;
    } else {
      totalPrice = calcTotalVndPrice(selectedPlan, days) * quantity;
    }
  }

  // Shared add-to-cart logic. Returns true on success.
  const doAddToCart = async () => {
    if (!selectedPlan) return false;
    const isMultidate = !!selectedPlan.isAbleMultidate;
    const unitPrice = isFixed ? getFixedPrice(selectedPlan) : calcTotalPrice(selectedPlan, days);
    const unitVndPrice = isFixed ? getFixedVndPrice(selectedPlan) : calcTotalVndPrice(selectedPlan, days);
    const originalVndPrice = isFixed ? Number(selectedPlan.vndPrice) : (isMultidate ? Number(selectedPlan.vndPrice) * days : Number(selectedPlan.vndPrice));
    // Only pass durationDays (periodNum) for isAbleMultidate plans
    const cartDurationDays = isMultidate ? days : undefined;
    const displayDays = isFixed ? selectedPlan.durationDays : (isMultidate ? days : selectedPlan.durationDays);
    await addItem(
      {
        id: `${selectedPlan.id}:${cartDurationDays ?? "fixed"}`,
        planId: selectedPlan.id,
        name: selectedPlan.name || `eSIM ${destination || ""}`.trim(),
        description: `${selectedPlan.type === 'unlimited' || selectedPlan.type === 'unlimited-reduce' ? 'Unlimited' : selectedPlan.dataMb >= 1024 ? `${parseFloat((selectedPlan.dataMb / 1024).toFixed(1))} GB` : `${selectedPlan.dataMb} MB`} / ${displayDays} days`,
        price: unitPrice,
        vndPrice: unitVndPrice,
        destination: destination,
        dataMb: Number(selectedPlan.dataMb),
        durationDays: cartDurationDays,
        ...(selectedPlan.discount != null && selectedPlan.discount > 0 ? { discount: selectedPlan.discount, originalVndPrice } : {}),
      },
      quantity
    );
    return true;
  };

  // Add to cart → show confirmation (continue shopping / checkout), like desktop.
  const handleAddToCart = async () => {
    if (await doAddToCart()) setShowConfirm(true);
  };

  // Buy now → add and go straight to cart.
  const handleBuyNow = async () => {
    if (await doAddToCart()) router.push(localizedHref(lang, "cart"));
  };

  return (
    <div className="px-4">
      {/* Cart confirmation popup — matches desktop behaviour */}
      <CartConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        lang={lang}
        itemName={selectedPlan?.name || "eSIM"}
        totalLabel={formatVnd(totalPrice)}
      />

      {/* CTA Grid: Cart + Buy */}
      <div className="grid grid-cols-[1fr_1.5fr] gap-[9px] mb-3">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center gap-2 py-[15px] rounded-[30px] border border-[#1a1a1a] bg-white text-base font-semibold cursor-pointer text-[#1a1a1a] font-[inherit] transition-all active:bg-[#1a1a1a] active:text-white"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          {dict.addToCartMobile}
        </button>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          className="flex items-center justify-center py-[15px] rounded-[30px] border border-[#D1B700] bg-[#FFF500] text-base font-semibold cursor-pointer font-[inherit] text-[#1a1a1a] transition-all active:bg-[#D1B700]"
        >
          {dict.buyNow} — {selectedPlan ? formatVnd(totalPrice) : "—"}
        </button>
      </div>

      {/* Trust Row */}
      <div className="flex flex-wrap items-center justify-center gap-x-[10px] gap-y-1 py-3 border-t border-[#f3f4f6] mt-1">
        <div className="flex items-center gap-1 text-sm text-[#374151] font-medium whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5L2 4v4c0 3.5 2.5 6 6 6s6-2.5 6-6V4L8 1.5z"
              fill="#dcfce7"
              stroke="#16a34a"
              strokeWidth="1.2"
            />
            <path
              d="M5.5 8l1.8 1.8L10.5 6"
              stroke="#16a34a"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {dict.trust.secure}
        </div>
        <div className="flex items-center gap-1 text-sm text-[#374151] font-medium whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="#16a34a" strokeWidth="1.2" />
            <path d="M8 4.5v4l2.5 1.5" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {dict.trust.support}
        </div>
        <div className="flex items-center gap-1 text-sm text-[#374151] font-medium whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 8a5.5 5.5 0 1 0 1-3.1" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" />
            <path
              d="M2.5 3.5V6H5"
              stroke="#16a34a"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {dict.trust.refund}
        </div>
      </div>
    </div>
  );
}
