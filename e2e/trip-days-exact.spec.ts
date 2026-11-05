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

  expect(tripTiers(tiers, 1)).toEqual([]);
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
  expect(tripCombo(opts, 3)).toEqual([]);
});
