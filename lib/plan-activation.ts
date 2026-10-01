import type { Plan } from "./api";

/**
 * "Kích hoạt eSIM trước ngày dd/mm/yyyy" (#070).
 *
 * The product page used to print a flat "180 ngày kể từ ngày mua" for every plan,
 * with one hard-coded exception for Viettel. Suppliers allow 30 to 180 days
 * depending on the package, so that line was wrong for most of the catalogue —
 * and a customer who trusts it on a 30-day package loses the eSIM.
 *
 * The date itself comes from the API (`plan.activationDeadline`), already resolved
 * in Vietnam time from the moment the product was requested. Nothing is computed
 * from the browser clock here: that would disagree with the server during the
 * first seconds after midnight, and it would use whatever timezone the customer's
 * device happens to be set to.
 */

/** `yyyy-mm-dd` → `dd/mm/yyyy`, or null when the input is not that shape. */
export function formatActivationDate(isoDate: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/**
 * What to print in the "Thời hạn kích hoạt gói" row.
 *
 * Returns null when the supplier has not stated a window, which is the caller's
 * cue to keep the existing generic wording. A missing deadline must never become
 * a date: the row is read as a commitment.
 */
export function activationDeadlineText(
  plan: Pick<Plan, "activationDeadline"> | null | undefined,
  lang: string,
): string | null {
  if (!plan?.activationDeadline) return null;
  const formatted = formatActivationDate(plan.activationDeadline);
  if (!formatted) return null;

  return lang === "en"
    ? `Activate the eSIM before ${formatted}`
    : `Kích hoạt eSIM trước ngày ${formatted}`;
}
