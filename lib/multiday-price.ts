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
 * The tiers come from `/api/v1/plans/multiday-pricing`, loaded once by
 * {@link useMultidayTiers}. Until they arrive — and for anything that is not a
 * day pass — the price stays per-day × days.
 */
import type { Plan } from "./api";

export interface MarginTier {
  minVnd: number;
  maxVnd: number;
  percentage: number;
  fixedAmountVnd?: number | null;
}

let TIERS: MarginTier[] | null = null;

export function setMultidayTiers(tiers: MarginTier[] | null | undefined) {
  TIERS = tiers && tiers.length ? tiers : null;
}

function retailVndForCost(costVnd: number, tiers: MarginTier[]): number {
  let retail = costVnd;
  for (const tier of tiers) {
    if (costVnd >= Number(tier.minVnd) && costVnd <= Number(tier.maxVnd)) {
      const fixed = Number(tier.fixedAmountVnd) || 0;
      retail = fixed > 0 ? costVnd + fixed : costVnd * (1 + Number(tier.percentage) / 100);
      break;
    }
  }
  return Math.round(retail / 1000) * 1000;
}

type PricedPlan = Pick<Plan, "isAbleMultidate" | "vndPrice"> & { vndCostPrice?: number | string | null };

/** Đồng for `days` of a plan, before any plan discount. */
export function multidayVnd(plan: PricedPlan, days: number): number {
  const perDay = Number(plan.vndPrice) || 0;
  const n = plan.isAbleMultidate ? Math.max(1, Math.round(days || 1)) : 1;
  if (n === 1) return perDay;
  const cost = Number(plan.vndCostPrice) || 0;
  if (!TIERS || !(cost > 0)) return perDay * n;
  return retailVndForCost(cost * n, TIERS);
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
