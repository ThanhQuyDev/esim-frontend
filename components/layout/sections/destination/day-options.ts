/**
 * Day chips under "Số ngày dùng" on the product page.
 *
 * Providers publish one package per duration, so a daily-unlimited or unlimited
 * group routinely exposes every value from 1 to 30 — which renders as a wall of
 * ~30 chips that pushes the price block off screen. Customers only ever tap a
 * handful of them, so the row is trimmed to the popular values and the calendar
 * covers everything else.
 */

/** Popular durations for the wide layout (>840px). */
export const POPULAR_DAYS_DESKTOP = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30];

/** Popular durations for the narrow layout (≤840px) — fewer chips, fewer rows. */
export const POPULAR_DAYS_MOBILE = [1, 3, 5, 7, 10, 12, 15, 20, 30];

/**
 * Chips for a plan priced per day (`isFlexibleDays`): the popular list only —
 * the 180 / 365 shortcuts were dropped (#061, test round 4); any other value is
 * one calendar tap away.
 */
export function flexibleDayOptions(popular: number[]): number[] {
  return [...popular];
}

/**
 * Chips for a plan sold as one package per duration.
 *
 * Only values the provider actually sells may be offered, so the popular list is
 * used as a filter, never as a source. Longer durations (60, 90, 180, 365…) are
 * reached through the calendar (#061). The selected duration is kept as well, so the highlighted chip stays visible
 * after the calendar snaps to a value the list would otherwise hide.
 *
 * @param availableDays durations the provider sells, ascending
 * @param popular       POPULAR_DAYS_DESKTOP or POPULAR_DAYS_MOBILE
 * @param selectedDays  duration currently selected
 */
export function trimToPopularDays(
  availableDays: number[],
  popular: number[],
  selectedDays?: number
): number[] {
  if (availableDays.length === 0) return availableDays;
  // Only the popular values (#061, test round 4: no 60 / 90 / 180 / 365 chips);
  // longer durations are still on sale and picked from the calendar.
  const kept = availableDays.filter((d) => popular.includes(d));
  if (
    selectedDays !== undefined &&
    availableDays.includes(selectedDays) &&
    !kept.includes(selectedDays)
  ) {
    kept.push(selectedDays);
  }
  // A provider whose durations miss the popular list entirely (e.g. 11/14/18
  // only) would end up with an empty row — show the full list instead.
  return kept.length > 0 ? kept.sort((a, b) => a - b) : availableDays;
}
