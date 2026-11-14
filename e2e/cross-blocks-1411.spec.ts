import { test, expect, type Page } from "@playwright/test";

/**
 * vande-1411 #019 — the blocks at the foot of a product page.
 *
 * - "Đi nhiều nước? Gói eSIM khu vực có …" on a country page: grey cards, a
 *   darker grey on hover, an arrow without "Xem gói" in front of it. (The
 *   "Xem eSIM cho các điểm đến khác" block below it is gone, on country and
 *   region pages alike.)
 * - "Xem các eSIM nội địa khác" on a domestic page: every other carrier, not
 *   three.
 */

const API_BASE = "http://localhost:3001";

const json = (body: unknown) => ({
  status: 200,
  contentType: "application/json",
  body: JSON.stringify(body),
});

function region(id: number, name: string, slugVi: string, count: number) {
  return {
    id,
    name,
    slug: slugVi,
    slugVi,
    title: `${name} eSIM`,
    titleVi: `eSIM ${name}`,
    avatarUrl: null,
    iconUrl: null,
    destinationCount: count,
    fromPrice: 120_000,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  };
}

const ASIA = region(1, "Châu Á", "esim-chau-a", 13);
const GLOBAL = region(2, "Toàn cầu", "esim-toan-cau", 120);

async function mockRegionSuggest(page: Page) {
  await page.route(`${API_BASE}/api/v1/destinations/slug/**`, (route) =>
    route.fulfill(
      json({
        id: 10,
        name: "China",
        title: "China eSIM",
        titleVi: "eSIM Trung Quốc",
        slug: "esim-china",
        slugVi: "esim-trung-quoc",
        regions: [ASIA, GLOBAL],
      }),
    ),
  );
  await page.route(`${API_BASE}/api/v1/regions**`, (route) =>
    route.fulfill(json({ data: [ASIA, GLOBAL], hasNextPage: false })),
  );
}

test.describe("Đi nhiều nước? Gói eSIM khu vực (vande-1411 #019)", () => {
  test("should draw grey cards ending in an arrow alone", async ({ page }) => {
    await mockRegionSuggest(page);
    await page.goto("/esim-noi-dia/test?view=region-suggest&slug=esim-trung-quoc&lang=vi");

    const card = page.getByTestId("region-suggestion-esim-chau-a");
    await expect(card).toBeVisible();
    await expect(page.getByTestId("region-suggestions")).not.toContainText("Xem gói");
    await expect(card).toHaveCSS("background-color", "rgb(247, 247, 248)");
    await expect(card).toHaveCSS("border-top-width", "0px");

    await card.hover();
    await expect(card).toHaveCSS("background-color", "rgb(236, 236, 238)");
  });
});

const CARRIERS = ["wintel", "itel", "vnsky", "viettel", "mobifone", "vinaphone"];

async function mockDomestic(page: Page) {
  await page.route(`${API_BASE}/api/v1/plans/local-carriers`, (route) =>
    route.fulfill(
      json(
        CARRIERS.map((carrier, i) => ({
          provider: `${carrier}-noidia`,
          carrier,
          fromVndPrice: 47_000 + i * 1_000,
          planCount: 3,
        })),
      ),
    ),
  );
  await page.route(`${API_BASE}/api/v1/plans/local/wintel**`, (route) =>
    route.fulfill(
      json({
        dataPlans: [],
        slowUnlimited: [],
        fastUnlimited: [],
        dailyUnlimited: [],
        smsCallEsim: [],
        localEsim: [
          {
            id: 101,
            provider: "wintel-noidia",
            providerPlanId: "x",
            name: "WIN69X 30 ngày",
            durationDays: 30,
            dataMb: 3072,
            costPrice: 0,
            price: 2,
            retailPrice: 2.6,
            currency: "VND",
            sms: 1,
            call: 1,
            type: "fixed",
            topUp: false,
            isActive: true,
            createdAt: "",
            updatedAt: "",
            vndPrice: 69_000,
            isLocalInventory: true,
            isKyc: true,
            speed: "4G",
          },
        ],
      }),
    ),
  );
}

test.describe("Xem các eSIM nội địa khác (vande-1411 #019)", () => {
  test("should list every other domestic carrier, not three", async ({ page }) => {
    await mockDomestic(page);
    await page.goto("/esim-noi-dia/test?carrier=wintel&lang=vi");

    const cards = page.locator(".ndd .cross-card");
    await expect(cards).toHaveCount(CARRIERS.length - 1);
    await expect(page.locator('.ndd .cross-card[href*="wintel"]')).toHaveCount(0);
  });
});
