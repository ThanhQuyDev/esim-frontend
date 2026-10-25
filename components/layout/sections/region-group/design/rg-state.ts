"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan, PlansByDestinationResponse, Region } from "@/lib/api";
import { useCart, usePlansByRegionSlug, usePublicCoupons } from "@/lib/hooks";
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
  daysFor,
  planForDays,
  priceOf,
  type Kind,
  type Opt,
  type Tier,
} from "./rg-model";

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

/** A chosen plan: a fixed size with its days, or a daily / unlimited / combo chip. */
export interface Selection {
  kind: Kind;
  key: string;
  /** Fixed plans: the number of days picked in the dropdown. */
  days?: number;
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
export function useRegionPurchase(regions: Region[], lang: Locale, initialSlug?: string) {
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

  const { data: all = EMPTY, isLoading } = usePlansByRegionSlug(slug, lang);

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
  const china = isChinaProductPage({ region: member });
  const showFilter = china && hasTiktokPlans(all);
  const [appFilter, setAppFilter] = useState(false);
  const plans = appFilter && showFilter ? filterTiktokPlans(all) : all;

  const tiers = useMemo(() => buildTiers(plans.dataPlans), [plans.dataPlans]);
  const daily = useMemo(() => buildDaily(plans.slowUnlimited), [plans.slowUnlimited]);
  const unl = useMemo(() => buildUnlimited(plans.fastUnlimited, plans.dailyUnlimited), [plans.fastUnlimited, plans.dailyUnlimited]);
  const combo = useMemo(() => buildCombo(plans.smsCallEsim ?? []), [plans.smsCallEsim]);

  const [tab, setTab] = useState<"data" | "combo">("data");
  const [sel, setSel] = useState<Selection | null>(null);
  const [days, setDays] = useState(7);
  /** A size was picked but not its days yet (design's `l.need`). */
  const [need, setNeed] = useState(false);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (slug) trackJourney("plan_list", slug);
  }, [slug]);

  const tierOf = (key?: string) => tiers.find((t) => t.key === key) ?? null;
  const optOf = (key?: string) => [...daily, ...unl, ...combo].find((o) => o.key === key) ?? null;
  const valid = (s: Selection | null) => !!s && (s.kind === "fixed" ? !!tierOf(s.key) : !!optOf(s.key));

  // Open on the design's default — the popular fixed plan — or the first one
  // there is; keep the choice across variants when the new one sells it too.
  useEffect(() => {
    if (isLoading || valid(sel)) return;
    const next = defaultSelection(tiers, daily, unl, combo, sel);
    setSel(next);
    setNeed(false);
    if (next?.kind === "combo") setTab("combo");
    else if (next) setTab("data");
  }, [isLoading, tiers, daily, unl, combo]); // eslint-disable-line react-hooks/exhaustive-deps

  const tier = sel?.kind === "fixed" ? tierOf(sel.key) : null;
  const opt = sel && sel.kind !== "fixed" ? optOf(sel.key) : null;
  const fixedPlan: Plan | null = tier
    ? (tier.plans.find((p) => p.durationDays === sel?.days) ?? tier.plans[0])
    : null;
  const allowed = opt && opt.kind !== "combo" ? daysFor(opt) : null;

  // Days a daily / unlimited chip cannot be bought for snap to the nearest.
  useEffect(() => {
    if (!allowed || allowed === "any" || !allowed.length || allowed.includes(days)) return;
    setDays(allowed.reduce((a, b) => (Math.abs(b - days) < Math.abs(a - days) ? b : a)));
  }, [allowed, days]);

  const plan: Plan | null = fixedPlan ?? (opt ? planForDays(opt, days) : null);
  const perDayKind = !!opt && opt.kind !== "combo";
  const effDays = plan ? (perDayKind ? days : plan.durationDays) : days;
  const isFixed = !perDayKind;

  const selectTier = (t: Tier) => {
    // Nearest number of days to what is chosen now; the visitor still has to
    // confirm it in the dropdown (design: tier click → dock "need").
    const target = plan ? effDays : days;
    const near = [...t.plans].sort(
      (a, b) => Math.abs(a.durationDays - target) - Math.abs(b.durationDays - target) || a.durationDays - b.durationDays,
    )[0];
    setSel({ kind: "fixed", key: t.key, days: near?.durationDays });
    setNeed(true);
    if (near) trackJourney("plan_view", String(near.id));
  };
  const selectFixedDays = (t: Tier, d: number) => {
    setSel({ kind: "fixed", key: t.key, days: d });
    setNeed(false);
    const p = t.plans.find((x) => x.durationDays === d);
    if (p) trackJourney("plan_view", String(p.id));
  };
  const selectOpt = (o: Opt) => {
    setSel({ kind: o.kind, key: o.key });
    setNeed(false);
    trackJourney("plan_view", String(planForDays(o, days).id));
  };
  const switchTab = (t: "data" | "combo") => {
    setTab(t);
    if (t === "combo" && sel?.kind !== "combo" && combo[0]) selectOpt(combo[0]);
    if (t === "data" && sel?.kind === "combo") setSel(defaultSelection(tiers, daily, unl, [], null));
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
  const kycWhere = kycCodes.map(nameOf);
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
    tiers,
    daily,
    unl,
    combo,
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

function defaultSelection(tiers: Tier[], daily: Opt[], unl: Opt[], combo: Opt[], prev: Selection | null): Selection | null {
  // Same kind and size as before, when the new lineup has it.
  if (prev?.kind === "fixed") {
    const t = tiers.find((x) => x.key === prev.key);
    if (t) return { kind: "fixed", key: t.key, days: t.plans.some((p) => p.durationDays === prev.days) ? prev.days : t.plans[0]?.durationDays };
  }
  const popular = tiers.find((t) => t.plans.some((p) => badgeOf(p)?.cls === "pop"));
  if (popular) {
    const p = popular.plans.find((x) => badgeOf(x)?.cls === "pop")!;
    return { kind: "fixed", key: popular.key, days: p.durationDays };
  }
  const t7 = tiers.find((t) => t.plans.some((p) => p.durationDays === 7));
  if (t7) return { kind: "fixed", key: t7.key, days: 7 };
  if (tiers[0]) return { kind: "fixed", key: tiers[0].key, days: tiers[0].plans[0]?.durationDays };
  const o = daily[0] ?? unl[0] ?? combo[0];
  return o ? { kind: o.kind, key: o.key } : null;
}
