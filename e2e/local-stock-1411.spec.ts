import { test, expect, type Page } from "@playwright/test";

/**
 * vande-1411 #008 — Viettel / domestic eSIMs are a finite stock. The cart let
 * the quantity past it and checkout took the order. Now the cart brings a
 * line down to what is left and will not go higher, and checkout refuses an
 * order of more than is left.
 *
 * Mocked API: plan 61058 has 2 eSIMs left, plan 61057 none.
 */

const API_BASE = "http://localhost:3001";
const STOCK = { 61058: 2, 61057: 0 };

const line = (planId: number, quantity: number) => ({
  id: `${planId}:fixed`,
  planId,
  name: `Viettel ${planId}`,
  description: "8 GB / 180 days",
  price: 70,
  quantity,
  vndPrice: 1900000,
});

async function mockApi(page: Page) {
  await page.route(`${API_BASE}/api/v1/**`, (route) => {
    const url = route.request().url();
    if (url.includes("/api/v1/plans/stock")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(STOCK),
      });
    }
    if (/\/api\/v1\/carts/.test(url)) {
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
  });
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("brings a cart line down to the eSIMs left and stops the + there", async ({ page }) => {
  await page.addInitScript((items) => {
    localStorage.setItem("esim_cart", JSON.stringify({ items, appliedCoupon: null }));
  }, [line(61058, 5)]);
  await mockApi(page);
  await page.goto("/vi/gio-hang", { waitUntil: "domcontentloaded" });

  const plus = page.getByTestId("cart-qty-plus-61058:fixed");
  await expect(plus).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("cart-stock-61058:fixed")).toContainText("Còn 2 eSIM");
  await expect(plus).toBeDisabled();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("esim_cart") || "{}"));
  expect(stored.items[0].quantity).toBe(2);
});

test("will not go to checkout with a sold-out plan in the cart", async ({ page }) => {
  await page.addInitScript((items) => {
    localStorage.setItem("esim_cart", JSON.stringify({ items, appliedCoupon: null }));
  }, [line(61057, 1)]);
  await mockApi(page);
  await page.goto("/vi/gio-hang", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("cart-stock-61057:fixed")).toContainText("đã hết eSIM", {
    timeout: 60_000,
  });
  // Tick the line, then try to check out.
  await page.locator('input[type="checkbox"]').last().check();
  await page.getByRole("button", { name: /thanh toán|checkout/i }).last().click();
  await expect(page.getByTestId("cart-stock-error")).toContainText("đã hết eSIM");
  await expect(page).toHaveURL(/gio-hang/);
});

test("refuses at checkout an order of more than is left", async ({ page }) => {
  await page.addInitScript((items) => {
    localStorage.setItem("esim_checkout_items", JSON.stringify(items));
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "khach@test.local", firstName: "Test" }),
    );
  }, [line(61058, 3)]);
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && /\/api\/v1\/(orders|payment)/.test(r.url())) sent.push(r.url());
  });
  await mockApi(page);
  await page.goto("/vi/thanh-toan", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Hoàn tất đơn hàng" }).click({ timeout: 60_000 });
  await expect(page.getByTestId("checkout-stock-error")).toContainText("chỉ còn 2 eSIM");
  expect(sent).toHaveLength(0);
});
