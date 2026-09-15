import { test, expect, type Page } from "@playwright/test";
import { listFeaturedCoupons, type ListedCoupon } from "../lib/coupon-list";

/**
 * #040 — /ma-giam-gia lists every featured coupon with its own copy button.
 *
 * The page had a single "Lấy mã" button copying one code. It now lists the codes
 * an admin marked "Mã nổi bật" in the CMS, as long as they are actually usable.
 */

const API_BASE = "http://localhost:3001";

test.describe.configure({ mode: "serial", timeout: 120_000 });

const NOW = new Date("2026-09-15T12:00:00Z");
const inDays = (days: number) => new Date(NOW.getTime() + days * 86_400_000).toISOString();

function coupon(overrides: Partial<ListedCoupon>): ListedCoupon {
  return {
    id: 1,
    code: "CODE",
    discountPercent: 10,
    discountType: "percent",
    discountAmount: 0,
    maxDiscountAmount: null,
    maxUsage: 100,
    usageCount: 0,
    minOrderAmount: 0,
    expiresAt: inDays(30),
    isActive: true,
    isPopular: true,
    isPublic: true,
    partnerId: null,
    deletedAt: null,
    ...overrides,
  } as ListedCoupon;
}

test.describe("featured coupon list — rules", () => {
  test("lists only the codes marked featured", () => {
    const listed = listFeaturedCoupons(
      [coupon({ id: 1, code: "HOT" }), coupon({ id: 2, code: "PLAIN", isPopular: false })],
      NOW,
    );
    expect(listed.map((c) => c.code)).toEqual(["HOT"]);
  });

  test("hides featured codes that can no longer be used", () => {
    const listed = listFeaturedCoupons(
      [
        coupon({ id: 1, code: "OK" }),
        coupon({ id: 2, code: "EXPIRED", expiresAt: inDays(-1) }),
        coupon({ id: 3, code: "USEDUP", maxUsage: 5, usageCount: 5 }),
        coupon({ id: 4, code: "OFF", isActive: false }),
        coupon({ id: 5, code: "PRIVATE", isPublic: false }),
        coupon({ id: 6, code: "KOL", partnerId: 9 }),
      ],
      NOW,
    );
    expect(listed.map((c) => c.code)).toEqual(["OK"]);
  });

  test("keeps a fixed-amount code and puts the ones ending soonest first", () => {
    const listed = listFeaturedCoupons(
      [
        coupon({ id: 1, code: "LATER", expiresAt: inDays(60) }),
        coupon({ id: 2, code: "FIXED", discountType: "fixed", discountPercent: 0, discountAmount: 50_000, expiresAt: inDays(3) }),
        coupon({ id: 3, code: "FOREVER", expiresAt: null }),
      ],
      NOW,
    );
    expect(listed.map((c) => c.code)).toEqual(["FIXED", "LATER", "FOREVER"]);
  });
});

async function mockCoupons(page: Page, coupons: ListedCoupon[]) {
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
  );
  await page.route(`${API_BASE}/api/v1/coupons?**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: coupons, hasNextPage: false }),
    }),
  );
}

test.describe("featured coupon list — on /ma-giam-gia", () => {
  test("shows each featured code with its discount and a working copy button", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const far = new Date(Date.now() + 30 * 86_400_000).toISOString();
    await mockCoupons(page, [
      coupon({ id: 1, code: "SUMMER15", discountPercent: 15, maxDiscountAmount: 50_000, minOrderAmount: 200_000, expiresAt: far }),
      coupon({ id: 2, code: "GIAM50K", discountType: "fixed", discountPercent: 0, discountAmount: 50_000, expiresAt: far }),
      coupon({ id: 3, code: "NOTFEATURED", isPopular: false, expiresAt: far }),
    ]);

    await page.goto("/ma-giam-gia", { waitUntil: "domcontentloaded" });

    const summer = page.getByTestId("coupon-card-SUMMER15");
    await expect(summer).toBeVisible({ timeout: 60_000 });
    await expect(summer).toContainText("15%");
    await expect(summer).toContainText("200.000");
    await expect(page.getByTestId("coupon-card-GIAM50K")).toContainText("50.000");
    await expect(page.getByTestId("coupon-card-NOTFEATURED")).toHaveCount(0);

    // Copy — retried because a click before hydration is lost.
    const copy = page.getByTestId("coupon-copy-GIAM50K");
    await expect(async () => {
      await copy.click();
      await expect(copy).toContainText("Đã sao chép", { timeout: 2_000 });
    }).toPass({ timeout: 60_000 });
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("GIAM50K");
  });

  test("hides the section when no code is featured", async ({ page }) => {
    await mockCoupons(page, [coupon({ id: 3, code: "NOTFEATURED", isPopular: false })]);

    await page.goto("/ma-giam-gia", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("section-CouponList")).toHaveCount(0, { timeout: 15_000 });
  });
});
