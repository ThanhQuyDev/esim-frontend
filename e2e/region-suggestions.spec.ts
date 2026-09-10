import { test, expect, type Page } from "@playwright/test";
import { buildRegionSuggestions } from "../lib/region-suggestions";
import type { Region } from "../lib/api";

/**
 * #043 — a country page suggests the regional / global packs that cover it.
 *
 * A traveller looking at Japan may be visiting Korea next: one regional pack
 * beats two country eSIMs. The suggestion list is built by joining the regions
 * on the country payload with the region list (which carries country count and
 * "from" price), so nothing is suggested that doesn't actually include the
 * country.
 *
 * Pure-logic tests for that join, then the rendered section driven through the
 * client harness (`/esim-noi-dia/test?view=region-suggest`).
 */

const API_BASE = "http://localhost:3001";

function region(overrides: Record<string, unknown>): Region {
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
  } as unknown as Region;
}

const ASIA = region({
  id: 1,
  name: "Asia",
  title: "Asia eSIM",
  titleVi: "eSIM Châu Á",
  slug: "esim-asia",
  slugVi: "esim-chau-a",
  destinationCount: 13,
  fromPrice: 120_000,
});

const GLOBAL = region({
  id: 2,
  name: "Global",
  title: "Global eSIM",
  titleVi: "eSIM Toàn cầu",
  slug: "esim-global",
  slugVi: "esim-toan-cau",
  destinationCount: 120,
  fromPrice: 350_000,
});

const EUROPE = region({
  id: 3,
  name: "Europe",
  title: "Europe eSIM",
  titleVi: "eSIM Châu Âu",
  slug: "esim-europe",
  slugVi: "esim-chau-au",
  destinationCount: 42,
  fromPrice: 200_000,
});

/** Japan belongs to Asia and Global — not Europe. */
function japan() {
  return {
    id: 10,
    name: "Japan",
    title: "Japan eSIM",
    titleVi: "eSIM Nhật Bản",
    slug: "esim-japan",
    slugVi: "esim-nhat-ban",
    countryCode: "JP",
    isPopular: true,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    regions: [
      { id: 1, name: "Asia", slug: "esim-asia", slugVi: "esim-chau-a" },
      { id: 2, name: "Global", slug: "esim-global", slugVi: "esim-toan-cau" },
    ],
  };
}

test.describe("Region suggestion rules", () => {
  test("suggests only the regions that actually include the country", () => {
    const items = buildRegionSuggestions(japan(), [ASIA, EUROPE, GLOBAL], "vi");

    expect(items.map((i) => i.id)).toEqual([1, 2]);
    expect(items.map((i) => i.titleVi)).not.toContain("eSIM Châu Âu");
  });

  test("puts the regional pack before the global one", () => {
    // Global covers more countries but is the pricier answer for someone
    // hopping between two neighbours, so the narrow pack leads.
    const items = buildRegionSuggestions(japan(), [GLOBAL, ASIA], "vi");

    expect(items.map((i) => i.name)).toEqual(["Asia", "Global"]);
  });

  test("returns nothing when the country belongs to no region", () => {
    expect(
      buildRegionSuggestions({ regions: [] }, [ASIA, GLOBAL], "vi"),
    ).toEqual([]);
    expect(buildRegionSuggestions({}, [ASIA, GLOBAL], "vi")).toEqual([]);
  });

  test("skips a region the CMS switched off", () => {
    const items = buildRegionSuggestions(
      japan(),
      [{ ...ASIA, isActive: false }, GLOBAL],
      "vi",
    );

    expect(items.map((i) => i.id)).toEqual([2]);
  });

  test("collapses same-named variants into one card, like every other list", () => {
    // "eSIM Châu Á" sold as a 13- and a 20-country pack is ONE suggestion
    // pointing at the group page (#007).
    const asia20 = region({
      id: 4,
      name: "Asia 20",
      title: "Asia eSIM",
      titleVi: "eSIM Châu Á",
      slug: "esim-asia-20-countries",
      slugVi: "esim-chau-a-20-quoc-gia",
      destinationCount: 20,
      fromPrice: 99_000,
    });
    const dest = japan();
    dest.regions.push({
      id: 4,
      name: "Asia 20",
      slug: "esim-asia-20-countries",
      slugVi: "esim-chau-a-20-quoc-gia",
    });

    const items = buildRegionSuggestions(dest, [ASIA, asia20, GLOBAL], "vi");

    const asia = items.find((i) => i.titleVi === "eSIM Châu Á");
    expect(asia?.variantCount).toBe(2);
    expect(asia?.slugVi).toBe("esim-chau-a");
    // Cheapest of the two variants, so the card doesn't overquote.
    expect(asia?.fromPrice).toBe(99_000);
    expect(items).toHaveLength(2);
  });

  test("caps the list so the section stays a suggestion, not a catalogue", () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      region({
        id: 100 + i,
        name: `R${i}`,
        title: `R${i}`,
        titleVi: `R${i}`,
        slug: `r-${i}`,
        slugVi: `r-${i}`,
        destinationCount: 5 + i,
        fromPrice: 100_000,
      }),
    );
    const dest = {
      regions: many.map((r) => ({ id: r.id, name: r.name, slug: r.slug })),
    };

    expect(buildRegionSuggestions(dest, many, "vi")).toHaveLength(3);
  });
});

/* ── Rendered section ── */

async function mockApi(
  page: Page,
  regions: unknown[],
  destination: unknown = japan(),
) {
  await page.route(
    `${API_BASE}/api/v1/destinations/slug/**`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(destination),
      }),
  );
  await page.route(`${API_BASE}/api/v1/regions**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: regions, hasNextPage: false }),
    }),
  );
}

test.describe("Region suggestions on a country page", () => {
  test("names the country and links to each pack", async ({ page }) => {
    await mockApi(page, [ASIA, EUROPE, GLOBAL]);
    await page.goto(
      "/esim-noi-dia/test?view=region-suggest&slug=esim-nhat-ban&lang=vi",
    );

    const section = page.getByTestId("region-suggestions");
    await expect(section).toBeVisible();
    await expect(section).toContainText("eSIM Nhật Bản");

    // Asia first, then Global — and Europe nowhere.
    await expect(page.getByTestId("region-suggestion-esim-chau-a")).toHaveAttribute(
      "href",
      "/esim-chau-a",
    );
    await expect(
      page.getByTestId("region-suggestion-esim-toan-cau"),
    ).toBeVisible();
    await expect(page.getByTestId("region-suggestion-esim-chau-au")).toHaveCount(0);

    // Country count + "from" price, the same facts the destination list shows.
    await expect(page.getByTestId("region-suggestion-esim-chau-a")).toContainText(
      "13",
    );
    await expect(page.getByTestId("region-suggestion-esim-chau-a")).toContainText(
      "120.000đ",
    );
  });

  test("renders nothing when the country belongs to no region", async ({
    page,
  }) => {
    await mockApi(page, [EUROPE], { ...japan(), regions: [] });
    await page.goto(
      "/esim-noi-dia/test?view=region-suggest&slug=esim-nhat-ban&lang=vi",
    );

    await expect(page.getByTestId("local-test-meta")).toBeVisible();
    await expect(page.getByTestId("region-suggestions")).toHaveCount(0);
  });

  test("links to the English slug on the English locale", async ({ page }) => {
    await mockApi(page, [ASIA, GLOBAL]);
    await page.goto(
      "/en/esim-noi-dia/test?view=region-suggest&slug=esim-japan&lang=en",
    );

    await expect(page.getByTestId("region-suggestions")).toContainText(
      "Japan eSIM",
    );
    await expect(page.getByTestId("region-suggestion-esim-asia")).toHaveAttribute(
      "href",
      "/en/esim-asia",
    );
  });
});
