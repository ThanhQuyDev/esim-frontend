/**
 * The data allowance line for a plan embedded in a blog post (#057).
 *
 * The blog printed `dataMb` as-is, so an unlimited plan (dataMb 0) read "0 MB"
 * and a daily plan's per-day allowance read like a total ("2 GB" instead of
 * "2 GB/ngày"). The plan type decides what the number means:
 *   • fixed            — total allowance                  → "5 GB"
 *   • daily            — allowance per day                → "2 GB/ngày"
 *   • unlimited        — no cap (dataMb is 0)             → "Không giới hạn"
 *   • unlimited-reduce — high-speed allowance per day, then throttled
 *                                                         → "Không giới hạn (2 GB/ngày tốc độ cao)"
 */

export interface BlogPlanDataInput {
  type?: string | null;
  dataMb?: number | string | null;
}

/** "500 MB", "2 GB", "1.5 GB" — the same rounding as the destination page. */
export function formatDataSize(mb: number): string {
  if (mb >= 1024) return `${parseFloat((mb / 1024).toFixed(1))} GB`;
  return `${Math.round(mb)} MB`;
}

export function formatBlogPlanData(plan: BlogPlanDataInput, lang: string): string {
  const vi = lang === "vi";
  const mb = Number(plan.dataMb) || 0;
  const type = (plan.type ?? "").toLowerCase();
  const perDay = vi ? "/ngày" : "/day";
  const unlimited = vi ? "Không giới hạn" : "Unlimited";

  if (type === "unlimited") return unlimited;

  if (type === "unlimited-reduce") {
    if (mb <= 0) return unlimited;
    const highSpeed = vi ? "tốc độ cao" : "high-speed";
    return `${unlimited} (${formatDataSize(mb)}${perDay} ${highSpeed})`;
  }

  // A plan with no allowance at all is unlimited whatever its type says —
  // never "0 MB".
  if (mb <= 0) return unlimited;

  if (type === "daily") return `${formatDataSize(mb)}${perDay}`;

  return formatDataSize(mb);
}
