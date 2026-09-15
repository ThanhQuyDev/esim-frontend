import { isPubliclyOfferable, type VoucherCandidate } from "./voucher-preview";

/**
 * The coupons shown on /ma-giam-gia (#040).
 *
 * The page offered one "Lấy mã" button that copied a single code, so a customer
 * could never see or compare the other offers. It now lists the codes an admin
 * ticked "Mã nổi bật" in the CMS — and only while they are actually usable: the
 * same rule the product pages use to advertise a voucher (active, public, not a
 * KOL's own code, carrying a real discount, not expired, uses left).
 */

export type ListedCoupon = VoucherCandidate & {
  id: number;
  isPopular?: boolean;
  minOrderAmount?: number | null;
  maxUsagePerUser?: number | null;
  maxDiscountAmount?: number | null;
};

export function listFeaturedCoupons<T extends ListedCoupon>(
  coupons: T[] | null | undefined,
  now: Date = new Date(),
): T[] {
  return (coupons ?? [])
    .filter((coupon) => coupon.isPopular === true && isPubliclyOfferable(coupon, now))
    .sort((a, b) => {
      // Codes that run out soonest first, so nobody misses them; open-ended last.
      const aEnd = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.POSITIVE_INFINITY;
      const bEnd = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.POSITIVE_INFINITY;
      return aEnd - bEnd || a.code.localeCompare(b.code);
    });
}

/**
 * Copy a code, falling back to a hidden textarea where the async clipboard is
 * unavailable (plain http, older in-app browsers).
 */
export async function copyCouponCode(code: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      return true;
    }
  } catch {
    // fall through to the textarea fallback
  }
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = code;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
