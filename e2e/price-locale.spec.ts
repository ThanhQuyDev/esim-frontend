import { test, expect } from "@playwright/test";
import {
  formatSalePrice,
  formatUsdPrice,
  formatVndPrice,
  salePriceCurrency,
  salePriceNumber,
  usdFromVnd,
} from "../lib/price-locale";
import { buildSeoTemplateVars } from "../lib/seo-vars";
import { buildHowItWorksDict } from "../lib/how-it-works";
import { applySeoVars } from "../lib/seo-vars";
import vi from "../messages/vi.json";
import en from "../messages/en.json";

/**
 * #050 — the sale price has to read in the visitor's own currency.
 *
 * Prices are stored and charged in VND. Vietnamese copy says "48.000đ"; an
 * English page quoting dong is useless to the reader, so it must say "$1.88",
 * converted at the live rate — including inside the country/region description
 * paragraph, which is where Thọ asked for it.
 */

/** A rate close to the real one, so the numbers read like production. */
const RATE = 25_500;

function plan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    provider: "esimaccess",
    providerPlanId: "x",
    name: "",
    durationDays: 7,
    dataMb: 1024,
    costPrice: 0,
    price: 2,
    retailPrice: 2,
    currency: "USD",
    type: "fixed",
    topUp: false,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice: 48_000,
    ...overrides,
  } as never;
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    dataPlans: [],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
    ...overrides,
  } as never;
}

const PLANS = payload({ dataPlans: [plan({ vndPrice: 48_000 })] });

test.describe("Sale price per locale", () => {
  test("shows dong to a Vietnamese reader and dollars to an English one", () => {
    // Thọ's example: 48.000đ on the Vietnamese page.
    expect(formatSalePrice(48_000, "vi", RATE)).toBe("48.000đ");
    expect(formatSalePrice(48_000, "en", RATE)).toBe("$1.88");
  });

  test("converts by the live rate, so the two prices never contradict", () => {
    expect(usdFromVnd(48_000, RATE)).toBe(1.88);
    // A weaker dong makes the same plan cheaper in dollars.
    expect(usdFromVnd(48_000, 24_000)).toBe(2);
    expect(formatSalePrice(48_000, "en", 24_000)).toBe("$2.00");
  });

  test("falls back to the shared rate rather than dividing by nothing", () => {
    // No rate passed: the constant the client hook also falls back to.
    expect(formatSalePrice(48_000, "en")).toBe("$1.88");
    expect(usdFromVnd(48_000, 0)).toBe(0);
  });

  test("gives schema.org a bare number in the matching currency", () => {
    expect(salePriceNumber(48_000, "vi", RATE)).toBe("48000");
    expect(salePriceNumber(48_000, "en", RATE)).toBe("1.88");
    expect(salePriceCurrency("vi")).toBe("VND");
    expect(salePriceCurrency("en")).toBe("USD");
  });

  test("returns nothing for a missing price instead of '0đ'", () => {
    expect(formatSalePrice(0, "vi", RATE)).toBe("");
    expect(formatSalePrice(0, "en", RATE)).toBe("");
    expect(salePriceNumber(0, "en", RATE)).toBe("");
  });

  test("formats each currency the way its readers expect", () => {
    expect(formatVndPrice(1_250_000)).toBe("1.250.000đ");
    expect(formatUsdPrice(1.9)).toBe("$1.90");
  });
});

test.describe("Price variables in CMS copy", () => {
  test("gives the description paragraph the right currency per language", () => {
    const viVars = buildSeoTemplateVars({
      name: "Nhật Bản",
      plans: PLANS,
      lang: "vi",
      rate: RATE,
    });
    const enVars = buildSeoTemplateVars({
      name: "Japan",
      plans: PLANS,
      lang: "en",
      rate: RATE,
    });

    expect(
      applySeoVars("eSIM ${name} chỉ từ ${fromPrice}", viVars),
    ).toBe("eSIM Nhật Bản chỉ từ 48.000đ");
    expect(applySeoVars("${name} eSIM from ${fromPrice}", enVars)).toBe(
      "Japan eSIM from $1.88",
    );
  });

  test("offers both currencies explicitly, for copy that needs to state them", () => {
    const vars = buildSeoTemplateVars({
      name: "Japan",
      plans: PLANS,
      lang: "en",
      rate: RATE,
    });

    expect(vars.fromPriceVnd).toBe("48.000đ");
    expect(vars.fromPriceUsd).toBe("$1.88");
    // The locale-aware one follows the page language.
    expect(vars.fromPrice).toBe("$1.88");
  });

  test("keeps the schema price and its currency in step", () => {
    const enVars = buildSeoTemplateVars({
      name: "Japan",
      plans: PLANS,
      lang: "en",
      rate: RATE,
    });

    // A price of 48000 labelled USD would overcharge by 25,000×.
    expect(enVars.fromPriceNumber).toBe("1.88");
    expect(enVars.currency).toBe("USD");
  });

  test("quotes the same currency in the usage steps as in the description", () => {
    const enSteps = buildHowItWorksDict(en.howItWorks, {
      name: "Japan",
      plans: PLANS,
      lang: "en",
      rate: RATE,
    });
    const viSteps = buildHowItWorksDict(vi.howItWorks, {
      name: "Nhật Bản",
      plans: PLANS,
      lang: "vi",
      rate: RATE,
    });

    expect(enSteps.steps[0].note).toContain("$1.88");
    expect(enSteps.steps[0].note).not.toContain("đ");
    expect(viSteps.steps[0].note).toContain("48.000đ");
  });
});
