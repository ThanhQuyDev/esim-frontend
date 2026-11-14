import { test, expect, type Page, type Route } from "@playwright/test";
import { placeName } from "../lib/esim-name";

/**
 * vande-1411 #021 — the destination picker on the home page and the
 * all-destinations page:
 * - the buttons name the place alone ("Nhật Bản", "Châu Á", "iTel");
 * - the headings, the button and the cards' arrow are esim.vn's;
 * - a phone shows the five destinations the admin picked for each tab;
 * - the "Tất cả" tab has a heading over countries, regions and domestic.
 */

const API_BASE = "http://localhost:3001";

const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

function country(id: number, name: string, nameVi: string, code: string, rank: number | null = null) {
  return {
    id,
    name,
    title: `${name} eSIM`,
    titleVi: `eSIM ${nameVi}`,
    slug: `${name.toLowerCase()}-esim`,
    slugVi: `esim-${code.toLowerCase()}`,
    countryCode: code,
    flagUrl: null,
    isPopular: true,
    isActive: true,
    fromPrice: 50_000 + id * 1_000,
    mobileHomeRank: rank,
    createdAt: "",
    updatedAt: "",
  };
}

const COUNTRIES = [
  country(1, "Australia", "Úc", "AU"),
  country(2, "China", "Trung Quốc", "CN"),
  country(3, "France", "Pháp", "FR"),
  country(4, "Germany", "Đức", "DE"),
  country(5, "Italy", "Ý", "IT"),
  country(6, "Japan", "Nhật Bản", "JP"),
  country(7, "Korea", "Hàn Quốc", "KR"),
  country(8, "Thailand", "Thái Lan", "TH"),
];
/** What the admin picked for a phone: Japan first, then Korea, then Thailand. */
const PICKS = [
  // Sent in another order on purpose: the page orders them itself.
  country(8, "Thailand", "Thái Lan", "TH", 3),
  country(6, "Japan", "Nhật Bản", "JP", 1),
  country(7, "Korea", "Hàn Quốc", "KR", 2),
];

const ASIA = {
  id: 50,
  name: "Asia",
  title: "Asia eSIM",
  titleVi: "eSIM Châu Á",
  slug: "asia-esim",
  slugVi: "esim-chau-a",
  isActive: true,
  isPopular: true,
  parentId: null,
  destinationCount: 13,
  fromPrice: 99_000,
  createdAt: "",
  updatedAt: "",
};

async function mockApi(page: Page, picks: unknown[]) {
  await page.route(`${API_BASE}/api/v1/destinations**`, (route) => {
    const filters = new URL(route.request().url()).searchParams.get("filters") ?? "";
    const data = filters.includes("mobileHome") ? picks : COUNTRIES;
    return json(route, { data, hasNextPage: false });
  });
  await page.route(`${API_BASE}/api/v1/regions**`, (route) => {
    const filters = new URL(route.request().url()).searchParams.get("filters") ?? "";
    return json(route, { data: filters.includes("mobileHome") ? [] : [ASIA], hasNextPage: false });
  });
  await page.route(`${API_BASE}/api/v1/plans/local-carriers`, (route) =>
    json(route, [{ provider: "itel-noidia", carrier: "itel", fromVndPrice: 47_000, planCount: 3 }]),
  );
}

test.describe("Names on the destination buttons (vande-1411 #021)", () => {
  test("should drop eSIM from a name, wherever it stands", () => {
    expect(placeName("eSIM Việt Nam")).toBe("Việt Nam");
    expect(placeName("Japan eSIM")).toBe("Japan");
    expect(placeName("eSIM Châu Á")).toBe("Châu Á");
    expect(placeName("Asia (12 areas)")).toBe("Asia (12 areas)");
  });

  test("should show the place alone on the home page, and iTel for the carrier", async ({ page }) => {
    await mockApi(page, []);
    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");

    const japan = page.getByTestId("destination-card-japan-esim");
    await expect(japan).toContainText("Nhật Bản");
    await expect(japan).not.toContainText("eSIM");

    await page.getByTestId("country-list-tab-chip-local").click();
    await expect(page.getByTestId("local-carrier-card-itel")).toContainText("iTel");
    await expect(page.getByTestId("local-carrier-card-itel")).not.toContainText("eSIM");
  });
});

test.describe("Home page heading and arrow as on esim.vn (vande-1411 #021)", () => {
  test("should use esim.vn's heading, button and arrow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await mockApi(page, []);
    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");

    const section = page.getByTestId("section-CountryList");
    await expect(section.locator("h2.heading-xl")).toHaveText("Chọn điểm đến du lịch của bạn");
    await expect(section.locator("p.body-md-medium.text-text-disabled")).toBeVisible();
    const cta = section.getByTestId("section-button-desktop").getByTestId("view-all-destinations-cta");
    await expect(cta).toBeVisible();
    await expect(cta).toHaveCSS("border-radius", "9999px");

    // The arrow: esim.vn's chevron, turned to point right.
    const arrow = page.getByTestId("destination-card-japan-esim").locator("svg.dp-cv");
    await expect(arrow).toHaveAttribute("viewBox", "0 0 16 16");
  });
});

test.describe("Five picked destinations on a phone (vande-1411 #021)", () => {
  test("should show the admin's picks, in their order, on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockApi(page, PICKS);
    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");

    const picks = page.getByTestId("mobile-home-picks");
    await expect(picks).toBeVisible();
    await expect(picks.locator(".dp-n")).toHaveText(["Nhật Bản", "Hàn Quốc", "Thái Lan"]);
    // The usual list is hidden on a phone once there are picks.
    await expect(page.getByTestId("destination-card-australia-esim")).toBeHidden();
  });

  test("should keep the first five on a phone while nothing is picked", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockApi(page, []);
    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");

    await expect(page.getByTestId("mobile-home-picks")).toHaveCount(0);
    await expect(page.locator("#country-list-items .dp-c:visible")).toHaveCount(5);
  });

  test("should leave the desktop list as it is", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await mockApi(page, PICKS);
    await page.goto("/esim-noi-dia/test?view=tab&lang=vi");

    await expect(page.getByTestId("mobile-home-picks")).toBeHidden();
    await expect(page.locator("#country-list-items .dp-c:visible")).toHaveCount(COUNTRIES.length);
  });
});

test.describe("All destinations, the Tất cả tab (vande-1411 #021)", () => {
  test("should head countries, regions and domestic, with room between them", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await mockApi(page, []);
    await page.goto("/diem-den");

    await expect(page.locator("h1.heading-xl")).toHaveText("Tất cả điểm đến");
    await expect(page.getByTestId("all-section-country").locator("h2")).toHaveText("Quốc gia");
    await expect(page.getByTestId("all-section-region").locator("h2")).toHaveText("Khu vực");
    await expect(page.getByTestId("all-section-local").locator("h2")).toHaveText("Nội địa");
    await expect(page.getByTestId("all-section-region")).toHaveCSS("margin-top", "40px");
    await expect(page.getByTestId("all-section-region")).toHaveCSS("margin-bottom", "40px");
  });
});
