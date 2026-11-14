import { test, expect, type Page } from "@playwright/test";

/**
 * vande-1411 #007 — the phone number is typed under a country. With 🇻🇳
 * picked, "912 345 67" (8 digits) is refused and no order is placed;
 * "0912 345 678" goes through as +84912345678. Pasting "+82 …" switches the
 * flag to Korea.
 *
 * Signed in with a fake token against a mocked API: nothing reaches a server.
 */

const API_BASE = "http://localhost:3001";

const CHECKOUT_ITEMS = [
  {
    id: "plan-1",
    planId: 1,
    name: "Vietnam 3GB / 7 days",
    description: "3 GB",
    price: 6,
    quantity: 1,
    vndPrice: 179000,
    destination: "Việt Nam",
    dataMb: 3072,
    durationDays: 7,
  },
];

async function openCheckout(page: Page) {
  await page.addInitScript((items) => {
    localStorage.setItem("esim_checkout_items", JSON.stringify(items));
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "khach@test.local", firstName: "Test" }),
    );
  }, CHECKOUT_ITEMS);
  const orders: unknown[] = [];
  await page.route(`${API_BASE}/api/v1/**`, (route) => {
    const req = route.request();
    // The order goes out with its payment: QR transfer by default.
    if (
      req.method() === "POST" &&
      /\/api\/v1\/(orders|payment\/plan\/[a-z-]+)(\?|$)/.test(req.url())
    ) {
      orders.push(req.postDataJSON());
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ message: "stopped by the test" }),
      });
    }
    // The signed-in cart is a list; anything else is simply not there.
    if (/\/api\/v1\/carts/.test(req.url())) {
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    }
    return route.fulfill({ status: 404, contentType: "application/json", body: "{}" });
  });
  await page.goto("/vi/thanh-toan", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("checkout-phone")).toBeVisible({ timeout: 60_000 });
  return orders;
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("starts on 🇻🇳 +84 with a Vietnamese example", async ({ page }) => {
  await openCheckout(page);
  await expect(page.getByTestId("checkout-phone-country")).toContainText("+84");
  await expect(page.getByTestId("checkout-phone-number")).toHaveAttribute(
    "placeholder",
    /0912 345 678/,
  );
});

test("refuses 912 345 67 and places no order", async ({ page }) => {
  const orders = await openCheckout(page);
  await page.getByTestId("checkout-phone-number").fill("912 345 67");
  await page.getByRole("button", { name: "Hoàn tất đơn hàng" }).click();
  await expect(page.getByText(/Số điện thoại Việt Nam gồm 10 số/)).toBeVisible();
  expect(orders).toHaveLength(0);
});

test("sends 0912 345 678 as +84912345678", async ({ page }) => {
  const orders = await openCheckout(page);
  await page.getByTestId("checkout-phone-number").fill("0912 345 678");
  await page.getByRole("button", { name: "Hoàn tất đơn hàng" }).click();
  await expect.poll(() => orders.length, { timeout: 30_000 }).toBeGreaterThan(0);
  expect(orders[0]).toMatchObject({ phoneNumber: "+84912345678" });
});

test("switches the flag when a +82 number is pasted, and lets one pick a country", async ({
  page,
}) => {
  await openCheckout(page);
  await page.getByTestId("checkout-phone-number").fill("+82 10 1234 5678");
  await expect(page.getByTestId("checkout-phone-country")).toContainText("+82");
  await page.getByTestId("checkout-phone-country").click();
  await page.getByTestId("checkout-phone-search").fill("Nhật");
  await page.getByTestId("checkout-phone-country-JP").click();
  await expect(page.getByTestId("checkout-phone-country")).toContainText("+81");
});
