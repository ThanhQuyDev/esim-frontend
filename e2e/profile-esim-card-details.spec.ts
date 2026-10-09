import { test, expect, type Page } from "@playwright/test";

/**
 * #025 (test round 4) — the customer's eSIM tab: the plan named like the CMS
 * names it (minutes / SMS spelled out), a one-line summary under it, the
 * Mới / Đang sử dụng / Hết hạn status, the order number above the ICCID, and
 * "Mua lại eSIM" instead of the supplier's duplicate "Install on iPhone".
 */

const API_BASE = "http://localhost:3001";

test.describe.configure({ mode: "serial", timeout: 120_000 });

const future = "2099-01-01T00:00:00.000Z";
const CARDS = [
  {
    id: 1,
    iccid: "8934079000000000001",
    status: "sold",
    provider: "airalo",
    createdAt: "2026-09-01T00:00:00.000Z",
    expiresAt: future,
    activatedAt: null,
    orderNumber: "ORD-TEST-0001",
    directAppleInstallationUrl: "https://example.com/install",
    plan: {
      id: 7,
      name: "United States 2GB / 15day",
      call: 20,
      sms: 20,
      dataMb: 2048,
      durationDays: 15,
      type: "fixed",
    },
  },
  {
    id: 2,
    iccid: "8934079000000000002",
    status: "sold",
    provider: "airalo",
    createdAt: "2026-09-01T00:00:00.000Z",
    expiresAt: "2026-09-10T00:00:00.000Z",
    activatedAt: "2026-09-02T00:00:00.000Z",
    plan: { id: 8, name: "Japan 1GB / 7day", dataMb: 1024, durationDays: 7, type: "fixed" },
  },
  {
    id: 3,
    iccid: "8934079000000000003",
    status: "sold",
    provider: "airalo",
    createdAt: "2026-09-01T00:00:00.000Z",
    expiresAt: future,
    activatedAt: "2026-09-02T00:00:00.000Z",
    plan: { id: 9, name: "Korea 1GB/day", dataMb: 1024, durationDays: 5, type: "daily" },
  },
];

function card(page: Page, id: number) {
  return page.locator(`[data-testid="esim-card"][data-esim-id="${id}"]`);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }),
    );
  });
  await page.route(`${API_BASE}/api/v1/carts**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route(`${API_BASE}/api/v1/esims/my/*/data-usage**`, (route) =>
    route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
  );
  await page.goto(
    `/esim-noi-dia/test?view=esim-cards&lang=vi&esims=${encodeURIComponent(JSON.stringify(CARDS))}`,
    { waitUntil: "domcontentloaded" },
  );
  await expect(page.getByTestId("esim-card")).toHaveCount(CARDS.length);
});

test("names the plan with its minutes and SMS, with a summary underneath", async ({ page }) => {
  await expect(card(page, 1)).toContainText("United States 2GB / 15day - 20Mins - 20SMS");
  await expect(card(page, 1).getByTestId("esim-plan-summary")).toHaveText(
    "2GB · 15 ngày · 20 phút gọi · 20 SMS",
  );
  await expect(card(page, 3).getByTestId("esim-plan-summary")).toHaveText("1GB/ngày · 5 ngày");
});

test("shows the customer status: Mới, Hết hạn, Đang sử dụng", async ({ page }) => {
  await expect(card(page, 1).getByTestId("esim-status")).toHaveText("Mới");
  await expect(card(page, 2).getByTestId("esim-status")).toHaveText("Hết hạn");
  await expect(card(page, 3).getByTestId("esim-status")).toHaveText("Đang sử dụng");
});

test("puts the order number above the ICCID and offers Mua lại instead of the supplier install link", async ({ page }) => {
  const target = card(page, 1);
  await expect(async () => {
    await target.getByText("United States 2GB / 15day - 20Mins - 20SMS").click();
    await expect(target.getByText("ORD-TEST-0001")).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });

  const text = await target.innerText();
  expect(text.indexOf("ORD-TEST-0001")).toBeLessThan(text.indexOf("8934079000000000001"));
  await expect(target.getByTestId("esim-buy-again-button")).toBeVisible();
  await expect(target.getByText("Cài đặt trên iPhone")).toHaveCount(0);
});
