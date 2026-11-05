import { expect, test } from "@playwright/test";
import { canBuyMoreData } from "../components/layout/sections/region-group/design/rg-model";

/** "Hết data: có thể / không thể nạp thêm" (vande-0411 #066). */
test("reads what the plan really offers", () => {
  expect(canBuyMoreData({ topUp: true })).toBe(true);
  expect(canBuyMoreData({ topUp: false })).toBe(false);
  expect(canBuyMoreData({ topUp: false, isAddOn: true })).toBe(true);
  expect(canBuyMoreData({ topUp: true, purchaseKind: "none" })).toBe(false);
  expect(canBuyMoreData({ topUp: false, purchaseKind: "addon" })).toBe(true);
});
