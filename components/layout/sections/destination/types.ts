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
  perDay: string;
  calTitle: string;
  calSelectStart: string;
  calSelectEnd: string;
  calClose: string;
  calConfirm: string;
  calDays: string;
  weekDays: string[];
  deviceCheck: {
    title: string;
    placeholder: string;
    button: string;
    supported: string;
    notSupported: string;
    similarDevices: string;
    viewAll: string;
    checking: string;
  };
  tabs: {
    features: string;
    delivery: string;
  };
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

// ===== Helper: find best plan for a given dataMb + days =====
/**
 * Among plans with the same dataMb, pick the cheapest total cost for `days` travel days.
 *
 * Logic:
 * - If plan has `isAbleMultidate = true`: total cost = price * days (buy one per day)
 * - If plan has `durationDays >= days`: total cost = price (one package covers all days)
 * - Otherwise the plan can't cover the requested days → skip it
 *
 * Pick the plan with the lowest total cost.
 */
export function findBestPlan(plans: Plan[], dataMb: number, days: number): Plan | null {
  const sameMb = plans.filter((p) => Number(p.dataMb) === Number(dataMb));
  if (sameMb.length === 0) return null;

  type Candidate = { plan: Plan; totalCost: number };
  const candidates: Candidate[] = [];

  for (const p of sameMb) {
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
    // Fallback: pick the longest-duration plan with that dataMb
    const fallback = sameMb.sort((a, b) => b.durationDays - a.durationDays);
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

/**
 * Calculate the total VND price using the plan's vndPrice field directly.
 */
export function calcTotalVndPrice(plan: Plan, days: number): number {
  if (plan.isAbleMultidate) {
    return Number(plan.vndPrice) * days;
  }
  return Number(plan.vndPrice);
}

/**
 * Calculate the total VND retail price.
 * API only provides vndPrice (not vndRetailPrice), so we derive it proportionally.
 */
export function calcTotalVndRetailPrice(plan: Plan, days: number): number {
  const price = Number(plan.price);
  const retailPrice = Number(plan.retailPrice);
  const vndPrice = Number(plan.vndPrice);
  // Derive VND retail from the USD ratio
  const vndRetail = price > 0 ? Math.round((vndPrice * retailPrice) / price / 1000) * 1000 : 0;
  if (plan.isAbleMultidate) {
    return vndRetail * days;
  }
  return vndRetail;
}

/** Get unique dataMb values from a list of plans, sorted ascending */
export function getUniqueDataMb(plans: Plan[]): number[] {
  const set = new Set(plans.map((p) => p.dataMb));
  return Array.from(set).sort((a, b) => a - b);
}

/** Get unique durationDays values from plans with a specific dataMb, sorted ascending */
export function getAvailableDays(plans: Plan[], dataMb: number): number[] {
  const set = new Set(plans.filter((p) => p.dataMb === dataMb).map((p) => p.durationDays));
  return Array.from(set).sort((a, b) => a - b);
}
