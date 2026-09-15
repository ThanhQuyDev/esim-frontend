import { test, expect, type Page } from "@playwright/test";

/**
 * #036 — "Đặt lại" puts the calculator back in custom mode.
 *
 * It used to jump to the "casual browser" preset, pre-filling hours the customer
 * then had to clear one by one. Now it selects "Tùy chỉnh" with every activity
 * at 0 hours, so the customer can start over from scratch.
 *
 * The calculator page is a server component, so the real calculator is mounted
 * through the client harness (`?view=calculator`).
 */

const API_BASE = "http://localhost:3001";
const HARNESS = "/esim-noi-dia/test?view=calculator&lang=vi";

test.describe.configure({ mode: "serial", timeout: 120_000 });

async function open(page: Page) {
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
  );
  await page.goto(HARNESS, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("local-test-meta")).toBeVisible();
}

const desktopProfile = (page: Page, key: string) =>
  page.locator(`input[name="profileCardsDesktop"][value="${key}"]`);

const hourInputs = (page: Page) => page.locator('input[type="number"]');

/**
 * Select a profile through its desktop card. The mobile card comes first in the
 * DOM but is hidden at this width, and a click before hydration is lost — so
 * click the visible card's label and retry until the radio is checked.
 */
async function chooseProfile(page: Page, key: string) {
  const radio = desktopProfile(page, key);
  const card = page.locator("label", { has: radio });
  await expect(async () => {
    if (!(await radio.isChecked())) await card.click();
    await expect(radio).toBeChecked({ timeout: 2_000 });
  }).toPass({ timeout: 60_000 });
}

test.describe("data calculator reset", () => {
  test("goes back to custom mode with every activity cleared", async ({ page }) => {
    await open(page);

    // Pick a preset first.
    await chooseProfile(page, "remote_worker");

    // …and tweak one activity by hand, which turns on its "Khác" state.
    await hourInputs(page).first().fill("1.5");
    await expect(hourInputs(page).first()).toHaveValue("1.5");

    await page.getByRole("button", { name: /Đặt lại/ }).first().click();

    await expect(desktopProfile(page, "individual")).toBeChecked();
    await expect(desktopProfile(page, "casual_browser")).not.toBeChecked();

    const count = await hourInputs(page).count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(hourInputs(page).nth(i)).toHaveValue("");
    }
  });

  test("asks for usage again instead of suggesting plans for the old hours", async ({ page }) => {
    await open(page);

    await chooseProfile(page, "remote_worker");

    await page.getByRole("button", { name: /Đặt lại/ }).first().click();

    // With nothing entered, the suggestions box asks for hours first.
    await expect(page.getByTestId("plan-suggestions-need-usage").first()).toBeVisible();
  });
});
