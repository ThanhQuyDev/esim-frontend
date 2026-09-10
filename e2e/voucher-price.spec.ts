import { test, expect, type Page } from "@playwright/test";
import {
  pickBestVoucher,
  isPubliclyOfferable,
  couponDiscountVnd,
} from "../lib/voucher-preview";

/**
 * #042 — "price after voucher", Shopee-style.
 *
 * Long-duration plans carry a high margin markup, so their sticker price reads
 * as expensive. The plan page now also shows what the buyer actually pays with
 * the house voucher applied.
 *
 * Two halves: the pick rules (pure logic — a wrong pick shows a price the cart
 * would refuse) and the rendered line on the real plan page, driven through the
 * client harness (`/esim-noi-dia/test?view=plans`) against a mocked API.
 */

const API_BASE = "http://localhost:3001";

function coupon(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    code: "SALE10",
    discountPercent: 10,
    minOrderAmount: null,
    maxUsage: null,
    maxUsagePerUser: null,
    usageCount: 0,
    expiresAt: null,
    isActive: true,
    isPopular: false,
    partnerId: null,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    ...overrides,
  };
}

test.describe("Voucher pick rules", () => {
  test("takes the biggest saving the order actually qualifies for", () => {
    const best = pickBestVoucher(
      [
        coupon({ code: "SMALL", discountPercent: 5 }),
        coupon({ code: "BIG", discountPercent: 20 }),
        coupon({ code: "HUGE", discountPercent: 50, minOrderAmount: 5_000_000 }),
      ],
      1_000_000,
    );

    // HUGE saves more but needs a 5M order — promising it on a 1M total would be
    // a price the cart refuses.
    expect(best?.code).toBe("BIG");
    expect(best?.discountVnd).toBe(200_000);
    expect(best?.finalVnd).toBe(800_000);
  });

  test("rounds the saving to thousands, exactly like the cart", () => {
    // 7% of 149.000 = 10.430 → the cart's roundVndToThousands gives 10.000.
    const best = pickBestVoucher([coupon({ discountPercent: 7 })], 149_000);

    expect(best?.discountVnd).toBe(10_000);
    expect(best?.finalVnd).toBe(139_000);
  });

  test("never advertises a partner (KOL) code", () => {
    expect(
      isPubliclyOfferable(coupon({ code: "KOL30", partnerId: 7 })),
    ).toBe(false);
    // …not even when it is the biggest one available.
    const best = pickBestVoucher(
      [
        coupon({ code: "KOL30", discountPercent: 30, partnerId: 7 }),
        coupon({ code: "HOUSE5", discountPercent: 5 }),
      ],
      1_000_000,
    );
    expect(best?.code).toBe("HOUSE5");
  });

  test("never advertises a code the admin marked private (#081)", () => {
    expect(isPubliclyOfferable(coupon({ code: "VIPONLY", isPublic: false }))).toBe(
      false,
    );
    // A private code with the biggest discount still loses to the public one.
    const best = pickBestVoucher(
      [
        coupon({ code: "VIPONLY", discountPercent: 40, isPublic: false }),
        coupon({ code: "HOUSE5", discountPercent: 5 }),
      ],
      1_000_000,
    );
    expect(best?.code).toBe("HOUSE5");
    // Codes with no flag at all (older API payloads) stay offerable.
    expect(isPubliclyOfferable(coupon({ isPublic: undefined }))).toBe(true);
    expect(isPubliclyOfferable(coupon({ isPublic: true }))).toBe(true);
  });

  test("honours a ceiling on a percentage code (#082)", () => {
    // "15% off, up to 50k": 15% of 5M would be 750k.
    const capped = coupon({
      code: "CAP15",
      discountPercent: 15,
      maxDiscountAmount: 50_000,
    });

    expect(couponDiscountVnd(capped, 5_000_000)).toBe(50_000);
    // Below the ceiling the percentage applies as usual.
    expect(couponDiscountVnd(capped, 200_000)).toBe(30_000);
    expect(pickBestVoucher([capped], 5_000_000)?.discountVnd).toBe(50_000);
  });

  test("takes a flat amount off for a fixed-amount code (#082)", () => {
    const flat = coupon({
      code: "GIAM50K",
      discountType: "fixed",
      discountAmount: 50_000,
      discountPercent: 0,
    });

    expect(couponDiscountVnd(flat, 300_000)).toBe(50_000);
    // Never more than the order itself.
    expect(couponDiscountVnd(flat, 30_000)).toBe(30_000);
    expect(pickBestVoucher([flat], 300_000)?.finalVnd).toBe(250_000);
  });

  test("picks the code that actually saves the most, cap included (#082)", () => {
    // On a 5M order the capped 15% gives 50k while a plain 3% gives 150k.
    const best = pickBestVoucher(
      [
        coupon({ code: "CAP15", discountPercent: 15, maxDiscountAmount: 50_000 }),
        coupon({ code: "FLAT3", discountPercent: 3 }),
      ],
      5_000_000,
    );

    expect(best?.code).toBe("FLAT3");
    expect(best?.discountVnd).toBe(150_000);
  });

  test("skips inactive, expired and used-up codes", () => {
    expect(isPubliclyOfferable(coupon({ isActive: false }))).toBe(false);
    expect(
      isPubliclyOfferable(coupon({ expiresAt: "2020-01-01T00:00:00.000Z" })),
    ).toBe(false);
    expect(
      isPubliclyOfferable(coupon({ maxUsage: 10, usageCount: 10 })),
    ).toBe(false);
    expect(isPubliclyOfferable(coupon({ deletedAt: "2024-01-01" }))).toBe(false);
    // A live code with usage left stays offerable.
    expect(
      isPubliclyOfferable(coupon({ maxUsage: 10, usageCount: 9 })),
    ).toBe(true);
  });

  test("shows nothing rather than a zero discount", () => {
    expect(pickBestVoucher([coupon()], 0)).toBeNull();
    expect(pickBestVoucher([], 1_000_000)).toBeNull();
    expect(pickBestVoucher(undefined, 1_000_000)).toBeNull();
    // 10% of 4.000 rounds to 0₫ — no point claiming a discount.
    expect(pickBestVoucher([coupon()], 4_000)).toBeNull();
  });
});

/* ── Rendered line on the real plan page ── */

function plan(overrides: Record<string, unknown>) {
  return {
    id: 0,
    provider: "esimaccess",
    providerPlanId: "x",
    name: "",
    durationDays: 30,
    dataMb: 3072,
    costPrice: 0,
    price: 2,
    retailPrice: 2,
    currency: "USD",
    sms: 0,
    call: 0,
    type: "fixed",
    topUp: false,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice: 500_000,
    ...overrides,
  };
}

function plansPayload() {
  return {
    dataPlans: [plan({ id: 21, name: "Japan 3GB / 30day", vndPrice: 500_000 })],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
  };
}

async function mockApi(
  page: Page,
  coupons: Record<string, unknown>[],
  slug = "japan",
) {
  await page.route(
    `${API_BASE}/api/v1/plans/by-destination/${slug}**`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(plansPayload()),
      }),
  );
  await page.route(`${API_BASE}/api/v1/coupons**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: coupons, hasNextPage: false }),
    }),
  );
}

const line = (page: Page) => page.locator('[data-testid="voucher-price"]:visible');
const finalPrice = (page: Page) =>
  page.locator('[data-testid="voucher-final-price"]:visible');
const codeChip = (page: Page) =>
  page.locator('[data-testid="voucher-code"]:visible');

test.describe("Price after voucher on the plan page", () => {
  test("shows the post-voucher price under the sticker price", async ({
    page,
  }) => {
    await mockApi(page, [coupon({ code: "SALE20", discountPercent: 20 })]);
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await expect(line(page)).toBeVisible();
    await expect(line(page)).toContainText("Giá sau voucher");
    // 500.000₫ − 20% = 400.000₫, and the saving is spelled out.
    await expect(finalPrice(page)).toHaveText("400.000₫");
    await expect(line(page)).toContainText("100.000₫");
    await expect(codeChip(page)).toContainText("SALE20");

    // The sticker price is untouched — this is a second line, not a repricing.
    await expect(
      page.locator("text=500.000₫ >> visible=true").first(),
    ).toBeVisible();
  });

  test("follows the quantity, so the shown price is the order total", async ({
    page,
  }) => {
    await mockApi(page, [coupon({ code: "SALE20", discountPercent: 20 })]);
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");
    await expect(finalPrice(page)).toHaveText("400.000₫");

    await page.locator('button:visible', { hasText: "+" }).first().click();

    // 2 × 500.000₫ = 1.000.000₫ − 20% = 800.000₫
    await expect(finalPrice(page)).toHaveText("800.000₫");
  });

  test("copies the code so it can be pasted at checkout", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await mockApi(page, [coupon({ code: "SALE20", discountPercent: 20 })]);
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await codeChip(page).click();
    await expect(codeChip(page)).toContainText("Đã sao chép");
    expect(
      await page.evaluate(() => navigator.clipboard.readText()),
    ).toBe("SALE20");
  });

  test("stays hidden when the order is below the voucher minimum", async ({
    page,
  }) => {
    await mockApi(page, [
      coupon({ discountPercent: 20, minOrderAmount: 900_000 }),
    ]);
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    // The plan list rendered, so the page is up — the voucher line simply isn't.
    await expect(page.locator('[data-testid="plan-chip"]:visible')).toHaveCount(1);
    await expect(page.getByTestId("voucher-price")).toHaveCount(0);
  });

  test("stays hidden when there is no public voucher at all", async ({
    page,
  }) => {
    await mockApi(page, []);
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await expect(page.locator('[data-testid="plan-chip"]:visible')).toHaveCount(1);
    await expect(page.getByTestId("voucher-price")).toHaveCount(0);
  });

  test("reads in English on the English locale", async ({ page }) => {
    await mockApi(page, [coupon({ code: "SALE20", discountPercent: 20 })]);
    await page.goto("/en/esim-noi-dia/test?view=plans&slug=japan&lang=en");

    await expect(line(page)).toContainText("Price after voucher");
    await expect(line(page)).toContainText("20% off");
  });
});
