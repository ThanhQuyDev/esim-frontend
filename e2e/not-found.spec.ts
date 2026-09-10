import { test, expect } from "@playwright/test";

/**
 * #093 — the 404 page.
 *
 * There was no `not-found` boundary anywhere, so a wrong URL fell through to
 * Next's built-in page: a white screen with one line of small text, no header
 * and no footer. Visitors read that as "the site is broken / still loading"
 * rather than "that address does not exist".
 */

test.describe("404 page", () => {
  test("answers with a real 404 status, not a soft 200", async ({ page }) => {
    const response = await page.goto("/khong-co-trang-nay-dau-2026");

    // A soft 404 (200 + empty page) is worse than useless: crawlers index it.
    expect(response?.status()).toBe(404);
  });

  test("says what happened instead of showing a blank page", async ({ page }) => {
    await page.goto("/khong-co-trang-nay-dau-2026");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Không tìm thấy trang này",
    );
    await expect(page.getByText("404").first()).toBeVisible();
    // The page has real content, not an empty body.
    const text = await page.locator("body").innerText();
    expect(text.length).toBeGreaterThan(80);
  });

  test("keeps the site's own header and footer", async ({ page }) => {
    await page.goto("/khong-co-trang-nay-dau-2026");

    // The navbar and footer come from the locale layout — the thing the
    // built-in 404 page never had.
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("offers a way out: home and the usual sections", async ({ page }) => {
    await page.goto("/khong-co-trang-nay-dau-2026");

    await expect(page.getByTestId("not-found-home")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link")).not.toHaveCount(0);
  });

  test("sends a country search to the destinations page, with the term kept", async ({
    page,
  }) => {
    await page.goto("/khong-co-trang-nay-dau-2026");

    await page.getByTestId("not-found-search").fill("nhật bản");
    await page.getByRole("button", { name: /Tìm eSIM/ }).click();

    await expect(page).toHaveURL(/diem-den\?q=/, { timeout: 30_000 });
    // The term survives the jump instead of landing in an empty search box.
    await expect(page.locator('input[value="nhật bản"]').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("tells crawlers not to index it", async ({ page }) => {
    await page.goto("/khong-co-trang-nay-dau-2026");

    const robots = await page
      .locator('meta[name="robots"]')
      .first()
      .getAttribute("content");
    expect(robots).toContain("noindex");
  });

  test("reads in English on the English site", async ({ page }) => {
    await page.goto("/en/no-such-page-2026");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "We could not find that page",
    );
  });
});
