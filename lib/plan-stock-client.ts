"use client";

import { useQuery } from "@tanstack/react-query";

/** eSIMs left per plan id: a number for local stock, null when unlimited. */
export type PlanStock = Record<number, number | null>;

/**
 * The stock of the plans in the cart, read fresh (vande-1411 #008): the cart
 * and checkout must not take more Viettel / domestic eSIMs than are left.
 * Missing ids (not loaded yet, or the request failed) count as unlimited:
 * the server refuses an order over the stock anyway.
 */
export function usePlanStock(planIds: (number | undefined)[]) {
  const ids = Array.from(
    new Set(planIds.filter((id): id is number => typeof id === "number" && id > 0))
  ).sort((a, b) => a - b);
  return useQuery<PlanStock>({
    queryKey: ["plan-stock", ids.join(",")],
    enabled: ids.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const res = await fetch(`${base}/api/v1/plans/stock?ids=${ids.join(",")}`);
      if (!res.ok) return {};
      return (await res.json()) as PlanStock;
    },
  });
}

/** eSIMs left of a cart line's plan; Infinity when it does not track stock. */
export function stockLeft(stock: PlanStock | undefined, planId: number | undefined): number {
  if (!stock || !planId) return Infinity;
  const left = stock[planId];
  return left === null || left === undefined ? Infinity : Math.max(0, Number(left));
}

/**
 * What stops a line from being bought, or null: none left, or more than is
 * left. Lines of one plan count together.
 */
export function stockProblem(
  item: { planId?: number; quantity: number; name?: string },
  stock: PlanStock | undefined,
  lang: string,
  quantityOfPlan: number = item.quantity
): string | null {
  const left = stockLeft(stock, item.planId);
  if (left === Infinity || quantityOfPlan <= left) return null;
  const vi = lang === "vi";
  if (left === 0) {
    return vi
      ? `Gói "${item.name ?? ""}" đã hết eSIM, vui lòng xoá khỏi giỏ hàng.`
      : `"${item.name ?? ""}" is sold out, please remove it from the cart.`;
  }
  return vi
    ? `Gói "${item.name ?? ""}" chỉ còn ${left} eSIM.`
    : `Only ${left} eSIM of "${item.name ?? ""}" left.`;
}
