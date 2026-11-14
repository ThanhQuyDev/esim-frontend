import { test, expect, type Page } from "@playwright/test";

/**
 * vande-1411 #022 — the FAQ blocks and the cart.
 * - FAQ: the question reads 1.125rem on a phone as on a computer, the answer
 *   1rem; the arrows are drawn with a finer line.
 * - Cart: the promo box gives way so "Áp dụng" stays on one line, an X clears
 *   what was typed; the eXU buttons read 1rem, "Dùng eXU (…)".
 */

const API_BASE = "http://localhost:3001";

test.describe.configure({ timeout: 120_000 });

const json = (body: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

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

async function mockCart(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem("esim_auth_user", JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }));
  });
  await page.route(`${API_BASE}/**`, (route) => route.fulfill(json({ data: [] })));
  await page.route(`${API_BASE}/api/v1/carts**`, (route) => route.fulfill(json([CART_ITEM])));
  await page.route(`${API_BASE}/api/v1/wallets/me`, (route) =>
    route.fulfill(json({ status: "active", availableBalanceVnd: 3_574_428, balanceVnd: 3_574_428 })),
  );
}

test.describe("Cart promo box (vande-1411 #022)", () => {
  test("should keep Áp dụng on one line on a phone and clear the code with X", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockCart(page);
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Japan 5GB / 7 days").first()).toBeVisible({ timeout: 60_000 });

    const apply = page.getByTestId("cart-promo-apply");
    const box = await apply.boundingBox();
    // One line: no taller than the input next to it.
    const input = page.getByTestId("cart-promo-input");
    const inputBox = await input.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(inputBox!.height + 1);

    await expect(page.getByTestId("cart-promo-clear")).toHaveCount(0);
    await expect(async () => {
      await input.fill("ABC123");
      await expect(input).toHaveValue("ABC123", { timeout: 2_000 });
    }).toPass({ timeout: 60_000 });
    await page.getByTestId("cart-promo-clear").click();
    await expect(input).toHaveValue("");
    await expect(page.getByTestId("cart-promo-clear")).toHaveCount(0);
  });

  test("should read Dùng eXU (…) at 1rem when signed in", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockCart(page);
    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    const use = page.getByTestId("cart-exu-use");
    await expect(use).toBeVisible({ timeout: 60_000 });
    await expect(use).toHaveText("Dùng eXU (3.574.428 điểm eXU)");
    await expect(use).toHaveCSS("font-size", "16px");
  });
});

test.describe("FAQ (vande-1411 #022)", () => {
  test("should read the question at 1.125rem on a phone, with a finer arrow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route(`${API_BASE}/**`, (route) => route.fulfill(json({ data: [] })));
    await page.route(`${API_BASE}/api/v1/faqs/by-context**`, (route) =>
      route.fulfill(
        json([
          { id: "1", language: "vi", isActive: true, sortOrder: 0, question: "eSIM là gì?", answer: "<p>Một SIM số.</p>", createdAt: "", updatedAt: "" },
        ]),
      ),
    );
    await page.goto("/esim-noi-dia/test?view=faq&lang=vi");
    const section = page.getByTestId("section-FAQ");
    await expect(section).toBeVisible({ timeout: 60_000 });
    await expect(section.locator("h3").first()).toHaveCSS("font-size", "18px");
    await expect(section.locator("button svg").first()).toHaveAttribute("stroke-width", "1.5");
    await section.locator("button").first().click();
    await expect(section.locator("section").first()).toHaveCSS("font-size", "16px");
  });
});
