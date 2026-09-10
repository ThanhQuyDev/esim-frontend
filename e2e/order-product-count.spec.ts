import { test, expect, type Page } from "@playwright/test";

/**
 * #064 — the customer's order history shows how many products each order holds.
 *
 * The rows carried the order number, date, status and amount, but nothing about
 * size, so an order of one eSIM looked exactly like an order of five.
 *
 * The count is eSIMs, not order lines: one plan bought three times is three
 * products to the person holding them, even though the order has a single line.
 */

function order(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    orderNumber: "ES2026010001",
    status: "paid",
    totalAmount: 10,
    currency: "USD",
    vndPrice: 250_000,
    paymentMethod: "ONEPAY",
    couponCode: null,
    discountAmount: 0,
    createdAt: "2026-01-10T03:00:00.000Z",
    itemCount: 1,
    productQuantity: 3,
    ...overrides,
  };
}

function open(page: Page, orders: unknown[], lang = "vi") {
  const encoded = encodeURIComponent(JSON.stringify(orders));
  return page.goto(
    `/esim-noi-dia/test?view=orders&lang=${lang}&orders=${encoded}`,
  );
}

const counts = (page: Page) => page.getByTestId("order-product-count");

test.describe("Product count in order history", () => {
  test("counts eSIMs, not order lines", async ({ page }) => {
    // One line, quantity three — the customer holds three eSIMs.
    await open(page, [order({ itemCount: 1, productQuantity: 3 })]);

    await expect(counts(page)).toHaveText("3 sản phẩm");
  });

  test("adds up several lines", async ({ page }) => {
    await open(page, [order({ itemCount: 2, productQuantity: 5 })]);

    await expect(counts(page)).toHaveText("5 sản phẩm");
  });

  test("shows the right number on each row", async ({ page }) => {
    await open(page, [
      order({ id: 1, orderNumber: "ES-A", productQuantity: 1 }),
      order({ id: 2, orderNumber: "ES-B", productQuantity: 4 }),
    ]);

    await expect(counts(page)).toHaveCount(2);
    await expect(counts(page).nth(0)).toHaveText("1 sản phẩm");
    await expect(counts(page).nth(1)).toHaveText("4 sản phẩm");
  });

  test("falls back to the line count on an older API response", async ({
    page,
  }) => {
    const legacy = order({ productQuantity: undefined, itemCount: 2 });
    await open(page, [legacy]);

    await expect(counts(page)).toHaveText("2 sản phẩm");
  });

  test("never shows a paid order as holding nothing", async ({ page }) => {
    // "0 sản phẩm" next to a paid order reads as a failed purchase.
    await open(page, [order({ productQuantity: 0, itemCount: 0 })]);

    await expect(counts(page)).toHaveText("1 sản phẩm");
  });

  test("reads in English on the English locale", async ({ page }) => {
    await open(page, [order({ productQuantity: 2 })], "en");
    await expect(counts(page)).toHaveText("2 items");

    await open(page, [order({ productQuantity: 1 })], "en");
    await expect(counts(page)).toHaveText("1 item");
  });
});
