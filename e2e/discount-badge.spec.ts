import { test, expect } from "@playwright/test";
import {
  hasVisibleDiscount,
  savingPercent,
} from "../components/layout/sections/destination/types";

/**
 * #077 — the "-0%" discount badge on the product page.
 *
 * The struck-out price and the red badge appeared whenever retail was above the
 * price by any amount at all. When the gap was under half a percent the badge
 * rounded to "-0%", so the page struck out a price and advertised a discount of
 * nothing. Rounding in the per-day and round-to-thousands maths makes gaps that
 * small routine, which is why the test is the percentage, not the difference.
 */

test.describe("discount badge", () => {
  test("shows a real saving", () => {
    expect(savingPercent(200_000, 150_000)).toBe(25);
    expect(hasVisibleDiscount(200_000, 150_000)).toBe(true);
  });

  test("hides a saving that rounds away to nothing", () => {
    // 201,000 → 200,000 is 0.49%: the badge would have read "-0%".
    expect(savingPercent(201_000, 200_000)).toBe(0);
    expect(hasVisibleDiscount(201_000, 200_000)).toBe(false);
    // A single đồng, the worst case.
    expect(hasVisibleDiscount(200_001, 200_000)).toBe(false);
  });

  test("shows the smallest saving that is still true", () => {
    // 1% rounds to 1, so it is a claim the page can stand behind.
    expect(savingPercent(100_000, 99_000)).toBe(1);
    expect(hasVisibleDiscount(100_000, 99_000)).toBe(true);
  });

  test("shows nothing when there is no discount at all", () => {
    expect(hasVisibleDiscount(150_000, 150_000)).toBe(false);
    // Retail below price is bad data, not a discount.
    expect(hasVisibleDiscount(100_000, 150_000)).toBe(false);
  });

  test("does not divide by a missing retail price", () => {
    expect(savingPercent(0, 150_000)).toBe(0);
    expect(hasVisibleDiscount(0, 150_000)).toBe(false);
  });
});
