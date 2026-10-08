import type { Plan } from "@/lib/api";
import type { CartItem } from "@/lib/cart";
import { calcTotalPrice, calcTotalVndPrice, getFixedPrice, getFixedVndPrice } from "./types";

/**
 * The cart line for one plan. One implementation for every "add to cart": the
 * product page's buttons and sticky bar, and the data calculator's suggestions
 * (v3 #013) — they used to each spell out the same price/duration rules.
 *
 * `isFixed` is a plan sold for its own duration; otherwise a multi-day plan is
 * bought for `days`.
 */
export function planCartItem(
  plan: Plan,
  { days, isFixed, destination }: { days: number; isFixed: boolean; destination?: string },
): Omit<CartItem, "quantity"> {
  const isMultidate = !!plan.isAbleMultidate;
  const unitPrice = isFixed ? getFixedPrice(plan) : calcTotalPrice(plan, days);
  const unitVndPrice = isFixed ? getFixedVndPrice(plan) : calcTotalVndPrice(plan, days);
  const originalVndPrice = isFixed
    ? Number(plan.vndPrice)
    : isMultidate
      ? Number(plan.vndPrice) * days
      : Number(plan.vndPrice);
  const cartDurationDays = isMultidate ? days : undefined;
  const displayDays = isFixed ? plan.durationDays : isMultidate ? days : plan.durationDays;
  const isUnlimited = plan.type === "unlimited" || plan.type === "unlimited-reduce";
  const data = isUnlimited
    ? "Unlimited"
    : plan.dataMb >= 1024
      ? `${parseFloat((plan.dataMb / 1024).toFixed(1))} GB`
      : `${plan.dataMb} MB`;

  return {
    id: `${plan.id}:${cartDurationDays ?? "fixed"}`,
    planId: plan.id,
    name: plan.name || `eSIM ${destination || ""}`.trim(),
    description: `${data} / ${displayDays} days`,
    price: unitPrice,
    vndPrice: unitVndPrice,
    destination,
    dataMb: Number(plan.dataMb),
    durationDays: cartDurationDays,
    ...(plan.discount != null && plan.discount > 0
      ? { discount: plan.discount, originalVndPrice }
      : {}),
  };
}
