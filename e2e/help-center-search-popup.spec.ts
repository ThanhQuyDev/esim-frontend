import { test, expect, type Page } from "@playwright/test";
import {
  helpCenterArticleSlug,
  helpCenterResults,
  helpCenterSearchUrl,
  moveActiveIndex,
} from "../lib/help-center-search";

/**
 * #074 — the help-centre search must show its results while the customer types.
 *
 * The box used to stay silent until Enter: every popup implementation called
 * `/api/help-center?search=…`, but the controller is versioned and the keyword
 * search lives at `/api/v1/help-center/search?q=…`, so the request 404'd and the
 * result list was always empty.
 *
 * The real help-centre page is a server component whose SSR fetch throws with no
 * backend, so the real search box is mounted through the client harness
 * (`/esim-noi-dia/test?view=help-search`) against a mocked search endpoint.
 */

const API_BASE = "http://localhost:3001";
const HARNESS = "/esim-noi-dia/test?view=help-search&lang=vi";

function article(id: string, title: string, slug?: string) {
  return {
    id,
    slug: slug ?? "",
    title,
    content: `<p>${title}</p>`,
    order: 1,
    category: "getting_started",
    parent: "activation",
    createdAt: "",
    updatedAt: "",
  };
}

const MATCHES = [
  article("a1", "Cách kích hoạt eSIM trên iPhone", "kich-hoat-esim-iphone"),
  article("a2", "eSIM không nhận sóng phải làm sao", "esim-khong-nhan-song"),
];

/** Serve the search endpoint; `articles` decides what a query returns. */
async function mockSearch(
  page: Page,
  articles: ReturnType<typeof article>[],
  onRequest?: (url: URL) => void,
) {
  // Catch-all first: Playwright runs the LAST matching handler registered, so
  // the search route below has to be added after it to win.
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
  );

  await page.route(`${API_BASE}/api/v1/help-center/search*`, async (route) => {
    onRequest?.(new URL(route.request().url()));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: articles, hasNextPage: false, total: articles.length }),
    });
  });
}

test.describe("help-center quick search", () => {
  test("builds the versioned search URL the backend actually serves", () => {
    const url = new URL(helpCenterSearchUrl(API_BASE, "kích hoạt", { limit: 8, lang: "vi" }));

    // The old `/api/help-center?search=` shape is what made the popup empty.
    expect(url.pathname).toBe("/api/v1/help-center/search");
    expect(url.searchParams.get("q")).toBe("kích hoạt");
    expect(url.searchParams.get("limit")).toBe("8");
    expect(url.searchParams.get("language")).toBe("vi");
  });

  test("reads results out of either response shape", () => {
    expect(helpCenterResults({ data: MATCHES }).map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(helpCenterResults(MATCHES).map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(helpCenterResults({ data: null })).toEqual([]);
    expect(helpCenterResults(null)).toEqual([]);
  });

  test("prefers the CMS slug and only derives one when it is missing", () => {
    expect(helpCenterArticleSlug(MATCHES[0])).toBe("kich-hoat-esim-iphone");
    expect(helpCenterArticleSlug({ slug: "   ", title: "Hello There" })).toBe("hello-there");
  });

  test("wraps the keyboard highlight around both ends", () => {
    expect(moveActiveIndex(-1, 1, 3)).toBe(0);
    expect(moveActiveIndex(-1, -1, 3)).toBe(2);
    expect(moveActiveIndex(2, 1, 3)).toBe(0);
    expect(moveActiveIndex(0, -1, 3)).toBe(2);
    // Nothing to highlight while the popup is empty.
    expect(moveActiveIndex(0, 1, 0)).toBe(-1);
  });

  test("opens the popup with results while typing, no Enter needed", async ({ page }) => {
    const queries: string[] = [];
    await mockSearch(page, MATCHES, (url) => queries.push(url.searchParams.get("q") ?? ""));

    await page.goto(HARNESS);
    await page.getByTestId("help-center-search-input").fill("kích hoạt");

    const popup = page.getByTestId("help-center-search-popup");
    await expect(popup).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("help-center-search-result-0")).toContainText(
      "Cách kích hoạt eSIM trên iPhone",
    );
    await expect(page.getByTestId("help-center-search-result-1")).toBeVisible();
    await expect(page.getByTestId("help-center-search-see-all")).toBeVisible();

    expect(queries.at(-1)).toBe("kích hoạt");
  });

  test("says so when nothing matches instead of showing an empty box", async ({ page }) => {
    await mockSearch(page, []);

    await page.goto(HARNESS);
    await page.getByTestId("help-center-search-input").fill("xyzkhongcogi");

    await expect(page.getByTestId("help-center-search-empty")).toBeVisible();
  });

  test("arrow keys move the highlight and Enter opens that article", async ({ page }) => {
    await mockSearch(page, MATCHES);

    await page.goto(HARNESS);
    const input = page.getByTestId("help-center-search-input");
    await input.fill("esim");
    await expect(page.getByTestId("help-center-search-result-1")).toBeVisible({
      timeout: 15_000,
    });

    await input.press("ArrowDown");
    await input.press("ArrowDown");
    await expect(page.getByTestId("help-center-search-result-1")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await input.press("Enter");
    // The article route is compiled on demand by `next dev`, which can take a
    // while when the whole suite runs in parallel.
    await expect(page).toHaveURL(/esim-khong-nhan-song/, { timeout: 30_000 });
  });

  test("Escape closes the popup but keeps what was typed", async ({ page }) => {
    await mockSearch(page, MATCHES);

    await page.goto(HARNESS);
    const input = page.getByTestId("help-center-search-input");
    await input.fill("esim");
    await expect(page.getByTestId("help-center-search-popup")).toBeVisible();

    await input.press("Escape");
    await expect(page.getByTestId("help-center-search-popup")).toBeHidden();
    await expect(input).toHaveValue("esim");
  });

  test("clicking outside closes the popup", async ({ page }) => {
    await mockSearch(page, MATCHES);

    await page.goto(HARNESS);
    await page.getByTestId("help-center-search-input").fill("esim");
    await expect(page.getByTestId("help-center-search-popup")).toBeVisible();

    await page.getByTestId("local-test-meta").click();
    await expect(page.getByTestId("help-center-search-popup")).toBeHidden();
  });
});
