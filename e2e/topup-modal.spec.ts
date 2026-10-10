import { test, expect, type Page } from "@playwright/test";

/**
 * #029 — the topup popup must not name the wholesaler to the customer.
 *
 * The header carried a supplier badge next to the ICCID; the popup now shows the
 * ICCID and the product name instead. The error channel matters just as much:
 * the backend writes the supplier into its own message text, and the modal used
 * to print unrecognised messages verbatim.
 */

const API_BASE = "http://localhost:3001";
const ICCID = "8934079000000000001";

const SUPPLIER_NAMES = [
  "Airalo",
  "eSIMAccess",
  "eSIM Access",
  "Gadget Korea",
  "Billion",
  "MicroEsim",
  "MICRO_ESIM",
];

async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }),
    );
  });
}

async function mockTopupPackages(page: Page) {
  await page.route(`${API_BASE}/api/v1/topup/packages**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        iccid: ICCID,
        // The API still sends the provider — the page just must not show it.
        provider: "MICRO_ESIM",
        packages: [
          {
            provider: "MICRO_ESIM",
            packageId: "vn-3d-3gb",
            name: "3 GB - 3 Days",
            dataAmountBytes: 3221225472,
            dataAmountText: "3 GB",
            durationDays: 3,
            isUnlimited: false,
            price: 5,
            retailPrice: 7,
            vndPrice: 179000,
          },
        ],
      }),
    }),
  );
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("the popup header shows the product name and ICCID, never the supplier", async ({
  page,
}) => {
  await seedAuth(page);
  await mockTopupPackages(page);

  await page.goto(`/esim-noi-dia/test?view=topup&iccid=${ICCID}`, {
    waitUntil: "domcontentloaded",
  });

  const modal = page.getByTestId("topup-modal");
  await expect(modal).toBeVisible();
  await expect(modal).toContainText(ICCID);
  // The ICCID sits in the title itself (#062, test round 4).
  await expect(page.getByTestId("topup-title")).toHaveText(
    `Nạp thêm dữ liệu vào ICCID: ${ICCID}`,
  );

  const text = (await modal.textContent()) ?? "";
  for (const name of SUPPLIER_NAMES) {
    expect(text).not.toContain(name);
  }
});

/** Enough eXu that the "Pay with eXU" button is enabled (#028 guards on this). */
async function mockWalletBalance(page: Page, availableBalanceVnd = 5_000_000) {
  await page.route(`${API_BASE}/api/v1/wallets/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        balanceVnd: availableBalanceVnd,
        availableBalanceVnd,
        status: "active",
        expiresAt: null,
        daysLeft: null,
        lifetimeSpendVnd: 0,
      }),
    }),
  );
}

/**
 * #030 — the popup has to be wide enough to hold all three payment methods plus
 * Cancel, and to leave the QR step readable.
 */
test("all three payment methods and Cancel are visible at once", async ({ page }) => {
  await seedAuth(page);
  await mockTopupPackages(page);
  await mockWalletBalance(page);

  await page.goto(`/esim-noi-dia/test?view=topup&iccid=${ICCID}`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByTestId("topup-package-vn-3d-3gb").click();

  for (const id of ["topup-wallet-btn", "topup-bank-transfer-btn", "topup-card-btn"]) {
    await expect(page.getByTestId(id)).toBeVisible();
  }

  // No horizontal scrollbar inside the popup: the buttons fit rather than
  // spilling out of it, which is the actual complaint in #030.
  const overflows = await page.getByTestId("topup-modal").evaluate((el) => {
    return el.scrollWidth > el.clientWidth + 1;
  });
  expect(overflows).toBe(false);
});

test("the QR step gets a readable amount of room", async ({ page }) => {
  await seedAuth(page);
  await mockTopupPackages(page);
  await page.route(`${API_BASE}/api/v1/topup/bank-transfer`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        orderId: "TOPUP-1",
        bankTransferCode: "ESIM123",
        qrUrl: "https://img.vietqr.io/image/test.png",
        amount: 179000,
        accountNumber: "19001234567890",
        accountName: "CONG TY ESIM VN",
        bankCode: "TCB",
      }),
    }),
  );

  await page.goto(`/esim-noi-dia/test?view=topup&iccid=${ICCID}`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByTestId("topup-package-vn-3d-3gb").click();
  await page.getByTestId("topup-bank-transfer-btn").click();

  await expect(page.getByTestId("bank-transfer-panel")).toBeVisible();
  // The panel lays the QR beside the bank details, so it needs real width — the
  // old 512px popup left the details column around 230px.
  const width = await page
    .getByTestId("bank-transfer-panel")
    .evaluate((el) => el.clientWidth);
  expect(width).toBeGreaterThan(560);
});

test("a supplier-naming error from the API is replaced with a generic message", async ({
  page,
}) => {
  await seedAuth(page);
  await mockTopupPackages(page);
  await mockWalletBalance(page);
  await page.route(`${API_BASE}/api/v1/topup/wallet`, (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/json",
      // Real backend wording from topup.service.ts.
      body: JSON.stringify({
        message: "Provider MICRO_ESIM does not support topup for existing eSIMs",
      }),
    }),
  );

  await page.goto(`/esim-noi-dia/test?view=topup&iccid=${ICCID}`, {
    waitUntil: "domcontentloaded",
  });

  await page.getByTestId("topup-package-vn-3d-3gb").click();
  await page.getByTestId("topup-wallet-btn").click();
  // eXU asks for confirmation first (#028, round 4).
  await page.getByTestId("topup-exu-confirm-btn").click();

  const modal = page.getByTestId("topup-modal");
  const text = (await modal.textContent()) ?? "";
  expect(text).not.toContain("MICRO_ESIM");
});

test("paying with eXU asks for confirmation before charging anything (#028)", async ({ page }) => {
  await seedAuth(page);
  await mockTopupPackages(page);
  await mockWalletBalance(page);
  let charged = 0;
  await page.route(`${API_BASE}/api/v1/topup/wallet`, (route) => {
    charged += 1;
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  await page.goto(`/esim-noi-dia/test?view=topup&iccid=${ICCID}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("topup-package-vn-3d-3gb").click();
  await page.getByTestId("topup-wallet-btn").click();

  await expect(page.getByTestId("topup-exu-confirm")).toContainText("không thể khôi phục");
  expect(charged).toBe(0);

  // Back returns to the packages without paying.
  await page.getByTestId("topup-exu-back").click();
  await expect(page.getByTestId("topup-wallet-btn")).toBeVisible();
  expect(charged).toBe(0);

  await page.getByTestId("topup-wallet-btn").click();
  await page.getByTestId("topup-exu-confirm-btn").click();
  await expect.poll(() => charged).toBe(1);
});

test("the bank transfer step can go back to the packages (#028)", async ({ page }) => {
  await seedAuth(page);
  await mockTopupPackages(page);
  await page.route(`${API_BASE}/api/v1/topup/bank-transfer`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        orderId: "TOPUP-1",
        bankTransferCode: "ESIM123",
        qrUrl: "https://img.vietqr.io/image/test.png",
        amount: 179000,
        accountNumber: "19001234567890",
        accountName: "CONG TY ESIM VN",
        bankCode: "TCB",
      }),
    }),
  );

  await page.goto(`/esim-noi-dia/test?view=topup&iccid=${ICCID}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("topup-package-vn-3d-3gb").click();
  await page.getByTestId("topup-bank-transfer-btn").click();
  await expect(page.getByTestId("bank-transfer-panel")).toBeVisible();

  await page.getByTestId("topup-bank-back").click();
  await expect(page.getByTestId("bank-transfer-panel")).toHaveCount(0);
  await expect(page.getByTestId("topup-package-vn-3d-3gb")).toBeVisible();
  await expect(page.getByTestId("topup-bank-transfer-btn")).toBeVisible();
});

test("the pay button keeps its amount on one line on a desktop screen (#029)", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await seedAuth(page);
  await mockTopupPackages(page);
  await mockWalletBalance(page);
  await page.goto(`/esim-noi-dia/test?view=topup&iccid=${ICCID}`, { waitUntil: "domcontentloaded" });
  await page.getByTestId("topup-package-vn-3d-3gb").click();

  const button = page.getByTestId("topup-card-btn");
  await expect(button).toContainText("đ");
  // One line of text: no taller than a single-line button of the same padding.
  const height = await button.evaluate((el) => el.getBoundingClientRect().height);
  expect(height).toBeLessThan(48);
  // And the three payment buttons share one row.
  const tops = await Promise.all(
    ["topup-wallet-btn", "topup-bank-transfer-btn", "topup-card-btn"].map((id) =>
      page.getByTestId(id).evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    ),
  );
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
});
