import { test, expect, type Page } from "@playwright/test";
import {
  collectCandidates,
  groupSuggestions,
  planKind,
} from "../lib/plan-suggestions";
import type { Plan, PlansByDestinationResponse } from "../lib/api";

/**
 * #078, #035 — turn the data estimate into a plan to buy.
 *
 * With a destination entered, the plans sold there are matched the way each is
 * sold (the rule from the #035 test note):
 *   - fixed plans of 30+ days holding a month of the estimate
 *     (34.8 GB/month → 50 GB · 30 days, 100 GB · 180 days);
 *   - daily plans whose per-day allowance covers a day (1.2 GB/day → 1.5 GB/day+);
 *   - the cheapest unlimited plans.
 *
 * The calculator page is a server component, so the real suggestion box is
 * mounted through the client harness (`?view=plan-suggest`) against mocked
 * destination and plan endpoints.
 */

const API_BASE = "http://localhost:3001";
const HARNESS_BASE = "/esim-noi-dia/test?view=plan-suggest&lang=vi";
/**
 * The harness defaults to 2h video + 1h social (2.15 GB/day); pin 1h + 1h so the
 * on-screen cases share {@link DAILY_MB} with the matching cases.
 */
const HARNESS = `${HARNESS_BASE}&values=videoCalls:1,socialMedia:1`;

test.describe.configure({ mode: "serial", timeout: 120_000 });

function plan(overrides: Partial<Plan>): Plan {
  return {
    id: 1,
    provider: "esimaccess",
    providerPlanId: "p",
    name: "Plan",
    slug: "plan",
    durationDays: 30,
    dataMb: 51_200,
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

/** 1h video call (1000MB) + 1h social (150MB) = 1150 MB/day → 34.5 GB/month. */
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

async function pickJapan(page: Page) {
  await page.goto(HARNESS, { waitUntil: "domcontentloaded" });
  const input = page.getByTestId("plan-suggestions-input");
  const option = page.getByTestId("plan-suggestions-option-esim-japan");
  // Typing before hydration is lost, so keep typing until the option shows.
  await expect(async () => {
    if (!(await option.isVisible())) {
      await input.fill("");
      await input.fill("nhật");
    }
    await expect(option).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 60_000 });
  await option.click();
}

test.describe("plan suggestions — matching", () => {
  test("offers fixed plans of 30+ days that hold a month of the estimate", () => {
    const groups = groupSuggestions(
      collectCandidates(
        payload({
          dataPlans: [
            plan({ id: 1, dataMb: 10_240, durationDays: 7, vndPrice: 150_000 }),
            plan({ id: 2, dataMb: 20_480, durationDays: 30, vndPrice: 400_000 }),
            plan({ id: 3, dataMb: 51_200, durationDays: 30, vndPrice: 700_000 }),
            plan({ id: 4, dataMb: 102_400, durationDays: 180, vndPrice: 1_200_000 }),
          ],
        }),
      ),
      { dailyMb: DAILY_MB },
    );

    // 7 days is too short; 20 GB is less than 34.5 GB; 50 GB·30d and 100 GB·180d fit.
    expect(groups.fixed.map((s) => s.plan.id)).toEqual([3, 4]);
  });

  test("offers daily plans whose per-day allowance covers a day", () => {
    const groups = groupSuggestions(
      collectCandidates(
        payload({
          slowUnlimited: [
            plan({ id: 11, type: "daily", dataMb: 1024, durationDays: 1, vndPrice: 30_000 }),
            plan({ id: 12, type: "daily", dataMb: 2048, durationDays: 7, vndPrice: 280_000 }),
            plan({ id: 13, type: "daily", dataMb: 5120, durationDays: 1, vndPrice: 60_000 }),
          ],
        }),
      ),
      { dailyMb: DAILY_MB },
    );

    // 1 GB/day is short of 1.15 GB/day; the others are sorted by price per day.
    expect(groups.daily.map((s) => s.plan.id)).toEqual([12, 13]);
    expect(groups.daily.every((s) => !s.isUnlimited)).toBe(true);
  });

  test("never passes a daily plan off as unlimited (the #035 bug)", () => {
    const candidate = {
      plan: plan({ id: 20, type: "daily", dataMb: 500, durationDays: 1 }),
      bucket: "slowUnlimited" as const,
    };

    expect(planKind(candidate)).toBe("daily");

    const groups = groupSuggestions([candidate], { dailyMb: DAILY_MB });
    expect(groups.unlimited).toHaveLength(0);
    expect(groups.daily).toHaveLength(0);
  });

  test("lists a few of the cheapest unlimited plans", () => {
    const groups = groupSuggestions(
      collectCandidates(
        payload({
          fastUnlimited: [
            plan({ id: 31, type: "unlimited-reduce", dataMb: 3072, durationDays: 10, vndPrice: 500_000 }),
            plan({ id: 32, type: "unlimited-reduce", dataMb: 2048, durationDays: 5, vndPrice: 150_000 }),
          ],
          dailyUnlimited: [
            plan({ id: 33, type: "unlimited", dataMb: 0, durationDays: 7, vndPrice: 700_000 }),
            plan({ id: 34, type: "unlimited", dataMb: 0, durationDays: 30, vndPrice: 3_000_000 }),
          ],
        }),
      ),
      { dailyMb: DAILY_MB, perGroup: 3 },
    );

    // Price per day: 30k, 50k, 100k, 100k — the three cheapest.
    expect(groups.unlimited.map((s) => s.plan.id)).toEqual([32, 31, 33]);
    expect(groups.unlimited.every((s) => s.isUnlimited)).toBe(true);
  });

  test("never lists the same plan twice when buckets overlap", () => {
    const shared = plan({ id: 7, dataMb: 51_200, durationDays: 30, vndPrice: 500_000 });
    const candidates = collectCandidates(payload({ dataPlans: [shared], fastUnlimited: [shared] }));

    expect(candidates).toHaveLength(1);
  });

  test("skips plans with no price rather than offering a free eSIM", () => {
    const groups = groupSuggestions(
      collectCandidates(
        payload({
          dataPlans: [
            plan({ id: 1, dataMb: 51_200, vndPrice: 0 }),
            plan({ id: 2, dataMb: 51_200, vndPrice: 700_000 }),
          ],
        }),
      ),
      { dailyMb: DAILY_MB },
    );

    expect(groups.fixed.map((s) => s.plan.id)).toEqual([2]);
  });

  test("falls back to the biggest fixed plan when no fixed or daily plan covers", () => {
    const groups = groupSuggestions(
      collectCandidates(
        payload({
          dataPlans: [
            plan({ id: 1, dataMb: 5120, durationDays: 30, vndPrice: 90_000 }),
            plan({ id: 2, dataMb: 20_480, durationDays: 30, vndPrice: 300_000 }),
          ],
          dailyUnlimited: [plan({ id: 3, type: "unlimited", dataMb: 0, durationDays: 7, vndPrice: 260_000 })],
        }),
      ),
      { dailyMb: DAILY_MB },
    );

    expect(groups.fixed).toHaveLength(0);
    expect(groups.fallback.map((s) => s.plan.id)).toEqual([2]);
    // The unlimited plan is still offered alongside.
    expect(groups.unlimited.map((s) => s.plan.id)).toEqual([3]);
  });

  test("suggests nothing at all when no data has been estimated", () => {
    const groups = groupSuggestions(
      collectCandidates(payload({ dataPlans: [plan({ id: 1 })] })),
      { dailyMb: 0 },
    );

    expect(groups).toEqual({ fixed: [], daily: [], unlimited: [], fallback: [] });
  });
});

test.describe("plan suggestions — on screen", () => {
  test("shows the need and the three groups for a destination", async ({ page }) => {
    await mockApi(
      page,
      payload({
        dataPlans: [
          plan({ id: 1, dataMb: 20_480, durationDays: 30, vndPrice: 400_000 }),
          plan({ id: 2, dataMb: 51_200, durationDays: 30, vndPrice: 700_000 }),
        ],
        slowUnlimited: [
          plan({ id: 11, type: "daily", dataMb: 1024, durationDays: 1, vndPrice: 30_000 }),
          plan({ id: 12, type: "daily", dataMb: 2048, durationDays: 1, vndPrice: 45_000 }),
        ],
        dailyUnlimited: [
          plan({ id: 21, type: "unlimited", dataMb: 0, durationDays: 7, vndPrice: 500_000 }),
        ],
      }),
    );

    await pickJapan(page);

    await expect(page.getByTestId("plan-suggestions-destination")).toHaveText("Nhật Bản");
    await expect(page.getByTestId("plan-suggestions-need")).toContainText("/tháng");

    const fixed = page.getByTestId("plan-suggestions-group-fixed");
    await expect(fixed.getByTestId("plan-suggestion-2")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("plan-suggestion-1")).toHaveCount(0);

    const daily = page.getByTestId("plan-suggestions-group-daily");
    await expect(daily.getByTestId("plan-suggestion-12")).toContainText("/ngày");
    await expect(page.getByTestId("plan-suggestion-11")).toHaveCount(0);

    const unlimited = page.getByTestId("plan-suggestions-group-unlimited");
    await expect(unlimited.getByTestId("plan-suggestion-21")).toContainText("Không giới hạn");
  });

  test("links a suggestion to the destination page in the reader's language", async ({ page }) => {
    await mockApi(page, payload({ dataPlans: [plan({ id: 2 })] }));

    await pickJapan(page);

    // Vietnamese reader → the Vietnamese slug, no locale prefix.
    await expect(page.getByTestId("plan-suggestion-2")).toHaveAttribute("href", "/esim-nhat-ban", {
      timeout: 30_000,
    });
  });

  test("admits when nothing covers and shows the closest instead", async ({ page }) => {
    await mockApi(
      page,
      payload({ dataPlans: [plan({ id: 1, dataMb: 3072, durationDays: 30, vndPrice: 140_000 })] }),
    );

    await pickJapan(page);

    await expect(page.getByTestId("plan-suggestions-none-cover")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("plan-suggestion-1")).toBeVisible();
  });

  test("asks for some usage first when nothing has been estimated", async ({ page }) => {
    await mockApi(page, payload());

    await page.goto(`${HARNESS_BASE}&values=socialMedia:0`, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("plan-suggestions-need-usage")).toBeVisible({ timeout: 30_000 });
  });

  test("says so when the destination sells nothing yet", async ({ page }) => {
    await mockApi(page, payload());

    await pickJapan(page);

    await expect(page.getByTestId("plan-suggestions-empty")).toBeVisible({ timeout: 30_000 });
  });

  test("lets the customer pick a different destination", async ({ page }) => {
    await mockApi(page, payload({ dataPlans: [plan({ id: 2 })] }));

    await pickJapan(page);
    await expect(page.getByTestId("plan-suggestions-destination")).toBeVisible();

    await page.getByTestId("plan-suggestions-change").click();

    await expect(page.getByTestId("plan-suggestions-input")).toBeVisible();
    await expect(page.getByTestId("plan-suggestions-input")).toHaveValue("");
  });
});
