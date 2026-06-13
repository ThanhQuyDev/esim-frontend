"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "../types";
import { calcTotalPrice, calcTotalVndPrice, getFixedPrice, getFixedVndPrice } from "../types";
import { formatVnd, useCart } from "@/lib/hooks";
import Image from "next/image";

interface MobileStickyBarProps {
  selectedPlan: Plan | null;
  days: number;
  quantity: number;
  isFixed: boolean;
  dict: DestinationDict;
  lang: string;
  destination?: string;
  destinationData: any;
  region: any;
  planLabel: string;
  onQuantityChange: (q: number) => void;
  ctaRef: React.RefObject<HTMLDivElement | null>;
  /** Open the eKYC guide modal — surfaces a tiny banner above the action row. */
  onOpenEkyc?: () => void;
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
  region,
  destinationData,
  onQuantityChange,
  ctaRef,
  onOpenEkyc,
}: MobileStickyBarProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

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

  // Hide sticky bar when FAQ section has scrolled out of view — footer is now visible
  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout>;
    let attempts = 0;

    const setupObserver = () => {
      const faqSection = document.querySelector('[data-section="FAQ"]');
      if (!faqSection) {
        attempts++;
        if (attempts < 20) {
          retryTimer = setTimeout(setupObserver, 500);
        }
        return;
      }
      observer = new IntersectionObserver(
        ([entry]) => {
          setNearFooter(!entry.isIntersecting);
        },
        { threshold: 0 }
      );
      observer.observe(faqSection);
    };

    setupObserver();
    return () => {
      observer?.disconnect();
      clearTimeout(retryTimer);
    };
  }, []);

  // Toggle body class so chat bubble can adjust its position
  const stickyVisible = visible && !nearFooter;
  useEffect(() => {
    if (stickyVisible) {
      document.body.classList.add("mobile-sticky-bar-visible");
    } else {
      document.body.classList.remove("mobile-sticky-bar-visible");
    }
    return () => {
      document.body.classList.remove("mobile-sticky-bar-visible");
    };
  }, [stickyVisible]);

  let totalPrice = 0;
  if (selectedPlan) {
    if (isFixed) {
      totalPrice = getFixedVndPrice(selectedPlan) * quantity;
    } else {
      totalPrice = calcTotalVndPrice(selectedPlan, days) * quantity;
    }
  }

  // Description like "Unlimited / 7 days" or "5 GB / 30 days"
  const descriptionPlan = selectedPlan
    ? `${selectedPlan.type === 'unlimited' || selectedPlan.type === 'unlimited-reduce' ? 'Unlimited' : selectedPlan.dataMb >= 1024 ? `${parseFloat((selectedPlan.dataMb / 1024).toFixed(1))} GB` : `${selectedPlan.dataMb} MB`} / ${isFixed ? selectedPlan.durationDays : (selectedPlan.isAbleMultidate ? days : selectedPlan.durationDays)} days`
    : '';

  const handleAddToCart = async () => {
    if (!selectedPlan) return;
    const isMultidate = !!selectedPlan.isAbleMultidate;
    const unitPrice = isFixed ? getFixedPrice(selectedPlan) : calcTotalPrice(selectedPlan, days);
    const unitVndPrice = isFixed ? getFixedVndPrice(selectedPlan) : calcTotalVndPrice(selectedPlan, days);
    const originalVndPrice = isFixed ? Number(selectedPlan.vndPrice) : (isMultidate ? Number(selectedPlan.vndPrice) * days : Number(selectedPlan.vndPrice));
    // Only pass durationDays (periodNum) for isAbleMultidate plans
    const cartDurationDays = isMultidate ? days : undefined;
    const displayDays = isFixed ? selectedPlan.durationDays : (isMultidate ? days : selectedPlan.durationDays);
    await addItem(
      {
        id: String(selectedPlan.id),
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
    router.push(`/${lang}/cart`);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
  };

  if (!selectedPlan) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300] bg-white border-t border-[#e5e7eb] px-4 pt-[10px] pb-5 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)]"
      style={{ transform: stickyVisible ? "translateY(0)" : "translateY(110%)" }}
    >
      {/* Top row: plan info + price — slim variant for 390px */}
      <div className="flex items-center justify-between mb-[9px] gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {(region?.iconUrl || destinationData?.flagUrl) ? (
            <div className="w-[24px] h-[24px] border rounded-full overflow-hidden shrink-0">
              <Image src={region?.iconUrl ? region?.iconUrl : (destinationData?.flagUrl || region?.iconUrl || "")} alt={destinationData?.name || region.name} width={30} height={30} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-[24px] h-[24px] bg-[#fff500] rounded-full flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
              </svg>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm text-[#6b7280] font-medium truncate">
              eSIM {destination || ""}
            </div>
            <div className="text-sm font-bold truncate">
              {selectedPlan.name} {descriptionPlan}
            </div>
          </div>
        </div>
        <div className="text-[16px] font-extrabold text-[#1a1a1a] whitespace-nowrap shrink-0">
          {formatVnd(totalPrice)}
        </div>
      </div>

      {/* Optional eKYC mini banner */}
      {selectedPlan?.isKyc && onOpenEkyc && (
        <button
          type="button"
          onClick={onOpenEkyc}
          className="flex items-center gap-2 px-3 py-1.5 mb-2 w-full rounded-[10px] cursor-pointer font-[inherit] text-left"
          style={{
            background: "linear-gradient(135deg, #FFF1F2, #FFF7ED)",
            border: "1.5px solid #FCA5A5",
          }}
        >
          <span
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="M3 20s1-3 6-3 6 3 6 3" />
              <path d="M16 8h3M16 12h3" />
            </svg>
          </span>
          <span className="flex-1 text-[12.5px] font-bold text-[#991B1B] whitespace-nowrap overflow-hidden text-ellipsis">
            {lang === "en" ? "⚠ Identity verification required." : "⚠ Bắt buộc xác thực danh tính."}
            <span className="text-[#991B1B] ml-2 underline">{lang === "en" ? "View details →" : "Xem chi tiết →"}</span>
          </span>
        </button>
      )}

      {/* Bottom row: quantity + cart + buy — tighter on small screens to fit 390px width */}
      <div className="flex items-center gap-2">
        {/* Quantity stepper — slim variant */}
        <div className="flex items-center border border-[#e5e7eb] rounded-[30px] h-[42px] shrink-0 px-0.5">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-8 h-8 border-none rounded-full bg-[#f3f4f6] text-base font-semibold cursor-pointer flex items-center justify-center text-[#1a1a1a] shrink-0 transition-colors active:bg-[#c8ccd1]"
          >
            −
          </button>
          <span className="text-sm font-bold min-w-[18px] text-center px-1">{quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-8 h-8 border-none rounded-full bg-[#f3f4f6] text-base font-semibold cursor-pointer flex items-center justify-center text-[#1a1a1a] shrink-0 transition-colors active:bg-[#c8ccd1]"
          >
            +
          </button>
        </div>

        {/* Cart button — square 42×42, icon-only */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-[100px] h-[42px] flex items-center justify-center rounded-full border border-[#1a1a1a] bg-white cursor-pointer shrink-0 transition-colors active:bg-[#1a1a1a] active:[&_svg]:stroke-white"
          aria-label={dict.addToCart}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
        </button>

        {/* Buy now button takes remaining width */}
        <button
          type="button"
          onClick={handleBuyNow}
          className="flex-1 min-w-0 h-[42px] px-3 rounded-[30px] border border-[#D1B700] bg-[#FFF500] text-[.875rem] font-bold cursor-pointer text-[#1a1a1a] transition-colors active:bg-[#D1B700] truncate"
        >
          {dict.buyNow}
        </button>
      </div>
    </div>
  );
}
