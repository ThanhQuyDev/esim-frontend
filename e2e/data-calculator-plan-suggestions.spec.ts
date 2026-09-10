import { test, expect, type Page } from "@playwright/test";
import {
  collectCandidates,
  fallbackSuggestions,
  suggestPlans,
} from "../lib/plan-suggestions";
import type { Plan, PlansByDestinationResponse } from "../lib/api";

/**
 * #078 — turn the data estimate into a plan to buy.
 *
 * The calculator stopped at a number of gigabytes and left the customer to
 * work out which package covered it. With a destination entered, every plan we
 * sell there is measured against the estimate over the plan's own duration,
 * and the ones that cover it are offered cheapest first.
 *
 * The calculator page is a server component, so the real suggestion box is
 * mounted through the client harness (`?view=plan-suggest`) against mocked
 * destination and plan endpoints.
 */

const API_BASE = "http://localhost:3001";
const HARNESS = "/esim-noi-dia/test?view=plan-suggest&lang=vi";

function plan(overrides: Partial<Plan>): Plan {
  return {
    id: 1,
    provider: "esimaccess",
    providerPlanId: "p",
    name: "Plan",
    slug: "plan",
    durationDays: 7,
    dataMb: 5120,
    costPrice: 0,
    price: 2,
    retailPrice: 3,
    currency: "USD",
    type: "fixed",
    topUp: false,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice: 200_000,
    ...overrides,
  } as Plan;
}

function payload(overrides: Partial<PlansByDestinationResponse> = {}): PlansByDestinationResponse {
  return {
    dataPlans: [],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    ...overrides,
  };
}

/** 1h video call (1000MB) + 1h social (150MB) = 1150 MB/day. */
const DAILY_MB = 1150;

const JAPAN = {
  id: 9,
  name: "Japan",
  title: "Japan",
  titleVi: "Nhật Bản",
  slug: "esim-japan",
  slugVi: "esim-nhat-ban",
  countryCode: "JP",
  isPopular: true,
  isActive: true,
  createdAt: "",
  updatedAt: "",
};

async function mockApi(
  page: Page,
  plans: PlansByDestinationResponse,
  destinations: unknown[] = [JAPAN],
) {
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
  );
  await page.route(`${API_BASE}/api/v1/destinations*`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: destinations, hasNextPage: false }),
    }),
  );
  await page.route(`${API_BASE}/api/v1/plans/by-destination/*`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(plans),
    }),
  );
}

test.describe("plan suggestions — matching", () => {
  test("offers only plans that carry the estimate for their own duration", () => {
    // 1150 MB/day: a 7-day plan needs 8.05GB, a 30-day plan needs 34.5GB.
    const candidates = collectCandidates(
      payload({
        dataPlans: [
          plan({ id: 1, dataMb: 5120, durationDays: 7, vndPrice: 150_000 }),
          plan({ id: 2, dataMb: 10_240, durationDays: 7, vndPrice: 250_000 }),
          plan({ id: 3, dataMb: 20_480, durationDays: 30, vndPrice: 600_000 }),
          plan({ id: 4, dataMb: 51_200, durationDays: 30, vndPrice: 900_000 }),
        ],
      }),
    );

    const suggestions = suggestPlans(candidates, { dailyMb: DAILY_MB });

    // 5GB/7d and 20GB/30d fall short; the other two cover, cheapest first.
    expect(suggestions.map((s) => s.plan.id)).toEqual([2, 4]);
  });

  test("counts an unlimited plan as covering whatever the estimate is", () => {
    const candidates = collectCandidates(
      payload({
        dataPlans: [plan({ id: 1, dataMb: 1024, durationDays: 7, vndPrice: 90_000 })],
        fastUnlimited: [plan({ id: 5, dataMb: 0, durationDays: 7, vndPrice: 300_000 })],
      }),
    );

    const suggestions = suggestPlans(candidates, { dailyMb: DAILY_MB });

    expect(suggestions.map((s) => s.plan.id)).toEqual([5]);
    expect(suggestions[0].isUnlimited).toBe(true);
  });

  test("sorts by price, then by the shorter commitment", () => {
    const candidates = collectCandidates(
      payload({
        dataPlans: [
          plan({ id: 1, dataMb: 51_200, durationDays: 30, vndPrice: 400_000 }),
          plan({ id: 2, dataMb: 51_200, durationDays: 15, vndPrice: 400_000 }),
          plan({ id: 3, dataMb: 51_200, durationDays: 30, vndPrice: 300_000 }),
        ],
      }),
    );

    expect(
      suggestPlans(candidates, { dailyMb: DAILY_MB }).map((s) => s.plan.id),
    ).toEqual([3, 2, 1]);
  });

  test("says how long an allowance lasts and what a day costs", () => {
    const candidates = collectCandidates(
      payload({
        dataPlans: [plan({ id: 1, dataMb: 10_240, durationDays: 7, vndPrice: 210_000 })],
      }),
    );

    const [suggestion] = suggestPlans(candidates, { dailyMb: DAILY_MB });

    expect(suggestion.requiredMb).toBe(DAILY_MB * 7);
    expect(suggestion.coversDays).toBe(Math.floor(10_240 / DAILY_MB)); // 8 days
    expect(suggestion.vndPerDay).toBe(30_000);
  });

  test("never lists the same plan twice when buckets overlap", () => {
    const shared = plan({ id: 7, dataMb: 51_200, durationDays: 30, vndPrice: 500_000 });
    const candidates = collectCandidates(
      payload({ dataPlans: [shared], fastUnlimited: [shared] }),
    );

    expect(candidates).toHaveLength(1);
    expect(suggestPlans(candidates, { dailyMb: DAILY_MB })).toHaveLength(1);
  });

  test("skips plans with no price rather than offering a free eSIM", () => {
    const candidates = collectCandidates(
      payload({
        dataPlans: [
          plan({ id: 1, dataMb: 51_200, durationDays: 30, vndPrice: 0 }),
          plan({ id: 2, dataMb: 51_200, durationDays: 30, vndPrice: 700_000 }),
        ],
      }),
    );

    expect(
      suggestPlans(candidates, { dailyMb: DAILY_MB }).map((s) => s.plan.id),
    ).toEqual([2]);
  });

  test("falls back to the biggest allowance when every plan falls short", () => {
    // No unlimited plan here — an unlimited one always covers, so the fallback
    // only ever runs on a destination that sells fixed data alone.
    const candidates = collectCandidates(
      payload({
        dataPlans: [
          plan({ id: 1, dataMb: 1024, durationDays: 7, vndPrice: 90_000 }),
          plan({ id: 2, dataMb: 3072, durationDays: 7, vndPrice: 140_000 }),
        ],
      }),
    );

    expect(suggestPlans(candidates, { dailyMb: DAILY_MB })).toHaveLength(0);
    expect(
      fallbackSuggestions(candidates, { dailyMb: DAILY_MB }).map((s) => s.plan.id),
    ).toEqual([2]);
  });

  test("keeps the cheapest unlimited alongside the biggest allowance", () => {
    const candidates = collectCandidates(
      payload({
        dataPlans: [plan({ id: 2, dataMb: 3072, durationDays: 7, vndPrice: 140_000 })],
        slowUnlimited: [
          plan({ id: 3, dataMb: 0, durationDays: 7, vndPrice: 260_000 }),
          plan({ id: 4, dataMb: 0, durationDays: 7, vndPrice: 380_000 }),
        ],
      }),
    );

    expect(
      fallbackSuggestions(candidates, { dailyMb: DAILY_MB }).map((s) => s.plan.id),
    ).toEqual([2, 3]);
  });

  test("suggests nothing at all when no data has been estimated", () => {
    const candidates = collectCandidates(
      payload({ dataPlans: [plan({ id: 1, dataMb: 51_200, durationDays: 30 })] }),
    );

    expect(suggestPlans(candidates, { dailyMb: 0 })).toEqual([]);
    expect(fallbackSuggestions(candidates, { dailyMb: 0 })).toEqual([]);
  });
});

test.describe("plan suggestions — on screen", () => {
  test("looks up a destination and lists the plans that cover the estimate", async ({
    page,
  }) => {
    await mockApi(
      page,
      payload({
        dataPlans: [
          plan({ id: 1, dataMb: 5120, durationDays: 7, vndPrice: 150_000 }),
          plan({ id: 2, dataMb: 10_240, durationDays: 7, vndPrice: 250_000 }),
        ],
      }),
    );

    await page.goto(HARNESS);
    await page.getByTestId("plan-suggestions-input").fill("nhật");
    await page.getByTestId("plan-suggestions-option-esim-japan").click({ timeout: 20_000 });

    await expect(page.getByTestId("plan-suggestions-destination")).toHaveText("Nhật Bản");
    // Only the 10GB plan carries 7 × 1.15GB.
    await expect(page.getByTestId("plan-suggestion-2")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("plan-suggestion-1")).toHaveCount(0);
    await expect(page.getByTestId("plan-suggestion-2")).toContainText("10.2 GB");
    await expect(page.getByTestId("plan-suggestion-2")).toContainText("250.000đ");
  });

  test("links a suggestion to the destination page in the reader's language", async ({
    page,
  }) => {
    await mockApi(
      page,
      payload({
        dataPlans: [plan({ id: 2, dataMb: 10_240, durationDays: 7, vndPrice: 250_000 })],
      }),
    );

    await page.goto(HARNESS);
    await page.getByTestId("plan-suggestions-input").fill("nhật");
    await page.getByTestId("plan-suggestions-option-esim-japan").click({ timeout: 20_000 });

    // Vietnamese reader → the Vietnamese slug, no locale prefix.
    await expect(page.getByTestId("plan-suggestion-2")).toHaveAttribute(
      "href",
      "/esim-nhat-ban",
    );
  });

  test("admits when nothing covers and shows the closest instead", async ({ page }) => {
    await mockApi(
      page,
      payload({
        dataPlans: [plan({ id: 1, dataMb: 3072, durationDays: 7, vndPrice: 140_000 })],
      }),
    );

    await page.goto(HARNESS);
    await page.getByTestId("plan-suggestions-input").fill("nhật");
    await page.getByTestId("plan-suggestions-option-esim-japan").click({ timeout: 20_000 });

    await expect(page.getByTestId("plan-suggestions-none-cover")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByTestId("plan-suggestion-1")).toBeVisible();
  });

  test("asks for some usage first when nothing has been estimated", async ({ page }) => {
    await mockApi(page, payload());

    await page.goto(`${HARNESS}&values=socialMedia:0`);

    await expect(page.getByTestId("plan-suggestions-need-usage")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("says so when the destination sells nothing yet", async ({ page }) => {
    await mockApi(page, payload());

    await page.goto(HARNESS);
    await page.getByTestId("plan-suggestions-input").fill("nhật");
    await page.getByTestId("plan-suggestions-option-esim-japan").click({ timeout: 20_000 });

    await expect(page.getByTestId("plan-suggestions-empty")).toBeVisible({ timeout: 20_000 });
  });

  test("lets the customer pick a different destination", async ({ page }) => {
    await mockApi(
      page,
      payload({
        dataPlans: [plan({ id: 2, dataMb: 10_240, durationDays: 7, vndPrice: 250_000 })],
      }),
    );

    await page.goto(HARNESS);
    await page.getByTestId("plan-suggestions-input").fill("nhật");
    await page.getByTestId("plan-suggestions-option-esim-japan").click({ timeout: 20_000 });
    await expect(page.getByTestId("plan-suggestions-destination")).toBeVisible();

    await page.getByTestId("plan-suggestions-change").click();

    await expect(page.getByTestId("plan-suggestions-input")).toBeVisible();
    await expect(page.getByTestId("plan-suggestions-input")).toHaveValue("");
  });
});
