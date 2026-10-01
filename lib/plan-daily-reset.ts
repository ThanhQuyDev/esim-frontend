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

  if (plan.dailyResetPolicy === "rolling_24h") {
    return lang === "en"
      ? "Each day runs as a 24-hour cycle from the moment you install the eSIM."
      : "Mỗi ngày được tính theo chu kỳ 24 giờ kể từ lúc bạn cài eSIM.";
  }

  const offset = plan.dailyResetUtcOffset ?? 8;
  const zone = `UTC${offset >= 0 ? "+" : "-"}${Math.abs(offset)}`;
  return lang === "en"
    ? `Each day ends at 23:59 (${zone}), regardless of the timezone where you install the SIM.`
    : `Mỗi ngày được tính đến 23:59 (${zone}) không phụ thuộc vào múi giờ nơi bạn cài SIM vào thiết bị.`;
}
