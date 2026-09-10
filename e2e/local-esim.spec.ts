import { test, expect, type Page } from "@playwright/test";

/**
 * Frontend Playwright tests for the "eSIM nội địa" (domestic eSIM) feature.
 *
 * Exercises the real components against a fully mocked plans API — no backend,
 * Postgres, or OnePay involved:
 *   - GET /api/v1/plans/local-carriers        → carrier cards (grouped by provider)
 *   - GET /api/v1/plans/local/:carrier        → grouped plans for the detail page
 *
 * What they verify (the code changed in this task):
 *   1. Homepage "eSIM nội địa" tab renders carrier cards grouped dynamically.
 *   2. Detail page /esim-noi-dia/[carrier] renders high-speed + unlimited plans,
 *      shows the carrier phone-prefix + eKYC, and selecting a plan updates price
 *      from `vndPrice` (no FE price multiplication).
 */

const API_BASE = "http://localhost:3001";

interface MockLocalCarrier {
  provider: string;
  fromVndPrice: number;
  planCount: number;
}

function carriers(): MockLocalCarrier[] {
  return [
    { provider: "wintel", fromVndPrice: 49000, planCount: 6 },
    { provider: "itel", fromVndPrice: 47000, planCount: 4 },
    { provider: "vnsky", fromVndPrice: 48000, planCount: 3 },
  ];
}

/** Minimal Plan shape the detail page reads. */
function plan(overrides: Record<string, unknown>) {
  return {
    id: 0,
    provider: "wintel",
    providerPlanId: "x",
    name: "",
    durationDays: 30,
    dataMb: 3072,
    costPrice: 0,
    price: 2,
    retailPrice: 2.6,
    currency: "VND",
    sms: 1,
    call: 1,
    type: "fixed",
    topUp: false,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice: 69000,
    isLocalInventory: true,
    isKyc: true,
    speed: "4G",
    ...overrides,
  };
}

/** Grouped response — for a carrier, all plans land in `localEsim`. */
function groupedPlans() {
  return {
    dataPlans: [],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [
      plan({ id: 101, name: "WIN69X 30 ngày", vndPrice: 69000, durationDays: 30, type: "fixed", speed: "4G", tags: ["Phổ biến"], hotSpot: true, hotSpotAllow: "7GB" }),
      plan({ id: 102, name: "5G99C 30 ngày", vndPrice: 99000, durationDays: 30, type: "fixed", speed: "5G", dataMb: 6144 }),
      plan({ id: 201, name: "WINUNL 30 ngày", vndPrice: 129000, durationDays: 30, type: "unlimited", dataMb: 0, tags: ["Best Seller"] }),
    ],
  };
}

async function mockLocalApi(page: Page, carrier = "wintel") {
  await page.route(`${API_BASE}/api/v1/plans/local-carriers`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(carriers()),
    });
  });
  await page.route(`${API_BASE}/api/v1/plans/local/${carrier}**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(groupedPlans()),
    });
  });
}

test.describe("Homepage — eSIM nội địa tab", () => {
  test("renders carrier cards grouped from provider", async ({ page }) => {
    await mockLocalApi(page);

    // Homepage is a server component whose SSR landing fetch would throw when
    // the backend is down, so we mount the real DestinationsSection via the
    // client harness (?view=tab) and drive its tab from there.
    await page.goto("/en/esim-noi-dia/test?view=tab&lang=en");
    await page.getByTestId("country-list-tab-chip-local").click();

    // All three mocked carriers render as cards, cheapest-first.
    await expect(page.getByTestId("local-carrier-card-wintel")).toBeVisible();
    await expect(page.getByTestId("local-carrier-card-itel")).toBeVisible();
    await expect(page.getByTestId("local-carrier-card-vnsky")).toBeVisible();

    // Card shows the "from" price + infra.
    await expect(page.getByTestId("local-carrier-card-wintel")).toContainText("49.000đ");

    // Card links to the detail route.
    await expect(page.getByTestId("local-carrier-card-wintel")).toHaveAttribute(
      "href",
      "/en/domestic-esim/wintel",
    );
  });
});

test.describe("Search — domestic eSIM suggestions", () => {
  /** Destination/region search endpoints return nothing, so only local hits show. */
  async function mockEmptySearch(page: Page) {
    for (const path of ["/api/v1/destinations", "/api/v1/regions"]) {
      await page.route(`${API_BASE}${path}**`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [], total: 0, page: 1, limit: 20 }),
        });
      });
    }
  }

  test("typing 'việt nam' surfaces every domestic carrier", async ({ page }) => {
    await mockLocalApi(page);
    await mockEmptySearch(page);

    await page.goto("/esim-noi-dia/test?view=search&lang=vi");
    await page.getByTestId("search-input").fill("việt nam");

    await expect(page.getByTestId("search-local-carrier-wintel")).toBeVisible();
    await expect(page.getByTestId("search-local-carrier-itel")).toBeVisible();
    await expect(page.getByTestId("search-local-carrier-vnsky")).toBeVisible();

    // Card links to the Vietnamese detail route and shows the "from" price.
    await expect(page.getByTestId("search-local-carrier-wintel")).toHaveAttribute(
      "href",
      "/esim-noi-dia/wintel",
    );
    await expect(page.getByTestId("search-local-carrier-wintel")).toContainText("49.000₫");

    // The generic "no destinations found" empty state must not win.
    await expect(page.getByText("Không tìm thấy điểm đến")).toHaveCount(0);
  });

  test("accent-free 'esim noi dia' and a carrier name both match", async ({ page }) => {
    await mockLocalApi(page);
    await mockEmptySearch(page);

    await page.goto("/esim-noi-dia/test?view=search&lang=vi");

    await page.getByTestId("search-input").fill("esim noi dia");
    await expect(page.getByTestId("search-local-carrier-itel")).toBeVisible();

    // A brand query narrows to that carrier only.
    await page.getByTestId("search-input").fill("vnsky");
    await expect(page.getByTestId("search-local-carrier-vnsky")).toBeVisible();
    await expect(page.getByTestId("search-local-carrier-wintel")).toHaveCount(0);
  });

  test("an unrelated destination query shows no domestic carriers", async ({ page }) => {
    await mockLocalApi(page);
    await mockEmptySearch(page);

    await page.goto("/esim-noi-dia/test?view=search&lang=vi");
    await page.getByTestId("search-input").fill("nhật bản");

    await expect(page.getByText("Không tìm thấy điểm đến")).toBeVisible();
    await expect(page.getByTestId("search-local-carrier-wintel")).toHaveCount(0);
  });
});

test.describe("Detail — LocalEsimDetail (via client harness)", () => {
  // The real /esim-noi-dia/[carrier] page is a server component whose SSR
  // fetch Playwright cannot intercept, so we mount the real detail component
  // client-side via the test-only harness (/esim-noi-dia/test), which fetches
  // plans through the mocked network layer.
  test("renders plans, phone prefix, eKYC, and price from vndPrice", async ({ page }) => {
    await mockLocalApi(page, "wintel");

    await page.goto("/en/esim-noi-dia/test?carrier=wintel&lang=en");
    await expect(page.getByTestId("local-test-meta")).toBeVisible();

    // High-speed + unlimited plan cards render.
    await expect(page.getByTestId("local-plan-101")).toBeVisible();
    await expect(page.getByTestId("local-plan-102")).toBeVisible();
    await expect(page.getByTestId("local-plan-201")).toBeVisible();

    // Carrier phone-prefix pill (Wintel = 055) from carrier-meta.
    await expect(page.getByText("Prefix 055")).toBeVisible();

    // First plan auto-selected → price header shows its vndPrice (69.000).
    await expect(page.getByText("69.000", { exact: false }).first()).toBeVisible();

    // Select the unlimited plan → price updates to its vndPrice (129.000), not multiplied.
    await page.getByTestId("local-plan-201").click();
    await expect(page.getByText("129.000", { exact: false }).first()).toBeVisible();
  });

  /**
   * `plan.hotSpotAllow` already carries its unit ("7GB"); the pill used to
   * append its own "GB" and render "7GBGB/day".
   */
  test("should render the hotspot allowance without duplicating its unit", async ({
    page,
  }) => {
    await mockLocalApi(page, "wintel");

    await page.goto("/en/esim-noi-dia/test?carrier=wintel&lang=en");
    await expect(page.getByTestId("local-test-meta")).toBeVisible();

    await expect(page.getByText("7GB/day")).toBeVisible();
    await expect(page.getByText(/GBGB/)).toHaveCount(0);
  });

  /**
   * The round brand badge shows a single initial ("W"), as in the design —
   * `carrierInitial()` exists for exactly this and had been bypassed by an
   * inline two-character slice that rendered "WI".
   */
  test("should show a single-letter brand initial in the hero badge", async ({
    page,
  }) => {
    await mockLocalApi(page, "wintel");

    await page.goto("/en/esim-noi-dia/test?carrier=wintel&lang=en");
    await expect(page.getByTestId("local-test-meta")).toBeVisible();

    await expect(page.getByText("W", { exact: true })).toBeVisible();
    await expect(page.getByText("WI", { exact: true })).toHaveCount(0);
  });

  test("unknown carrier still renders shell via carrier-meta fallback", async ({ page }) => {
    // local-carriers resolves; the carrier plans endpoint returns empty groups.
    await page.route(`${API_BASE}/api/v1/plans/local-carriers`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(carriers()) });
    });
    await page.route(`${API_BASE}/api/v1/plans/local/ghost**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          dataPlans: [], slowUnlimited: [], fastUnlimited: [],
          dailyUnlimited: [], smsCallEsim: [], localEsim: [],
        }),
      });
    });

    await page.goto("/en/esim-noi-dia/test?carrier=ghost&lang=en");
    // Falls back to an uppercase label, so the shell renders without crashing.
    await expect(page.getByText("eSIM GHOST").first()).toBeVisible();
  });
});

test.describe("Domestic stock — sold-out plans", () => {
  /**
   * Only local inventory is a finite pile of pre-loaded eSIMs, so only it can
   * run out (#040). A sold-out plan must stay visible but be unselectable —
   * hiding it loses the "we normally sell this" signal, leaving it selectable
   * fails at checkout.
   */
  function stockedGroups() {
    return {
      dataPlans: [],
      slowUnlimited: [],
      fastUnlimited: [],
      dailyUnlimited: [],
      smsCallEsim: [],
      localEsim: [
        plan({ id: 301, name: "Còn hàng", vndPrice: 69000, availableStock: 5 }),
        plan({ id: 302, name: "Hết hàng", vndPrice: 99000, availableStock: 0 }),
      ],
    };
  }

  test("greys out and disables a plan with no stock left", async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/plans/local-carriers`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(carriers()) });
    });
    await page.route(`${API_BASE}/api/v1/plans/local/wintel**`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(stockedGroups()) });
    });

    await page.goto("/esim-noi-dia/test?carrier=wintel&lang=vi");
    await expect(page.getByTestId("local-test-meta")).toBeVisible();

    const soldOut = page.getByTestId("local-plan-302");
    await expect(soldOut).toBeVisible();
    await expect(soldOut).toHaveAttribute("data-sold-out", "true");
    await expect(soldOut).toBeDisabled();
    await expect(soldOut).toContainText("Tạm hết hàng");

    // The in-stock one stays fully usable.
    const inStock = page.getByTestId("local-plan-301");
    await expect(inStock).toBeEnabled();
    await expect(inStock).not.toHaveAttribute("data-sold-out", "true");
  });

  test("auto-selects an in-stock plan, never the sold-out one", async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/plans/local-carriers`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(carriers()) });
    });
    await page.route(`${API_BASE}/api/v1/plans/local/wintel**`, async (route) => {
      // Sold-out plan listed FIRST — the old code would have selected it.
      const groups = stockedGroups();
      groups.localEsim.reverse();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(groups) });
    });

    await page.goto("/esim-noi-dia/test?carrier=wintel&lang=vi");
    await expect(page.getByTestId("local-test-meta")).toBeVisible();

    // Price header shows the in-stock plan's price, not the sold-out one's.
    await expect(page.getByText("69.000", { exact: false }).first()).toBeVisible();
  });

  test("never marks an API provider's plan as sold out", async ({ page }) => {
    await page.route(`${API_BASE}/api/v1/plans/local-carriers`, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(carriers()) });
    });
    await page.route(`${API_BASE}/api/v1/plans/local/wintel**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...stockedGroups(),
          // No stock figure at all: an API provider mints eSIMs on demand.
          localEsim: [plan({ id: 401, name: "Airalo-style", vndPrice: 50000, isLocalInventory: false })],
        }),
      });
    });

    await page.goto("/esim-noi-dia/test?carrier=wintel&lang=vi");
    await expect(page.getByTestId("local-test-meta")).toBeVisible();

    await expect(page.getByTestId("local-plan-401")).toBeEnabled();
  });
});
