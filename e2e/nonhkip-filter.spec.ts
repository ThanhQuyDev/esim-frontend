import { test, expect, type Page } from "@playwright/test";

/**
 * #041 — local-exit-IP ("nonhkip") plan filter.
 *
 * eSIM Access ships two variants of many packages: the ordinary one routes out
 * through Hong Kong, the other exits on a local IP. Apps that geo-block Hong
 * Kong routing (TikTok, ChatGPT) only work on the latter, which costs more — so
 * the choice is the customer's, behind an opt-in toggle rather than a silent
 * price bump.
 *
 * The real destination page is a server component whose SSR fetch throws with no
 * backend, so the real DestinationPlans is mounted through the client harness
 * (`/esim-noi-dia/test?view=plans`) and driven against a mocked plans API.
 */

const API_BASE = "http://localhost:3001";

function plan(overrides: Record<string, unknown>) {
  return {
    id: 0,
    provider: "esimaccess",
    providerPlanId: "x",
    name: "",
    durationDays: 30,
    dataMb: 3072,
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
    vndPrice: 150000,
    isNonHkIp: false,
    ...overrides,
  };
}

/** Two ordinary plans + one local-IP plan, all fixed-data. */
function mixedPlans() {
  return {
    dataPlans: [
      plan({ id: 11, name: "Japan 3GB / 30day", dataMb: 3072, vndPrice: 150000 }),
      plan({ id: 12, name: "Japan 5GB / 30day", dataMb: 5120, vndPrice: 210000 }),
      plan({
        id: 13,
        name: "Japan 10GB / 30day",
        dataMb: 10240,
        vndPrice: 420000,
        isNonHkIp: true,
      }),
    ],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
  };
}

/** No local-IP variant at all — the toggle must not appear. */
function ordinaryPlansOnly() {
  const payload = mixedPlans();
  payload.dataPlans = payload.dataPlans.filter((p) => !p.isNonHkIp);
  return payload;
}

async function mockPlans(page: Page, payload: unknown, slug = "japan") {
  await page.route(
    `${API_BASE}/api/v1/plans/by-destination/${slug}**`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
    },
  );
}

/** Desktop and mobile layouts both render the toggle; keep the visible one. */
const visibleToggle = (page: Page) =>
  page.locator('[data-testid="nonhkip-toggle"]:visible');
const visibleHint = (page: Page) =>
  page.locator('[data-testid="nonhkip-hint"]:visible');
const visibleChips = (page: Page) =>
  page.locator('[data-testid="plan-chip"]:visible');

test.describe("Local-IP plan filter", () => {
  test("is offered, off by default, and narrows the list to local-IP plans", async ({
    page,
  }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    // Off by default: every plan is listed, including the pricier local-IP one.
    await expect(visibleChips(page)).toHaveCount(3);
    await expect(visibleToggle(page)).toHaveAttribute("aria-checked", "false");

    // The copy names the apps customers actually come here for.
    await expect(visibleToggle(page)).toContainText("TikTok");
    await expect(visibleToggle(page)).toContainText("ChatGPT");
    // …and says outright that these cost more, so the toggle is an informed choice.
    await expect(visibleHint(page)).toContainText("Giá cao hơn");

    await visibleToggle(page).click();

    await expect(visibleToggle(page)).toHaveAttribute("aria-checked", "true");
    await expect(visibleChips(page)).toHaveCount(1);
    await expect(visibleChips(page).first()).toHaveAttribute(
      "data-plan-id",
      "13",
    );
  });

  test("restores the full list when turned back off", async ({ page }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await expect(visibleChips(page)).toHaveCount(3);
    await visibleToggle(page).click();
    await expect(visibleChips(page)).toHaveCount(1);
    await visibleToggle(page).click();

    await expect(visibleChips(page)).toHaveCount(3);
    await expect(visibleToggle(page)).toHaveAttribute("aria-checked", "false");
  });

  test("selects a surviving plan, so the price never belongs to a hidden one", async ({
    page,
  }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    // Auto-selection lands on the first (cheapest, Hong-Kong-routed) plan.
    await expect(visibleChips(page).first()).toHaveAttribute(
      "data-plan-id",
      "11",
    );
    await visibleToggle(page).click();

    // After filtering, the only remaining plan must be the selected one —
    // otherwise the CTA would charge for a plan no longer on screen.
    const remaining = visibleChips(page).first();
    await expect(remaining).toHaveAttribute("data-plan-id", "13");
    await expect(remaining).toHaveClass(/border-\[#1a1a1a\]/);
  });

  test("is not offered when the destination has no local-IP plan", async ({
    page,
  }) => {
    await mockPlans(page, ordinaryPlansOnly());
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await expect(visibleChips(page)).toHaveCount(2);
    await expect(page.getByTestId("nonhkip-toggle")).toHaveCount(0);
  });

  test("reads in English on the English locale", async ({ page }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/en/esim-noi-dia/test?view=plans&slug=japan&lang=en");

    await expect(visibleToggle(page)).toContainText("Works with TikTok");
    await expect(visibleHint(page)).toContainText("local exit IP");
  });
});
