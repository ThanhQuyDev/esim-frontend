import { test, expect } from "@playwright/test";
import {
  buildBreadcrumbSchema,
  homeCrumb,
} from "../lib/breadcrumb-schema";
import {
  MAX_SCHEMA_OFFERS,
  buildProductSchema,
  hasProductSchema,
} from "../lib/product-schema";

/**
 * #051 — BreadcrumbList on every page, plus Product + Offer built from the plans
 * a country/region page actually sells (VND price, data, days).
 *
 * The Offer figures come from the same plans the page renders, so they cannot
 * drift from the displayed price. The invariants worth pinning: a Product without
 * an Offer (which Google rejects), a price in the wrong currency, and a trail
 * that names only "Home".
 */

function plan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    provider: "esimaccess",
    providerPlanId: "x",
    name: "",
    durationDays: 30,
    dataMb: 3072,
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
    vndPrice: 150_000,
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
    plan({ id: 1, dataMb: 1024, durationDays: 7, vndPrice: 120_000 }),
    plan({ id: 2, dataMb: 20480, durationDays: 30, vndPrice: 800_000 }),
  ],
});

const PRODUCT_OPTS = {
  name: "eSIM Nhật Bản",
  url: "/esim-nhat-ban",
  lang: "vi",
};

test.describe("Product + Offer schema", () => {
  test("prices every plan in VND with its data and duration", () => {
    const schema = buildProductSchema({ ...PRODUCT_OPTS, plans: JAPAN })!;
    const offers = schema.offers as Record<string, any>;

    expect(schema["@type"]).toBe("Product");
    expect(offers["@type"]).toBe("AggregateOffer");
    expect(offers.priceCurrency).toBe("VND");
    expect(offers.offerCount).toBe(2);

    // Cheapest first, so lowPrice and the first Offer agree.
    expect(offers.lowPrice).toBe("120000");
    expect(offers.highPrice).toBe("800000");
    expect(offers.offers[0].price).toBe("120000");
    expect(offers.offers[0].name).toBe("1GB / 7 ngày");
    expect(offers.offers[0].additionalProperty).toEqual([
      { "@type": "PropertyValue", name: "Dung lượng", value: "1GB" },
      { "@type": "PropertyValue", name: "Số ngày", value: 7, unitCode: "DAY" },
    ]);
  });

  test("uses an absolute URL, which schema.org requires", () => {
    const schema = buildProductSchema({ ...PRODUCT_OPTS, plans: JAPAN })!;

    expect(schema.url).toBe("https://esim.vn/esim-nhat-ban");
    expect((schema.offers as Record<string, any>).offers[0].url).toBe(
      "https://esim.vn/esim-nhat-ban",
    );
  });

  test("marks a sold-out local plan as out of stock", () => {
    const schema = buildProductSchema({
      ...PRODUCT_OPTS,
      plans: payload({
        localEsim: [
          plan({ id: 3, isLocalInventory: true, availableStock: 0 }),
          plan({ id: 4, isLocalInventory: true, availableStock: 5 }),
        ],
      }),
    })!;
    const offers = (schema.offers as Record<string, any>).offers;

    expect(offers[0].availability).toBe("https://schema.org/OutOfStock");
    expect(offers[1].availability).toBe("https://schema.org/InStock");
  });

  test("names an unlimited plan instead of claiming 0MB", () => {
    const schema = buildProductSchema({
      ...PRODUCT_OPTS,
      plans: payload({ dailyUnlimited: [plan({ dataMb: 0, durationDays: 10 })] }),
    })!;
    const offer = (schema.offers as Record<string, any>).offers[0];

    expect(offer.name).toBe("Không giới hạn / 10 ngày");
    // No data property at all, rather than "0MB".
    expect(offer.additionalProperty).toHaveLength(1);
  });

  test("emits nothing rather than a Product with no Offer", () => {
    // Google rejects an offer-less Product, so no schema is better than an
    // invalid one.
    expect(buildProductSchema({ ...PRODUCT_OPTS, plans: payload() })).toBeNull();
    expect(buildProductSchema({ ...PRODUCT_OPTS, plans: null })).toBeNull();
    expect(
      buildProductSchema({
        ...PRODUCT_OPTS,
        plans: payload({ dataPlans: [plan({ vndPrice: 0 })] }),
      }),
    ).toBeNull();
  });

  test("caps the Offer list but still reports the real plan count", () => {
    const many = Array.from({ length: MAX_SCHEMA_OFFERS + 20 }, (_, i) =>
      plan({ id: i + 1, vndPrice: 100_000 + i * 1_000 }),
    );
    const schema = buildProductSchema({
      ...PRODUCT_OPTS,
      plans: payload({ dataPlans: many }),
    })!;
    const offers = schema.offers as Record<string, any>;

    expect(offers.offers).toHaveLength(MAX_SCHEMA_OFFERS);
    expect(offers.offerCount).toBe(MAX_SCHEMA_OFFERS + 20);
    // The range still covers the plans that were left out.
    expect(offers.highPrice).toBe(String(100_000 + (many.length - 1) * 1_000));
  });

  test("reads in English on the English locale", () => {
    const schema = buildProductSchema({
      name: "Japan eSIM",
      url: "/en/esim-japan",
      lang: "en",
      plans: JAPAN,
    })!;
    const offer = (schema.offers as Record<string, any>).offers[0];

    expect(offer.name).toBe("1GB / 7 days");
    expect(offer.additionalProperty[0].name).toBe("Data");
    // Still charged in dong, whatever the page language.
    expect(offer.priceCurrency).toBe("VND");
  });

  test("stands down when the CMS schema already declares a Product", () => {
    expect(
      hasProductSchema('<script type="application/ld+json">{"@type": "Product"}</script>'),
    ).toBe(true);
    expect(hasProductSchema('{"@type":"FAQPage"}')).toBe(false);
    expect(hasProductSchema(null)).toBe(false);
  });
});

test.describe("BreadcrumbList schema", () => {
  test("numbers the trail and makes every item absolute", () => {
    const schema = buildBreadcrumbSchema(
      [homeCrumb("vi"), { label: "Điểm đến", href: "/diem-den" }, { label: "Nhật Bản" }],
      "/esim-nhat-ban",
    )!;
    const items = schema.itemListElement as Record<string, any>[];

    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items[0].item).toBe("https://esim.vn/");
    expect(items[1].item).toBe("https://esim.vn/diem-den");
    // The last crumb has no href, so it falls back to the current path.
    expect(items[2].item).toBe("https://esim.vn/esim-nhat-ban");
  });

  test("labels the first crumb in the page's language", () => {
    expect(homeCrumb("vi")).toEqual({ label: "Trang chủ", href: "/" });
    expect(homeCrumb("en")).toEqual({ label: "Home", href: "/en" });
  });

  test("emits nothing for a trail that only names Home", () => {
    // A one-item list describes no path; Google ignores it either way.
    expect(buildBreadcrumbSchema([homeCrumb("vi")], "/")).toBeNull();
    expect(buildBreadcrumbSchema([], "/")).toBeNull();
  });

  test("leaves an already-absolute URL alone", () => {
    const schema = buildBreadcrumbSchema(
      [homeCrumb("vi"), { label: "Blog", href: "https://esim.vn/blog" }],
      "/blog",
    )!;

    expect((schema.itemListElement as Record<string, any>[])[1].item).toBe(
      "https://esim.vn/blog",
    );
  });
});
