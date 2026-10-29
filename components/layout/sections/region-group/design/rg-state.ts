"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Destination, Plan, PlansByDestinationResponse, Region } from "@/lib/api";
import { useCart, usePlansByRegionSlug, usePlansBySlug, usePublicCoupons } from "@/lib/hooks";
import { pickBestVoucher } from "@/lib/voucher-preview";
import { localizedHref } from "@/lib/route-mapping";
import { trackJourney } from "@/lib/journey-tracking";
import { filterTiktokPlans, hasTiktokPlans, isChinaProductPage } from "@/lib/plan-tiktok";
import { groupCountries } from "@/lib/region-groups";
import { localizedSlug } from "@/lib/slug";
import type { Locale } from "@/lib/i18n-config";
import { planCartItem } from "../../destination/cart-item";
import { badgeOf } from "../../local-esim/design/nd-model";
import {
  appsOf,
  buildCombo,
  buildDaily,
  buildTiers,
  buildUnlimited,
  planForDays,
  priceOf,
  tripCombo,
  tripOpts,
  tripTiers,
  type Kind,
  type Opt,
  type Tier,
} from "./rg-model";
import {
  normalizeDays,
  validDays as soldDays,
  type DaysWarning,
} from "../../destination/days-first";

const EMPTY: PlansByDestinationResponse = {
  dataPlans: [],
  slowUnlimited: [],
  fastUnlimited: [],
  dailyUnlimited: [],
  smsCallEsim: [],
  localEsim: [],
};

/** Destinations that ask for identity verification (the design's `r`). */
const KYC_CODES = ["HK", "TW", "MO"];

/**
 * A chosen plan: a fixed size, or a daily / unlimited / combo chip. The days
 * come from the trip length (vande #089), not from the selection.
 */
export interface Selection {
  kind: Kind;
  key: string;
}

export interface RegionCountry {
  code: string;
  name: string;
  flagUrl?: string;
  /** Members (by index into the sorted list) that cover this country. */
  in: number[];
}

/**
 * Everything the region page tracks (#067): the coverage variant, the
 * countries the visitor says they will visit, the plan, days and quantity,
 * and the prices that follow. Shared by the desktop and mobile layouts.
 */
export function useRegionPurchase(
  regions: Region[],
  lang: Locale,
  initialSlug?: string,
  /**
   * A country page on the same design (vande #032): one "pack" — the country
   * itself — with no coverage step, its plans read by destination.
   */
  country?: Destination | null,
  initialPlans?: PlansByDestinationResponse | null,
  /** The country's own note from the CMS, shown in the design's note bar. */
  noticeHtml?: string | null,
) {
  const router = useRouter();
  const { addItem } = useCart();
  const { data: coupons } = usePublicCoupons();

  // The design lists the widest coverage first.
  const members = useMemo(
    () => [...regions].sort((a, b) => count(b) - count(a)),
    [regions],
  );
  const [active, setActive] = useState(() =>
    Math.max(0, members.findIndex((m) => localizedSlug(m, lang) === initialSlug)),
  );
  const member = members[active] ?? members[0];
  const slug = member ? localizedSlug(member, lang) : "";

  const regionPlans = usePlansByRegionSlug(country ? "" : slug, lang);
  const countryPlans = usePlansBySlug(country ? slug : "", lang, initialPlans ?? undefined);
  const { data: all = EMPTY, isLoading } = country ? countryPlans : regionPlans;

  // ── countries ──
  const countries: RegionCountry[] = useMemo(() => {
    const flags = new Map<string, string | undefined>();
    for (const m of members) for (const d of m.destinations ?? []) flags.set((d.countryCode || "").toUpperCase(), d.flagUrl);
    return groupCountries(members, lang).map((c) => ({
      code: c.countryCode,
      name: c.name,
      flagUrl: flags.get(c.countryCode),
      in: members.map((m, i) => (c.memberIds.includes(m.id) ? i : -1)).filter((i) => i >= 0),
    }));
  }, [members, lang]);
  const codesOf = (i: number) =>
    (members[i]?.destinations ?? []).map((d) => (d.countryCode || "").toUpperCase()).filter(Boolean);
  const codes = codesOf(active);
  const nameOf = (code: string) => countries.find((c) => c.code === code)?.name ?? code;

  const [picked, setPicked] = useState<string[]>([]);
  /** The cheapest variant that covers every picked country (design's `V`). */
  const fitFor = (list: string[]): number | null => {
    if (!list.length) return null;
    let best: number | null = null;
    members.forEach((_, i) => {
      const c = codesOf(i);
      if (!list.every((x) => c.includes(x))) return;
      if (best === null || cheaper(members[i], members[best])) best = i;
    });
    return best;
  };
  const fit = fitFor(picked);
  const togglePick = (code: string, on?: boolean) => {
    const next = (on ?? !picked.includes(code)) ? Array.from(new Set([...picked, code])) : picked.filter((c) => c !== code);
    setPicked(next);
    const f = fitFor(next);
    if (f !== null && f !== active) setActive(f);
  };

  // ── plans ──
  const china = isChinaProductPage(country ? { destination: country } : { region: member });
  const showFilter = china && hasTiktokPlans(all);
  const [appFilter, setAppFilter] = useState(false);
  const plans = appFilter && showFilter ? filterTiktokPlans(all) : all;

  const allTiers = useMemo(() => buildTiers(plans.dataPlans), [plans.dataPlans]);
  const allDaily = useMemo(() => buildDaily(plans.slowUnlimited), [plans.slowUnlimited]);
  const allUnl = useMemo(() => buildUnlimited(plans.fastUnlimited, plans.dailyUnlimited), [plans.fastUnlimited, plans.dailyUnlimited]);
  const allCombo = useMemo(() => buildCombo(plans.smsCallEsim ?? []), [plans.smsCallEsim]);

  // ── trip length first (vande #089, "Chọn số ngày trước") ──
  // The visitor says how long the trip is; the plans shown are those that
  // cover it. Days the destination does not sell snap to one it does.
  const sold = useMemo(() => soldDays({ ...plans, localEsim: [] }), [plans]);
  const [days, setDaysRaw] = useState(7);
  const [warning, setWarning] = useState<DaysWarning | null>(null);
  useEffect(() => {
    if (sold.length && !sold.includes(days)) setDaysRaw(normalizeDays(days, sold).days);
  }, [sold]); // eslint-disable-line react-hooks/exhaustive-deps
  const setDays = (requested: number) => {
    const { days: next, warning: w } = normalizeDays(requested, sold);
    setWarning(w);
    setDaysRaw(next);
  };

  const tiers = useMemo(() => tripTiers(allTiers, days), [allTiers, days]);
  const daily = useMemo(() => tripOpts(allDaily, days), [allDaily, days]);
  const unl = useMemo(() => tripOpts(allUnl, days), [allUnl, days]);
  const combo = useMemo(() => tripCombo(allCombo, days), [allCombo, days]);

  const [tab, setTab] = useState<"data" | "combo">("data");
  const [sel, setSel] = useState<Selection | null>(null);
  /** Kept for the layouts: a trip length is always chosen now (vande #089). */
  const need = false;
  const setNeed = (_: boolean) => undefined;
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (slug) trackJourney("plan_list", slug);
  }, [slug]);

  const tierOf = (key?: string) => tiers.find((t) => t.key === key) ?? null;
  const optOf = (key?: string) => [...daily, ...unl, ...combo].find((o) => o.key === key) ?? null;
  const valid = (s: Selection | null) => !!s && (s.kind === "fixed" ? !!tierOf(s.key) : !!optOf(s.key));

  // One plan is always chosen (spec §7.4): the same kind and size when the
  // trip length, the filter or the coverage still offers it, else the default
  // — fixed 1 GB, else the first there is. A choice on the other tab takes
  // the tab with it.
  useEffect(() => {
    if (isLoading || valid(sel)) return;
    const next = defaultSelection(tiers, daily, unl, combo, tab);
    setSel(next);
    if (next?.kind === "combo") setTab("combo");
    else if (next) setTab("data");
  }, [isLoading, tiers, daily, unl, combo]); // eslint-disable-line react-hooks/exhaustive-deps

  const tier = sel?.kind === "fixed" ? tierOf(sel.key) : null;
  const opt = sel && sel.kind !== "fixed" ? optOf(sel.key) : null;
  // The fixed plan of that size closest to the trip: its shortest that lasts it.
  const fixedPlan: Plan | null = tier ? tier.plans[0] ?? null : null;
  const allowed = null;

  const plan: Plan | null = fixedPlan ?? (opt ? planForDays(opt, days) : null);
  const perDayKind = !!opt && opt.kind !== "combo";
  const effDays = plan ? (perDayKind ? days : plan.durationDays) : days;
  const isFixed = !perDayKind;

  const selectTier = (t: Tier) => {
    setSel({ kind: "fixed", key: t.key });
    if (t.plans[0]) trackJourney("plan_view", String(t.plans[0].id));
  };
  /** Kept for callers of the old dropdown; the size is what is picked now. */
  const selectFixedDays = (t: Tier, _d: number) => selectTier(t);
  const selectOpt = (o: Opt) => {
    setSel({ kind: o.kind, key: o.key });
    trackJourney("plan_view", String(planForDays(o, days).id));
  };
  const switchTab = (t: "data" | "combo") => {
    setTab(t);
    if (t === "combo" && sel?.kind !== "combo" && combo[0]) selectOpt(combo[0]);
    if (t === "data" && sel?.kind === "combo") setSel(defaultSelection(tiers, daily, unl, [], "data"));
  };
  const toggleAppFilter = (on: boolean) => {
    setAppFilter(on);
    // The selection is re-checked against the filtered lineup by the effect.
  };

  // ── price ──
  const stock = plan?.availableStock == null ? Infinity : Math.max(0, Number(plan.availableStock));
  const quantity = Math.max(1, Math.min(qty, stock === Infinity ? qty : stock));
  const atMax = quantity >= stock;
  const { price: unit, list: listUnit } = plan ? priceOf(plan, effDays) : { price: 0, list: 0 };
  const total = unit * quantity;
  const listTotal = listUnit * quantity;
  const voucher = plan ? pickBestVoucher(coupons as never, total) : null;
  const voucherCoupon = voucher
    ? ((coupons as { code: string; maxDiscountAmount?: number | null }[] | undefined) ?? []).find((c) => c.code === voucher.code)
    : undefined;
  const net = voucher ? voucher.finalVnd : total;

  // ── identity verification ──
  const kycCodes = codes.filter((c) => KYC_CODES.includes(c));
  // A country page says "needs verification" without naming where (vande #032).
  const kycWhere = country ? [] : kycCodes.map(nameOf);
  const needsKyc = !!plan?.isKyc;

  // ── cart ──
  const regionName = member ? (lang === "vi" ? member.titleVi || member.name : member.title || member.name) : "";
  const cartItem = () =>
    plan ? planCartItem(plan, { days: effDays, isFixed, destination: `eSIM ${regionName}` }) : null;
  const addToCart = async () => {
    const item = cartItem();
    if (!item || need) return false;
    await addItem(item, quantity);
    setCartOpen(true);
    return true;
  };
  const buyNow = async () => {
    const item = cartItem();
    if (!item || need) return false;
    await addItem(item, quantity);
    router.push(localizedHref(lang, "cart"));
    return true;
  };

  return {
    // Page language, for the design's copy (vande #029).
    lang,
    /** Set on a country page (vande #032); null on a region page. */
    country: country ?? null,
    noticeHtml: noticeHtml ?? null,
    /** China, for the country page's own notes (vande #032). */
    china,
    members,
    active,
    setActive,
    member,
    /** Countries of the chosen pack. */
    n: countOf(member),
    codes,
    countries,
    nameOf,
    picked,
    togglePick,
    clearPicked: () => setPicked([]),
    fit,
    isLoading,
    all,
    plans,
    showFilter,
    appFilter,
    toggleAppFilter,
    /** What is shown for the trip length chosen (vande #089). */
    tiers,
    daily,
    unl,
    combo,
    /** Whether the destination sells data+call+SMS plans at all. */
    hasCombo: allCombo.length > 0,
    /** Trip length (vande #089) and the days the destination sells. */
    tripDays: days,
    validDays: sold,
    warning,
    tab,
    switchTab,
    sel,
    tier,
    opt,
    plan,
    need,
    setNeed,
    selectTier,
    selectFixedDays,
    selectOpt,
    days: effDays,
    setDays,
    allowed,
    perDayKind,
    isFixed,
    quantity,
    setQty,
    atMax,
    stock,
    unit,
    total,
    listTotal,
    voucher,
    voucherMax: Number(voucherCoupon?.maxDiscountAmount ?? 0) || null,
    net,
    apps: appsOf(plan),
    kycWhere,
    needsKyc,
    regionName,
    addToCart,
    buyNow,
    cartOpen,
    setCartOpen,
  };
}

export type RegionPurchase = ReturnType<typeof useRegionPurchase>;

/** Countries a pack covers, as its CMS record states it. */
export function countOf(r: Region | undefined): number {
  return r?.destinationCount || r?.destinations?.length || 0;
}
const count = countOf;

/** Cheaper by its "from" price; fewer countries when prices are unknown. */
function cheaper(a: Region, b: Region): boolean {
  const pa = Number(a.fromPrice);
  const pb = Number(b.fromPrice);
  if (pa > 0 && pb > 0 && pa !== pb) return pa < pb;
  return count(a) < count(b);
}

function defaultSelection(
  tiers: Tier[],
  daily: Opt[],
  unl: Opt[],
  combo: Opt[],
  tab: "data" | "combo",
): Selection | null {
  // The designs open on fixed 1 GB (spec §7.4 step 4), else the first plan.
  const t = tiers.find((x) => x.dataMb === 1024) ?? tiers[0];
  const data = t ? { kind: "fixed" as const, key: t.key } : daily[0] ?? unl[0];
  const first = tab === "combo" ? combo[0] ?? data : data ?? combo[0];
  if (!first) return null;
  return "plans" in first ? { kind: first.kind, key: first.key } : first;
}
