import { test, expect, type Route } from "@playwright/test";
import { carrierName } from "../components/layout/sections/local-esim/carrier-meta";

/**
 * vande-1411 #025 — a destination of eSIM Type "Local" names a domestic carrier:
 * its button in the "Nội địa" tab takes the destination's title and icon, and
 * stands before any eSIM is imported (no price then).
 */

const API_BASE = "http://localhost:3001";
const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

const ICON = "https://example.test/vietnamobile.png";

test("should name a carrier after its local destination", () => {
  const page = { name: "Vietnamobile", title: "Vietnamobile eSIM", titleVi: "eSIM Vietnamobile" };
  expect(carrierName("vietnamobile", "vi", page)).toBe("Vietnamobile");
  expect(carrierName("vietnamobile", "en", page)).toBe("Vietnamobile");
  // No local destination: the built-in label, as before.
  expect(carrierName("itel", "vi", null)).toBe("iTel");
});

test("should show a local destination's button, with its icon and no price yet", async ({ page }) => {
  await page.route(`${API_BASE}/**`, (route) => json(route, { data: [] }));
  await page.route(`${API_BASE}/api/v1/plans/local-carriers`, (route) =>
    json(route, [
      { provider: "itel-noidia", carrier: "itel", fromVndPrice: 47_000, planCount: 3, destination: null },
      {
        provider: "vietnamobile-noidia",
        carrier: "vietnamobile",
        fromVndPrice: 0,
        planCount: 0,
        destination: {
          id: 90,
          name: "Vietnamobile",
          title: "Vietnamobile eSIM",
          titleVi: "eSIM Vietnamobile",
          description: null,
          descriptionVi: "P1",
          avatarUrl: null,
          flagUrl: ICON,
          parentId: 5,
        },
      },
    ]),
  );
  await page.goto("/esim-noi-dia/test?view=tab&lang=vi");
  await page.getByTestId("country-list-tab-chip-local").click();

  const card = page.getByTestId("local-carrier-card-vietnamobile");
  await expect(card).toContainText("Vietnamobile");
  await expect(card).not.toContainText("Từ");
  await expect(card.locator("img")).toHaveAttribute("src", ICON);
  // The built-in carrier is unchanged.
  await expect(page.getByTestId("local-carrier-card-itel")).toContainText("Từ");
});
