import { roundVndToThousands } from "./utils";

/**
 * "Price after voucher", Shopee-style (#042).
 *
 * Long-duration plans carry a high margin markup, so their sticker price reads
 * as expensive next to short plans. Showing what the buyer will actually pay
 * once the house voucher is applied fixes the impression without touching the
 * price list — the discount is the same one the cart applies at checkout.
 *
 * The maths deliberately mirrors `getVndDiscount` in lib/cart.ts (percent off
 * the VND subtotal, rounded to thousands). If the two ever drift, the page would
 * promise a price the cart refuses to honour.
 */

/** The fields of a public coupon this preview needs. */
export interface VoucherCandidate {
  code: string;
  discountPercent: number;
  /**
   * Minimum order value. The storefront has always read this as VND (see
   * `fetchApiCoupons` → `minOrderAmountVnd` in lib/cart.ts), so it is compared
   * against the VND total here too.
   */
  minOrderAmount?: number | null;
  maxUsage?: number | null;
  usageCount?: number | null;
  expiresAt?: string | null;
  isActive?: boolean;
  deletedAt?: string | null;
  /** `percent` (default) or `fixed`, a flat VND amount off (#082). */
  discountType?: "percent" | "fixed" | null;
  /** Flat VND off, when `discountType` is `fixed`. */
  discountAmount?: number | null;
  /** Ceiling for a percentage code — "15% off, up to 50k". */
  maxDiscountAmount?: number | null;
  /** Set for a partner (KOL) code — theirs to hand out, not ours to advertise. */
  partnerId?: number | null;
  /**
   * Admin switch: a private code works when typed in but is never listed
   * (#081). The API already withholds these from anonymous callers; this
   * is the second lock, so a cached or privileged response cannot leak one
   * onto a product page.
   */
  isPublic?: boolean;
}

export interface VoucherPreview {
  code: string;
  discountPercent: number;
  /** VND taken off the total. */
  discountVnd: number;
  /** VND the buyer pays with the voucher applied. */
  finalVnd: number;
}

/**
 * Whether a coupon may be advertised on a public product page at all —
 * regardless of the current total.
 */
export function isPubliclyOfferable(
  coupon: VoucherCandidate,
  now: Date = new Date()
): boolean {
  if (coupon.isActive === false) return false;
  if (coupon.deletedAt) return false;
  if (coupon.isPublic === false) return false;
  // A KOL's code belongs to that KOL's audience. Advertising it to everyone
  // would hand out their commission and their exclusivity.
  if (coupon.partnerId != null) return false;
  // A code has to actually take something off: a percentage, or a flat amount
  // for a fixed-amount code, whose percentage is 0 by definition (#082).
  const hasValue =
    coupon.discountType === "fixed"
      ? Number(coupon.discountAmount ?? 0) > 0
      : Number(coupon.discountPercent) > 0;
  if (!hasValue) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt) <= now) return false;
  if (
    coupon.maxUsage != null &&
    Number(coupon.usageCount ?? 0) >= Number(coupon.maxUsage)
  ) {
    return false;
  }
  return true;
}

/** Percent off the VND total, rounded exactly the way the cart rounds it. */
export function voucherDiscountVnd(
  totalVnd: number,
  discountPercent: number
): number {
  if (!(totalVnd > 0) || !(discountPercent > 0)) return 0;
  return roundVndToThousands((totalVnd * discountPercent) / 100);
}

/**
 * VND taken off by a coupon of any shape (#082): a percentage, a flat amount,
 * or a percentage with a ceiling ("15% off, up to 50k").
 *
 * Mirrors `computeCouponDiscount` on the server, and rounds to thousands the
 * way the cart does — otherwise a page advertises a saving the cart refuses.
 */
export function couponDiscountVnd(
  coupon: Pick<
    VoucherCandidate,
    "discountPercent" | "discountType" | "discountAmount" | "maxDiscountAmount"
  >,
  totalVnd: number
): number {
  if (!(totalVnd > 0)) return 0;

  if (coupon.discountType === "fixed") {
    const flat = Number(coupon.discountAmount ?? 0);
    if (!(flat > 0)) return 0;
    // Never more than the order itself.
    return roundVndToThousands(Math.min(flat, totalVnd));
  }

  const percent = Number(coupon.discountPercent ?? 0);
  if (!(percent > 0)) return 0;

  let discount = (totalVnd * percent) / 100;
  const cap = Number(coupon.maxDiscountAmount ?? 0);
  if (cap > 0) discount = Math.min(discount, cap);

  return roundVndToThousands(Math.min(discount, totalVnd));
}

/**
 * The best voucher the buyer can use on this exact total, or null when there is
 * none. Vouchers whose minimum order the total doesn't reach are left out: a
 * price the buyer can't actually get would be a lie, not a discount.
 */
export function pickBestVoucher(
  coupons: VoucherCandidate[] | undefined | null,
  totalVnd: number,
  now: Date = new Date()
): VoucherPreview | null {
  if (!coupons?.length || !(totalVnd > 0)) return null;

  const usable = coupons
    .filter((coupon) => isPubliclyOfferable(coupon, now))
    .filter((coupon) => {
      const min = Number(coupon.minOrderAmount ?? 0);
      return !(min > 0) || totalVnd >= min;
    })
    .map((coupon) => {
      const discountPercent = Number(coupon.discountPercent);
      // Cap and flat-amount codes included (#082).
      const discountVnd = couponDiscountVnd(coupon, totalVnd);
      return {
        code: coupon.code,
        discountPercent,
        discountVnd,
        finalVnd: Math.max(0, totalVnd - discountVnd),
      };
    })
    .filter((preview) => preview.discountVnd > 0);

  if (!usable.length) return null;

  // Biggest saving wins; the code only breaks ties so the pick is stable across
  // renders (and across the two price blocks, which must never disagree).
  usable.sort(
    (a, b) => b.discountVnd - a.discountVnd || a.code.localeCompare(b.code)
  );
  return usable[0];
}
