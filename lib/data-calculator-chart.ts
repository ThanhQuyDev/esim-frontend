/**
 * Ring maths for the data calculator (#077).
 *
 * The ring is supposed to show how the estimated data splits across
 * activities, but the slices did not match the numbers:
 *
 *   - `paddingAngle={1}` takes a fixed degree off every slice, so anything
 *     small — email at 4 MB/h, maps at 10 MB/h — collapsed to nothing while
 *     still sitting in the legend, and the big slices absorbed the difference;
 *   - activities with an hour count but no measurable data still produced a
 *     (zero-width) slice, which shifted the hover index so the centre label
 *     described the wrong activity;
 *   - nothing on screen said what share a colour stood for, so a wrong slice
 *     could not be spotted.
 *
 * Everything the ring draws is derived here, in one place, so the picture and
 * the numbers can never drift apart.
 */

export interface DonutSegment {
  key: string;
  name: string;
  /** Hours per day spent on this activity. */
  hours: number;
  /** Data this activity uses per day, in MB. */
  dailyMb: number;
  /** Fraction of the daily total, 0–1. */
  share: number;
  color: string;
}

const FALLBACK_COLOR = "#E2E2E4";

export interface BuildSegmentsOptions {
  rates: Record<string, number>;
  colors: Record<string, string>;
  /** Human-readable activity name; falls back to the key. */
  label?: (key: string) => string | undefined;
}

/**
 * Turn "hours per activity" into the slices of the ring.
 *
 * Only activities that actually consume data get a slice — an hour of an
 * activity we have no rate for contributes nothing and must not take up a
 * slot. Slices come back largest first, the way a donut is normally read, and
 * the legend uses the same order so the two always line up.
 */
export function buildDonutSegments(
  values: Record<string, number>,
  { rates, colors, label }: BuildSegmentsOptions,
): DonutSegment[] {
  const withData = Object.entries(values)
    .map(([key, hours]) => ({
      key,
      hours: Number.isFinite(hours) && hours > 0 ? hours : 0,
      dailyMb: (Number.isFinite(hours) && hours > 0 ? hours : 0) * (rates[key] ?? 0),
    }))
    .filter((entry) => entry.dailyMb > 0);

  const total = withData.reduce((sum, entry) => sum + entry.dailyMb, 0);

  return withData
    .map((entry) => ({
      key: entry.key,
      name: label?.(entry.key) || entry.key,
      hours: entry.hours,
      dailyMb: entry.dailyMb,
      share: total > 0 ? entry.dailyMb / total : 0,
      color: colors[entry.key] ?? FALLBACK_COLOR,
    }))
    .sort((a, b) => b.dailyMb - a.dailyMb || a.key.localeCompare(b.key));
}

export function totalDailyMb(segments: DonutSegment[]): number {
  return segments.reduce((sum, segment) => sum + segment.dailyMb, 0);
}

/** A month of the same daily usage — the headline figure in the middle. */
export function monthlyMb(dailyMb: number, days = 30): number {
  return dailyMb * days;
}

/** MB below a gigabyte, GB above it — the way plans are sold. */
export function formatData(mb: number): string {
  if (!Number.isFinite(mb) || mb <= 0) return "0 GB";
  if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

/** Whole percent, but never a bare "0%" for a slice that does exist. */
export function formatShare(share: number): string {
  if (share <= 0) return "0%";
  const percent = share * 100;
  if (percent < 1) return "<1%";
  return `${Math.round(percent)}%`;
}

/** "1.5" not "1.50", "2" not "2.0". */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return "0";
  return Number.isInteger(hours) ? String(hours) : String(Number(hours.toFixed(2)));
}
