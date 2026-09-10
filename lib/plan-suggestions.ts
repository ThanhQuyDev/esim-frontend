import type { Plan, PlansByDestinationResponse } from "@/lib/api";

/**
 * Turn a data estimate into "buy this plan" (#078).
 *
 * The calculator used to stop at a number of gigabytes, which is the least
 * useful place to stop: the customer still has to guess which package covers
 * it. Given a destination, every plan we sell there is measured against the
 * estimate and the ones that actually cover it are offered, cheapest first.
 */

export type PlanBucket = "data" | "slowUnlimited" | "fastUnlimited" | "dailyUnlimited";

export interface CandidatePlan {
  plan: Plan;
  bucket: PlanBucket;
}

export interface PlanSuggestion {
  plan: Plan;
  bucket: PlanBucket;
  /** True for the unlimited buckets, where the data allowance is not a number. */
  isUnlimited: boolean;
  /** MB the estimate needs across the plan's own duration. */
  requiredMb: number;
  /** Days this plan's allowance lasts at the estimated daily usage. */
  coversDays: number;
  /** VND per day, so plans of different lengths can be compared honestly. */
  vndPerDay: number;
}

/** Flatten the by-destination payload, remembering which bucket each came from. */
export function collectCandidates(
  plans: PlansByDestinationResponse | undefined | null,
): CandidatePlan[] {
  if (!plans) return [];

  const buckets: [PlanBucket, Plan[] | undefined][] = [
    ["data", plans.dataPlans],
    ["fastUnlimited", plans.fastUnlimited],
    ["slowUnlimited", plans.slowUnlimited],
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

export function isUnlimitedBucket(bucket: PlanBucket): boolean {
  return bucket !== "data";
}

export interface SuggestOptions {
  /** Estimated data per day, in MB, from the calculator. */
  dailyMb: number;
  /** How many suggestions to return. */
  limit?: number;
}

/**
 * Pick the plans that cover the estimate.
 *
 * Each plan is judged over **its own duration** — a 7-day plan has to carry
 * seven days of the estimated usage, a 30-day plan thirty — so the customer
 * does not have to tell us how long the trip is before seeing anything. An
 * unlimited plan always covers, by definition.
 *
 * Sorted by price, because two plans that both cover the trip differ only in
 * what they cost; ties go to the shorter plan, which is the cheaper commitment.
 */
export function suggestPlans(
  candidates: CandidatePlan[],
  { dailyMb, limit = 3 }: SuggestOptions,
): PlanSuggestion[] {
  if (!(dailyMb > 0)) return [];

  return candidates
    .filter(({ plan }) => plan && plan.isActive !== false && plan.vndPrice > 0)
    .map(({ plan, bucket }) => {
      const days = plan.durationDays > 0 ? plan.durationDays : 1;
      const unlimited = isUnlimitedBucket(bucket);
      return {
        plan,
        bucket,
        isUnlimited: unlimited,
        requiredMb: dailyMb * days,
        coversDays: unlimited ? days : Math.floor(plan.dataMb / dailyMb),
        vndPerDay: Math.round(plan.vndPrice / days),
      } satisfies PlanSuggestion;
    })
    .filter(
      (suggestion) =>
        suggestion.isUnlimited || suggestion.plan.dataMb >= suggestion.requiredMb,
    )
    .sort(
      (a, b) =>
        a.plan.vndPrice - b.plan.vndPrice ||
        a.plan.durationDays - b.plan.durationDays ||
        a.plan.id - b.plan.id,
    )
    .slice(0, limit);
}

/**
 * What to offer when nothing covers the estimate — a heavy user on a
 * destination that only sells small packages. The largest allowance and the
 * cheapest unlimited plan are the two honest answers; showing nothing is not.
 */
export function fallbackSuggestions(
  candidates: CandidatePlan[],
  { dailyMb, limit = 2 }: SuggestOptions,
): PlanSuggestion[] {
  if (!(dailyMb > 0)) return [];

  const priced = candidates.filter(
    ({ plan }) => plan && plan.isActive !== false && plan.vndPrice > 0,
  );

  const describe = ({ plan, bucket }: CandidatePlan): PlanSuggestion => {
    const days = plan.durationDays > 0 ? plan.durationDays : 1;
    const unlimited = isUnlimitedBucket(bucket);
    return {
      plan,
      bucket,
      isUnlimited: unlimited,
      requiredMb: dailyMb * days,
      coversDays: unlimited ? days : Math.floor(plan.dataMb / dailyMb),
      vndPerDay: Math.round(plan.vndPrice / days),
    };
  };

  const biggest = priced
    .filter(({ bucket }) => bucket === "data")
    .sort((a, b) => b.plan.dataMb - a.plan.dataMb || a.plan.vndPrice - b.plan.vndPrice)
    .slice(0, 1)
    .map(describe);

  const cheapestUnlimited = priced
    .filter(({ bucket }) => isUnlimitedBucket(bucket))
    .sort((a, b) => a.plan.vndPrice - b.plan.vndPrice)
    .slice(0, 1)
    .map(describe);

  return [...biggest, ...cheapestUnlimited]
    .sort((a, b) => a.plan.vndPrice - b.plan.vndPrice)
    .slice(0, limit);
}
