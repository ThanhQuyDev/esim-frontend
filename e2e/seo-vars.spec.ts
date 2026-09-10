import { test, expect } from "@playwright/test";
import { applySeoVars, buildSeoTemplateVars } from "../lib/seo-vars";

/**
 * #047 — plan prices available to the CMS SEO records.
 *
 * The shared `/destination` and `/region` records serve every country, so their
 * text and their JSON-LD have to be filled in per page. `${name}` already
 * worked; the price and lineup variables are new.
 *
 * The dangerous case is a missing value: a leftover `${fromPrice}` in a meta
 * title is a typo an admin will spot, but in JSON-LD it would publish a nonsense
 * price to Google, so there it must be blanked instead.
 */

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
    vndPrice: 120_000,
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

const JAPAN = payload({
  dataPlans: [
    plan({ id: 1, dataMb: 1024, durationDays: 3, vndPrice: 120_000 }),
    plan({ id: 2, dataMb: 20480, durationDays: 30, vndPrice: 800_000 }),
  ],
});

test.describe("SEO template variables", () => {
  test("exposes the cheapest price, formatted and as a bare number", () => {
    const vars = buildSeoTemplateVars({
      name: "Nhật Bản",
      plans: JAPAN,
      lang: "vi",
    });

    expect(vars).toMatchObject({
      name: "Nhật Bản",
      fromPrice: "120.000đ",
      // schema.org rejects "120.000đ" as a price, so a digits-only twin exists.
      fromPriceNumber: "120000",
      currency: "VND",
      planCount: "2",
      dataRange: "1GB – 20GB",
      dayRange: "3 – 30 ngày",
    });
  });

  test("fills a CMS meta title from the record's placeholders", () => {
    const vars = buildSeoTemplateVars({
      name: "Nhật Bản",
      plans: JAPAN,
      lang: "vi",
    });

    expect(
      applySeoVars("eSIM ${name} chỉ từ ${fromPrice} - esim.vn", vars),
    ).toBe("eSIM Nhật Bản chỉ từ 120.000đ - esim.vn");
  });

  test("omits price variables when the page has no plans", () => {
    const vars = buildSeoTemplateVars({
      name: "Nhật Bản",
      plans: payload(),
      lang: "vi",
    });

    expect(vars.name).toBe("Nhật Bản");
    expect(vars.fromPrice).toBeUndefined();
    expect(vars.fromPriceNumber).toBeUndefined();
    expect(vars.planCount).toBeUndefined();
  });

  test("keeps an unfillable placeholder visible in meta text", () => {
    // An admin should see their typo rather than have it silently vanish.
    const vars = buildSeoTemplateVars({ name: "Nhật Bản", lang: "vi" });

    expect(applySeoVars("eSIM ${name} từ ${fromPrice}", vars)).toBe(
      "eSIM Nhật Bản từ ${fromPrice}",
    );
  });

  test("blanks an unfillable placeholder in JSON-LD, keeping it parseable", () => {
    const vars = buildSeoTemplateVars({ name: "Nhật Bản", lang: "vi" });
    const schema =
      '{"@type":"Product","name":"eSIM ${name}","offers":{"price":"${fromPriceNumber}","priceCurrency":"${currency}"}}';

    const filled = applySeoVars(schema, vars, { stripUnresolved: true });

    expect(filled).not.toContain("${");
    const parsed = JSON.parse(filled);
    expect(parsed.name).toBe("eSIM Nhật Bản");
    // Empty rather than the literal placeholder — crawlers ignore an empty price.
    expect(parsed.offers.price).toBe("");
  });

  test("writes a real Offer price into JSON-LD when the page has plans", () => {
    const vars = buildSeoTemplateVars({
      name: "Nhật Bản",
      plans: JAPAN,
      lang: "vi",
    });
    const schema =
      '{"@type":"Product","name":"eSIM ${name}","offers":{"@type":"Offer","price":"${fromPriceNumber}","priceCurrency":"${currency}"}}';

    const parsed = JSON.parse(
      applySeoVars(schema, vars, { stripUnresolved: true }),
    );

    expect(parsed.offers.price).toBe("120000");
    expect(parsed.offers.priceCurrency).toBe("VND");
  });

  test("uses the English day unit on the English locale", () => {
    const vars = buildSeoTemplateVars({
      name: "Japan",
      plans: JAPAN,
      lang: "en",
    });

    expect(vars.dayRange).toBe("3 – 30 days");
  });

  test("returns an empty string for an empty record field", () => {
    const vars = buildSeoTemplateVars({ name: "Nhật Bản", lang: "vi" });

    expect(applySeoVars(null, vars)).toBe("");
    expect(applySeoVars(undefined, vars)).toBe("");
    expect(applySeoVars("", vars)).toBe("");
  });
});
