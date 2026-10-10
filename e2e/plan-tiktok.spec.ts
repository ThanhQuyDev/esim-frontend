import { test, expect } from "@playwright/test";
import {
  appsLine,
  filterTiktokPlans,
  hasTiktokPlans,
  isChinaProductPage,
  worksWithTiktokAndChatGpt,
} from "../lib/plan-tiktok";
import type { PlansByDestinationResponse } from "../lib/api";

/**
 * The "works with TikTok & ChatGPT" logic (#068).
 *
 * For a China trip this is the question that decides the purchase, so every test
 * here is about not overstating: the filter only offers plans that work on both
 * platforms, and the green box never turns "the APN table says nothing" into
 * "TikTok does not work".
 */

const WORKS = {
  tiktokIos: true,
  tiktokAndroid: true,
  tiktokAllDevices: true,
  chatGpt: true,
  known: true,
};
const CHATGPT_ONLY = {
  tiktokIos: false,
  tiktokAndroid: false,
  tiktokAllDevices: false,
  chatGpt: true,
  known: true,
};
const IPHONE_ONLY = {
  tiktokIos: true,
  tiktokAndroid: false,
  tiktokAllDevices: false,
  chatGpt: true,
  known: true,
};
const UNKNOWN = {
  tiktokIos: false,
  tiktokAndroid: false,
  tiktokAllDevices: false,
  chatGpt: false,
  known: false,
};

const plan = (id: number, appSupport: unknown, vndPrice = 100000) =>
  ({ id, vndPrice, appSupport }) as never;

const payload = (over: Partial<PlansByDestinationResponse>) =>
  ({
    dataPlans: [],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
    tiktokHiddenByPrice: [],
    ...over,
  }) as PlansByDestinationResponse;

test.describe("which pages offer the filter", () => {
  test("offers it for mainland China", () => {
    expect(isChinaProductPage({ destination: { countryCode: "CN" } })).toBe(true);
    expect(isChinaProductPage({ destination: { countryCode: " cn " } })).toBe(true);
  });

  test("offers it for a region pack that covers China", () => {
    // "eSIM Châu Á" includes China, so the question applies there too.
    expect(
      isChinaProductPage({
        region: {
          destinations: [
            { countryCode: "JP" },
            { countryCode: "CN" },
          ] as never,
        },
      }),
    ).toBe(true);
  });

  test("does not offer it where nothing is blocked", () => {
    // A TikTok filter on the Japan page would imply a problem that is not there.
    expect(isChinaProductPage({ destination: { countryCode: "JP" } })).toBe(false);
    expect(isChinaProductPage({ region: { destinations: [] } })).toBe(false);
    expect(isChinaProductPage({})).toBe(false);
    // Hong Kong and Macao do not block these apps.
    expect(isChinaProductPage({ destination: { countryCode: "HK" } })).toBe(false);
  });
});

test.describe("which plans the filter keeps", () => {
  test("needs both apps on both platforms", () => {
    expect(worksWithTiktokAndChatGpt({ appSupport: WORKS })).toBe(true);
    // Works on iPhone only: the page does not know what the visitor is holding.
    expect(worksWithTiktokAndChatGpt({ appSupport: IPHONE_ONLY })).toBe(false);
    expect(worksWithTiktokAndChatGpt({ appSupport: CHATGPT_ONLY })).toBe(false);
    expect(worksWithTiktokAndChatGpt({ appSupport: UNKNOWN })).toBe(false);
    expect(worksWithTiktokAndChatGpt({})).toBe(false);
  });

  test("narrows every group, not just the fixed-data one", () => {
    const filtered = filterTiktokPlans(
      payload({
        dataPlans: [plan(1, WORKS), plan(2, CHATGPT_ONLY)],
        dailyUnlimited: [plan(3, WORKS), plan(4, UNKNOWN)],
        localEsim: [plan(5, UNKNOWN)],
      }),
    );

    expect(filtered.dataPlans.map((p) => p.id)).toEqual([1]);
    expect(filtered.dailyUnlimited.map((p) => p.id)).toEqual([3]);
    expect(filtered.localEsim).toEqual([]);
  });

  test("adds back the plans the price de-duplication had removed", () => {
    // The ticket's capitalised note: these never reached the page before.
    const filtered = filterTiktokPlans(
      payload({
        dataPlans: [plan(1, WORKS, 420000)],
        tiktokHiddenByPrice: [plan(99, WORKS, 390000)],
      }),
    );

    // Merged into the group they were removed from, cheapest first.
    expect(filtered.dataPlans.map((p) => p.id)).toEqual([99, 1]);
  });

  test("puts a recovered unlimited plan in its own tab (#045, round 4)", () => {
    const filtered = filterTiktokPlans(
      payload({
        dailyUnlimited: [plan(1, IPHONE_ONLY)],
        tiktokHiddenByPrice: [{ ...plan(77, WORKS, 300000), type: "unlimited" }],
      }),
    );

    expect(filtered.dailyUnlimited.map((p) => p.id)).toEqual([77]);
    expect(filtered.dataPlans.map((p) => p.id)).toEqual([]);
  });

  test("does not add back something that is not capable", () => {
    const filtered = filterTiktokPlans(
      payload({
        dataPlans: [plan(1, WORKS)],
        tiktokHiddenByPrice: [plan(99, IPHONE_ONLY)],
      }),
    );

    expect(filtered.dataPlans.map((p) => p.id)).toEqual([1]);
  });

  test("does not list the same plan twice", () => {
    const filtered = filterTiktokPlans(
      payload({
        dataPlans: [plan(7, WORKS)],
        tiktokHiddenByPrice: [plan(7, WORKS)],
      }),
    );

    expect(filtered.dataPlans.map((p) => p.id)).toEqual([7]);
  });

  test("knows when there is nothing to offer", () => {
    expect(hasTiktokPlans(payload({ dataPlans: [plan(1, CHATGPT_ONLY)] }))).toBe(
      false,
    );
    expect(hasTiktokPlans(payload({ dataPlans: [plan(1, WORKS)] }))).toBe(true);
    // A capable plan that only exists in the recovered list still counts.
    expect(
      hasTiktokPlans(payload({ tiktokHiddenByPrice: [plan(99, WORKS)] })),
    ).toBe(true);
  });
});

test.describe("the green box apps line", () => {
  test("names TikTok when it works", () => {
    expect(appsLine({ appSupport: WORKS }, "vi")).toBe(
      "Hỗ trợ sử dụng Tiktok, ChatGPT, Gemini, Claude…",
    );
  });

  test("says outright when TikTok does not work", () => {
    // The ticket's own example.
    expect(appsLine({ appSupport: CHATGPT_ONLY }, "vi")).toBe(
      "Hỗ trợ sử dụng ChatGPT, Gemini, Claude… Không dùng được Tiktok.",
    );
  });

  test("treats iPhone-only as not working", () => {
    // Same reason as the filter: the visitor's device is unknown.
    expect(appsLine({ appSupport: IPHONE_ONLY }, "vi")).toContain(
      "Không dùng được Tiktok",
    );
  });

  test("says nothing when the APN table says nothing", () => {
    // Every plan outside China is absent from the table, and printing "TikTok does
    // not work" off the back of that would be false — in Japan it works fine.
    expect(appsLine({ appSupport: UNKNOWN }, "vi")).toBeNull();
    expect(appsLine({}, "vi")).toBeNull();
    expect(appsLine(null, "vi")).toBeNull();
  });

  test("is translated", () => {
    expect(appsLine({ appSupport: WORKS }, "en")).toContain("Works with TikTok");
    expect(appsLine({ appSupport: CHATGPT_ONLY }, "en")).toContain(
      "TikTok does not work",
    );
  });
});
