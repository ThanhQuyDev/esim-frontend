import type { Plan } from "./api";

/**
 * Which refund rule applies to a plan (#072).
 *
 * The product page used to tell every customer "Hoàn tiền nếu eSIM chưa kích
 * hoạt" — including for Viettel and the domestic eSIMs, which are not refundable
 * at all. That is a promise we cannot keep, so the rule is decided per supplier
 * here instead of being one sentence for the whole catalogue.
 */

/** Suppliers that mint an eSIM on demand and will take it back unactivated. */
const REFUNDABLE_PROVIDERS = new Set([
  "gadgetkorea",
  "billion",
  "microesim",
  "esimaccess",
  "airalo",
]);

export type RefundRule = "fast-if-unactivated" | "not-supported";

/**
 * MicroEsim sells both pooled packages and "local" ones. The local ones behave
 * like domestic stock — warranty and setup help, no refund — and the only thing
 * telling them apart is the supplier's own package name, which we store verbatim
 * (`item.channel_dataplan_name`). Matched as a substring because the name is the
 * supplier's wording, not ours: "Local", "LocalSIM" and "local-5GB" all occur.
 */
function isMicroEsimLocalPackage(plan: Pick<Plan, "provider" | "name">): boolean {
  if ((plan.provider ?? "").toLowerCase() !== "microesim") return false;
  return (plan.name ?? "").toLowerCase().includes("local");
}

export function refundRule(
  plan: Pick<Plan, "provider" | "name" | "isLocalInventory"> | null | undefined,
): RefundRule {
  // An unknown supplier gets the cautious answer rather than the generous one:
  // wrongly promising a refund is a promise made to a paying customer, while
  // wrongly withholding one is corrected by support.
  if (!plan) return "not-supported";

  // Domestic stock (Viettel and the local carriers) is bought in up front.
  if (plan.isLocalInventory) return "not-supported";
  if (isMicroEsimLocalPackage(plan)) return "not-supported";

  return REFUNDABLE_PROVIDERS.has((plan.provider ?? "").toLowerCase())
    ? "fast-if-unactivated"
    : "not-supported";
}
