import { test, expect, type Page } from "@playwright/test";

/**
 * #003 — public "Tra cứu eSIM" page: a customer checks data and expiry with the
 * ICCID alone, no sign-in, and can forward the link to whoever is travelling.
 *
 * The rule the tests exist to hold: the ICCID never reaches the URL. The form
 * swaps it for a signed token server-side, and it is the token that lands in the
 * address bar and in any forwarded link.
 */

const API_BASE = "http://localhost:3001";
const TOKEN = "eyJlIjo0MiwidCI6MX0.c2lnbmF0dXJl";
const ICCID = "8901234567890123456";

test.describe.configure({ mode: "serial", timeout: 120_000 });

function lookup(overrides: Record<string, unknown> = {}) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 20);
  const activated = new Date();
  activated.setDate(activated.getDate() - 10);
  return {
    iccidMasked: "•••••••••••••••3456",
    planName: "Japan 5GB / 30 days",
    status: "ACTIVE",
    isUnlimited: false,
    totalMb: 5120,
    usedMb: 1024,
    remainingMb: 4096,
    durationDays: 30,
    activatedAt: activated.toISOString(),
    expiredAt: expires.toISOString(),
    lastUpdateTime: null,
    usageAvailable: true,
    callMinutes: null,
    smsCount: null,
    ...overrides,
  };
}

async function mockTokenEndpoint(page: Page, status: number, body: unknown) {
  await page.route(`${API_BASE}/api/v1/esims/lookup/token`, (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );
}

async function mockLookupEndpoint(page: Page, status: number, body: unknown) {
  await page.route(`${API_BASE}/api/v1/esims/lookup**`, (route) => {
    // The token endpoint is a POST to a longer path; let it through to its own
    // handler.
    if (route.request().method() !== "GET") return route.fallback();
    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

test("shows the form and rejects a malformed ICCID without calling the API", async ({
  page,
}) => {
  let called = false;
  await page.route(`${API_BASE}/api/v1/esims/lookup/token`, (route) => {
    called = true;
    return route.fulfill({ status: 200, body: "{}" });
  });

  await page.goto("/tra-cuu-esim", { waitUntil: "domcontentloaded" });
  await page.getByTestId("lookup-iccid-input").fill("12345");
  await page.getByTestId("lookup-submit").click();

  await expect(page.getByTestId("lookup-error")).toContainText("18–22");
  expect(called).toBe(false);
});

test("an unknown ICCID says so instead of failing silently", async ({ page }) => {
  await mockTokenEndpoint(page, 404, { message: "esimNotFound" });

  await page.goto("/tra-cuu-esim", { waitUntil: "domcontentloaded" });
  await page.getByTestId("lookup-iccid-input").fill(ICCID);
  await page.getByTestId("lookup-submit").click();

  await expect(page.getByTestId("lookup-error")).toContainText("Không tìm thấy");
});

test("a valid ICCID is swapped for a token — and never lands in the URL", async ({
  page,
}) => {
  await mockTokenEndpoint(page, 200, { token: TOKEN });
  await mockLookupEndpoint(page, 200, lookup());

  await page.goto("/tra-cuu-esim", { waitUntil: "domcontentloaded" });
  await page.getByTestId("lookup-iccid-input").fill(ICCID);
  await page.getByTestId("lookup-submit").click();

  await expect(page.getByTestId("lookup-result")).toBeVisible();
  expect(page.url()).toContain("token=");
  expect(page.url()).not.toContain(ICCID);
  // Only the last four digits are shown, even to whoever the link is forwarded to.
  await expect(page.getByTestId("lookup-result")).toContainText("3456");
  await expect(page.getByTestId("lookup-result")).not.toContainText(ICCID);
});

test("a link with a token renders usage straight away", async ({ page }) => {
  await mockLookupEndpoint(page, 200, lookup());

  await page.goto(`/tra-cuu-esim?token=${TOKEN}`, { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("lookup-result")).toBeVisible();
  await expect(page.getByTestId("lookup-status")).toHaveText("Đang dùng");
  await expect(page.getByTestId("lookup-result")).toContainText("Japan 5GB / 30 days");
  await expect(page.getByTestId("lookup-result")).toContainText("4.0 GB còn lại");
});

test("a provider without a usage API says so rather than drawing an empty bar", async ({
  page,
}) => {
  await mockLookupEndpoint(page, 200, lookup({ usageAvailable: false }));

  await page.goto(`/tra-cuu-esim?token=${TOKEN}`, { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("lookup-usage-unavailable")).toBeVisible();
});

test("a stale token falls back to the form with an explanation", async ({ page }) => {
  await mockLookupEndpoint(page, 404, { message: "esimNotFound" });

  await page.goto(`/tra-cuu-esim?token=${TOKEN}`, { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("lookup-error")).toContainText("không còn hợp lệ");
  await expect(page.getByTestId("lookup-iccid-input")).toBeVisible();
});

test("minutes and SMS allowances are shown when the plan has them", async ({ page }) => {
  await mockLookupEndpoint(page, 200, lookup({ callMinutes: 30, smsCount: 100 }));

  await page.goto(`/tra-cuu-esim?token=${TOKEN}`, { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("lookup-result")).toContainText("30 phút gọi");
  await expect(page.getByTestId("lookup-result")).toContainText("100 tin nhắn SMS");
});
