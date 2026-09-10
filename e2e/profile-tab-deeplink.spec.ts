import { test, expect, type Page } from "@playwright/test";

/**
 * Opening a profile tab straight from a link (#095).
 *
 * The partner approval email's only call to action is "go to your partner
 * page". It used to point at `/tai-khoan/affiliates`, a path the site serves in
 * neither language, so every approved partner clicked through to a 404. The
 * Affiliates tab is not a route of its own — it is a tab inside the profile
 * page — so the email now links to `/ho-so?tab=affiliate` and the page has to
 * honour that parameter.
 */

const API_BASE = "http://localhost:3001";

const PARTNER = {
  id: 5,
  partnerType: "kol",
  status: "active",
  tierCode: "silver",
  contactName: "Nguyễn Văn A"
};

async function signIn(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "e2e-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "kol@example.com" })
    );
  });
}

async function mockApi(page: Page, { partner }: { partner: unknown }) {
  // Catch-all first (last route wins): an unmocked call answering 401 would
  // trip authFetch's auth-expired handler and sign the fake session out.
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    })
  );
  // A realistic wallet, so these tests exercise the deep link rather than the
  // page's tolerance of a malformed one (that has its own test below).
  await page.route(`${API_BASE}/api/v1/wallets/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balanceVnd: 0,
        tier: "silver",
        lifetimeSpendVnd: 1_500_000,
        daysLeft: 90,
      }),
    })
  );
  await page.route(`${API_BASE}/api/v1/partners/me`, (route) =>
    partner
      ? route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(partner),
        })
      : // What the backend really answers an ordinary customer: role-guarded.
        route.fulfill({
          status: 403,
          contentType: "application/json",
          body: JSON.stringify({ message: "Forbidden" }),
        })
  );
}

test("opens the Affiliates tab when the email link says so", async ({
  page,
}) => {
  await signIn(page);
  await mockApi(page, { partner: PARTNER });

  await page.goto("/ho-so?tab=affiliate");

  // The tab's own content, not merely the tab button: landing on the profile
  // tab instead would make the email's promise false.
  await expect(page.getByTestId("affiliate-tab")).toBeVisible({
    timeout: 20000,
  });
});

test("serves that profile path at all — the email link must not 404", async ({
  page,
}) => {
  await signIn(page);
  await mockApi(page, { partner: PARTNER });

  const response = await page.goto("/ho-so?tab=affiliate");

  expect(response?.status()).toBe(200);
});

test("ignores the parameter for someone who is not a partner", async ({
  page,
}) => {
  await signIn(page);
  await mockApi(page, { partner: null });

  await page.goto("/ho-so?tab=affiliate");

  // No Affiliates tab exists for them, so they stay on the default one rather
  // than seeing a blank panel.
  await expect(page.getByTestId("affiliate-tab")).toHaveCount(0);
  await expect(page.getByTestId("affiliate-status-notice")).toHaveCount(0);
});

test("ignores an unknown tab name", async ({ page }) => {
  await signIn(page);
  await mockApi(page, { partner: PARTNER });

  await page.goto("/ho-so?tab=nonsense");

  await expect(page.getByTestId("affiliate-tab")).toHaveCount(0);
});

test("still renders the profile when the wallet has a tier we do not know", async ({
  page,
}) => {
  await signIn(page);
  await mockApi(page, { partner: PARTNER });
  // Overrides the wallet mock above (last route registered wins).
  await page.route(`${API_BASE}/api/v1/wallets/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ balanceVnd: 0, tier: "diamond", daysLeft: 30 }),
    })
  );

  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/ho-so?tab=affiliate");

  // A tier name the frontend cannot spell used to throw and blank the entire
  // page; the customer's orders and eSIMs must not depend on that lookup.
  await expect(page.getByTestId("affiliate-tab")).toBeVisible({
    timeout: 20000,
  });
  expect(errors).toEqual([]);
});
