import type { Plan, PlansByDestinationResponse } from "@/lib/api";

/**
 * Turn a data estimate into "buy this plan" (#078, #035).
 *
 * Given a destination, the plans we sell there are sorted into the three ways a
 * customer can buy data, and each kind is matched against the estimate the way
 * it is actually sold:
 *
 *   - fixed plans — a 30-day-or-longer package holding at least a month of the
 *     estimated usage (34.8 GB/month → 35 GB and up, 30 or 180 days);
 *   - daily plans — a per-day allowance at least as big as the daily estimate
 *     (1.2 GB/day → 1.5 GB/day and up);
 *   - unlimited plans — a few of the cheapest, since any of them covers it.
 *
 * The by-destination payload names its buckets after the old UI, not after what
 * is in them: `slowUnlimited` holds the DAILY plans (`dataMb` is the allowance
 * per day). Reading every non-fixed bucket as unlimited listed a 500 MB/day plan
 * as "Không giới hạn" that always covered the estimate — the inaccuracy #035
 * reported.
 */

export type PlanBucket = "data" | "slowUnlimited" | "fastUnlimited" | "dailyUnlimited";

export type PlanKind = "fixed" | "daily" | "unlimited";

export interface CandidatePlan {
  plan: Plan;
  bucket: PlanBucket;
}

export interface PlanSuggestion {
  plan: Plan;
  bucket: PlanBucket;
  kind: PlanKind;
  /** True only for genuinely unlimited plans. */
  isUnlimited: boolean;
  /** MB the estimate needs to be covered by this plan. */
  requiredMb: number;
  /** Days this plan's data lasts at the estimated usage (its duration, for daily/unlimited). */
  coversDays: number;
  /** VND per day, so plans of different lengths can be compared honestly. */
  vndPerDay: number;
}

export interface GroupedSuggestions {
  fixed: PlanSuggestion[];
  daily: PlanSuggestion[];
  unlimited: PlanSuggestion[];
  /** When no fixed or daily plan covers: the biggest fixed allowance, to be honest about the gap. */
  fallback: PlanSuggestion[];
}

/** A fixed plan must last at least this long to be suggested. */
export const FIXED_MIN_DAYS = 30;

/** The estimate a fixed plan must hold: a month of usage. */
export const MONTH_DAYS = 30;

/** Flatten the by-destination payload, remembering which bucket each came from. */
export function collectCandidates(
  plans: PlansByDestinationResponse | undefined | null,
): CandidatePlan[] {
  if (!plans) return [];

  const buckets: [PlanBucket, Plan[] | undefined][] = [
    ["data", plans.dataPlans],
    ["slowUnlimited", plans.slowUnlimited],
    ["fastUnlimited", plans.fastUnlimited],
    ["dailyUnlimited", plans.dailyUnlimited],
  ];

  const seen = new Set<number>();
  const candidates: CandidatePlan[] = [];

  for (const [bucket, list] of buckets) {
    for (const plan of list ?? []) {
      // A plan can appear in more than one bucket; the first (most specific)
      // wins so it is never offered twice.
      if (!plan || seen.has(plan.id)) continue;
      seen.add(plan.id);
      candidates.push({ plan, bucket });
    }
  }

  return candidates;
}

/**
 * What a plan really is. The plan's own `type` decides when it is set; the
 * bucket is the fallback for payloads that carry no type.
 */
export function planKind({ plan, bucket }: CandidatePlan): PlanKind {
  const type = (plan.type ?? "").toLowerCase();
  if (type === "fixed") return "fixed";
  if (type === "daily") return "daily";
  if (type.startsWith("unlimited")) return "unlimited";
  if (bucket === "data") return "fixed";
  if (bucket === "slowUnlimited") return "daily";
  return "unlimited";
}

export interface SuggestOptions {
  /** Estimated data per day, in MB, from the calculator. */
  dailyMb: number;
  /** How many plans to list per group. */
  perGroup?: number;
}

function describe(candidate: CandidatePlan, dailyMb: number): PlanSuggestion {
  const { plan, bucket } = candidate;
  const kind = planKind(candidate);
  const days = plan.durationDays > 0 ? plan.durationDays : 1;
  return {
    plan,
    bucket,
    kind,
    isUnlimited: kind === "unlimited",
    requiredMb: kind === "fixed" ? dailyMb * MONTH_DAYS : dailyMb,
    coversDays: kind === "fixed" ? Math.floor(plan.dataMb / dailyMb) : days,
    vndPerDay: Math.round(plan.vndPrice / days),
  };
}

const byPrice = (a: PlanSuggestion, b: PlanSuggestion) =>
  a.plan.vndPrice - b.plan.vndPrice ||
  a.plan.durationDays - b.plan.durationDays ||
  a.plan.id - b.plan.id;

const byPricePerDay = (a: PlanSuggestion, b: PlanSuggestion) =>
  a.vndPerDay - b.vndPerDay || byPrice(a, b);

/**
 * Sort a destination's plans into what covers the estimate, per kind of plan.
 */
export function groupSuggestions(
  candidates: CandidatePlan[],
  { dailyMb, perGroup = 3 }: SuggestOptions,
): GroupedSuggestions {
  const empty: GroupedSuggestions = { fixed: [], daily: [], unlimited: [], fallback: [] };
  if (!(dailyMb > 0)) return empty;

  const priced = candidates
    .filter(({ plan }) => plan && plan.isActive !== false && plan.vndPrice > 0)
    .map((candidate) => describe(candidate, dailyMb));

  const fixed = priced
    .filter(
      (s) =>
        s.kind === "fixed" &&
        s.plan.durationDays >= FIXED_MIN_DAYS &&
        s.plan.dataMb >= s.requiredMb,
    )
    .sort(byPrice)
    .slice(0, perGroup);

  const daily = priced
    .filter((s) => s.kind === "daily" && s.plan.dataMb >= dailyMb)
    .sort(byPricePerDay)
    .slice(0, perGroup);

  const unlimited = priced
    .filter((s) => s.kind === "unlimited")
    .sort(byPricePerDay)
    .slice(0, perGroup);

  const fallback =
    fixed.length === 0 && daily.length === 0
      ? priced
          .filter((s) => s.kind === "fixed")
          .sort((a, b) => b.plan.dataMb - a.plan.dataMb || byPrice(a, b))
          .slice(0, 1)
      : [];

  return { fixed, daily, unlimited, fallback };
}
