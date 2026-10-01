import { test, expect } from "@playwright/test";
import { refundRule } from "../lib/plan-refund";

/**
 * #072 — "Hướng dẫn hoàn tiền" on the product page.
 *
 * The row printed one sentence for the whole catalogue: "Hoàn tiền nếu eSIM chưa
 * kích hoạt". That is true of the API suppliers and false of Viettel, the
 * domestic eSIMs and MicroEsim's local packages, which are bought in up front and
 * come with warranty and setup help instead. The row is read as a commitment at
 * the moment of purchase, so what these tests protect is that it is never
 * promised to a plan that cannot honour it.
 */

const plan = (over: Record<string, unknown>) =>
  ({ provider: "esimaccess", name: "Japan 3GB", isLocalInventory: false, ...over }) as never;

test.describe("refund rule per supplier", () => {
  test("offers the unactivated refund for the API suppliers", () => {
    for (const provider of [
      "gadgetkorea",
      "billion",
      "microesim",
      "esimaccess",
      "airalo",
    ]) {
      expect(refundRule(plan({ provider }))).toBe("fast-if-unactivated");
    }
  });

  test("does not offer it for Viettel or domestic stock", () => {
    expect(refundRule(plan({ provider: "viettel", isLocalInventory: true }))).toBe(
      "not-supported",
    );
    // Domestic stock is sold under several carrier names, so the flag decides.
    expect(
      refundRule(plan({ provider: "wintel", isLocalInventory: true })),
    ).toBe("not-supported");
  });

  test("does not offer it for MicroEsim's local packages", () => {
    // Same supplier, two different rules: only the package name tells them apart.
    expect(
      refundRule(plan({ provider: "microesim", name: "Japan Local 5GB" })),
    ).toBe("not-supported");
    expect(
      refundRule(plan({ provider: "microesim", name: "LocalSIM Korea" })),
    ).toBe("not-supported");
    expect(
      refundRule(plan({ provider: "microesim", name: "Japan 5GB" })),
    ).toBe("fast-if-unactivated");
  });

  test("only applies the local-name rule to MicroEsim", () => {
    // "Local" in an esimaccess package name says nothing about refundability.
    expect(
      refundRule(plan({ provider: "esimaccess", name: "Local IP Japan 3GB" })),
    ).toBe("fast-if-unactivated");
  });

  test("stays cautious about a supplier it does not know", () => {
    // Wrongly promising a refund is a promise made to a paying customer; wrongly
    // withholding one is corrected by support.
    expect(refundRule(plan({ provider: "brand-new-supplier" }))).toBe(
      "not-supported",
    );
    expect(refundRule(plan({ provider: "" }))).toBe("not-supported");
    expect(refundRule(null)).toBe("not-supported");
    expect(refundRule(undefined)).toBe("not-supported");
  });

  test("ignores the case the supplier is written in", () => {
    expect(refundRule(plan({ provider: "EsimAccess" }))).toBe(
      "fast-if-unactivated",
    );
  });
});
