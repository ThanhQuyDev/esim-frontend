import { test, expect } from "@playwright/test";
import {
  POPULAR_DAYS_DESKTOP,
  POPULAR_DAYS_MOBILE,
  flexibleDayOptions,
  trimToPopularDays,
} from "../components/layout/sections/destination/day-options";

/**
 * #061 (test round 4) — "Số ngày dùng" shows only the popular values; the 180 /
 * 365 chips are gone and anything else is picked from the calendar.
 */
test("per-day plans offer only the popular values", () => {
  expect(flexibleDayOptions(POPULAR_DAYS_DESKTOP)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30,
  ]);
  expect(flexibleDayOptions(POPULAR_DAYS_MOBILE)).toEqual([1, 3, 5, 7, 10, 12, 15, 20, 30]);
});

test("package plans drop durations beyond the popular list", () => {
  const sold = [1, 3, 5, 7, 11, 15, 30, 60, 90, 180, 365];
  expect(trimToPopularDays(sold, POPULAR_DAYS_MOBILE)).toEqual([1, 3, 5, 7, 15, 30]);
});

test("a duration picked in the calendar stays visible", () => {
  expect(trimToPopularDays([1, 7, 30, 180], POPULAR_DAYS_MOBILE, 180)).toEqual([1, 7, 30, 180]);
});

test("a supplier selling only odd durations still shows them", () => {
  expect(trimToPopularDays([11, 14, 18], POPULAR_DAYS_MOBILE)).toEqual([11, 14, 18]);
});
