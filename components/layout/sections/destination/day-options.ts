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

/** Long-stay shortcuts kept on top of the popular list for pay-per-day plans. */
const LONG_STAY_DAYS = [180, 365];

/**
 * Chips for a plan priced per day (`isFlexibleDays`): the popular list plus the
 * long-stay shortcuts, since any other value is one calendar tap away.
 */
export function flexibleDayOptions(popular: number[]): number[] {
  return [...popular, ...LONG_STAY_DAYS];
}

/**
 * Chips for a plan sold as one package per duration.
 *
 * Only values the provider actually sells may be offered, so the popular list is
 * used as a filter, never as a source. Durations beyond the popular list (60, 90,
 * 365…) are always kept: they are few, and no nearby chip stands in for them.
 * The selected duration is kept as well, so the highlighted chip stays visible
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
  const longest = popular[popular.length - 1];
  const kept = availableDays.filter((d) => popular.includes(d) || d > longest);
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
