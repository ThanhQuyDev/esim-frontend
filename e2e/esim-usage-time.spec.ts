import { test, expect, type Page } from "@playwright/test";

/**
 * #062, #027 — the "Thông tin" tab must show how much data and usage time is
 * left.
 *
 * The reported symptom: the data bar coloured correctly but the figures and the
 * time were missing or wrong. For eSIM Access (the main provider) the usage
 * endpoint returns no expiry at all, so "days left" printed "—" forever. The
 * backend now derives the expiry from the activation moment the usage cron
 * records plus the plan length, and hands the page `activatedAt` and
 * `durationDays` so it can draw a time bar.
 *
 * #027 then fixed the figures themselves: the bar spoke English on the
 * Vietnamese page, days read "20.0", an unknown remaining amount read "0.0 GB",
 * an in-use eSIM without an expiry said "not activated", and carriers with no
 * usage API showed an error panel.
 */

const API_BASE = "http://localhost:3001";

test.describe.configure({ mode: "serial", timeout: 120_000 });

/** The usage query only runs for a signed-in customer, so seed auth first. */
async function seedAuth(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "test-jwt-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "test@esim.vn", firstName: "Test" }),
    );
  });
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function usage(overrides: Record<string, unknown> = {}) {
  return {
    remaining: 2048,
    total: 3072,
    dataUsed: 1024,
    expiredAt: null,
    isUnlimited: false,
    status: "ACTIVE",
    lastUpdateTime: null,
    activatedAt: daysFromNow(-10),
    durationDays: 30,
    ...overrides,
  };
}

async function mockUsage(page: Page, body: unknown, status = 200) {
  await page.route(`${API_BASE}/api/v1/esims/my/*/data-usage**`, (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );
}

async function open(page: Page, lang = "vi") {
  await seedAuth(page);
  await page.goto(`/esim-noi-dia/test?view=esim-usage&esimId=1&lang=${lang}`, {
    waitUntil: "domcontentloaded",
  });
}

test.describe("Usage time on an activated eSIM", () => {
  test("draws a time bar next to the data bar", async ({ page }) => {
    await mockUsage(page, usage({ expiredAt: daysFromNow(20) }));
    await open(page);

    const bar = page.getByTestId("time-bar");
    await expect(bar).toBeVisible();
    // 30-day plan, activated 10 days ago → 20 left, counted in whole days.
    await expect(bar).toContainText("20 ngày còn lại");
    await expect(bar).not.toContainText("20.0");
  });

  test("still shows the time when the provider reports no expiry", async ({
    page,
  }) => {
    // eSIM Access returns no expiry — this is the case that used to print "—".
    await mockUsage(page, usage({ expiredAt: daysFromNow(25), durationDays: 30 }));
    await open(page);

    await expect(page.getByTestId("time-bar")).toBeVisible();
    await expect(page.getByTestId("not-activated")).toHaveCount(0);
  });

  test("shows the data figures in the unit and language it labels them with", async ({
    page,
  }) => {
    await mockUsage(page, usage({ total: 3072, dataUsed: 1024, remaining: 2048 }));
    await open(page);

    // 2048 MB = 2 GB remaining — not "2048 GB", and in Vietnamese.
    await expect(page.getByText("2.0 GB còn lại")).toBeVisible();
    await expect(page.getByText("Đã dùng 1.0 GB")).toBeVisible();
    await expect(page.getByText("Tổng 3.0 GB")).toBeVisible();
  });

  test("keeps the English wording on the English locale", async ({ page }) => {
    await mockUsage(page, usage({ total: 3072, dataUsed: 1024, remaining: 2048 }));
    await open(page, "en");

    await expect(page.getByText("2.0 GB left")).toBeVisible();
  });

  test("translates the provider status instead of printing the enum", async ({
    page,
  }) => {
    await mockUsage(page, usage());
    await open(page);

    await expect(page.getByTestId("usage-status")).toHaveText("Đang dùng");
  });

  test("does not call an in-use eSIM 'not activated' while its expiry is unknown", async ({
    page,
  }) => {
    await mockUsage(
      page,
      usage({ activatedAt: null, expiredAt: null, durationDays: null }),
    );
    await open(page);

    await expect(page.getByTestId("time-unknown")).toBeVisible();
    await expect(page.getByTestId("not-activated")).toHaveCount(0);
  });
});

test.describe("An eSIM that has not been activated", () => {
  test("says the clock has not started rather than showing a countdown", async ({
    page,
  }) => {
    await mockUsage(
      page,
      usage({
        status: "NOT_ACTIVE",
        activatedAt: null,
        expiredAt: null,
        dataUsed: 0,
        remaining: 3072,
      }),
    );
    await open(page);

    await expect(page.getByTestId("not-activated")).toContainText(
      "kết nối mạng lần đầu",
    );
    await expect(page.getByTestId("time-bar")).toHaveCount(0);
    await expect(page.getByTestId("usage-status")).toHaveText("Chưa kích hoạt");
  });

  test("reads in English on the English locale", async ({ page }) => {
    await mockUsage(
      page,
      usage({ status: "NOT_ACTIVE", activatedAt: null, expiredAt: null }),
    );
    await open(page, "en");

    await expect(page.getByTestId("not-activated")).toContainText(
      "first connects to a network",
    );
    await expect(page.getByTestId("usage-status")).toHaveText("Not activated");
  });
});

test.describe("When usage cannot be read", () => {
  test("says so instead of rendering an empty bar", async ({ page }) => {
    await mockUsage(page, { message: "boom" }, 500);
    await open(page);

    await expect(page.getByTestId("time-bar")).toHaveCount(0);
    await expect(page.getByTestId("not-activated")).toHaveCount(0);
  });

  test("explains a carrier with no usage reporting instead of a full bar", async ({
    page,
  }) => {
    // Viettel local inventory: the backend answers with what it stored and
    // `usageAvailable: false` rather than a 404 (#027).
    await mockUsage(
      page,
      usage({
        usageAvailable: false,
        total: 5120,
        dataUsed: 0,
        remaining: 5120,
        status: "NOT_ACTIVE",
        activatedAt: null,
      }),
    );
    await open(page);

    await expect(page.getByTestId("usage-unavailable")).toContainText(
      "chưa cung cấp số liệu",
    );
    await expect(page.getByText("5.0 GB còn lại")).toHaveCount(0);
  });
});

test.describe("A provider that reports no package size", () => {
  test("shows what has been used instead of an empty bar", async ({ page }) => {
    // Gadget Korea sends consumption only; a bar drawn against 0 would claim
    // "0 GB left" on a barely-used plan (#065).
    await mockUsage(
      page,
      usage({ total: 0, remaining: null, dataUsed: 512, durationDays: 30 }),
    );
    await open(page);

    const line = page.getByTestId("data-used-only");
    await expect(line).toBeVisible();
    await expect(line).toContainText("Đã dùng 0.5 GB");
    // No misleading "0.0 GB còn lại" — the summary card says it is unknown.
    await expect(page.getByText("0.0 GB còn lại")).toHaveCount(0);
    await expect(page.getByText("0.0", { exact: true })).toHaveCount(0);
  });

  test("works out the remaining figure when only the size and usage are sent", async ({
    page,
  }) => {
    await mockUsage(page, usage({ total: 3072, dataUsed: 512, remaining: null }));
    await open(page);

    await expect(page.getByText("2.5 GB còn lại")).toBeVisible();
  });

  test("still draws the bar once the package size is known", async ({ page }) => {
    await mockUsage(page, usage({ total: 3072, dataUsed: 512, remaining: 2560 }));
    await open(page);

    await expect(page.getByTestId("data-used-only")).toHaveCount(0);
    await expect(page.getByText("2.5 GB còn lại")).toBeVisible();
  });
});
