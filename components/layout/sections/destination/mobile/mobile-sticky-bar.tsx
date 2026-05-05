"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "../types";
import { calcTotalPrice, calcTotalVndPrice, getFixedPrice, getFixedVndPrice } from "../types";
import { formatVnd, useCart } from "@/lib/hooks";

interface MobileStickyBarProps {
  selectedPlan: Plan | null;
  days: number;
  quantity: number;
  isFixed: boolean;
  dict: DestinationDict;
  lang: string;
  destination?: string;
  planLabel: string;
  onQuantityChange: (q: number) => void;
  ctaRef: React.RefObject<HTMLDivElement | null>;
}

export function MobileStickyBar({
  selectedPlan,
  days,
  quantity,
  isFixed,
  dict,
  lang,
  destination,
  planLabel,
  onQuantityChange,
  ctaRef,
}: MobileStickyBarProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);

  // Show sticky bar when CTA buttons scroll out of view
  useEffect(() => {
    if (!ctaRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [ctaRef]);

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
    const originalVndPrice = isFixed ? Number(selectedPlan.vndPrice) : (selectedPlan.isAbleMultidate ? Number(selectedPlan.vndPrice) * days : Number(selectedPlan.vndPrice));
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

  const handleBuyNow = async () => {
    await handleAddToCart();
  };

  if (!selectedPlan) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300] bg-white border-t border-[#e5e7eb] px-4 pt-[10px] pb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)]"
      style={{ transform: visible ? "translateY(0)" : "translateY(110%)" }}
    >
      {/* Top row: plan info + price */}
      <div className="flex items-center justify-between mb-[9px] gap-2">
        <div className="flex items-center gap-[10px] min-w-0 flex-1">
          {/* Globe icon */}
          <div className="w-10 h-10 rounded-full bg-[#FFF500] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
            </svg>
          </div>
          {/* Plan info */}
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[#6b7280] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              eSIM {destination || ""}
            </div>
            <div className="text-[13.5px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">
              {selectedPlan.name} {planLabel}
            </div>
          </div>
        </div>
        {/* Price */}
        <div className="text-[19px] font-extrabold text-[#1a1a1a] whitespace-nowrap shrink-0">
          {formatVnd(totalPrice)}
        </div>
      </div>

      {/* Bottom row: quantity + cart + buy */}
      <div className="flex items-center gap-[9px]">
        {/* Quantity stepper */}
        <div className="flex items-center border-[1.5px] border-[#e5e7eb] rounded-[30px] h-[42px] shrink-0">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-9 h-9 border-none rounded-full bg-[#f3f4f6] text-lg font-semibold cursor-pointer flex items-center justify-center text-[#1a1a1a] mx-[3px] shrink-0 transition-colors active:bg-[#c8ccd1]"
          >
            −
          </button>
          <span className="text-sm font-bold min-w-[20px] text-center px-1">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-9 h-9 border-none rounded-full bg-[#f3f4f6] text-lg font-semibold cursor-pointer flex items-center justify-center text-[#1a1a1a] mx-[3px] shrink-0 transition-colors active:bg-[#c8ccd1]"
          >
            +
          </button>
        </div>

        {/* Cart button */}
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center w-[106px] h-[42px] rounded-[30px] border-[1.5px] border-[#1a1a1a] bg-white cursor-pointer shrink-0 transition-colors active:bg-[#1a1a1a] active:[&_svg]:stroke-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
        </button>

        {/* Buy now button */}
        <button
          onClick={handleBuyNow}
          className="flex-1 h-[42px] rounded-[30px] border-[1.5px] border-[#D1B700] bg-[#FFF500] text-sm font-bold cursor-pointer text-[#1a1a1a] transition-colors active:bg-[#D1B700]"
        >
          {dict.buyNow}
        </button>
      </div>
    </div>
  );
}
