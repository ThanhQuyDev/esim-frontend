import type { Plan } from "./api";

/**
 * "Giờ làm mới mỗi ngày" — when a daily allowance starts over (#071).
 *
 * Customers ask this because the answer changes when they get their data back.
 * Two cycles are in use across our suppliers:
 *
 *  - a rolling 24 hours counted from the moment the eSIM is installed, so the
 *    reset lands at a different clock time for every customer;
 *  - the supplier's own calendar day, ending at 23:59 in a fixed timezone, the
 *    same moment for everyone regardless of where the device is.
 *
 * The timezone is read off the plan rather than hard-coded: Viettel and the
 * domestic eSIMs count their day in UTC+7, the Chinese suppliers in UTC+8. The
 * one wording in the ticket says UTC+8, which would be wrong for half the
 * catalogue if it were pinned.
 */

/** Plans whose data is a single total pool have no daily reset to describe. */
const TOTAL_DATA_TYPES = new Set(["fixed", "data-in-total"]);

export function hasDailyAllowance(
  plan: Pick<Plan, "type"> | null | undefined,
): boolean {
  if (!plan?.type) return false;
  return !TOTAL_DATA_TYPES.has(plan.type.toLowerCase());
}

/**
 * The sentence for the "Giờ làm mới mỗi ngày" row, or null when there is nothing
 * truthful to say — the supplier has not stated the cycle, or the plan is a
 * single total pool of data with no daily reset at all. The caller omits the row
 * in that case rather than printing a default that may be wrong.
 */
export function dailyResetText(
  plan:
    | Pick<Plan, "type" | "dailyResetPolicy" | "dailyResetUtcOffset">
    | null
    | undefined,
  lang: string,
): string | null {
  if (!plan?.dailyResetPolicy) return null;
  if (!hasDailyAllowance(plan)) return null;
  return dayRuleText(plan.dailyResetPolicy, plan.dailyResetUtcOffset, lang);
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Whole calendar days since the epoch, in a timezone `offsetHours` from UTC. */
const calendarDay = (at: number, offsetHours: number) =>
  Math.floor((at + offsetHours * HOUR_MS) / DAY_MS);

export type DayCycle = {
  totalDays: number;
  /** The day the eSIM is on now, from 1. */
  dayIndex: number;
  /** Days fully gone — the one in progress is not one of them. */
  daysUsed: number;
  daysRemaining: number;
  /** When the current day ends, and with it the daily data resets. */
  dayEndsAt: Date | null;
  expiresAt: Date | null;
  finished: boolean;
  /** Whether the plan says how its days run; otherwise the old estimate. */
  ruleKnown: boolean;
};

/**
 * Which day of its plan an eSIM is on, counted the way the plan counts days
 * (vande #075): 24 hours from the first connection, or the supplier's
 * calendar day in its own timezone, where the connection day is day one.
 * Counting 24-hour blocks back from the expiry for every plan told a
 * customer an hour into their eSIM that a day was gone.
 */
export function esimDayCycle(input: {
  activatedAt: string | null | undefined;
  expiredAt: string | null | undefined;
  durationDays: number | null | undefined;
  policy: string | null | undefined;
  utcOffset: number | null | undefined;
  now?: number;
}): DayCycle | null {
  const now = input.now ?? Date.now();
  const activated = input.activatedAt ? new Date(input.activatedAt).getTime() : NaN;
  const expires = input.expiredAt ? new Date(input.expiredAt).getTime() : NaN;
  const hasStart = !Number.isNaN(activated);
  const hasEnd = !Number.isNaN(expires);

  const totalDays =
    input.durationDays && input.durationDays > 0
      ? input.durationDays
      : hasStart && hasEnd
        ? Math.max(1, Math.round((expires - activated) / DAY_MS))
        : null;
  if (!totalDays) return null;

  const rolling = input.policy === "rolling_24h";
  const calendar = input.policy === "calendar_day";
  const offset = input.utcOffset ?? 8;

  if (hasStart && (rolling || calendar)) {
    const dayIndex = rolling
      ? Math.floor((now - activated) / DAY_MS) + 1
      : calendarDay(now, offset) - calendarDay(activated, offset) + 1;
    const dayEnd = rolling
      ? activated + dayIndex * DAY_MS
      : (calendarDay(now, offset) + 1) * DAY_MS - offset * HOUR_MS;
    const derivedEnd = rolling
      ? activated + totalDays * DAY_MS
      : (calendarDay(activated, offset) + totalDays) * DAY_MS - offset * HOUR_MS;
    const end = hasEnd ? expires : derivedEnd;
    const finished = now >= end || dayIndex > totalDays;
    const daysUsed = finished ? totalDays : Math.min(totalDays, Math.max(0, dayIndex - 1));
    return {
      totalDays,
      dayIndex: Math.min(totalDays, Math.max(1, dayIndex)),
      daysUsed,
      daysRemaining: totalDays - daysUsed,
      dayEndsAt: finished ? null : new Date(Math.min(dayEnd, end)),
      expiresAt: new Date(end),
      finished,
      ruleKnown: true,
    };
  }

  // The plan does not say how its days run: whole 24-hour blocks left before
  // the expiry, as before.
  if (!hasEnd) return null;
  const daysRemaining = Math.max(0, Math.ceil((expires - now) / DAY_MS));
  const daysUsed = Math.min(totalDays, Math.max(0, totalDays - daysRemaining));
  return {
    totalDays,
    dayIndex: Math.min(totalDays, daysUsed + 1),
    daysUsed,
    daysRemaining: totalDays - daysUsed,
    dayEndsAt: null,
    expiresAt: new Date(expires),
    finished: now >= expires,
    ruleKnown: false,
  };
}

/**
 * How the plan's days run, in a sentence — for any plan, daily allowance or
 * not (vande #075). Null when the supplier has not said.
 */
export function dayRuleText(
  policy: string | null | undefined,
  utcOffset: number | null | undefined,
  lang: string,
): string | null {
  if (policy === "rolling_24h") {
    return lang === "en"
      ? "Each day runs as a 24-hour cycle from the moment you install the eSIM."
      : "Mỗi ngày được tính theo chu kỳ 24 giờ kể từ lúc bạn cài eSIM.";
  }
  if (policy === "calendar_day") {
    const offset = utcOffset ?? 8;
    const zone = `UTC${offset >= 0 ? "+" : "-"}${Math.abs(offset)}`;
    return lang === "en"
      ? `Each day ends at 23:59 (${zone}), regardless of the timezone where you install the SIM.`
      : `Mỗi ngày được tính đến 23:59 (${zone}) không phụ thuộc vào múi giờ nơi bạn cài SIM vào thiết bị.`;
  }
  return null;
}
