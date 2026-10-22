import { test, expect, type Page } from "@playwright/test";

/**
 * "Gói cố định" on a country page, laid out like the region page (#067): one
 * chip per data size, the days picked in a dropdown under the chips. Japan has
 * ~150 fixed plans, and one chip per "size – days" pair buried the buy button.
 *
 * Mounted through the client harness (`/esim-noi-dia/test?view=plans`) against
 * a mocked plans API, like nonhkip-filter.spec.ts.
 */

const API_BASE = "http://localhost:3001";

function plan(id: number, dataMb: number, durationDays: number, vndPrice: number) {
  return {
    id,
    provider: "esimaccess",
    providerPlanId: `p${id}`,
    name: `Japan ${dataMb}MB / ${durationDays}day`,
    durationDays,
    dataMb,
    costPrice: 0,
    price: 2,
    retailPrice: 2.6,
    currency: "USD",
    sms: 0,
    call: 0,
    type: "fixed",
    topUp: false,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice,
  };
}

async function mockPlans(page: Page) {
  const payload = {
    dataPlans: [
      plan(1, 1024, 7, 80000),
      plan(2, 1024, 15, 120000),
      plan(3, 3072, 7, 93000),
      plan(4, 3072, 15, 99000),
      plan(5, 3072, 30, 150000),
      plan(6, 5120, 30, 210000),
    ],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
  };
  await page.route(`${API_BASE}/api/v1/plans/by-destination/japan**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(payload) }),
  );
}

const chips = (page: Page) => page.locator('[data-testid="plan-chip"]:visible');
const dayButton = (page: Page) => page.locator('[data-testid="fixed-day-button"]:visible');
const dayOptions = (page: Page) => page.locator('[data-testid="fixed-day-option"]:visible');

test.describe("Fixed plans on a country page", () => {
  test.beforeEach(async ({ page }) => {
    await mockPlans(page);
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");
  });

  test("shows one chip per data size, not one per size and days", async ({ page }) => {
    await expect(chips(page)).toHaveText(["1GB", "3GB", "5GB"]);
    // The cheapest plan is picked first; its days sit in the dropdown.
    await expect(chips(page).first()).toHaveAttribute("aria-pressed", "true");
    await expect(dayButton(page)).toContainText("7 ngày");
  });

  test("lists the days of the chosen size with their prices", async ({ page }) => {
    await chips(page).filter({ hasText: "3GB" }).click();
    await dayButton(page).click();
    await expect(dayOptions(page)).toHaveCount(3);
    await expect(dayOptions(page).nth(1)).toContainText("15 ngày");
    await expect(dayOptions(page).nth(1)).toContainText("99.000");

    await dayOptions(page).nth(1).click();
    await expect(dayOptions(page)).toHaveCount(0);
    await expect(dayButton(page)).toContainText("15 ngày");
    await expect(chips(page).filter({ hasText: "3GB" })).toHaveAttribute("data-plan-id", "4");
  });

  test("keeps the days when the new size has them, else takes its shortest", async ({ page }) => {
    await chips(page).filter({ hasText: "3GB" }).click();
    await dayButton(page).click();
    await dayOptions(page).filter({ hasText: "15 ngày" }).click();

    await chips(page).filter({ hasText: "1GB" }).click();
    await expect(dayButton(page)).toContainText("15 ngày");
    await expect(chips(page).filter({ hasText: "1GB" })).toHaveAttribute("data-plan-id", "2");

    // 5GB comes in 30 days only: no dropdown to open.
    await chips(page).filter({ hasText: "5GB" }).click();
    await expect(dayButton(page)).toContainText("30 ngày");
    await expect(dayButton(page)).toBeDisabled();
  });
});
