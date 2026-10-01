import { test, expect, type Page } from "@playwright/test";

/**
 * #044 — the success page titled every eSIM "Thông tin eSIM #1 / #2", so a buyer
 * who ordered Japan and Korea together could not tell which card was which.
 *
 * Each card is now titled with the package it came from, and `#n` is appended
 * only when more than one of THAT package was bought.
 */

const API_BASE = "http://localhost:3001";
const ORDER_NUMBER = "ORD-TEST-044";

function esim(n: number) {
  return {
    id: n,
    orderItemId: n,
    iccid: `893407900000000000${n}`,
    smdpAddress: "rsp.truphone.com",
    activationCode: `AC-${n}`,
    lpa: `LPA:1$rsp.truphone.com$AC-${n}`,
    matchId: "",
    qrcode: "",
    directAppleInstallationUrl: "",
    apnValue: "",
    isRoaming: false,
    status: "available",
    dataUsed: "",
    dataTotal: "3GB",
    expiresAt: null,
    activatedAt: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    deletedAt: null,
  };
}

type Item = {
  id: number;
  planId: number;
  planName: string;
  esimCount: number;
};

async function openResult(page: Page, items: Item[]) {
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
  await page.route(`${API_BASE}/api/v1/destinations**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], hasNextPage: false }),
    }),
  );

  let nextEsimId = 1;
  const body = {
    id: 1,
    orderNumber: ORDER_NUMBER,
    status: "paid",
    vndPrice: 358000,
    paymentMethod: "onepay",
    items: items.map((item) => ({
      id: item.id,
      planId: item.planId,
      plan: {
        id: item.planId,
        name: item.planName,
        slug: `plan-${item.planId}`,
        durationDays: 7,
        dataMb: 3072,
        price: "6",
        vndPrice: 179000,
        currency: "USD",
      },
      orderRequestId: null,
      status: "completed",
      vndPrice: 179000,
      quantity: item.esimCount,
      esims: Array.from({ length: item.esimCount }, () => esim(nextEsimId++)),
    })),
  };

  await page.route(`${API_BASE}/api/v1/orders/my/by-number/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );

  await page.goto(
    `/vi/payment/result?vpc_TxnResponseCode=0&vpc_MerchTxnRef=${ORDER_NUMBER}`,
    { waitUntil: "domcontentloaded" },
  );

  await expect(page.getByTestId("esim-title-0")).toBeVisible({ timeout: 60_000 });
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("titles a single eSIM with its package name and no number", async ({ page }) => {
  await openResult(page, [
    { id: 1, planId: 11, planName: "eSIM Nhật Bản 3GB / 7 ngày", esimCount: 1 },
  ]);

  await expect(page.getByTestId("esim-title-0")).toHaveText(
    "eSIM Nhật Bản 3GB / 7 ngày",
  );
});

test("numbers the eSIMs when two of the same package were bought", async ({ page }) => {
  await openResult(page, [
    { id: 1, planId: 11, planName: "eSIM Nhật Bản 3GB / 7 ngày", esimCount: 2 },
  ]);

  await expect(page.getByTestId("esim-title-0")).toHaveText(
    "eSIM Nhật Bản 3GB / 7 ngày #1",
  );
  await expect(page.getByTestId("esim-title-1")).toHaveText(
    "eSIM Nhật Bản 3GB / 7 ngày #2",
  );
});

test("numbers each package separately in a mixed order", async ({ page }) => {
  // Two Japan, one Korea: the Japan pair is numbered, the lone Korea is not —
  // a global counter would have called Korea "#3".
  await openResult(page, [
    { id: 1, planId: 11, planName: "eSIM Nhật Bản 3GB", esimCount: 2 },
    { id: 2, planId: 22, planName: "eSIM Hàn Quốc 5GB", esimCount: 1 },
  ]);

  await expect(page.getByTestId("esim-title-0")).toHaveText("eSIM Nhật Bản 3GB #1");
  await expect(page.getByTestId("esim-title-1")).toHaveText("eSIM Nhật Bản 3GB #2");
  await expect(page.getByTestId("esim-title-2")).toHaveText("eSIM Hàn Quốc 5GB");
});

test("counts across order items, not within one", async ({ page }) => {
  // A Gadget Korea purchase is split into one order item per unit, so the same
  // plan arrives as several items of one eSIM each. Counting per item would
  // leave every card unnumbered.
  await openResult(page, [
    { id: 1, planId: 33, planName: "eSIM Hàn Quốc GK", esimCount: 1 },
    { id: 2, planId: 33, planName: "eSIM Hàn Quốc GK", esimCount: 1 },
  ]);

  await expect(page.getByTestId("esim-title-0")).toHaveText("eSIM Hàn Quốc GK #1");
  await expect(page.getByTestId("esim-title-1")).toHaveText("eSIM Hàn Quốc GK #2");
});

test("falls back to the generic heading when the item has no plan", async ({ page }) => {
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
  await page.route(`${API_BASE}/api/v1/orders/my/by-number/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 1,
        orderNumber: ORDER_NUMBER,
        status: "paid",
        items: [
          {
            id: 1,
            planId: 44,
            orderRequestId: null,
            status: "completed",
            vndPrice: 179000,
            quantity: 1,
            esims: [esim(1)],
          },
        ],
      }),
    }),
  );

  await page.goto(
    `/vi/payment/result?vpc_TxnResponseCode=0&vpc_MerchTxnRef=${ORDER_NUMBER}`,
    { waitUntil: "domcontentloaded" },
  );

  // Never blank: an older order without plan data keeps the previous heading.
  await expect(page.getByTestId("esim-title-0")).toHaveText("Thông tin eSIM", {
    timeout: 60_000,
  });
});
