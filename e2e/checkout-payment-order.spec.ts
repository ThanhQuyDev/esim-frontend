import { test, expect, type Page } from "@playwright/test";

/**
 * #043 — the QR method must be listed above the card gateway on the checkout
 * page.
 *
 * Order is the whole point of the ticket, so the assertion is on the order of
 * the two rows in the DOM, not merely on both being present.
 *
 * Runs as a guest: the cart lives in localStorage when nobody is signed in, so
 * the page can be reached without an account or a cart API.
 */

const API_BASE = "http://localhost:3001";

/**
 * The checkout page reads `esim_checkout_items`, which the cart page writes when
 * the buyer proceeds — not the `esim_cart` key the header badge reads.
 */
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
  }, CHECKOUT_ITEMS);

  // The page asks for these on mount; without a backend they hang and the
  // payment block never settles.
  await page.route(`${API_BASE}/api/v1/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/vi/thanh-toan", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("payment-method-bank_transfer")).toBeVisible({
    timeout: 60_000,
  });
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("lists the QR method above the card gateway", async ({ page }) => {
  await openCheckout(page);

  const methods = page.locator('[data-testid^="payment-method-"]');
  await expect(methods).toHaveCount(2);

  // `nth(0)` is the first in DOM order, which is what the customer reads first.
  await expect(methods.nth(0)).toHaveAttribute(
    "data-testid",
    "payment-method-bank_transfer",
  );
  await expect(methods.nth(1)).toHaveAttribute(
    "data-testid",
    "payment-method-onepay",
  );
});

test("still offers both methods, each with its own radio", async ({ page }) => {
  await openCheckout(page);

  // Reordering must not have dropped or duplicated a method.
  await expect(page.locator('input[name="payment"][value="bank_transfer"]')).toHaveCount(1);
  await expect(page.locator('input[name="payment"][value="onepay"]')).toHaveCount(1);
});

test("keeps the QR row above the card row on a phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCheckout(page);

  const qr = await page.getByTestId("payment-method-bank_transfer").boundingBox();
  const card = await page.getByTestId("payment-method-onepay").boundingBox();

  expect(qr).not.toBeNull();
  expect(card).not.toBeNull();
  expect(qr!.y).toBeLessThan(card!.y);
});

test("ticks the QR method by default (#032, test round 4)", async ({ page }) => {
  await openCheckout(page);

  await expect(
    page.getByTestId("payment-method-bank_transfer").locator('input[type="radio"]'),
  ).toBeChecked();
  await expect(
    page.getByTestId("payment-method-onepay").locator('input[type="radio"]'),
  ).not.toBeChecked();
});
