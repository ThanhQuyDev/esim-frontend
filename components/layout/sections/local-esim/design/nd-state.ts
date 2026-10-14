"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/api";
import { formatVnd, useCart, usePublicCoupons } from "@/lib/hooks";
import { pickBestVoucher } from "@/lib/voucher-preview";
import { localizedHref } from "@/lib/route-mapping";
import { trackJourney } from "@/lib/journey-tracking";
import { planCartItem } from "../../destination/cart-item";
import {
  cycleMonths,
  groupOffers,
  groupSoldOut,
  listVnd,
  priceVnd,
  stockOf,
  variantFor,
  type OfferGroup,
} from "./nd-model";

/** VND as the design writes it: "119.000₫". */
export const vnd = (n: number) => formatVnd(Math.round(n));

/**
 * Everything the domestic carrier page tracks: the chosen card, cycle length
 * and quantity, and the prices that follow from them (#066). Shared by the
 * desktop and mobile layouts of the design.
 */
export function useDomesticPurchase(plans: Plan[], carrier: string, lang: string, destination: string) {
  const router = useRouter();
  const { addItem } = useCart();
  const { data: coupons } = usePublicCoupons();

  const groups = useMemo(() => groupOffers(plans), [plans]);
  const highSpeed = useMemo(() => groups.filter((g) => !g.unlimited), [groups]);
  const unlimited = useMemo(() => groups.filter((g) => g.unlimited), [groups]);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [months, setMonths] = useState(1);
  const [qty, setQty] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    trackJourney("plan_list", carrier);
  }, [carrier]);

  // Open on the first card that is actually in stock (#040).
  useEffect(() => {
    if (selectedKey && groups.some((g) => g.key === selectedKey)) return;
    const first =
      highSpeed.find((g) => !groupSoldOut(g)) ??
      unlimited.find((g) => !groupSoldOut(g)) ??
      null;
    if (first) {
      setSelectedKey(first.key);
      setMonths(cycleMonths(first.variants[0]));
    }
  }, [groups, highSpeed, unlimited, selectedKey]);

  const group: OfferGroup | null = groups.find((g) => g.key === selectedKey) ?? null;
  const plan: Plan | null = group ? variantFor(group, months) : null;

  const selectGroup = (g: OfferGroup) => {
    if (groupSoldOut(g)) return;
    setSelectedKey(g.key);
    // Keep the chosen cycle when the card offers it; else its shortest.
    const keep = g.variants.some((p) => cycleMonths(p) === months);
    const next = keep ? variantFor(g, months) : g.variants[0];
    if (!keep) setMonths(cycleMonths(next));
    trackJourney("plan_view", String(next.id));
  };

  const stock = plan ? stockOf(plan) : Infinity;
  const quantity = Math.max(1, Math.min(qty, stock === Infinity ? qty : stock));
  const atMax = quantity >= stock;

  const unit = plan ? priceVnd(plan) : 0;
  const total = unit * quantity;
  const listUnit = plan ? listVnd(plan) : 0;
  const listTotal = listUnit * quantity;
  const voucher = plan ? pickBestVoucher(coupons as never, total) : null;
  const voucherCoupon = voucher
    ? ((coupons as { code: string; maxDiscountAmount?: number | null }[] | undefined) ?? []).find(
        (c) => c.code === voucher.code,
      )
    : undefined;
  const net = voucher ? voucher.finalVnd : total;

  const cartItem = () =>
    plan ? planCartItem(plan, { days: plan.durationDays, isFixed: true, destination }) : null;

  const addToCart = async () => {
    const item = cartItem();
    if (!item) return;
    await addItem(item, quantity);
    setCartOpen(true);
  };
  const buyNow = async () => {
    const item = cartItem();
    if (!item) return;
    await addItem(item, quantity);
    router.push(localizedHref(lang, "cart"));
  };

  return {
    groups,
    highSpeed,
    unlimited,
    group,
    plan,
    months,
    setMonths,
    selectGroup,
    quantity,
    setQty,
    atMax,
    stock,
    unit,
    total,
    listUnit,
    listTotal,
    voucher,
    voucherMax: Number(voucherCoupon?.maxDiscountAmount ?? 0) || null,
    net,
    addToCart,
    buyNow,
    cartOpen,
    setCartOpen,
  };
}

export type DomesticPurchase = ReturnType<typeof useDomesticPurchase>;

/**
 * The price and quantity fields the shared design parts read (quantity
 * stepper, stock alert, voucher breakdown) — the region page (#067) feeds
 * them from its own state.
 */
export interface PriceState {
  quantity: number;
  setQty: (n: number) => void;
  atMax: boolean;
  stock: number;
  total: number;
  listTotal: number;
  voucher: ReturnType<typeof pickBestVoucher>;
  voucherMax: number | null;
  net: number;
}

/** "dd/mm/yyyy" `days` from today — the design's activation deadline. */
export function dateAfter(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
