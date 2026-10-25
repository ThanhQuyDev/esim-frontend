import { tr } from "../../local-esim/design/design-i18n-core";
import type { Plan, PlansByDestinationResponse } from "@/lib/api";
import {
  calcTotalVndPrice,
  calcTotalVndRetailPrice,
  findBestDailyUnlimitedPlan,
  findBestPlan,
} from "../../destination/types";
import { badgeOf } from "../../local-esim/design/nd-model";

/**
 * The plan lineup of a region page, shaped like the design file
 * "esim-chau-a-desktop-v41 / mobile-v36" (#067, test round 4):
 *
 *  - "Gói cố định": one button per data size; the days are picked in the
 *    dropdown under it (`dataPlans`).
 *  - "Gói theo ngày": X/ngày chips; the days come from step 3 (`slowUnlimited`).
 *  - "Gói không giới hạn": X/ngày ∞ speed, or ∞ speed only (`fastUnlimited` +
 *    `dailyUnlimited`).
 *  - "Data + Gọi + SMS" tab: one chip per plan (`smsCallEsim`).
 */

export type Kind = "fixed" | "daily" | "unl" | "combo";

export interface Badge {
  cls: string;
  label: string;
}

/** A "Gói cố định" data size and its plans, one per number of days. */
export interface Tier {
  key: string;
  dataMb: number;
  gb: string;
  plans: Plan[];
  badge: Badge | null;
}

/** One chip of the daily / unlimited / combo groups. */
export interface Opt {
  key: string;
  kind: Exclude<Kind, "fixed">;
  plans: Plan[];
  /** Data size as the design writes it ("1 GB"); "" for speed-only plans. */
  gb: string;
  /** Speed once the daily allowance is used up, e.g. "5 Mbps". */
  throttle: string;
  /** Plans of the group are matched by speed rather than by data size. */
  bySpeed: boolean;
}

/** "7 GB", "1,5 GB", "500 MB" — the design writes decimals with a comma. */
export function gbLabel(mb: number): string {
  if (!mb) return "";
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${(Number.isInteger(gb) ? gb : parseFloat(gb.toFixed(1))).toString().replace(".", ",")} GB`;
  }
  return `${Math.round(mb)} MB`;
}

/** "1Mbps" / "1 mbps" → "1 Mbps"; "" when the plan names no speed. */
export function speedLabel(raw?: string | null): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  const m = s.match(/^([\d.,]+)\s*([kmg]?)(?:bps|b\/s)?$/i);
  if (!m) return s;
  const unit = m[2].toUpperCase() === "K" ? "Kbps" : m[2].toUpperCase() === "G" ? "Gbps" : "Mbps";
  return `${m[1]} ${unit}`;
}

/** The design's badge: a marketing tag, else the plan's own discount. */
export function badgeFor(plan: Plan | undefined, withDiscount = true): Badge | null {
  if (!plan) return null;
  const tag = badgeOf(plan);
  if (tag) return tag;
  if (withDiscount && plan.discount != null && plan.discount > 0) {
    return { cls: "disc", label: `-${Math.round(plan.discount)}%` };
  }
  return null;
}

function byDays(a: Plan, b: Plan) {
  return a.durationDays - b.durationDays || Number(a.vndPrice) - Number(b.vndPrice);
}

export function buildTiers(plans: Plan[]): Tier[] {
  const byMb = new Map<number, Plan[]>();
  for (const p of plans) {
    const mb = Number(p.dataMb);
    byMb.set(mb, [...(byMb.get(mb) ?? []), p]);
  }
  return Array.from(byMb.entries())
    .sort(([a], [b]) => a - b)
    .map(([mb, list]) => {
      // One option per number of days: the cheapest plan offering it.
      const seen = new Set<number>();
      const sorted = list.sort(byDays).filter((p) => !seen.has(p.durationDays) && seen.add(p.durationDays));
      const tagged = sorted.find((p) => badgeOf(p));
      return { key: `t${mb}`, dataMb: mb, gb: gbLabel(mb), plans: sorted, badge: tagged ? badgeOf(tagged) : null };
    });
}

function group(plans: Plan[], keyOf: (p: Plan) => string): Map<string, Plan[]> {
  const out = new Map<string, Plan[]>();
  for (const p of plans) out.set(keyOf(p), [...(out.get(keyOf(p)) ?? []), p]);
  return out;
}

export function buildDaily(plans: Plan[]): Opt[] {
  return Array.from(group(plans, (p) => String(Number(p.dataMb))).values())
    .map((list) => ({
      key: `d${Number(list[0].dataMb)}`,
      kind: "daily" as const,
      plans: list.sort(byDays),
      gb: gbLabel(Number(list[0].dataMb)),
      throttle: speedLabel(list[0].fupSpeed),
      bySpeed: false,
    }))
    .sort((a, b) => Number(a.plans[0].dataMb) - Number(b.plans[0].dataMb));
}

export function buildUnlimited(fast: Plan[], daily: Plan[]): Opt[] {
  const fastOpts = Array.from(group(fast, (p) => `${Number(p.dataMb)}|${speedLabel(p.fupSpeed) || "1 Mbps"}`).entries()).map(
    ([k, list]) => ({
      key: `uf${k}`,
      kind: "unl" as const,
      plans: list.sort(byDays),
      gb: gbLabel(Number(list[0].dataMb)),
      throttle: speedLabel(list[0].fupSpeed) || "1 Mbps",
      bySpeed: false,
    }),
  );
  const dailyOpts = Array.from(group(daily, (p) => `${Number(p.dataMb)}|${speedLabel(p.fupSpeed)}`).entries()).map(
    ([k, list]) => ({
      key: `ud${k}`,
      kind: "unl" as const,
      plans: list.sort(byDays),
      gb: Number(list[0].dataMb) > 0 && list[0].fupSpeed ? gbLabel(Number(list[0].dataMb)) : "",
      throttle: speedLabel(list[0].fupSpeed),
      bySpeed: true,
    }),
  );
  // X GB/ngày first (by size, then speed), then speed-only, then full speed.
  const rank = (o: Opt) => (o.gb ? 0 : o.throttle ? 1 : 2);
  const mb = (o: Opt) => Number(o.plans[0].dataMb);
  const speed = (o: Opt) => parseFloat(o.throttle) || Infinity;
  return [...fastOpts, ...dailyOpts].sort(
    (a, b) => rank(a) - rank(b) || mb(a) - mb(b) || speed(a) - speed(b),
  );
}

export function buildCombo(plans: Plan[]): Opt[] {
  return [...plans].sort(byDays).map((p) => ({
    key: `c${p.id}`,
    kind: "combo" as const,
    plans: [p],
    gb: gbLabel(Number(p.dataMb)),
    throttle: speedLabel(p.fupSpeed),
    bySpeed: false,
  }));
}

/** The plan of a daily / unlimited chip for `days` days. */
export function planForDays(opt: Opt, days: number): Plan {
  if (opt.kind === "combo") return opt.plans[0];
  const best = opt.bySpeed
    ? findBestDailyUnlimitedPlan(opt.plans, opt.plans[0].fupSpeed || "", days)
    : findBestPlan(opt.plans, Number(opt.plans[0].dataMb), days);
  if (best) return best;
  return opt.plans.reduce((a, b) => (Math.abs(b.durationDays - days) < Math.abs(a.durationDays - days) ? b : a));
}

/**
 * Days a daily / unlimited chip can be bought for: any number when one of its
 * plans is sold per day, else only its plans' own durations.
 */
export function daysFor(opt: Opt): number[] | "any" {
  if (opt.plans.some((p) => p.isAbleMultidate)) return "any";
  return Array.from(new Set(opt.plans.map((p) => p.durationDays))).sort((a, b) => a - b);
}

/** Price of one eSIM of `plan` for `days` days, and its pre-discount price. */
export function priceOf(plan: Plan, days: number): { price: number; list: number } {
  const price = calcTotalVndPrice(plan, days);
  const list = calcTotalVndRetailPrice(plan, days);
  return { price, list: list > price ? list : 0 };
}

/** Price per day the design prints under a fixed option: "≈ 25.000₫/ngày". */
export function perDay(price: number, days: number): number {
  return days > 0 ? 100 * Math.round(price / days / 100) : price;
}

/** "Data dùng được TikTok…" verdict for the chip filter and the summary line. */
export type Apps = "all" | "notiktok" | "none" | "unknown";
export function appsOf(plan: Plan | null | undefined): Apps {
  const s = plan?.appSupport;
  if (!s?.known) return "unknown";
  if (s.tiktokAllDevices && s.chatGpt) return "all";
  if (s.chatGpt) return "notiktok";
  return "none";
}

export function countPlans(p: PlansByDestinationResponse, tab: "data" | "combo"): number {
  if (tab === "combo") return p.smsCallEsim?.length ?? 0;
  return p.dataPlans.length + p.slowUnlimited.length + p.fastUnlimited.length + p.dailyUnlimited.length;
}

/** "Thái Lan, Singapore và Nhật Bản". */
export function joinVi(names: string[], lang: string): string {
  return names.length > 1 ? tr(lang, "{0} và {1}", names.slice(0, -1).join(", "), names[names.length - 1]) : names[0] ?? "";
}
