import type { DomesticOffer, Plan } from "@/lib/api";
import { isPlanSoldOut } from "@/lib/plan-stock";
import type { CarrierMeta } from "../carrier-meta";

/**
 * Data behind the domestic-eSIM carrier page, ported from the design file
 * "esim-noi-dia-desktop-v60 / mobile-v45" (#066, test round 4).
 *
 * The design shows one card per offer and a "Chu kỳ sử dụng" (1/3/6/12 tháng)
 * picker. Our data has one plan per import row, each with its own number of
 * monthly cycles, so plans that offer the SAME thing for a different number of
 * months are grouped into one card and the picker switches between them.
 */

export type BadgeClass = "hot" | "nw" | "pop" | "bv";

export interface CardLine {
  icon: "ic-phone" | "ic-social";
  text: string;
  /** Explanation behind the ⓘ, when the wording needs one. */
  tip?: string;
}

export interface CardNote {
  icon: "ic-gift" | "ic-calendar" | "ic-bolt";
  text: string;
  /** The "Miễn phí gói N tháng đầu" note follows the chosen cycle. */
  isCycle?: boolean;
}

/** One card: an offer and its variants by cycle length. */
export interface OfferGroup {
  key: string;
  /** Variants sorted by number of months, shortest first. */
  variants: Plan[];
  unlimited: boolean;
}

const VI_MONTH = (m: number) => `${m} tháng`;

export function offerOf(plan: Plan): DomesticOffer | null {
  return plan.domesticOffer ?? null;
}

export function isUnlimitedPlan(plan: Plan): boolean {
  const t = (offerOf(plan)?.bundleType ?? plan.type ?? "").toLowerCase();
  return t === "unlimited" || t === "unlimited-reduce";
}

export function cycleMonths(plan: Plan): number {
  const offer = offerOf(plan);
  if (offer?.cycleMonths) return offer.cycleMonths;
  return Math.max(1, Math.round((plan.durationDays || 30) / 30));
}

function period(plan: Plan): "daily" | "month" {
  const offer = offerOf(plan);
  if (offer) return offer.dataPeriod;
  return (plan.type ?? "").toLowerCase() === "month" ? "month" : "daily";
}

/** "7 GB", "1.5 GB", "500 MB". */
export function sizeLabel(mb: number): string {
  if (mb >= 1024) {
    const gb = mb / 1024;
    return `${Number.isInteger(gb) ? gb : parseFloat(gb.toFixed(1))} GB`;
  }
  return `${Math.round(mb)} MB`;
}

export function perLabel(plan: Plan): string {
  return period(plan) === "daily" ? "ngày" : "tháng";
}

function firstDataMb(plan: Plan): number | null {
  const offer = offerOf(plan);
  if (offer) return offer.firstCycleDataMb;
  return plan.dataMb ? Number(plan.dataMb) : null;
}

/** The card's headline: "7 GB/ngày", "10 GB/tháng" or "Data không giới hạn". */
export function dataTitle(plan: Plan): string {
  if (isUnlimitedPlan(plan)) return "Data không giới hạn";
  const mb = firstDataMb(plan);
  return mb ? `${sizeLabel(mb)}/${perLabel(plan)}` : "Data không giới hạn";
}

/** Calls, SMS and social-data lines under the headline. */
export function cardLines(plan: Plan): CardLine[] {
  const o = offerOf(plan);
  if (!o) return [];
  const lines: CardLine[] = [];
  if (o.offNetMinutes > 0) lines.push({ icon: "ic-phone", text: `${o.offNetMinutes} phút ngoại mạng` });
  if (o.onNetMinutes > 0) lines.push({ icon: "ic-phone", text: `${o.onNetMinutes} phút nội mạng` });
  if (o.domesticMinutes > 0)
    lines.push({
      icon: "ic-phone",
      text: `${o.domesticMinutes} phút trong nước`,
      tip: `${o.domesticMinutes} phút gọi áp dụng cho tất cả cuộc gọi nội mạng và ngoại mạng.`,
    });
  if (o.offNetSms > 0) lines.push({ icon: "ic-phone", text: `${o.offNetSms} SMS ngoại mạng` });
  if (o.onNetSms > 0) lines.push({ icon: "ic-phone", text: `${o.onNetSms} SMS nội mạng` });
  if (o.zeroRatedSocial)
    lines.push({
      icon: "ic-social",
      text: "Miễn phí data mạng xã hội",
      tip: "Miễn phí truy cập YouTube, Facebook, TikTok.",
    });
  return lines;
}

/**
 * The footnote: data from the second cycle when it changes, the high-speed
 * allowance of an "unlimited-reduce" plan, otherwise that the first cycle's
 * fee is included in the eSIM price.
 */
export function cardNote(plan: Plan): CardNote {
  const o = offerOf(plan);
  const months = cycleMonths(plan);
  if (o && o.recurringDataMb !== o.firstCycleDataMb && o.recurringDataMb) {
    return {
      icon: "ic-calendar",
      text: `Từ tháng thứ ${months + 1}: ${sizeLabel(o.recurringDataMb)}/${perLabel(plan)}`,
    };
  }
  const bundle = (o?.bundleType ?? plan.type ?? "").toLowerCase();
  const first = firstDataMb(plan);
  if (bundle === "unlimited-reduce" && first) {
    return {
      icon: "ic-bolt",
      text: `Tốc độ cao ${sizeLabel(first)}/${perLabel(plan)}, hết data chuyển tốc độ thường`,
    };
  }
  return { icon: "ic-gift", text: `Miễn phí gói ${VI_MONTH(months)} đầu`, isCycle: true };
}

export function totalMinutes(plan: Plan): number {
  const o = offerOf(plan);
  return o ? o.offNetMinutes + o.onNetMinutes + o.domesticMinutes : 0;
}

/** "7 GB/ngày + 330 phút gọi" — the summary line by the buy buttons. */
export function summary(plan: Plan): string {
  const minutes = totalMinutes(plan);
  return minutes > 0 ? `${dataTitle(plan)} + ${minutes} phút gọi` : dataTitle(plan);
}

/** "WIN119P — 7 GB/ngày" */
export function planLabel(plan: Plan): string {
  return `${plan.providerPlanId} — ${dataTitle(plan)}`;
}

/** Hotspot allowance: "7 GB/ngày"; "Không giới hạn" for an unlimited one. */
export function hotspotLabel(plan: Plan): string | null {
  if (!plan.hotSpot && !plan.hotSpotAllow) return null;
  const raw = (plan.hotSpotAllow ?? "").trim();
  if (!raw) return "Có";
  if (/unlimited|không giới hạn/i.test(raw)) return "Không giới hạn";
  const m = raw.match(/([\d.,]+)\s*(gb|mb)?/i);
  if (!m) return raw;
  const unit = (m[2] ?? "GB").toUpperCase();
  return `${m[1]} ${unit}/${perLabel(plan)}`;
}

/** "Wintel 4G/5G – Hạ tầng VinaPhone" / "VNSKY 5G – Hạ tầng MobiFone". */
export function networkLabel(meta: CarrierMeta, plan: Plan | null): string {
  const tech = plan && techOf(plan) === "5G" && !(plan.speed ?? "").includes("4G") ? "5G" : "4G/5G";
  return meta.network ? `${meta.label} ${tech} – Hạ tầng ${meta.network}` : `${meta.label} ${tech}`;
}

export function techOf(plan: Plan): "4G" | "5G" {
  return (plan.speed ?? "").toUpperCase().includes("5G") ? "5G" : "4G";
}

/** "Đầu số 055" — from the plan, else the carrier's known prefix. */
export function phonePrefixLabel(meta: CarrierMeta, plan: Plan | null): string | null {
  const fromPlan = plan ? offerOf(plan)?.supportPhone : null;
  if (fromPlan) return fromPlan;
  return meta.phonePrefix ? `Đầu số ${meta.phonePrefix}` : null;
}

/** Marketing tag → the design's badge class and label. */
export function badgeOf(plan: Plan): { cls: BadgeClass; label: string } | null {
  for (const raw of (plan.tags as string[] | undefined) ?? []) {
    const s = String(raw).toLowerCase().trim().replace(/[\s_]+/g, "-");
    if (s === "hot-deal" || s === "hot" || s === "hotdeal") return { cls: "hot", label: "Giá sốc" };
    if (s === "new") return { cls: "nw", label: "Mới" };
    if (s === "popular") return { cls: "pop", label: "Phổ biến" };
    if (s === "best-seller" || s === "bestseller" || s === "best") return { cls: "bv", label: "Bán chạy" };
  }
  return null;
}

/** Sale price (VND) of one eSIM of this plan. */
export function priceVnd(plan: Plan): number {
  return Number(plan.vndPrice) || 0;
}

/**
 * The list price shown struck through ("Giá gốc"), from the plan's retail
 * price, rounded to thousands — the same figure the old page showed.
 */
export function listVnd(plan: Plan): number {
  const price = Number(plan.price);
  const retail = Number(plan.retailPrice);
  const vnd = priceVnd(plan);
  if (!(price > 0) || !(retail > 0)) return 0;
  const list = Math.round((vnd * retail) / price / 1000) * 1000;
  return list > vnd ? list : 0;
}

/** Renewal fee per cycle: "119.000₫/1 tháng". */
export function renewalLabel(plan: Plan, fmt: (n: number) => string): string | null {
  const o = offerOf(plan);
  if (!o?.cycleFeeVnd) return null;
  return `${fmt(o.cycleFeeVnd)}/${VI_MONTH(o.cycleMonths)}`;
}

/** "Cước 119k / 1 tháng" (mobile card). */
export function renewalShort(plan: Plan): string | null {
  const o = offerOf(plan);
  if (!o?.cycleFeeVnd) return null;
  const k = o.cycleFeeVnd / 1000;
  return `Cước ${Number.isInteger(k) ? k : k.toFixed(1)}k / ${VI_MONTH(o.cycleMonths)}`;
}

export function monthLabel(m: number): string {
  return VI_MONTH(m);
}

/** What makes two plans the same offer, apart from how many months they run. */
function offerKey(plan: Plan): string {
  const o = offerOf(plan);
  // A plan imported before the domestic template has no perks to compare by:
  // it is its own card.
  if (!o) return `plan:${plan.id}`;
  return [
    isUnlimitedPlan(plan) ? "u" : "d",
    (o?.bundleType ?? plan.type ?? "").toLowerCase(),
    o?.firstCycleDataMb ?? plan.dataMb,
    o?.recurringDataMb ?? "",
    o?.dataPeriod ?? "",
    o?.offNetMinutes ?? "",
    o?.onNetMinutes ?? "",
    o?.domesticMinutes ?? "",
    o?.offNetSms ?? "",
    o?.onNetSms ?? "",
    o?.zeroRatedSocial ? 1 : 0,
    techOf(plan),
    // a renewal fee per cycle that differs is a different offer
    o?.cycleFeeVnd && o.cycleMonths ? Math.round(o.cycleFeeVnd / o.cycleMonths) : "",
  ].join("|");
}

/** Cards for the page, in the order the plans arrive (cheapest first). */
export function groupOffers(plans: Plan[]): OfferGroup[] {
  const groups = new Map<string, OfferGroup>();
  for (const plan of plans) {
    const key = offerKey(plan);
    const g = groups.get(key) ?? { key, variants: [], unlimited: isUnlimitedPlan(plan) };
    g.variants.push(plan);
    groups.set(key, g);
  }
  return Array.from(groups.values()).map((g) => ({
    ...g,
    variants: g.variants.sort((a, b) => cycleMonths(a) - cycleMonths(b) || priceVnd(a) - priceVnd(b)),
  }));
}

/** The variant of a card for the chosen number of months, else its shortest. */
export function variantFor(group: OfferGroup, months: number): Plan {
  return group.variants.find((p) => cycleMonths(p) === months) ?? group.variants[0];
}

/** Whether every variant of a card is out of stock. */
export function groupSoldOut(group: OfferGroup): boolean {
  return group.variants.every((p) => isPlanSoldOut(p));
}

/** Stock left for a plan, or Infinity when the plan does not track stock. */
export function stockOf(plan: Plan): number {
  const s = plan.availableStock;
  return s === null || s === undefined ? Infinity : Math.max(0, Number(s));
}
