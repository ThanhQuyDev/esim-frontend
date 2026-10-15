import { test, expect } from "@playwright/test";

/**
 * The "Đối tác" menu and the two partner pages beside the affiliate one
 * (doitac-1410 #014).
 */

test("the Đối tác menu leads to all three kinds of partner", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/affiliate");
  await page.getByRole("button", { name: /^Đối tác/ }).first().click();
  for (const [name, href] of [
    ["Tiếp thị liên kết (Affiliate)", "/affiliate"],
    ["Đối tác phân phối", "/doi-tac-phan-phoi"],
    ["Đối tác tích hợp API", "/doi-tac-tich-hop-api"],
  ]) {
    await expect(page.locator(`a[href="${href}"]`).filter({ hasText: name }).first()).toBeVisible();
  }
});

for (const [path, kind, heading] of [
  ["/doi-tac-phan-phoi", "distribution", "giá đại lý"],
  ["/doi-tac-tich-hop-api", "api", "website và ứng dụng"],
] as const) {
  test(`${path} explains itself and opens the form on "${kind}"`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toContainText(heading);
    const cta = page.getByTestId("affiliate-hero-cta");
    await expect(cta).toHaveAttribute("href", `/dang-ky-doi-tac?loai=${kind}`);
    await cta.click();
    await expect(page.getByTestId("affiliate-register-form")).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`input[type=radio][value="${kind}"]`)).toBeChecked();
  });
}

test("the English pages keep their own addresses", async ({ page }) => {
  await page.goto("/en/distribution-partners");
  await expect(page.getByTestId("affiliate-hero-cta")).toHaveAttribute(
    "href",
    "/en/partner-register?loai=distribution"
  );
  await page.goto("/en/api-partners");
  await expect(page.locator("h1")).toContainText("website and app");
});
