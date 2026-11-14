import { test, expect, type Page } from "@playwright/test";
import { couponDiscountLabel, couponListBadge, type Coupon } from "../lib/cart";
import { formatUsdPrice, usdFromVnd } from "../lib/price-locale";

/**
 * vande-1411 #020 — the English site reads prices in dollars everywhere, as
 * the destination list and the cart already did: the product page's price, the
 * plan cards and chips, the voucher rows, and the coupon labels. Amounts stay
 * VND underneath; only how they read changes.
 */

const API_BASE = "http://localhost:3001";
const RATE = 25_000;

const usd = (vnd: number) => formatUsdPrice(usdFromVnd(vnd, RATE));

const json = (body: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(body),
});

function plan(id: number, vndPrice: number, type = "fixed") {
  return {
    id,
    provider: "wintel-noidia",
    providerPlanId: `p${id}`,
    name: `Plan ${id}`,
    durationDays: 30,
    dataMb: 3072,
    costPrice: 0,
    price: 2,
    retailPrice: 2.6,
    currency: "VND",
    sms: 1,
    call: 1,
    type,
    topUp: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice,
    isLocalInventory: true,
    isKyc: true,
    speed: "4G",
  };
}

async function mockDomestic(page: Page) {
  await page.route("https://open.er-api.com/**", (route) =>
    route.fulfill(json({ conversion_rates: { VND: RATE } })),
  );
  await page.route(`${API_BASE}/api/v1/plans/local-carriers`, (route) =>
    route.fulfill(json([{ provider: "wintel-noidia", carrier: "wintel", fromVndPrice: 69_000, planCount: 2 }])),
  );
  await page.route(`${API_BASE}/api/v1/plans/local/wintel**`, (route) =>
    route.fulfill(
      json({
        dataPlans: [],
        slowUnlimited: [],
        fastUnlimited: [],
        dailyUnlimited: [],
        smsCallEsim: [],
        localEsim: [plan(101, 69_000), plan(201, 129_000, "unlimited")],
      }),
    ),
  );
}

test.describe("Product page prices on the English site (vande-1411 #020)", () => {
  test("should read the price and the plan cards in dollars", async ({ page }) => {
    await mockDomestic(page);
    await page.goto("/en/esim-noi-dia/test?carrier=wintel&lang=en");
    const d = page.locator(".ndd");

    await expect(d.locator("#priceNet")).toContainText(usd(69_000));
    await expect(d.getByTestId("local-plan-101")).toContainText(usd(69_000));

    // Picking another plan keeps dollars.
    await d.getByTestId("local-plan-201").click();
    await expect(d.locator("#priceNet")).toContainText(usd(129_000));
    await expect(d).not.toContainText("₫");
  });

  test("should keep đồng on the Vietnamese site", async ({ page }) => {
    await mockDomestic(page);
    await page.goto("/esim-noi-dia/test?carrier=wintel&lang=vi");
    const d = page.locator(".ndd");

    await expect(d.locator("#priceNet")).toContainText("69.000");
    await expect(d.locator("#priceNet")).toContainText("₫");
    await expect(d.locator("#priceNet")).not.toContainText("$");
  });
});

test.describe("Coupon labels on the English site (vande-1411 #020)", () => {
  const money = { isUsd: true, format: usd };
  const capped: Coupon = { code: "C", discount: 15, description: "", maxDiscountVnd: 50_000 };
  const fixed: Coupon = { code: "F", discount: 0, description: "", discountType: "fixed", discountAmountVnd: 25_000 };

  test("should state a cap and a flat amount in dollars, in English", () => {
    expect(couponDiscountLabel(capped, money)).toBe(`-15% (up to ${usd(50_000)})`);
    expect(couponDiscountLabel(fixed, money)).toBe(`-${usd(25_000)}`);
    expect(couponListBadge(capped, money)).toBe(`Up to ${usd(50_000)}`);
  });

  test("should keep the Vietnamese label as it was", () => {
    expect(couponDiscountLabel(capped)).toBe("-15% (tối đa 50.000₫)");
    expect(couponListBadge(fixed)).toBe("-25.000₫");
  });
});
