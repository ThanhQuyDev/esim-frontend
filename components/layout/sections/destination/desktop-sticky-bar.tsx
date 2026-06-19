"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/api";
import type { DestinationDict } from "./types";
import { calcTotalPrice, calcTotalVndPrice, getFixedPrice, getFixedVndPrice } from "./types";
import { formatVnd, useCart } from "@/lib/hooks";
import Image from "next/image";

interface DesktopStickyBarProps {
  selectedPlan: Plan | null;
  days: number;
  quantity: number;
  isFixed: boolean;
  dict: DestinationDict;
  lang: string;
  destination?: string;
  destinationData: any;
  region?: any;
  planLabel: string;
  planSource: string
  onQuantityChange: (q: number) => void;
  ctaRef: React.RefObject<HTMLDivElement | null>;
}

export function DesktopStickyBar({
  selectedPlan,
  days,
  quantity,
  isFixed,
  dict,
  lang,
  destination,
  planLabel,
  destinationData,
  region,
  onQuantityChange,
  ctaRef,
  planSource,
}: DesktopStickyBarProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);

  // Show sticky bar ONLY when user has scrolled PAST the CTA button (CTA is above viewport)
  // Not when CTA is below viewport (page just loaded, not scrolled to it yet)
  useEffect(() => {
    if (!ctaRef.current) return;

    const ctaObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // CTA is visible on screen — hide sticky bar
          setVisible(false);
        } else {
          // CTA is not visible — check if it's ABOVE viewport (scrolled past)
          // boundingClientRect.bottom < 0 means the element is above the viewport
          const isAboveViewport = entry.boundingClientRect.bottom < 0;
          setVisible(isAboveViewport);
        }
      },
      { threshold: 0 }
    );
    ctaObserver.observe(ctaRef.current);

    // Observe footer to hide sticky bar when near bottom
    const footerEl = document.querySelector("footer");
    let footerObserver: IntersectionObserver | null = null;
    if (footerEl) {
      footerObserver = new IntersectionObserver(
        ([entry]) => {
          setNearFooter(entry.isIntersecting);
        },
        { threshold: 0, rootMargin: "100px 0px 0px 0px" }
      );
      footerObserver.observe(footerEl);
    }

    return () => {
      ctaObserver.disconnect();
      footerObserver?.disconnect();
    };
  }, [ctaRef]);

  // Determine final visibility: show only when CTA is out of view AND not near footer
  const isVisible = visible && !nearFooter;

  // Push chat icon up when sticky bar is visible
  useEffect(() => {
    const chatBtn = document.getElementById("chat-bubble-toggle");
    if (chatBtn) {
      if (isVisible) {
        chatBtn.style.transition = "bottom 0.28s cubic-bezier(.4,0,.2,1)";
        chatBtn.style.bottom = "80px"; // Push above sticky bar
      } else {
        chatBtn.style.transition = "bottom 0.28s cubic-bezier(.4,0,.2,1)";
        chatBtn.style.bottom = "0px";
      }
    }
  }, [isVisible]);

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

  if (!selectedPlan) return null;
  console
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300] bg-white border-t border-[#e5e7eb] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)] hidden min-[841px]:block"
      style={{ transform: isVisible ? "translateY(0)" : "translateY(110%)" }}
    >
      <div className="max-w-[1168px] mx-auto py-3 flex items-center justify-between gap-6">
        {/* Left: Plan info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Globe icon */}
          {(region?.iconUrl || destinationData?.flagUrl) ? (
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden shrink-0 border">
              <Image src={(planSource === "region" && region?.iconUrl) ? region.iconUrl : (destinationData?.flagUrl || region?.iconUrl || "")} alt={destinationData?.name} width={30} height={30} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-[30px] h-[30px] bg-[#fff500] rounded-full flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
              </svg>
            </div>
          )}
          {/* Plan details */}
          <div className="min-w-0">
            <div className="text-sm text-[#6b7280] font-medium">
              eSIM {destination || ""}
            </div>
            <div className="text-base sm:text-sm font-medium text-[#1a1a1a] whitespace-nowrap overflow-hidden text-ellipsis">
              {descriptionPlan}
            </div>
          </div>
        </div>

        {/* Center: Price */}
        <div className="text-2xl sm:text-xl font-extrabold text-[#1a1a1a] whitespace-nowrap shrink-0">
          {formatVnd(totalPrice)}
        </div>

        {/* Right: Quantity + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quantity stepper */}
          <div className="flex items-center border border-[#e5e7eb] rounded-[30px] h-[40px]">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-8 h-8 border-none rounded-full bg-[#f9fafb] text-lg font-semibold cursor-pointer flex items-center justify-center text-[#1a1a1a] mx-[3px] shrink-0 transition-colors hover:bg-[#e5e7eb]"
            >
              −
            </button>
            <span className="text-base sm:text-sm font-medium min-w-[20px] text-center px-1">{quantity}</span>
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-8 h-8 border-none rounded-full bg-[#f9fafb] text-lg font-semibold cursor-pointer flex items-center justify-center text-[#1a1a1a] mx-[3px] shrink-0 transition-colors hover:bg-[#e5e7eb]"
            >
              +
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 px-5 h-[40px] rounded-[30px] border border-[#1a1a1a] bg-white text-base sm:text-sm font-semibold cursor-pointer text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            {dict.addToCart}
          </button>

          {/* Buy Now */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center px-6 h-[40px] rounded-[30px] border border-[#D1B700] bg-[#FFF500] text-base sm:text-sm font-medium cursor-pointer text-[#1a1a1a] transition-all hover:bg-[#D1B700]"
          >
            {dict.buyNow}
          </button>
        </div>
      </div>
    </div>
  );
}
