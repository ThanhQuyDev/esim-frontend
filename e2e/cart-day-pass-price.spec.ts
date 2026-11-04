import { test, expect } from "@playwright/test";

/**
 * vande-0411 #001: a day pass in a signed-in cart.
 *
 * The cart worked its price out as (1-day price) × days: 71.000 đ × 14 showed
 * 994.000 đ for a line that costs 491.000 đ. It now shows what the server says
 * checkout will charge.
 */

const API_BASE = "http://localhost:3001";

const LINE = {
  id: 1,
  userId: 1,
  planId: 51239,
  quantity: 1,
  periodNum: 14,
  unitVndPrice: 491_000,
  unitOriginalVndPrice: 491_000,
  createdAt: "",
  updatedAt: "",
  plan: {
    id: 51239,
    name: "China mainland unlimited",
    standardName: "China - Daily 1 GB/day - Unlimited 1 Mbps",
    slug: "cn-1gb",
    dataMb: 1024,
    durationDays: 1,
    vndPrice: 71_000,
    currency: "USD",
    discount: 0,
    isAbleMultidate: true,
    type: "unlimited-reduce",
    destination: { id: 1, name: "China", slug: "esim-trung-quoc", countryCode: "CN" },
  },
};

test("a signed-in cart shows the server price of a day pass, not 1 day x days", async ({ page }) => {
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
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([LINE]) }),
  );

  await page.goto("/cart", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("491.000").first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText("994.000")).toHaveCount(0);
});
