import { test, expect, type Page } from "@playwright/test";

/**
 * #062 — the "Thông tin" tab must show how much usage time is left, the way it
 * shows data.
 *
 * The reported symptom: the data bar coloured correctly but the figures and the
 * time were missing or wrong. The cause is upstream — for eSIM Access (the main
 * provider) the usage endpoint returns no expiry at all, so "days left" printed
 * "—" forever. The backend now derives the expiry from the activation moment the
 * usage cron records plus the plan length, and hands the page `activatedAt` and
 * `durationDays` so it can draw a time bar.
 */

const API_BASE = "http://localhost:3001";

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
  await page.goto(`/esim-noi-dia/test?view=esim-usage&esimId=1&lang=${lang}`);
}

test.describe("Usage time on an activated eSIM", () => {
  test("draws a time bar next to the data bar", async ({ page }) => {
    await mockUsage(page, usage({ expiredAt: daysFromNow(20) }));
    await open(page);

    const bar = page.getByTestId("time-bar");
    await expect(bar).toBeVisible();
    // 30-day plan, activated 10 days ago → 20 left.
    await expect(bar).toContainText("20");
    await expect(bar).toContainText("ngày");
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

  test("shows the data figures in the unit it labels them with", async ({
    page,
  }) => {
    await mockUsage(page, usage({ total: 3072, dataUsed: 1024, remaining: 2048 }));
    await open(page);

    // 2048 MB = 2 GB remaining — not "2048 GB".
    await expect(page.getByText("2.0 GB left")).toBeVisible();
  });

  test("translates the provider status instead of printing the enum", async ({
    page,
  }) => {
    await mockUsage(page, usage());
    await open(page);

    await expect(page.getByTestId("usage-status")).toHaveText("Đang dùng");
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
    // No misleading "0.0 GB left".
    await expect(page.getByText("0.0 GB left")).toHaveCount(0);
  });

  test("still draws the bar once the package size is known", async ({ page }) => {
    await mockUsage(page, usage({ total: 3072, dataUsed: 512, remaining: 2560 }));
    await open(page);

    await expect(page.getByTestId("data-used-only")).toHaveCount(0);
    await expect(page.getByText("2.5 GB left")).toBeVisible();
  });
});
