import { test, expect, type Page } from "@playwright/test";

/**
 * #029 — the customer's eSIM list had no Top Up button.
 *
 * The button existed but was commented out while `plan.topUp` was unpopulated.
 * It is back, shown only where a recharge can really go through: a provider the
 * backend can recharge, an eSIM that is not refunded/expired, and a plan marked
 * rechargeable — or, for Billion, whose catalogue never sets the flag, an eSIM
 * that has recharge products of its own (doitac-1410 #064).
 */

const API_BASE = "http://localhost:3001";

test.describe.configure({ mode: "serial", timeout: 120_000 });

async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }),
    );
  });
}

async function stubApi(page: Page) {
  await page.route(`${API_BASE}/api/v1/carts**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route(`${API_BASE}/api/v1/esims/my/*/data-usage**`, (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );
  await page.route(`${API_BASE}/api/v1/topup/packages**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        iccid: "8900000000000000001",
        provider: "AIRALO",
        packages: [
          {
            provider: "AIRALO",
            packageId: "airalo-1gb-7d",
            name: "Japan 1GB - 7 Days",
            dataAmountBytes: 1024 ** 3,
            dataAmountText: "1 GB",
            durationDays: 7,
            isUnlimited: false,
            price: 4.5,
            retailPrice: 6,
            vndPrice: 150000,
          },
        ],
      }),
    }),
  );
}

function esim(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    orderItemId: 1,
    userId: 1,
    iccid: "8900000000000000001",
    smdpAddress: "",
    activationCode: "",
    lpa: "",
    matchId: "",
    qrcode: "",
    directAppleInstallationUrl: "",
    apnValue: "",
    isRoaming: false,
    status: "sold",
    dataUsed: "0",
    dataTotal: "1024",
    expiresAt: null,
    activatedAt: null,
    createdAt: "2026-09-12T00:00:00.000Z",
    updatedAt: "2026-09-12T00:00:00.000Z",
    deletedAt: null,
    provider: "airalo",
    plan: { id: 1, name: "Japan 1GB / 7day", topUp: true },
    ...overrides,
  };
}

async function openCard(
  page: Page,
  card: Record<string, unknown>,
  opts: { noPackages?: boolean; keepPackages?: boolean } = {},
) {
  await seedAuth(page);
  if (!opts.keepPackages) await stubApi(page);
  if (opts.noPackages) {
    // Registered last, so it wins: this eSIM takes no topup (doitac-1410 #064).
    await page.route(`${API_BASE}/api/v1/topup/packages**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ iccid: card.iccid, provider: "BILLION", packages: [] }),
      }),
    );
  }
  const esims = encodeURIComponent(JSON.stringify([card]));
  await page.goto(`/esim-noi-dia/test?view=esim-cards&lang=vi&esims=${esims}`, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByTestId("local-test-meta")).toBeVisible();
  const plan = (card.plan as { name: string }).name;
  // A click that lands before hydration is lost, so keep opening the card
  // until its info fields (the ICCID) are on screen.
  await expect(async () => {
    const iccid = page.getByText(String(card.iccid)).first();
    if (!(await iccid.isVisible())) {
      await page.getByText(plan).first().click();
    }
    await expect(iccid).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 60_000 });
}

/** The stubs go first here, or they would win over the test's own packages. */
async function openCardKeepingPackages(page: Page, card: Record<string, unknown>) {
  await openCard(page, card, { keepPackages: true });
}

test.describe("Top Up button on My eSIMs", () => {
  test("is offered on a rechargeable Airalo eSIM and opens the topup modal", async ({
    page,
  }) => {
    await openCard(page, esim());

    const button = page.getByTestId("esim-topup-button");
    await expect(button).toBeVisible();
    await button.click();

    await expect(page.getByText("Japan 1GB - 7 Days")).toBeVisible();
  });

  test("is offered on a Billion eSIM that has recharge products (doitac-1410 #064)", async ({
    page,
  }) => {
    await openCard(
      page,
      esim({ provider: "billion", plan: { id: 2, name: "Billion Asia 3GB", topUp: false } }),
    );

    await expect(page.getByTestId("esim-topup-button")).toBeVisible();
  });

  test("a Billion eSIM gets one button for each thing it sells (vande-0411 #016)", async ({
    page,
  }) => {
    const pack = (packageId: string, title: string, kind: string) => ({
      packageId,
      name: title,
      kind,
      dataAmountText: "1 GB",
      durationDays: 7,
      isUnlimited: false,
      price: 2,
      retailPrice: 3,
      vndPrice: 76000,
    });
    await page.route(`${API_BASE}/api/v1/topup/packages**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          iccid: "8900000000000000001",
          provider: "BILLION",
          packages: [
            pack("billion:sku:7", "Goi gia han", "topup"),
            pack("billion-acc:2:sku:1", "Goi them data", "addon"),
          ],
        }),
      }),
    );
    await openCardKeepingPackages(
      page,
      esim({ provider: "billion", plan: { id: 2, name: "Billion Asia 3GB", topUp: false } }),
    );

    await expect(page.getByTestId("esim-topup-button")).toHaveText("Gia hạn gói");
    await expect(page.getByTestId("esim-topup-hint")).toHaveText(
      "Ở lại lâu hơn? Mua thêm ngày dùng kèm data.",
    );
    await expect(page.getByTestId("esim-addon-button")).toHaveText("Mua thêm data");
    await expect(page.getByTestId("esim-addon-hint")).toHaveText(
      "Hết data trước hạn? Mua thêm dung lượng, hạn dùng giữ nguyên.",
    );

    await page.getByTestId("esim-addon-button").click();
    const modal = page.getByTestId("topup-modal");
    await expect(modal).toContainText("Mua thêm data cho ICCID");
    await expect(modal).toContainText("Goi them data");
    await expect(modal).not.toContainText("Goi gia han");
  });

  test("an eSIM that only takes top-ups has no add-on button (vande-0411 #016)", async ({
    page,
  }) => {
    await openCard(page, esim());

    await expect(page.getByTestId("esim-topup-button")).toHaveText("Gia hạn gói");
    await expect(page.getByTestId("esim-addon-button")).toHaveCount(0);
  });

  test("is not offered on a Billion eSIM Billion gives no recharge product (doitac-1410 #064)", async ({
    page,
  }) => {
    await openCard(
      page,
      esim({ provider: "billion", plan: { id: 7, name: "Billion China 3GB", topUp: false } }),
      { noPackages: true },
    );

    await expect(page.getByText("8900000000000000001").first()).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(page.getByTestId("esim-topup-button")).toHaveCount(0);
  });

  for (const [label, card] of [
    [
      "a plan the provider marks non-rechargeable",
      esim({ plan: { id: 3, name: "Airalo no topup", topUp: false } }),
    ],
    [
      "MicroEsim, whose API cannot recharge",
      esim({ provider: "microesim", plan: { id: 4, name: "MicroEsim 5GB", topUp: true } }),
    ],
    [
      "Viettel local inventory",
      esim({ provider: "viettel", plan: { id: 5, name: "Viettel 5GB/ngày", topUp: false } }),
    ],
    [
      "a refunded eSIM",
      esim({ status: "refunded", plan: { id: 6, name: "Refunded Japan", topUp: true } }),
    ],
  ] as const) {
    test(`is not offered on ${label}`, async ({ page }) => {
      await openCard(page, card);

      // The card is open (its info fields render) but carries no button.
      await expect(page.getByText("8900000000000000001").first()).toBeVisible();
      await expect(page.getByTestId("esim-topup-button")).toHaveCount(0);
    });
  }
});
