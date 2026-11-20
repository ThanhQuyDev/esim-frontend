/**
 * Price of a day pass bought for several days (vande #014) — the storefront
 * mirror of the backend's `src/plans/multiday-price.ts`, so the page shows what
 * checkout charges.
 *
 * eSIM Access sells a day pass for 1–365 days at the per-day cost × days. The
 * page used to show (1-day price) × days, which repeats the margin every day;
 * the margin now applies once, to the whole cost:
 *
 *     price(days) = tier( per-day cost × days ), rounded to 1 000 đ
 *
 * The API sends each day pass's price for 1–365 days with the plan
 * (`multidayK`, vande-2011 #041) — the cost and margin tiers it used to be
 * worked out from here are no longer public. Without it, or for anything that
 * is not a day pass, the price stays per-day × days.
 */
import type { Plan } from "./api";

export interface MarginTier {
  minVnd: number;
  maxVnd: number;
  percentage: number;
  fixedAmountVnd?: number | null;
}

/**
 * Kept so older callers compile; the tiers are no longer public (vande-2011
 * #041) and nothing is computed from them here.
 */
export function setMultidayTiers(_tiers: MarginTier[] | null | undefined) {}

type PricedPlan = Pick<Plan, "isAbleMultidate" | "vndPrice"> & {
  /** Price for 1–365 days in thousands of đồng, from the API (vande-2011 #041). */
  multidayK?: number[] | null;
};

/** Đồng for `days` of a plan, before any plan discount. */
export function multidayVnd(plan: PricedPlan, days: number): number {
  const perDay = Number(plan.vndPrice) || 0;
  const n = plan.isAbleMultidate ? Math.max(1, Math.round(days || 1)) : 1;
  if (n === 1) return perDay;
  const table = plan.multidayK;
  if (table?.length) {
    const k = Number(table[Math.min(n, table.length) - 1]);
    if (k > 0) return k * 1000;
  }
  return perDay * n;
}

/**
 * How many "1-day prices" `days` of a day pass cost — the factor for the
 * dollar and struck-out prices, which scale with the đồng price.
 */
export function multidayFactor(plan: PricedPlan, days: number): number {
  const perDay = Number(plan.vndPrice) || 0;
  const n = plan.isAbleMultidate ? Math.max(1, Math.round(days || 1)) : 1;
  if (n === 1 || perDay <= 0) return n;
  return multidayVnd(plan, n) / perDay;
}
