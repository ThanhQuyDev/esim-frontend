import { expect, test } from "@playwright/test";
import {
  tripCombo,
  tripOpts,
  tripTiers,
  type Opt,
  type Tier,
} from "../components/layout/sections/region-group/design/rg-model";

/** Only the plans sold for the days chosen (vande-0411 #063). */
const plan = (durationDays: number, extra: Record<string, unknown> = {}) =>
  ({ durationDays, dataMb: 1024, vndPrice: 100000, ...extra }) as never;

test("a fixed size shows only for its exact number of days", () => {
  const tiers = [
    { key: "1", gb: "1 GB", plans: [plan(7), plan(30)] },
    { key: "3", gb: "3 GB", plans: [plan(30)] },
  ] as unknown as Tier[];

  // No 1-day plan: the nearest longer, 7 days (vande-1411 #017).
  expect(tripTiers(tiers, 1).map((t) => t.key)).toEqual(["1"]);
  expect(tripTiers(tiers, 1)[0].plans[0].durationDays).toBe(7);
  expect(tripTiers(tiers, 31)).toEqual([]);
  expect(tripTiers(tiers, 7).map((t) => t.key)).toEqual(["1"]);
  expect(tripTiers(tiers, 7)[0].plans).toHaveLength(1);
  expect(tripTiers(tiers, 30).map((t) => t.key)).toEqual(["1", "3"]);
});

test("a daily or unlimited chip needs that duration, or a price per day", () => {
  const opts = [
    { key: "a", plans: [plan(3)] },
    { key: "b", plans: [plan(1, { isAbleMultidate: true })] },
  ] as unknown as Opt[];

  expect(tripOpts(opts, 3).map((o) => o.key)).toEqual(["a", "b"]);
  expect(tripOpts(opts, 7).map((o) => o.key)).toEqual(["b"]);
});

test("a data + call + SMS plan shows only for its exact days, the cheapest of the same", () => {
  const opts = [
    { key: "dear", plans: [plan(7, { call: 10, sms: 10, vndPrice: 200000 })] },
    { key: "cheap", plans: [plan(7, { call: 10, sms: 10, vndPrice: 150000 })] },
    { key: "long", plans: [plan(30, { call: 10, sms: 10 })] },
  ] as unknown as Opt[];

  expect(tripCombo(opts, 7).map((o) => o.key)).toEqual(["cheap"]);
  // No 3-day plan: the nearest longer, 7 days (vande-1411 #017).
  expect(tripCombo(opts, 3).map((o) => o.key)).toEqual(["cheap"]);
  expect(tripCombo(opts, 31)).toEqual([]);
});

/**
 * vande-1411 #017 — China for 11 days: no plan is sold for 11, so the 12-day
 * ones show; a day pass still shows, priced for the 11 days. Gadget Korea's
 * 4 GB/day for 12-15-20-30 days must show at 12, 15, 20 and 30.
 */
test("China for 11 days shows the 12-day plans, the nearest longer", () => {
  const tiers = [
    { key: "1", gb: "1 GB", plans: [plan(10), plan(12), plan(15)] },
    { key: "5", gb: "5 GB", plans: [plan(12), plan(30)] },
    { key: "20", gb: "20 GB", plans: [plan(30)] },
  ] as unknown as Tier[];
  const fixed = tripTiers(tiers, 11);
  expect(fixed.map((t) => t.key)).toEqual(["1", "5"]);
  expect(fixed.flatMap((t) => t.plans.map((p) => p.durationDays))).toEqual([12, 12]);

  const daily = [
    { key: "d4", plans: [plan(12, { dataMb: 4096 }), plan(15, { dataMb: 4096 }), plan(20, { dataMb: 4096 }), plan(30, { dataMb: 4096 })] },
    { key: "pass", plans: [plan(1, { isAbleMultidate: true })] },
    { key: "d1", plans: [plan(10)] },
  ] as unknown as Opt[];
  const at11 = tripOpts(daily, 11);
  expect(at11.map((o) => o.key)).toEqual(["d4", "pass"]);
  expect(at11[0].plans.map((p) => p.durationDays)).toEqual([12]);
  for (const d of [12, 15, 20, 30]) {
    expect(tripOpts(daily, d).map((o) => o.key)).toContain("d4");
  }
});
