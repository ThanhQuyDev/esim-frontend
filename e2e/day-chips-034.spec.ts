import { test, expect } from "@playwright/test";
import type { Plan } from "../lib/api";
import { chipDaysFor, type Opt } from "../components/layout/sections/region-group/design/rg-model";
import {
  POPULAR_DAYS_DESKTOP,
  POPULAR_DAYS_MOBILE,
} from "../components/layout/sections/destination/day-options";

/**
 * vande #034 — the day chips list the durations really on sale. A per-day
 * esimaccess plan next to airalo packages must not open every day 1-30: "2
 * days" was two 1-day packages, dearer than the 3-day package.
 */
const plan = (durationDays: number, isAbleMultidate = false) =>
  ({ durationDays, isAbleMultidate }) as unknown as Plan;
const opt = (plans: Plan[]) => ({ plans }) as unknown as Opt;

test("china 3GB/day 1Mbps: esimaccess 1 day + airalo packages", () => {
  const o = opt([plan(1, true), ...[3, 5, 7, 10, 15, 30].map((d) => plan(d))]);
  expect(chipDaysFor(o, POPULAR_DAYS_DESKTOP)).toEqual({ days: [1, 3, 5, 7, 10, 15, 30], more: true });
  expect(chipDaysFor(o, POPULAR_DAYS_MOBILE).days).toEqual([1, 3, 5, 7, 10, 15, 30]);
});

test("a supplier selling every duration fills the popular row", () => {
  const o = opt(Array.from({ length: 30 }, (_, i) => plan(i + 1)).concat([plan(60), plan(90)]));
  expect(chipDaysFor(o, POPULAR_DAYS_DESKTOP)).toEqual({ days: POPULAR_DAYS_DESKTOP, more: true });
  expect(chipDaysFor(o, POPULAR_DAYS_MOBILE).days).toEqual(POPULAR_DAYS_MOBILE);
});

test("per-day plans only: any day is on offer", () => {
  expect(chipDaysFor(opt([plan(1, true)]), POPULAR_DAYS_MOBILE)).toEqual({ days: POPULAR_DAYS_MOBILE, more: true });
});

test("packages all on the popular list need no calendar", () => {
  expect(chipDaysFor(opt([plan(3), plan(7)]), POPULAR_DAYS_DESKTOP)).toEqual({ days: [3, 7], more: false });
});

test("durations off the popular list keep the row non-empty", () => {
  expect(chipDaysFor(opt([plan(11), plan(14)]), POPULAR_DAYS_MOBILE)).toEqual({ days: [11, 14], more: false });
});
