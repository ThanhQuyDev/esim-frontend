import { test, expect } from "@playwright/test";
import { buildProductGraph, cleanAnswer, kindOf, planName, type GraphPlan } from "../lib/schema-graph/product";

/** vande-2011 #046 — the product page @graph from Drive row 54 (SCHEMA TRANG SAN PHAM). */

const plans: GraphPlan[] = [
  { id: 1, type: "fixed", dataMb: 100, durationDays: 7, vndPrice: 58000, usdPrice: 2.24, operatorName: "CMCC" },
  { id: 2, type: "daily", dataMb: 500, durationDays: 1, vndPrice: 60000, usdPrice: 2.4 },
  { id: 3, type: "unlimited", dataMb: 0, durationDays: 1, vndPrice: 165000, usdPrice: 6.41, fupSpeed: "5Mbps" },
  { id: 4, type: "unlimited-reduce", dataMb: 1024, durationDays: 3, vndPrice: 200000, usdPrice: 7.7, fupSpeed: "512kbps" },
];

const input = (over = {}) => ({
  lang: "vi" as const,
  url: "https://esim.vn/esim-trung-quoc",
  productName: "eSIM Trung Quốc",
  breadcrumbLabel: "eSIM Trung Quốc",
  intro: "eSIM Trung Quốc giúp du khách kết nối Data 4G/5G",
  title: "eSIM Trung Quốc 5G",
  metaDescription: "Mua eSIM Trung Quốc",
  image: null,
  ogImage: "https://esim.vn/og/esimvn-og-vi.png",
  code: "CN",
  plans,
  faqs: [{ question: "Có cần VPN không?", answer: '<p class="x">Không cần.</p><iframe src="x"></iframe>' }],
  trail: [
    { name: "Trang chủ", item: "https://esim.vn/" },
    { name: "Điểm đến", item: "https://esim.vn/diem-den" },
    { name: "eSIM Trung Quốc", item: "https://esim.vn/esim-trung-quoc" },
  ],
  ...over,
});

const nodes = (g: Record<string, unknown> | null) => (g!["@graph"] as Record<string, any>[]);

test("one graph: organization, page, product, breadcrumb, FAQ", () => {
  const g = nodes(buildProductGraph(input()));
  expect(g.map((n) => n["@type"])).toEqual(["Organization", "ItemPage", "Product", "BreadcrumbList", "FAQPage"]);
  const ids = g.map((n) => n["@id"]);
  expect(new Set(ids).size).toBe(ids.length);
  const page = g[1];
  expect(page.hasPart).toEqual([{ "@id": "https://esim.vn/esim-trung-quoc#faq" }]);
  expect(g[4].isPartOf).toEqual({ "@id": "https://esim.vn/esim-trung-quoc#webpage" });
});

test("an Offer per plan at the listed price, SKU without the supplier", () => {
  const product = nodes(buildProductGraph(input()))[2];
  const offers = product.offers.offers as Record<string, any>[];
  expect(product.offers.offerCount).toBe(4);
  expect(product.offers.lowPrice).toBe("58000");
  expect(product.offers.highPrice).toBe("200000");
  expect(offers[0].sku).toBe("cn-100mb-7days-fixed-1");
  expect(offers.every((o) => !/-(es|ga|ai|bl|mi)$/.test(o.sku))).toBe(true);
  expect(product.description).toContain("Hiện có 4 gói eSIM Trung Quốc");
  expect(JSON.stringify(product)).not.toMatch(/aggregateRating|review|cost|supplier|provider/i);
});

test("USD on the English page", () => {
  const product = nodes(buildProductGraph(input({ lang: "en", url: "https://esim.vn/en/china-esim" })))[2];
  expect(product.offers.priceCurrency).toBe("USD");
  expect(product.offers.lowPrice).toBe("2.24");
});

test("plan names and kinds as in the samples", () => {
  expect(kindOf({ type: "unlimited-reduce" })).toBe("throttled");
  expect(planName(plans[0], "vi")).toBe("100MB tổng / 7 ngày");
  expect(planName(plans[1], "vi")).toBe("500MB/ngày × 1 ngày");
  expect(planName(plans[2], "en")).toBe("Unlimited 5 Mbps / 1 day");
  expect(planName(plans[3], "vi")).toBe("1GB/ngày, sau đó giảm còn 512 Kbps × 3 ngày");
});

test("FAQ answers keep only the tags Google allows", () => {
  expect(cleanAnswer('<p class="x">Không cần.</p><iframe src="x"></iframe>')).toBe("<p>Không cần.</p>");
  expect(cleanAnswer('<a href="/y" target="_blank" rel="nofollow">y</a>')).toBe('<a href="/y">y</a>');
});

test("a region page adds the covered places and the coverage options", () => {
  const g = nodes(
    buildProductGraph(
      input({
        url: "https://esim.vn/esim-chau-au",
        productName: "eSIM Châu Âu",
        region: {
          name: "Châu Âu",
          places: [{ name: "Đức", countryCode: "DE" }, { name: "Gibraltar", countryCode: "GI" }],
          scopes: [
            { name: "Châu Âu", countries: 41, from: 87000 },
            { name: "Châu Âu 33 Quốc Gia", countries: 33, from: 67000 },
          ],
        },
      })
    )
  );
  const place = g.find((n) => n["@type"] === "Place")!;
  expect(place.containsPlace).toEqual([
    { "@type": "Country", name: "Đức" },
    { "@type": "Place", name: "Gibraltar" },
  ]);
  const scopes = g.find((n) => n["@type"] === "ItemList")!;
  expect(scopes.itemListElement[1].description).toBe("33 quốc gia · từ 67.000đ");
  expect(g[1].hasPart[0]).toEqual({ "@id": "https://esim.vn/esim-chau-au#coverage-options" });
  expect(g[2].offers.areaServed).toEqual({ "@id": "https://esim.vn/esim-chau-au#coverage" });
});
