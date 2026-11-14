import { test, expect, type Route } from "@playwright/test";

/**
 * vande-1411 #023 — the navbar's "Điểm đến" menu on a computer:
 * "TOP 15" (the featured ones, three rows), then "Quốc gia", "Khu vực" and
 * "Nội địa" with every destination, three rows and a scrollbar past them.
 */

const API_BASE = "http://localhost:3001";
test.describe.configure({ timeout: 120_000 });

const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

const countries = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Country ${String(i + 1).padStart(2, "0")}`,
  title: null,
  titleVi: `Quốc gia ${String(i + 1).padStart(2, "0")}`,
  slug: `country-${i + 1}`,
  slugVi: `quoc-gia-${i + 1}`,
  countryCode: `C${i}`,
  isActive: true,
  isPopular: i < 12,
  fromPrice: 50_000,
}));
const regions = Array.from({ length: 6 }, (_, i) => ({
  id: 100 + i,
  name: `Region ${i}`,
  title: null,
  titleVi: `Khu vực ${i}`,
  slug: `region-${i}`,
  slugVi: `khu-vuc-${i}`,
  isActive: true,
  isPopular: true,
  parentId: null,
  destinationCount: 10,
  fromPrice: 90_000,
}));

test("should offer TOP 15 and every destination per tab, three rows then a scrollbar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route(`${API_BASE}/**`, (route) => json(route, { data: [] }));
  await page.route(`${API_BASE}/api/v1/destinations?**`, (route) => {
    const filters = new URL(route.request().url()).searchParams.get("filters") ?? "";
    const data = filters.includes("isPopular") ? countries.filter((c) => c.isPopular) : countries;
    return json(route, { data, hasNextPage: false });
  });
  await page.route(`${API_BASE}/api/v1/regions?**`, (route) => json(route, { data: regions, hasNextPage: false }));
  await page.route(`${API_BASE}/api/v1/plans/local-carriers`, (route) =>
    json(route, [
      { provider: "itel-noidia", carrier: "itel", fromVndPrice: 47_000, planCount: 3 },
      { provider: "vnsky-noidia", carrier: "vnsky", fromVndPrice: 48_000, planCount: 3 },
    ]),
  );

  await page.goto("/", { waitUntil: "load" });
  const dropdown = page.getByTestId("destinations-dropdown");
  await expect(async () => {
    await page.locator("header").getByRole("button", { name: /Điểm đến/ }).first().click();
    await expect(dropdown).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 60_000 });

  const items = dropdown.getByTestId("dropdown-tab-items");

  // TOP 15: the featured countries, then the featured regions, 15 in all.
  await expect(dropdown.getByTestId("dropdown-tab-top15")).toHaveText("TOP 15");
  await expect(items.locator("> a")).toHaveCount(15);

  // Quốc gia: every country, with a scrollbar past three rows.
  await dropdown.getByTestId("dropdown-tab-country").click();
  await expect(items.locator("> a")).toHaveCount(countries.length);
  const scroll = await items.evaluate((el) => ({ client: el.clientHeight, scroll: el.scrollHeight }));
  expect(scroll.client).toBe(224);
  expect(scroll.scroll).toBeGreaterThan(scroll.client);

  // Nội địa: the domestic carriers.
  await dropdown.getByTestId("dropdown-tab-local").click();
  await expect(dropdown.getByTestId("dropdown-tab-local")).toContainText("Nội địa");
  await expect(dropdown.getByTestId("dropdown-local-itel")).toContainText("iTel");
  await expect(items.locator("> a")).toHaveCount(2);
});
