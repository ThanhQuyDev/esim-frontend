import type { Plan } from "./api";

/**
 * True when a plan is domestic stock that has run out.
 *
 * Only local inventory (Viettel and the other domestic carriers) is a finite
 * pile of pre-loaded eSIMs. Every other provider mints one on demand, so their
 * plans carry no stock figure and must never be treated as sold out (#040).
 */
export function isPlanSoldOut(plan: Pick<Plan, "isLocalInventory" | "availableStock">): boolean {
  if (!plan.isLocalInventory) return false;
  return (plan.availableStock ?? null) !== null && Number(plan.availableStock) <= 0;
}

/** "Tạm hết hàng" / "Out of stock". */
export function soldOutLabel(lang: string): string {
  return lang === "vi" ? "Tạm hết hàng" : "Out of stock";
}
