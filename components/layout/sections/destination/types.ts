import type { Destination, Plan, PlansByDestinationResponse } from "@/lib/api";

// ===== Dictionary shape for destinationPage =====
export interface DestinationDict {
  title: string;
  subtitle: string;
  notFound: string;
  notFoundDesc: string;
  heroTag: string;
  viewCountries: string;
  supportedCountries: string;
  carriers: { title: string; domestic: string };
  features: {
    title: string;
    hotspot: string;
    calls: string;
    localNumber: string;
    ekyc: string;
    topup: string;
    yes: string;
    no: string;
  };
  delivery: {
    title: string;
    deliveryTime: string;
    instant: string;
    instantDesc: string;
    activationPeriod: string;
    activationDesc: string;
  };
  note: { title: string; text: string };
  planTabs: { data: string; dataCalls: string };
  planSections: { fixed: string; daily: string; unlimited: string };
  speed: { normal: string; high: string };
  unlimitedHint: string;
  daysLabel: string;
  daysUnit: string;
  quantity: string;
  esimUnit: string;
  buyNow: string;
  addToCart: string;
  noPlans: string;
  trust: {
    rating: string;
    ratingCount: string;
    trustpilot: string;
    secure: string;
    support: string;
    refund: string;
  };
  greenBox: { line1: string; line2: string; line3: string };
  disclaimer: string;
  disclaimerLink: string;
  save: string;
  calTitle: string;
  calSelectStart: string;
  calSelectEnd: string;
  calClose: string;
  calConfirm: string;
  calDays: string;
  weekDays: string[];
}

// ===== Categorized plans from new API =====
export type CategorizedPlans = PlansByDestinationResponse;

// ===== Shared props =====
export interface DestinationPlansProps {
  destination: Destination;
  slug: string;
  dict: DestinationDict;
  lang: string;
  /** "destination" (default) or "region" — switches the plans API endpoint */
  planSource?: "destination" | "region";
}

// ===== Helper: find best plan for a given dataGb + days =====
/**
 * Among plans with the same dataGb, pick the cheapest total cost for `days` travel days.
 *
 * Logic:
 * - If plan has `isAbleMultidate = true`: total cost = price * days (buy one per day)
 * - If plan has `durationDays >= days`: total cost = price (one package covers all days)
 * - Otherwise the plan can't cover the requested days → skip it
 *
 * Pick the plan with the lowest total cost.
 */
export function findBestPlan(plans: Plan[], dataGb: number, days: number): Plan | null {
  const samGb = plans.filter((p) => Number(p.dataGb) === Number(dataGb));
  if (samGb.length === 0) return null;

  type Candidate = { plan: Plan; totalCost: number };
  const candidates: Candidate[] = [];

  for (const p of samGb) {
    if (p.isAbleMultidate) {
      // Can be purchased multiple times — one per day
      candidates.push({ plan: p, totalCost: Number(p.price) * days });
    } else if (p.durationDays >= days) {
      // Single package covers all requested days
      candidates.push({ plan: p, totalCost: Number(p.price) });
    }
    // else: plan can't cover the days, skip
  }

  if (candidates.length === 0) {
    // Fallback: pick the longest-duration plan with that dataGb
    const fallback = samGb.sort((a, b) => b.durationDays - a.durationDays);
    return fallback[0];
  }

  // Pick cheapest total cost
  candidates.sort((a, b) => a.totalCost - b.totalCost);
  return candidates[0].plan;
}

/**
 * Calculate the total price for a selected plan given the user's chosen days.
 * - isAbleMultidate plans: price * days
 * - Otherwise: price (the package already covers durationDays >= days)
 */
export function calcTotalPrice(plan: Plan, days: number): number {
  if (plan.isAbleMultidate) {
    return Number(plan.price) * days;
  }
  return Number(plan.price);
}

/**
 * Calculate the total retail price for a selected plan given the user's chosen days.
 */
export function calcTotalRetailPrice(plan: Plan, days: number): number {
  if (plan.isAbleMultidate) {
    return Number(plan.retailPrice) * days;
  }
  return Number(plan.retailPrice);
}

/** Get unique dataGb values from a list of plans, sorted ascending */
export function getUniqueDataGb(plans: Plan[]): number[] {
  const set = new Set(plans.map((p) => p.dataGb));
  return Array.from(set).sort((a, b) => a - b);
}

/** Get unique durationDays values from plans with a specific dataGb, sorted ascending */
export function getAvailableDays(plans: Plan[], dataGb: number): number[] {
  const set = new Set(plans.filter((p) => p.dataGb === dataGb).map((p) => p.durationDays));
  return Array.from(set).sort((a, b) => a - b);
}
