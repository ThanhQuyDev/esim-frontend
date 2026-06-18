"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export interface CartConfirmDialogProps {
  /** Controls visibility of the dialog. */
  open: boolean;
  /** Called when the dialog is dismissed (overlay click / continue shopping). */
  onClose: () => void;
  /** Localized UI language: "vi" or "en". */
  lang: string;
  /** Label shown for the item (e.g. the plan name). */
  itemName?: string;
  /** Formatted total price to display. */
  totalLabel: string;
}

/**
 * "Added to cart" confirmation dialog shown after a product is added.
 *
 * Offers two actions: "Checkout now" (go to /cart) and "Continue shopping"
 * (close the dialog). Used by both desktop and mobile add-to-cart flows so the
 * behaviour is consistent across breakpoints.
 *
 * The dialog is rendered as a fixed full-screen overlay so it works regardless
 * of where the triggering button lives (in-page CTA or sticky bar).
 */
export function CartConfirmDialog({
  open,
  onClose,
  lang,
  itemName,
  totalLabel,
}: CartConfirmDialogProps) {
  const router = useRouter();

  // Lock body scroll while the dialog is open so the background doesn't move.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape for accessibility.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const isVi = lang === "vi";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm w-full animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[#111]">
            {isVi ? "Đã thêm vào giỏ hàng!" : "Added to cart!"}
          </h3>
          <p className="text-base sm:text-sm text-[#6b7280]">
            {itemName || "eSIM"} — {totalLabel}
          </p>
          <div className="flex flex-col gap-2.5 w-full mt-2">
            <button
              onClick={() => router.push(`/${lang}/cart`)}
              className="w-full py-3 rounded-full bg-[#fff500] border border-[#d1b700] text-base sm:text-sm font-medium text-[#111] transition-all hover:bg-[#d1b700] cursor-pointer"
            >
              {isVi ? "Thanh toán ngay" : "Checkout now"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full border border-[#e5e7eb] bg-white text-base sm:text-sm font-semibold text-[#111] transition-all hover:bg-gray-50 cursor-pointer"
            >
              {isVi ? "Tiếp tục mua hàng" : "Continue shopping"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
