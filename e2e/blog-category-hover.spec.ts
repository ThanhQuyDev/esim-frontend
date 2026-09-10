import { test, expect, type Page } from "@playwright/test";

/**
 * #067 — hovering a blog category opens its sub-menu.
 *
 * The level-2 categories were only reachable by clicking a small chevron next to
 * the category name, which nobody discovers. Hover now opens it; the chevron
 * still works, because a touch device has no hover.
 */

const API_BASE = "http://localhost:3001";

const CATEGORIES = ["Hướng dẫn", "Tin tức", "Khuyến mãi"];
const PARENTS: Record<string, string[]> = {
  "Hướng dẫn": ["Cài đặt eSIM", "Thiết bị hỗ trợ"],
  "Tin tức": ["Nhà mạng"],
  // "Khuyến mãi" deliberately has no children.
};

async function mockNav(page: Page) {
  await page.route(`${API_BASE}/api/v1/blogs/categories**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CATEGORIES),
    }),
  );
  await page.route(`${API_BASE}/api/v1/blogs/parents**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PARENTS),
    }),
  );
}

const GUIDES = "blog-cat-huong-dan";
const NEWS = "blog-cat-tin-tuc";
const PROMOS = "blog-cat-khuyen-mai";

async function open(page: Page) {
  await mockNav(page);
  await page.goto("/esim-noi-dia/test?view=blog-nav&lang=vi");
  await expect(page.getByTestId(GUIDES)).toBeVisible();
}

test.describe("Blog category sub-menu", () => {
  test("opens on hover, without touching the arrow", async ({ page }) => {
    await open(page);

    await expect(page.getByTestId("blog-subnav-huong-dan")).toHaveCount(0);
    await page.getByTestId(GUIDES).hover();

    const submenu = page.getByTestId("blog-subnav-huong-dan");
    await expect(submenu).toBeVisible();
    await expect(submenu).toContainText("Cài đặt eSIM");
    await expect(submenu).toContainText("Thiết bị hỗ trợ");
  });

  test("stays open while the pointer moves down onto it", async ({ page }) => {
    await open(page);
    await page.getByTestId(GUIDES).hover();

    // The gap between label and menu is padding, not margin, so travelling
    // between them never leaves the category.
    await page.getByRole("link", { name: "Cài đặt eSIM" }).hover();

    await expect(page.getByTestId("blog-subnav-huong-dan")).toBeVisible();
  });

  test("switches to the category being hovered", async ({ page }) => {
    await open(page);

    await page.getByTestId(GUIDES).hover();
    await expect(page.getByTestId("blog-subnav-huong-dan")).toBeVisible();

    await page.getByTestId(NEWS).hover();
    await expect(page.getByTestId("blog-subnav-tin-tuc")).toBeVisible();
    await expect(page.getByTestId("blog-subnav-huong-dan")).toHaveCount(0);
  });

  test("closes when the pointer leaves", async ({ page }) => {
    await open(page);
    await page.getByTestId(GUIDES).hover();
    await expect(page.getByTestId("blog-subnav-huong-dan")).toBeVisible();

    await page.getByTestId("local-test-meta").hover();

    await expect(page.getByTestId("blog-subnav-huong-dan")).toHaveCount(0);
  });

  test("shows no sub-menu for a category that has none", async ({ page }) => {
    await open(page);

    await page.getByTestId(PROMOS).hover();

    await expect(page.getByTestId("blog-subnav-khuyen-mai")).toHaveCount(0);
  });

  test("still opens by clicking the arrow, for touch devices", async ({
    page,
  }) => {
    await open(page);

    // A tap fires the click without any hover first, which is what a phone does.
    await page.getByTestId(NEWS).getByRole("button").dispatchEvent("click");

    await expect(page.getByTestId("blog-subnav-tin-tuc")).toBeVisible();
  });

  test("keeps the category itself clickable", async ({ page }) => {
    await open(page);

    await expect(
      page.getByTestId(GUIDES).getByRole("link", { name: "Hướng dẫn" }),
    ).toHaveAttribute("href", "/vi/blog/huong-dan");
  });
});
