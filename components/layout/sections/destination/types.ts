import type { Destination, Plan, PlansByDestinationResponse, Region } from "@/lib/api";
import { roundVndToThousands } from "@/lib/utils";

// ===== Dictionary shape for destinationPage =====
export interface DestinationDict {
  title: string;
  subtitle: string;
  notFound: string;
  notFoundDesc: string;
  heroTag: string;
  viewCountries: string;
  supportedCountries: string;
  carriers: { title: string; domestic: string, speed: string };
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
  /** Pre-fetched plans from server — avoids loading flash on initial render */
  initialPlans?: PlansByDestinationResponse | null;
  /** Pre-fetched region details for region pages — avoids duplicate client detail fetch */
  initialRegion?: Region | null;
}

// ===== Helper: find best plan for a given dataMb + days =====
/**
 * Among plans with the same dataMb, pick the cheapest total cost for `days` travel days.
 *
 * Logic:
 * - If plan has `isAbleMultidate = true`: total cost = price * days (buy one per day)
 * - If plan has `durationDays === days` (exact match only): total cost = price
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
    } else if (p.durationDays === days) {
      // Exact match only — plan duration must equal requested days
      candidates.push({ plan: p, totalCost: Number(p.price) });
    }
    // else: plan doesn't match the requested days exactly, skip
  }

  if (candidates.length === 0) {
    // No exact match and no multidate plan — return null (no valid plan for this days selection)
    return null;
  }

  // Pick cheapest total cost
  candidates.sort((a, b) => a.totalCost - b.totalCost);
  return candidates[0].plan;
}

/** Check if a given dataMb group has any isAbleMultidate plan */
export function hasMultidatePlan(plans: Plan[], dataMb: number): boolean {
  return plans.some((p) => Number(p.dataMb) === Number(dataMb) && p.isAbleMultidate);
}

/** Apply plan discount (percentage) to a price. Returns the discounted price. */
function applyDiscount(price: number, plan: Plan, roundAfterDiscount = false): number {
  if (plan.discount != null && plan.discount > 0) {
    const discountedPrice = price * (1 - plan.discount / 100);
    return roundAfterDiscount ? roundVndToThousands(discountedPrice) : Math.round(discountedPrice);
  }
  return price;
}

/**
 * Calculate the total price for a selected plan given the user's chosen days.
 * - isAbleMultidate plans: price * days
 * - Otherwise: price (the package already covers durationDays >= days)
 * Applies plan discount if present.
 */
export function calcTotalPrice(plan: Plan, days: number): number {
  const base = plan.isAbleMultidate ? Number(plan.price) * days : Number(plan.price);
  return applyDiscount(base, plan);
}

/**
 * Calculate the total retail price (before discount) for a selected plan.
 * When a plan has a discount, the retail price is the original (undiscounted) price.
 */
export function calcTotalRetailPrice(plan: Plan, days: number): number {
  if (plan.isAbleMultidate) {
    return Number(plan.retailPrice) * days;
  }
  return Number(plan.retailPrice);
}

/**
 * Calculate the total VND price using the plan's vndPrice field directly.
 * Applies plan discount if present.
 */
export function calcTotalVndPrice(plan: Plan, days: number): number {
  const base = plan.isAbleMultidate ? Number(plan.vndPrice) * days : Number(plan.vndPrice);
  return applyDiscount(base, plan, true);
}

/**
 * Calculate the total VND retail price.
 * When a plan has a discount, the "retail" is the original undiscounted vndPrice.
 * Otherwise, derive from the USD retail/price ratio.
 */
export function calcTotalVndRetailPrice(plan: Plan, days: number): number {
  if (plan.discount != null && plan.discount > 0) {
    // Original (undiscounted) vndPrice serves as the "retail" strikethrough
    const base = plan.isAbleMultidate ? Number(plan.vndPrice) * days : Number(plan.vndPrice);
    return base;
  }
  const price = Number(plan.price);
  const retailPrice = Number(plan.retailPrice);
  const vndPrice = Number(plan.vndPrice);
  // Derive VND retail from the USD ratio
  const vndRetail = price > 0 ? roundVndToThousands((vndPrice * retailPrice) / price) : 0;
  if (plan.isAbleMultidate) {
    return vndRetail * days;
  }
  return vndRetail;
}

/**
 * Get the VND price for a fixed plan, applying discount if present.
 * For fixed plans that use `plan.vndPrice` directly (not calcTotalVndPrice).
 */
export function getFixedVndPrice(plan: Plan): number {
  return applyDiscount(Number(plan.vndPrice), plan, true);
}

/**
 * Get the USD price for a fixed plan, applying discount if present.
 */
export function getFixedPrice(plan: Plan): number {
  return applyDiscount(Number(plan.price), plan);
}

/** Get unique dataMb values from a list of plans, sorted ascending */
export function getUniqueDataMb(plans: Plan[]): number[] {
  const set = new Set(plans.map((p) => p.dataMb));
  return Array.from(set).sort((a, b) => a - b);
}

/** Get unique fupSpeed values from a list of plans, sorted ascending by numeric value */
export function getUniqueFupSpeeds(plans: Plan[]): string[] {
  const set = new Set(plans.map((p) => p.fupSpeed || "").filter(Boolean));
  return Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b));
}

/** Get unique durationDays values from plans with a specific dataMb, sorted ascending */
export function getAvailableDays(plans: Plan[], dataMb: number): number[] {
  const set = new Set(plans.filter((p) => p.dataMb === dataMb).map((p) => p.durationDays));
  return Array.from(set).sort((a, b) => a - b);
}
