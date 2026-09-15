import { test, expect, type Page } from "@playwright/test";

/**
 * Regions that share a name but cover a different number of countries
 * ("eSIM Châu Á" as a 13-country pack and as a 20-country pack) must appear as
 * ONE card in the storefront lists, linking to the group page `/esim-chau-a`.
 *
 * The homepage is a server component whose SSR fetch throws without a backend,
 * so the real DestinationsSection is mounted through the client harness
 * (`/esim-noi-dia/test?view=tab`) and driven against mocked APIs.
 */

const API_BASE = "http://localhost:3001";

function region(overrides: Record<string, unknown>) {
  return {
    id: 0,
    name: "",
    slug: "",
    slugVi: null,
    title: null,
    titleVi: null,
    avatarUrl: null,
    iconUrl: null,
    destinationCount: 0,
    fromPrice: null,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

/** Two same-named Asia packs + one unrelated Europe region. */
function regions() {
  return [
    region({
      id: 1,
      name: "Asia 13",
      titleVi: "eSIM Châu Á",
      title: "Asia eSIM",
      slug: "esim-chau-a-13-quoc-gia",
      slugVi: "esim-chau-a-13-quoc-gia",
      destinationCount: 13,
      fromPrice: 120000,
    }),
    region({
      id: 2,
      name: "Asia 20",
      titleVi: "eSIM Châu Á",
      title: "Asia eSIM",
      slug: "esim-chau-a-20-quoc-gia",
      slugVi: "esim-chau-a-20-quoc-gia",
      destinationCount: 20,
      fromPrice: 99000,
    }),
    region({
      id: 3,
      name: "Europe",
      titleVi: "eSIM Châu Âu",
      title: "Europe eSIM",
      slug: "esim-chau-au",
      slugVi: "esim-chau-au",
      destinationCount: 30,
      fromPrice: 150000,
    }),
  ];
}

async function mockApi(page: Page) {
  await page.route(`${API_BASE}/api/v1/regions**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: regions(),
        total: 3,
        page: 1,
        limit: 100,
        hasNextPage: false,
      }),
    });
  });
  await page.route(`${API_BASE}/api/v1/destinations**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        hasNextPage: false,
      }),
    });
  });
}

/**
 * Plans for whichever region slug is requested, recording each slug so a test
 * can tell which pack's plans were loaded.
 */
async function mockRegionPlans(page: Page, requested: string[]) {
  await page.route(`${API_BASE}/api/v1/plans/by-region/**`, async (route) => {
    const slug = decodeURIComponent(
      new URL(route.request().url()).pathname.split("/").pop() ?? "",
    );
    requested.push(slug);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        dataPlans: [
          {
            id: slug.length,
            provider: "esimaccess",
            providerPlanId: slug,
            name: `${slug} 3GB / 30day`,
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
          },
        ],
        slowUnlimited: [],
        fastUnlimited: [],
        dailyUnlimited: [],
        smsCallEsim: [],
        localEsim: [],
      }),
    });
  });
}

test.describe("Region group page — packs as tabs (#004)", () => {
  test("switches between packs in place without changing the URL", async ({
    page,
  }) => {
    const requested: string[] = [];
    await mockApi(page);
    await mockRegionPlans(page, requested);

    await page.goto("/esim-noi-dia/test?view=region-tabs&slug=esim-chau-a&lang=vi");

    const tab13 = page.getByTestId("region-variant-tab-esim-chau-a-13-quoc-gia");
    const tab20 = page.getByTestId("region-variant-tab-esim-chau-a-20-quoc-gia");
    await expect(page.getByRole("tab")).toHaveCount(2);
    await expect(tab13).toContainText("13 quốc gia");
    await expect(tab20).toContainText("20 quốc gia");
    await expect(tab20).toContainText("99.000");

    // The pack with the fewest countries opens first, with its own plans.
    await expect(tab13).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => requested).toContain("esim-chau-a-13-quoc-gia");

    const urlBefore = page.url();
    await tab20.click();

    await expect(tab20).toHaveAttribute("aria-selected", "true");
    await expect(tab13).toHaveAttribute("aria-selected", "false");
    await expect.poll(() => requested).toContain("esim-chau-a-20-quoc-gia");
    // Tabs, not links: nothing navigated.
    expect(page.url()).toBe(urlBefore);
  });

  test("arrow keys move between the pack tabs", async ({ page }) => {
    await mockApi(page);
    await mockRegionPlans(page, []);

    await page.goto("/esim-noi-dia/test?view=region-tabs&slug=esim-chau-a&lang=vi");

    const tab13 = page.getByTestId("region-variant-tab-esim-chau-a-13-quoc-gia");
    const tab20 = page.getByTestId("region-variant-tab-esim-chau-a-20-quoc-gia");
    await tab13.focus();
    await page.keyboard.press("ArrowRight");

    await expect(tab20).toHaveAttribute("aria-selected", "true");
    await expect(tab20).toBeFocused();
  });

  test("a variant's own page opens on that pack", async ({ page }) => {
    const requested: string[] = [];
    await mockApi(page);
    await mockRegionPlans(page, requested);

    await page.goto(
      "/esim-noi-dia/test?view=region-tabs&slug=esim-chau-a-20-quoc-gia&lang=vi",
    );

    await expect(
      page.getByTestId("region-variant-tab-esim-chau-a-20-quoc-gia"),
    ).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => requested).toContain("esim-chau-a-20-quoc-gia");
  });
});

test.describe("Region grouping — same name, different country count", () => {
  test("lists one card for the group and links to the group slug", async ({
    page,
  }) => {
    await mockApi(page);

    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");
    await page.getByTestId("country-list-tab-chip-region").click();

    // The two Asia packs collapse into a single card at the group slug.
    const group = page.getByTestId("region-card-esim-chau-a");
    await expect(group).toBeVisible();
    await expect(group).toContainText("eSIM Châu Á");

    // …and the individual variants are no longer listed.
    await expect(
      page.getByTestId("region-card-esim-chau-a-13-quoc-gia"),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("region-card-esim-chau-a-20-quoc-gia"),
    ).toHaveCount(0);

    // A region with no same-named sibling is untouched.
    await expect(page.getByTestId("region-card-esim-chau-au")).toBeVisible();
  });

  test("group card shows how many packs it stands for, at the cheapest price", async ({
    page,
  }) => {
    await mockApi(page);

    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");
    await page.getByTestId("country-list-tab-chip-region").click();

    const group = page.getByTestId("region-card-esim-chau-a");
    // "2 lựa chọn" replaces the country count, which would be ambiguous here.
    await expect(group).toContainText("2 lựa chọn");
    // Cheapest across the two packs (99.000), not the first one (120.000).
    await expect(group).toContainText("99.000");

    // The ungrouped region keeps showing its country count.
    await expect(page.getByTestId("region-card-esim-chau-au")).toContainText(
      "30 quốc gia",
    );
  });

  test("group card href points at the shared slug prefix", async ({ page }) => {
    await mockApi(page);

    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");
    await page.getByTestId("country-list-tab-chip-region").click();

    await expect(page.getByTestId("esim-chau-a")).toHaveAttribute(
      "href",
      "/esim-chau-a",
    );
  });
});
