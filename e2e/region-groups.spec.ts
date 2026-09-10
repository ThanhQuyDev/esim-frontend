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
