"use client";

import { useState } from "react";
import { Ticket, Copy, Check } from "lucide-react";
import { formatVnd, usePublicCoupons } from "@/lib/hooks";
import { pickBestVoucher } from "@/lib/voucher-preview";
import type { DestinationDict } from "./types";

interface VoucherPriceProps {
  /** The VND total currently shown in the price block (all quantities, all days). */
  totalVnd: number;
  dict: DestinationDict;
  className?: string;
}

/**
 * "Giá sau voucher" line, Shopee-style (#042).
 *
 * Long-duration plans look overpriced because the margin markup scales with the
 * duration. Showing the real post-voucher price next to the sticker price fixes
 * the impression, and the code is copyable so the buyer can paste it in the cart.
 *
 * Renders nothing when no public voucher applies to this exact total — never a
 * placeholder, and never a price the cart would refuse.
 */
export function VoucherPrice({
  totalVnd,
  dict,
  className = "",
}: VoucherPriceProps) {
  const { data: coupons } = usePublicCoupons();
  const [copied, setCopied] = useState(false);

  const best = pickBestVoucher(coupons, totalVnd);
  if (!best) return null;

  const copy = dict.voucher;

  const handleCopy = () => {
    navigator.clipboard?.writeText(best.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-testid="voucher-price"
      className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-[10px] border border-dashed border-[#fdba74] bg-[#fff7ed] px-2.5 py-2 ${className}`}
    >
      <Ticket className="h-4 w-4 shrink-0 text-[#ea580c]" aria-hidden />

      <span className="text-[13px] text-[#9a3412]">{copy.priceAfter}</span>
      <span
        data-testid="voucher-final-price"
        className="text-[15px] font-extrabold text-[#ea580c]"
      >
        {formatVnd(best.finalVnd)}
      </span>
      <span className="text-[12px] font-medium text-[#c2410c]">
        {copy.saveAmount.replace("{amount}", formatVnd(best.discountVnd))}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        data-testid="voucher-code"
        aria-label={copy.copyCode.replace("{code}", best.code)}
        title={copy.copyCode.replace("{code}", best.code)}
        className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md border border-[#fdba74] bg-white px-2 py-[3px] text-[12px] font-bold tracking-wide text-[#ea580c] transition-colors hover:bg-[#fff1e6] cursor-pointer font-[inherit]"
      >
        {copied ? (
          <Check className="h-3 w-3" aria-hidden />
        ) : (
          <Copy className="h-3 w-3" aria-hidden />
        )}
        {copied ? copy.copied : best.code}
      </button>

      <p className="basis-full text-[11.5px] leading-snug text-[#b45309]">
        {copy.hint.replace("{percent}", String(best.discountPercent))}
      </p>
    </div>
  );
}
