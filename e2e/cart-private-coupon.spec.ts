import { test, expect, type Page } from "@playwright/test";

/**
 * #037 — a private coupon typed into the cart.
 *
 * Private coupons are left out of the public list on purpose, so the cart could
 * never recognise one: it fell through to the referral check and a perfectly
 * good coupon was reported as "mã giới thiệu không hợp lệ". The cart now asks the
 * server about an unlisted code first, and only treats it as a referral when no
 * coupon has that code.
 */

const API_BASE = "http://localhost:3001";

test.describe.configure({ mode: "serial", timeout: 120_000 });

const PRIVATE_COUPON = {
  id: 77,
  code: "PRIVATE10",
  discountPercent: 10,
  discountType: "percent",
  discountAmount: 0,
  maxDiscountAmount: null,
  minOrderAmount: 0,
  maxUsage: null,
  maxUsagePerUser: null,
  usageCount: 0,
  expiresAt: null,
  isActive: true,
  isPopular: false,
  isPublic: false,
  deletedAt: null,
};

const CART_ITEM = {
  id: 1,
  planId: 11,
  quantity: 1,
  plan: {
    id: 11,
    name: "Japan 5GB / 7 days",
    dataMb: 5120,
    durationDays: 7,
    vndPrice: 300_000,
    type: "fixed",
    destination: { name: "Japan" },
  },
};

async function setup(page: Page) {
  const calls = { lookups: [] as string[], referral: 0, validate: 0 };

  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }),
    );
  });

  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
  );
  await page.route(`${API_BASE}/api/v1/carts**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([CART_ITEM]) }),
  );
  // The public list: the private coupon is not in it.
  await page.route(`${API_BASE}/api/v1/coupons?**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) }),
  );
  await page.route(`${API_BASE}/api/v1/coupons/code/*`, (route) => {
    const code = decodeURIComponent(route.request().url().split("/").pop() ?? "");
    calls.lookups.push(code);
    return code === PRIVATE_COUPON.code
      ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(PRIVATE_COUPON) })
      : route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "Coupon not found" }),
        });
  });
  await page.route(`${API_BASE}/api/v1/coupons/validate`, (route) => {
    calls.validate += 1;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ valid: true, discountPercent: 10, discountAmount: 30_000, finalAmount: 270_000 }),
    });
  });
  await page.route(`${API_BASE}/api/v1/wallets/me/referral/validate`, (route) => {
    calls.referral += 1;
    return route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ message: "Mã giới thiệu không hợp lệ" }),
    });
  });

  return calls;
}

async function applyCode(page: Page, code: string) {
  await page.goto("/cart", { waitUntil: "domcontentloaded" });
  const input = page.getByPlaceholder("Nhập mã giảm giá hoặc mã giới thiệu");
  await expect(page.getByText("Japan 5GB / 7 days").first()).toBeVisible({ timeout: 60_000 });
  // Typing before hydration is lost; retry until the value sticks.
  await expect(async () => {
    await input.fill(code);
    await expect(input).toHaveValue(code, { timeout: 2_000 });
    await expect(page.getByRole("button", { name: "Áp dụng" })).toBeEnabled({ timeout: 2_000 });
  }).toPass({ timeout: 60_000 });
  await page.getByRole("button", { name: "Áp dụng" }).click();
}

test.describe("cart promo input", () => {
  test("accepts a private coupon instead of calling it an invalid referral code", async ({ page }) => {
    const calls = await setup(page);

    await applyCode(page, "private10");

    // Applied: the input gives way to the applied-code chip, the total drops by
    // 10% and no error is shown.
    await expect(page.getByText("PRIVATE10", { exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("-10%")).toBeVisible();
    await expect(page.getByText("270.000₫").first()).toBeVisible();
    await expect(page.getByPlaceholder("Nhập mã giảm giá hoặc mã giới thiệu")).toHaveCount(0);
    await expect(page.getByText(/không hợp lệ/)).toHaveCount(0);
    expect(calls.lookups).toEqual(["PRIVATE10"]);
    expect(calls.validate).toBe(1);
    expect(calls.referral).toBe(0);
  });

  test("still treats an unknown code as a referral code", async ({ page }) => {
    const calls = await setup(page);

    await applyCode(page, "NOPE");

    await expect(page.getByText("Mã giới thiệu không hợp lệ")).toBeVisible({ timeout: 30_000 });
    expect(calls.lookups).toEqual(["NOPE"]);
    expect(calls.referral).toBe(1);
  });
});
