import type { Plan } from "@/lib/api";
import type { CategorizedPlans } from "./types";
import { calcTotalVndPrice } from "./types";

/**
 * "Chọn số ngày trước" (vande #089): the visitor says how long the trip is,
 * then sees only the plans that cover it. Pure functions — the page keeps
 * the trip length, the chosen plan, the tab and the filter, and derives the
 * rest from them on every change (spec §10).
 */

export type DfGroup = "fixed" | "daily" | "unlimited" | "smsCall";
export type DfTab = "data" | "smsCall";

export interface DfOption {
  plan: Plan;
  group: DfGroup;
  /** Same option across trip lengths: the group plus what the plan gives. */
  identity: string;
}

export interface DfGroups {
  fixed: DfOption[];
  daily: DfOption[];
  unlimited: DfOption[];
  smsCall: DfOption[];
}

/** Longest trip the page offers (spec §6.1). */
export const DF_MAX_DAYS = 365;

/** Chips under the day box (spec §6.1, §11). */
export const DF_QUICK_DAYS_DESKTOP = [1, 3, 5, 7, 10, 15, 20, 30];
export const DF_QUICK_DAYS_MOBILE = [1, 2, 3, 5, 7, 10, 15, 20, 30];

const identityOf = (group: DfGroup, plan: Plan) =>
  group === "fixed"
    ? `fixed|${Number(plan.dataMb)}`
    : group === "smsCall"
      ? `sms|${Number(plan.dataMb)}|${plan.call ?? ""}|${plan.sms ?? ""}`
      : `${group}|${Number(plan.dataMb)}|${plan.fupSpeed ?? ""}`;

function fixedPlans(plans: CategorizedPlans): Plan[] {
  return [...(plans.localEsim ?? []), ...plans.dataPlans];
}

function unlimitedPlans(plans: CategorizedPlans): Plan[] {
  return [...plans.fastUnlimited, ...plans.dailyUnlimited];
}

/**
 * Trip lengths the destination sells (spec §5): every duration a plan is
 * sold as, and every day up to {@link DF_MAX_DAYS} when some plan is priced
 * per day.
 */
export function validDays(plans: CategorizedPlans): number[] {
  const all = [
    ...fixedPlans(plans),
    ...plans.slowUnlimited,
    ...unlimitedPlans(plans),
    ...(plans.smsCallEsim ?? []),
  ];
  const days = new Set<number>();
  let perDayMax = 0;
  for (const p of all) {
    if (p.isAbleMultidate) perDayMax = DF_MAX_DAYS;
    const d = Number(p.durationDays);
    if (d > 0) days.add(d);
  }
  for (let d = 1; d <= perDayMax; d++) days.add(d);
  return Array.from(days).sort((a, b) => a - b);
}

export type DaysWarning =
  | { kind: "over"; requested: number; max: number }
  | { kind: "snap"; requested: number; chosen: number };

/**
 * A typed or picked number of days as one the destination sells (spec §6.2):
 * past the longest → the longest; otherwise the nearest longer one.
 */
export function normalizeDays(
  requested: number,
  valid: number[]
): { days: number; warning: DaysWarning | null } {
  const asked = Math.max(Math.round(requested) || 1, 1);
  const n = Math.min(asked, DF_MAX_DAYS);
  const max = valid.length ? valid[valid.length - 1] : DF_MAX_DAYS;
  // Longer than anything sold (even past a year): say so, with what was asked.
  if (asked > max) return { days: max, warning: { kind: "over", requested: asked, max } };
  if (!valid.length || valid.includes(n)) return { days: n, warning: null };
  const chosen = valid.find((d) => d > n) ?? max;
  return { days: chosen, warning: { kind: "snap", requested: n, chosen } };
}

/** The valid day before / after `days` — what − and + jump to (spec §6.1). */
export function stepDays(days: number, valid: number[], dir: -1 | 1): number {
  if (!valid.length) return days;
  if (dir > 0) return valid.find((d) => d > days) ?? days;
  return [...valid].reverse().find((d) => d < days) ?? days;
}

/** Cheapest of `candidates` by what the trip costs with it. */
function cheapest(candidates: Plan[], days: number): Plan | null {
  let best: Plan | null = null;
  let bestPrice = Infinity;
  for (const p of candidates) {
    const price = calcTotalVndPrice(p, days);
    if (price > 0 && price < bestPrice) {
      best = p;
      bestPrice = price;
    }
  }
  return best ?? candidates[0] ?? null;
}

/** A per-day plan covers any trip; a plan of N days covers a trip of N. */
const coversExactly = (p: Plan, days: number) =>
  p.isAbleMultidate || Number(p.durationDays) === days;

function byIdentity(group: DfGroup, plans: Plan[]): Map<string, Plan[]> {
  const map = new Map<string, Plan[]>();
  for (const p of plans) {
    const key = identityOf(group, p);
    map.set(key, [...(map.get(key) ?? []), p]);
  }
  return map;
}

/**
 * The plans shown for a trip of `days` (spec §7.1–7.3), one per option:
 * - fixed and data+call+SMS: plans lasting at least the trip; per data size,
 *   the one closest to the trip (then the cheapest);
 * - per-day and unlimited: plans sold for exactly the trip, or per day; per
 *   data size and speed, the cheapest.
 */
export function optionsForDays(plans: CategorizedPlans, days: number): DfGroups {
  const lasting = (group: DfGroup, list: Plan[]): DfOption[] =>
    Array.from(byIdentity(group, list.filter((p) => Number(p.durationDays) >= days)).entries())
      .map(([identity, same]: [string, Plan[]]) => {
        const shortest = Math.min(...same.map((p) => Number(p.durationDays)));
        const plan = cheapest(
          same.filter((p) => Number(p.durationDays) === shortest),
          shortest
        )!;
        return { plan, group, identity };
      })
      .sort((a, b) => Number(a.plan.dataMb) - Number(b.plan.dataMb));

  const exact = (group: DfGroup, list: Plan[]): DfOption[] =>
    Array.from(byIdentity(group, list.filter((p) => coversExactly(p, days))).entries())
      .map(([identity, same]: [string, Plan[]]) => ({ plan: cheapest(same, days)!, group, identity }))
      .sort(
        (a, b) =>
          // Unlimited data (0 MB) after the sized ones; then by speed.
          (Number(a.plan.dataMb) || Infinity) - (Number(b.plan.dataMb) || Infinity) ||
          parseFloat(a.plan.fupSpeed ?? "0") - parseFloat(b.plan.fupSpeed ?? "0")
      );

  return {
    fixed: lasting("fixed", fixedPlans(plans)),
    daily: exact("daily", plans.slowUnlimited),
    unlimited: exact("unlimited", unlimitedPlans(plans)),
    smsCall: lasting("smsCall", plans.smsCallEsim ?? []),
  };
}

export function tabOf(group: DfGroup): DfTab {
  return group === "smsCall" ? "smsCall" : "data";
}

export function groupOf(plan: Plan, plans: CategorizedPlans): DfGroup | null {
  const has = (list: Plan[] | undefined) => (list ?? []).some((p) => p.id === plan.id);
  if (has(plans.smsCallEsim)) return "smsCall";
  if (has(fixedPlans(plans))) return "fixed";
  if (has(plans.slowUnlimited)) return "daily";
  if (has(unlimitedPlans(plans))) return "unlimited";
  return null;
}

/** The default pick (spec §7.4 step 4): fixed 1 GB, else the first there is. */
export function defaultOption(groups: DfGroups, tab: DfTab = "data"): DfOption | null {
  if (tab === "smsCall") return groups.smsCall[0] ?? null;
  return (
    groups.fixed.find((o) => Number(o.plan.dataMb) === 1024) ??
    groups.fixed[0] ??
    groups.daily[0] ??
    groups.unlimited[0] ??
    null
  );
}

/**
 * What stays selected once the trip length, the filter or the tab changed
 * (spec §7.4): the same kind of plan when it is still offered, the fixed plan
 * of the same size, else the default.
 */
export function reselect(
  previous: Plan | null,
  previousGroup: DfGroup | null,
  groups: DfGroups,
  tab: DfTab
): DfOption | null {
  if (previous && previousGroup && tabOf(previousGroup) === tab) {
    const id = identityOf(previousGroup, previous);
    const same = groups[previousGroup].find((o) => o.identity === id);
    if (same) return same;
  }
  return defaultOption(groups, tab) ?? defaultOption(groups, tab === "data" ? "smsCall" : "data");
}

/** "N gói" on a tab: fixed counts by data size, like its own group (§7.6). */
export function tabCount(groups: DfGroups, tab: DfTab): number {
  return tab === "smsCall"
    ? groups.smsCall.length
    : groups.fixed.length + groups.daily.length + groups.unlimited.length;
}
