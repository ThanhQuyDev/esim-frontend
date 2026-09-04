import { test, expect, type Page } from "@playwright/test";

/**
 * Frontend tests for the bank-transfer (SePay / Techcombank) topup flow.
 *
 * Exercises the real TopupModal + BankTransferPanel against a mocked API:
 *   - GET  /api/v1/topup/packages          → one package
 *   - POST /api/v1/topup/bank-transfer     → VietQR + transfer code
 *   - GET  /api/v1/orders/my/by-number/... → pending, then paid (polling)
 *
 * Verifies the buyer sees the exact transfer memo (the whole flow hinges on it)
 * and that the panel flips to "paid" once the webhook-confirmed order polls in.
 */

const API_BASE = "http://localhost:3001";
const TOKEN = "test-jwt-token";
const ICCID = "89000000000000billion0";
const ORDER_NUMBER = "TOPUP-TEST-1";
const TRANSFER_CODE = "ESIMAB12CD";

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

/**
 * Stub every other authenticated call the app makes on this page.
 *
 * `authFetch` logs the user out on ANY 401, so if a real backend is running on
 * :3001 an unrelated call (e.g. /carts) answering 401 to our fake token would
 * clear the token and disable the topup query — making the test fail for a
 * reason that has nothing to do with what it asserts.
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

async function mockApi(page: Page, opts: { paidAfter: number }) {
  await stubOtherAuthedCalls(page);
  await page.route(`${API_BASE}/api/v1/topup/packages**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        iccid: ICCID,
        provider: "BILLION",
        packages: [
          {
            provider: "BILLION",
            packageId: "billion-3gb-30d",
            name: "Billion 3GB - 30 Days",
            dataAmountBytes: 3 * 1024 * 1024 * 1024,
            dataAmountText: "3 GB",
            durationDays: 30,
            isUnlimited: false,
            price: 8,
            retailPrice: 11,
            vndPrice: 280000,
          },
        ],
      }),
    });
  });

  await page.route(`${API_BASE}/api/v1/topup/bank-transfer`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        orderId: ORDER_NUMBER,
        bankTransferCode: TRANSFER_CODE,
        qrUrl: "https://img.vietqr.io/image/TCB-19000000000000-compact2.png?amount=280000",
        amount: 280000,
        accountNumber: "19000000000000",
        accountName: "TRUONG THANH QUY",
        bankCode: "TCB",
      }),
    });
  });

  // Order polling: pending for the first N calls, then paid (as if the SePay
  // webhook had landed).
  let calls = 0;
  await page.route(
    `${API_BASE}/api/v1/orders/my/by-number/**`,
    async (route) => {
      calls += 1;
      const paid = calls > opts.paidAfter;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 1,
          orderNumber: ORDER_NUMBER,
          status: paid ? "paid" : "pending",
          vndPrice: 280000,
          paymentMethod: "bank_transfer",
          items: [],
        }),
      });
    },
  );
}

test.describe("Topup — bank transfer", () => {
  test("shows QR + exact transfer memo, then flips to paid", async ({ page }) => {
    await seedAuth(page);
    await mockApi(page, { paidAfter: 1 });

    await page.goto(
      `/en/profile/topup-test?provider=BILLION&iccid=${ICCID}&lang=en`,
    );
    await page.getByTestId("open-topup").click();

    // Pick the package, then choose bank transfer instead of OnePay.
    await page.getByText("Billion 3GB - 30 Days").click();
    await page.getByTestId("topup-bank-transfer-btn").click();

    // Panel replaces the package list.
    const panel = page.getByTestId("bank-transfer-panel");
    await expect(panel).toBeVisible();
    await expect(page.getByTestId("bank-transfer-qr")).toBeVisible();

    // The memo is the whole mechanism — it must be shown verbatim.
    await expect(panel).toContainText(TRANSFER_CODE);
    await expect(panel).toContainText("19000000000000");
    await expect(panel).toContainText("TCB");

    // Starts in the waiting state...
    await expect(page.getByTestId("bank-transfer-waiting")).toBeVisible();

    // ...then flips to paid once polling sees the webhook-confirmed order.
    await expect(page.getByTestId("bank-transfer-paid")).toBeVisible({
      timeout: 15000,
    });
  });
});
