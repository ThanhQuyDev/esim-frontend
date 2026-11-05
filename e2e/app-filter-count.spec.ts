import { expect, test } from "@playwright/test";
import { appFilterCount } from "../components/layout/sections/region-group/design/rg-model";

/** The China filter's "20/29 eSIM" (vande-0411 #065). */
const works = { tiktokAllDevices: true, chatGpt: true };
const plan = (id: number, dataMb: number, durationDays: number, appSupport?: unknown) =>
  ({
    id,
    dataMb,
    durationDays,
    type: "fixed",
    price: 1,
    retailPrice: 1,
    vndPrice: 10000 + id,
    provider: "x",
    appSupport,
  }) as never;

const lineup = (over: Record<string, unknown>) =>
  ({
    dataPlans: [],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
    tiktokHiddenByPrice: [],
    ...over,
  }) as never;

test("counts the capable plans held back as the dearer twin of a cheaper one", () => {
  const plans = lineup({
    // The cheap plans the page shows do not work; their dearer twins do.
    dataPlans: [plan(1, 1024, 7), plan(2, 2048, 7), plan(3, 3072, 7, works)],
    tiktokHiddenByPrice: [plan(11, 1024, 7, works), plan(12, 2048, 7, works)],
  });
  expect(appFilterCount(plans, 7, "data")).toEqual({ ok: 3, of: 3 });
});

test("counts only the trip chosen", () => {
  const plans = lineup({
    dataPlans: [plan(1, 1024, 7), plan(2, 2048, 7, works), plan(3, 1024, 30, works)],
  });
  expect(appFilterCount(plans, 7, "data")).toEqual({ ok: 1, of: 2 });
  expect(appFilterCount(plans, 30, "data")).toEqual({ ok: 1, of: 1 });
  expect(appFilterCount(plans, 15, "data")).toEqual({ ok: 0, of: 0 });
});

test("never reads more capable than there are", () => {
  const plans = lineup({
    dataPlans: [plan(1, 1024, 7)],
    tiktokHiddenByPrice: [plan(11, 1024, 7, works), plan(12, 5120, 7, works)],
  });
  expect(appFilterCount(plans, 7, "data")).toEqual({ ok: 2, of: 2 });
});
