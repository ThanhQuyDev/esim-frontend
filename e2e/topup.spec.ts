import { test, expect, type Page } from "@playwright/test";

/**
 * Frontend Playwright tests for the Topup modal — billion / microesim support.
 *
 * These tests exercise the *real* `TopupModal` component (mounted via the
 * test-only harness page `/profile/topup-test`) against a fully mocked topup
 * API. No backend, Postgres, or OnePay is involved:
 *   - `GET  /api/v1/topup/packages` → mocked package list per provider
 *   - `POST /api/v1/topup/checkout` → captured + fulfilled with a fake payUrl
 *
 * What they verify (the code changed in this task):
 *   1. New provider labels (Billion / MicroEsim) render in the modal header.
 *   2. The unified package list renders for these providers.
 *   3. Selecting a package + confirming sends a checkout payload carrying the
 *      correct `provider` enum value and `packageId`.
 */

const API_BASE = "http://localhost:3001";
const TOKEN = "test-jwt-token";

/** Seed auth into localStorage before any app script runs (AuthProvider reads it on hydrate). */
async function seedAuth(page: Page) {
  await page.addInitScript(
    ({ token }) => {
      localStorage.setItem("esim_auth_token", token);
      localStorage.setItem(
        "esim_auth_user",
        JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }),
      );
    },
    { token: TOKEN },
  );
}

interface MockPkg {
  provider: "BILLION";
  packageId: string;
  name: string;
  dataAmountBytes: number;
  dataAmountText: string;
  durationDays: number;
  isUnlimited: boolean;
  price: number;
  retailPrice: number;
  vndPrice?: number;
}

/**
 * Billion is a DB-catalogued, fully-supported topup provider (F007 recharge),
 * so its package list is populated. MicroEsim is intentionally NOT here: its
 * public API has no recharge endpoint, so the backend returns an empty list
 * and blocks checkout (see the "microesim" describe below).
 */
function packagesFor(_provider: "BILLION"): MockPkg[] {
  return [
    {
      provider: "BILLION",
      packageId: "billion-sku-3gb-30d",
      name: "Billion 3GB - 30 Days",
      dataAmountBytes: 3 * 1024 * 1024 * 1024,
      dataAmountText: "3 GB",
      durationDays: 30,
      isUnlimited: false,
      price: 8,
      retailPrice: 11,
      vndPrice: 280000,
    },
    {
      provider: "BILLION",
      packageId: "billion-sku-unltd-15d",
      name: "Billion Unlimited - 15 Days",
      dataAmountBytes: 0,
      dataAmountText: "Unlimited",
      durationDays: 15,
      isUnlimited: true,
      price: 15,
      retailPrice: 20,
      vndPrice: 520000,
    },
  ];
}

/**
 * Stub every other authenticated call this page makes.
 *
 * `authFetch` logs the user out on ANY 401, so when a real backend runs on
 * :3001 an unrelated call (e.g. /carts) rejecting our fake token would clear
 * the token and disable the topup query — failing the test for a reason
 * unrelated to what it asserts.
 */
async function stubOtherAuthedCalls(page: Page) {
  await page.route(`${API_BASE}/api/v1/carts**`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.route(`${API_BASE}/api/v1/destinations**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], hasNextPage: false }),
    });
  });
}

/** Mock the two topup endpoints. Returns a promise that resolves with the checkout payload once fired. */
function mockTopupApi(
  page: Page,
  provider: "BILLION",
  iccid: string,
) {
  void stubOtherAuthedCalls(page);
  let resolveCheckout: (body: any) => void;
  const checkoutPayload = new Promise<any>((r) => {
    resolveCheckout = r;
  });

  // GET /api/v1/topup/packages?iccid=...
  void page.route(`${API_BASE}/api/v1/topup/packages**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        iccid,
        provider,
        packages: packagesFor(provider),
      }),
    });
  });

  // POST /api/v1/topup/checkout
  void page.route(`${API_BASE}/api/v1/topup/checkout`, async (route) => {
    const body = route.request().postDataJSON();
    resolveCheckout(body);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        orderId: "TOPUP-TEST-0001",
        // Point the OnePay redirect back at the harness page so the
        // post-checkout `window.location.assign` doesn't leave the origin.
        paymentUrl: `/en/profile/topup-test?paid=1`,
      }),
    });
  });

  return { checkoutPayload };
}

test.describe("Topup modal — billion", () => {
  const iccid = "89000000000000billion0";

  test("renders Billion label + packages and checks out with BILLION provider", async ({
    page,
  }) => {
    await seedAuth(page);
    const { checkoutPayload } = mockTopupApi(page, "BILLION", iccid);

    await page.goto(`/en/profile/topup-test?provider=BILLION&iccid=${iccid}&lang=en`);
    await expect(page.getByTestId("topup-test-heading")).toBeVisible();

    await page.getByTestId("open-topup").click();

    // Header shows the ICCID and the new provider label.
    await expect(page.getByText(iccid).first()).toBeVisible();
    await expect(page.getByText("Billion", { exact: true })).toBeVisible();

    // Both mocked packages render.
    await expect(page.getByText("Billion 3GB - 30 Days")).toBeVisible();
    await expect(page.getByText("Billion Unlimited - 15 Days")).toBeVisible();

    // Select the first package, then confirm.
    await page.getByText("Billion 3GB - 30 Days").click();
    await page.getByRole("button", { name: /Continue to Payment/i }).click();

    const payload = await checkoutPayload;
    expect(payload).toMatchObject({
      iccid,
      packageId: "billion-sku-3gb-30d",
      provider: "BILLION",
      paymentMethod: "ONEPAY",
    });
  });
});

test.describe("Topup modal — microesim (recharge NOT supported)", () => {
  const iccid = "89000000000000microesim";

  // MicroEsim's public API has no recharge endpoint, so the backend returns an
  // empty package list for it and blocks checkout. The modal must therefore
  // still show the MicroEsim label but land on the empty state — never a
  // package list, never a checkout. This mirrors the real backend response
  // (TopupService returns { packages: [] } for MICRO_ESIM).
  test("shows MicroEsim label + empty state and never reaches checkout", async ({
    page,
  }) => {
    await seedAuth(page);
    await stubOtherAuthedCalls(page);

    // Real backend behaviour: empty package list for microesim.
    await page.route(`${API_BASE}/api/v1/topup/packages**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          iccid,
          provider: "MICRO_ESIM",
          packages: [],
        }),
      });
    });

    // Guard: if a checkout is ever fired for microesim, fail the test.
    let checkoutFired = false;
    await page.route(`${API_BASE}/api/v1/topup/checkout`, async (route) => {
      checkoutFired = true;
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Provider MICRO_ESIM does not support topup for existing eSIMs",
        }),
      });
    });

    await page.goto(
      `/en/profile/topup-test?provider=MICRO_ESIM&iccid=${iccid}&lang=en`,
    );
    await page.getByTestId("open-topup").click();

    // Header still shows the ICCID + the new MicroEsim label.
    await expect(page.getByText(iccid).first()).toBeVisible();
    await expect(page.getByText("MicroEsim", { exact: true })).toBeVisible();

    // Lands on the empty state — no packages, no confirm button.
    await expect(
      page.getByText(/No top-up packages are available/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continue to Payment/i }),
    ).toHaveCount(0);

    expect(checkoutFired).toBe(false);
  });
});
