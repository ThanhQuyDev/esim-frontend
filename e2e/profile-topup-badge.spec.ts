import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * #031 — a topped-up eSIM must be recognisable in the customer's own profile: a
 * TOPUP badge next to the product name, and the package named in the info tab.
 *
 * The count comes from the paid topup orders server-side, so an admin-granted
 * topup shows up exactly like one the customer bought — which is the point of
 * deriving it rather than flagging it at checkout.
 */

const API_BASE = "http://localhost:3001";

test.describe.configure({ mode: "serial", timeout: 120_000 });

// Only the fields this card actually renders: the whole fixture travels in the
// query string, and five full eSIM records made a URL the dev server choked on.
function esim(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    iccid: `893407900000000000${id}`,
    status: "sold",
    provider: "airalo",
    dataUsed: "0",
    dataTotal: "3072",
    createdAt: "2026-09-01T00:00:00.000Z",
    expiresAt: "2026-10-01T00:00:00.000Z",
    plan: { id: 1, name: `Vietnam 3GB / case ${id}` },
    ...overrides,
  };
}

/**
 * One case per card in ONE page load. Navigating per assertion made the suite
 * time out: each `page.goto` on this harness route pays dev-server compilation,
 * and the cost is per navigation, not per assertion.
 */
const CARDS = [
  // #1 topped up once — badge with no multiplier.
  esim(1, { topupCount: 1, topupPackageNames: "Vietnam-3days-3gb-topup" }),
  // #2 topped up three times — the count belongs in the badge.
  esim(2, { topupCount: 3, topupPackageNames: "A, B, C" }),
  // #3 never topped up — no badge at all.
  esim(3),
  // #4 names its package in the info tab, with the date of the last topup.
  esim(4, {
    topupCount: 1,
    topupPackageNames: "Vietnam-3days-3gb-topup",
    lastTopupAt: "2026-09-20T00:00:00.000Z",
  }),
  // #5 topped up before the snapshot existed (#015): no package name to show.
  esim(5, { topupCount: 2, topupPackageNames: null }),
];

function card(page: Page, id: number): Locator {
  return page.locator(`[data-testid="esim-card"][data-esim-id="${id}"]`);
}

/** The card starts collapsed; the info tab is what #031 asks about. */
async function expand(page: Page, id: number) {
  const target = card(page, id);
  // A click that lands before hydration is lost, so keep opening until the
  // expanded body (the ICCID field) is on screen.
  await expect(async () => {
    await target.getByText(`Vietnam 3GB / case ${id}`).click();
    await expect(target.getByText(`893407900000000000${id}`).first()).toBeVisible({
      timeout: 2_000,
    });
  }).toPass({ timeout: 30_000 });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }),
    );
  });
  // Without these the usage hook fires five live requests that never answer.
  await page.route(`${API_BASE}/api/v1/carts**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route(`${API_BASE}/api/v1/esims/my/*/data-usage**`, (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );

  await page.goto(
    `/esim-noi-dia/test?view=esim-cards&lang=vi&esims=${encodeURIComponent(
      JSON.stringify(CARDS),
    )}`,
    { waitUntil: "domcontentloaded" },
  );
  await expect(page.getByTestId("esim-card")).toHaveCount(CARDS.length);
});

test("shows a TOPUP badge beside the product name once topped up", async ({ page }) => {
  await expect(card(page, 1).getByTestId("esim-topup-badge")).toHaveText("TOPUP");
});

test("counts repeated topups in the badge", async ({ page }) => {
  await expect(card(page, 2).getByTestId("esim-topup-badge")).toHaveText("TOPUP ×3");
});

test("shows no badge on an eSIM that was never topped up", async ({ page }) => {
  await expect(card(page, 3).getByTestId("esim-topup-badge")).toHaveCount(0);
  // ...while its neighbours do have one, so this is not an empty page passing.
  await expect(page.getByTestId("esim-topup-badge")).toHaveCount(4);
});

test("names the topped-up package in the info tab", async ({ page }) => {
  await expand(page, 4);

  const packages = card(page, 4).getByTestId("esim-topup-packages");
  await expect(packages).toBeVisible();
  await expect(packages).toContainText("Vietnam-3days-3gb-topup");
});

test("falls back to the count when the package name is missing", async ({ page }) => {
  // Topups placed before the snapshot existed (#015) have no package name; the
  // customer should still be told it was topped up.
  await expand(page, 5);

  await expect(card(page, 5).getByTestId("esim-topup-packages")).toContainText("2 lần topup");
});
