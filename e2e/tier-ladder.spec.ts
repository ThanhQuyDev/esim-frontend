import { test, expect, type Page } from "@playwright/test";

/**
 * #061 — the profile page shows the whole membership ladder.
 *
 * The card above it already said which tier the customer is on and what it gives.
 * What was missing is the rest of the ladder: which levels they have NOT reached
 * and what those unlock, which is the part that makes the next tier worth
 * chasing (the Airalo layout Thọ pointed at).
 *
 * The levels come from the API rather than being hardcoded here, so the page can
 * never advertise a cashback rate the backend does not pay.
 */

const API_BASE = "http://localhost:3001";

const TIERS = [
  { tier: "traveler", minimumSpendVnd: 0, cashbackPercent: 2, referralRewardVnd: 10_000 },
  { tier: "silver", minimumSpendVnd: 1_000_000, cashbackPercent: 3, referralRewardVnd: 12_000 },
  { tier: "gold", minimumSpendVnd: 5_000_000, cashbackPercent: 4, referralRewardVnd: 15_000 },
  { tier: "platinum", minimumSpendVnd: 25_000_000, cashbackPercent: 7, referralRewardVnd: 20_000 },
];

async function mockTiers(page: Page, tiers: unknown = TIERS) {
  await page.route(`${API_BASE}/api/v1/membership-tiers**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(tiers),
    }),
  );
}

function open(page: Page, spend: number, tier: string, lang = "vi") {
  return page.goto(
    `/esim-noi-dia/test?view=tier-ladder&spend=${spend}&tier=${tier}&lang=${lang}`,
  );
}

test.describe("Membership ladder", () => {
  test("lists every level, not just the next one", async ({ page }) => {
    await mockTiers(page);
    await open(page, 1_500_000, "silver");

    await expect(page.getByTestId("tier-ladder")).toBeVisible();
    for (const { tier } of TIERS) {
      await expect(page.getByTestId(`tier-rung-${tier}`)).toBeVisible();
    }
  });

  test("marks the levels reached and leaves the rest locked", async ({ page }) => {
    await mockTiers(page);
    await open(page, 5_000_000, "gold");

    // Exactly at the threshold counts as reached.
    for (const tier of ["traveler", "silver", "gold"]) {
      await expect(page.getByTestId(`tier-rung-${tier}`)).toHaveAttribute(
        "data-reached",
        "true",
      );
    }
    await expect(page.getByTestId("tier-rung-platinum")).toHaveAttribute(
      "data-reached",
      "false",
    );
  });

  test("says how much more each locked level needs", async ({ page }) => {
    await mockTiers(page);
    await open(page, 1_500_000, "silver");

    // 5.000.000 − 1.500.000 = 3.500.000 still to spend for Gold.
    await expect(page.getByTestId("tier-rung-gold")).toContainText("3.500.000₫");
    await expect(page.getByTestId("tier-rung-platinum")).toContainText(
      "23.500.000₫",
    );
    // A level already reached has no "still need" line.
    await expect(page.getByTestId("tier-rung-traveler")).not.toContainText(
      "Còn thiếu",
    );
  });

  test("shows what each level gives, including the locked ones", async ({
    page,
  }) => {
    await mockTiers(page);
    await open(page, 0, "traveler");

    await expect(page.getByTestId("tier-rung-traveler")).toContainText("2% eXU");
    await expect(page.getByTestId("tier-rung-platinum")).toContainText("7% eXU");
    // Referral reward is eXU points, not dong (#052).
    await expect(page.getByTestId("tier-rung-platinum")).toContainText("20.000 điểm eXU");
  });

  test("points out which level the customer is on", async ({ page }) => {
    await mockTiers(page);
    await open(page, 6_000_000, "gold");

    const badge = page.getByTestId("tier-current-badge");
    await expect(badge).toHaveCount(1);
    await expect(page.getByTestId("tier-rung-gold")).toContainText("Hạng hiện tại");
  });

  test("follows an admin-granted tier, not the spend", async ({ page }) => {
    await mockTiers(page);
    // Support granted Platinum to someone who has spent nothing.
    await open(page, 0, "platinum");

    await expect(page.getByTestId("tier-rung-platinum")).toContainText(
      "Hạng hiện tại",
    );
    // The ladder still tells the truth about what has actually been spent.
    await expect(page.getByTestId("tier-rung-silver")).toHaveAttribute(
      "data-reached",
      "false",
    );
  });

  test("renders nothing rather than an empty ladder when the API is down", async ({
    page,
  }) => {
    await page.route(`${API_BASE}/api/v1/membership-tiers**`, (route) =>
      route.fulfill({ status: 500, body: "boom" }),
    );
    await open(page, 1_000_000, "silver");

    await expect(page.getByTestId("local-test-meta")).toBeVisible();
    await expect(page.getByTestId("tier-ladder")).toHaveCount(0);
  });

  test("reads in English on the English locale", async ({ page }) => {
    await mockTiers(page);
    await open(page, 1_500_000, "silver", "en");

    await expect(page.getByTestId("tier-ladder")).toContainText(
      "Membership levels",
    );
    await expect(page.getByTestId("tier-rung-gold")).toContainText("Still need");
  });
});
