/**
 * Plan name as the CMS shows it, call / SMS spelled out (#025, test round 4):
 * "United States 2GB / 15day - 20Mins - 20SMS". Only what the supplier's own
 * name does not already say is added.
 */
export function planDisplayName(
  plan:
    | { name?: string | null; standardName?: string | null; call?: number | null; sms?: number | null }
    | null
    | undefined,
): string {
  // The name under the one naming rule when the plan has one (vande #020):
  // "China - Total 5 GB - 7 days", not the supplier's "China 5GB / 7day".
  const base = (plan?.standardName || plan?.name)?.trim() ?? "";
  if (!base) return "";
  const parts = [base];
  const call = Number(plan?.call) || 0;
  const sms = Number(plan?.sms) || 0;
  if (call > 0 && !/\bmins?\b|phút/i.test(base)) parts.push(`${call}Mins`);
  if (sms > 0 && !/\bsms\b/i.test(base)) parts.push(`${sms}SMS`);
  return parts.join(" - ");
}

/**
 * One-line summary under the plan name: data · days · minutes · SMS
 * (#025) — "2GB/ngày · 15 ngày · 20 phút · 20 SMS".
 */
/**
 * A plan with what its finished top-ups added: 500 MB – 7 days plus 3 GB – 15
 * days reads 3.5 GB – 22 days (vande-0411 #019). Only a fixed plan's data adds
 * up; a day's allowance stays what it is.
 */
export function planWithTopups<
  P extends { dataMb?: number | null; durationDays?: number | null; type?: string | null },
>(plan: P | null | undefined, esim: { chosenDays?: number | null; addedDays?: number; addedDataMb?: number }): P | null | undefined {
  if (!plan) return plan;
  const fixed = !plan.type || plan.type === "fixed";
  return {
    ...plan,
    dataMb: (Number(plan.dataMb) || 0) + (fixed && Number(plan.dataMb) > 0 ? esim.addedDataMb ?? 0 : 0),
    durationDays:
      (Number(esim.chosenDays) || Number(plan.durationDays) || 0) + (esim.addedDays ?? 0),
  };
}

export function planSummary(
  plan:
    | { dataMb?: number | null; durationDays?: number | null; type?: string | null; call?: number | null; sms?: number | null }
    | null
    | undefined,
  lang: "vi" | "en",
): string {
  if (!plan) return "";
  const vi = lang === "vi";
  const mb = Number(plan.dataMb) || 0;
  const perDay = !!plan.type && plan.type !== "fixed";
  const size = mb >= 1024 ? `${parseFloat((mb / 1024).toFixed(1))}GB` : `${mb}MB`;
  const data =
    mb > 0 ? `${size}${perDay ? (vi ? "/ngày" : "/day") : ""}` : vi ? "Không giới hạn" : "Unlimited";
  const parts = [data];
  const days = Number(plan.durationDays) || 0;
  if (days > 0) parts.push(vi ? `${days} ngày` : `${days} day${days > 1 ? "s" : ""}`);
  const call = Number(plan.call) || 0;
  const sms = Number(plan.sms) || 0;
  if (call > 0) parts.push(vi ? `${call} phút gọi` : `${call} min`);
  if (sms > 0) parts.push(`${sms} SMS`);
  return parts.join(" · ");
}
