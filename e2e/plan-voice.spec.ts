import { test, expect, type Page } from "@playwright/test";
import { planVoiceInfo, planVoiceLabel } from "../lib/plan-voice";

/**
 * #045 — calls / SMS on the feature panel.
 *
 * Two defects: the panel collapsed the allowance into a bare "Có", throwing away
 * the minutes and the message count; and the "local phone number" row was
 * hardcoded to "Không" even for plans that include calls — which is impossible,
 * since you cannot be called without a number.
 */

const UNITS = { minutesUnit: "phút gọi", smsUnit: "tin nhắn SMS" };

test.describe("Calls / SMS allowance", () => {
  test("reads the minutes and the message count off the plan", () => {
    const info = planVoiceInfo({ call: 50, sms: 100 });

    expect(info).toEqual({ callMinutes: 50, smsCount: 100, hasVoice: true });
    expect(planVoiceLabel(info, UNITS)).toBe("50 phút gọi · 100 tin nhắn SMS");
  });

  test("shows only the half the plan actually includes", () => {
    expect(planVoiceLabel(planVoiceInfo({ call: 30, sms: null }), UNITS)).toBe(
      "30 phút gọi",
    );
    expect(planVoiceLabel(planVoiceInfo({ call: null, sms: 20 }), UNITS)).toBe(
      "20 tin nhắn SMS",
    );
  });

  test("treats a bare 1 as a yes flag, not as one minute", () => {
    // The domestic-eSIM Excel import stores yes/no as 1/null, so "1 phút gọi"
    // would be a number we invented.
    const info = planVoiceInfo({ call: 1, sms: 1 });

    expect(info.hasVoice).toBe(true);
    expect(planVoiceLabel(info, UNITS)).toBeNull();
    // A real figure alongside a flag still prints the real figure.
    expect(planVoiceLabel(planVoiceInfo({ call: 1, sms: 200 }), UNITS)).toBe(
      "200 tin nhắn SMS",
    );
  });

  test("says a plan with calls or SMS has a phone number", () => {
    expect(planVoiceInfo({ call: 50, sms: null }).hasVoice).toBe(true);
    expect(planVoiceInfo({ call: null, sms: 10 }).hasVoice).toBe(true);
    expect(planVoiceInfo({ call: null, sms: null }).hasVoice).toBe(false);
    expect(planVoiceInfo({ call: 0, sms: 0 }).hasVoice).toBe(false);
    expect(planVoiceInfo(null).hasVoice).toBe(false);
  });

  test("ignores junk values instead of rendering NaN", () => {
    const info = planVoiceInfo({
      call: "abc" as unknown as number,
      sms: -5,
    });

    expect(info).toEqual({ callMinutes: 0, smsCount: 0, hasVoice: false });
    expect(planVoiceLabel(info, UNITS)).toBeNull();
  });
});

/* ── Rendered feature panel ── */

const API_BASE = "http://localhost:3001";

function plan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    provider: "airalo",
    providerPlanId: "x",
    name: "Japan 3GB / 30day",
    durationDays: 30,
    dataMb: 3072,
    costPrice: 0,
    price: 2,
    retailPrice: 2,
    currency: "USD",
    sms: null,
    call: null,
    type: "fixed",
    topUp: true,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice: 250_000,
    ...overrides,
  };
}

async function mockPlans(page: Page, planOverrides: Record<string, unknown>) {
  await page.route(
    `${API_BASE}/api/v1/plans/by-destination/japan**`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          dataPlans: [plan(planOverrides)],
          slowUnlimited: [],
          fastUnlimited: [],
          dailyUnlimited: [],
          smsCallEsim: [],
          localEsim: [],
        }),
      }),
  );
}

/** Desktop and mobile panels both render; keep the visible one. */
const allowance = (page: Page) =>
  page.locator('[data-testid="voice-allowance"]:visible');

/** The "Số điện thoại địa phương" row, by its label. */
function localNumberRow(page: Page) {
  return page
    .locator("div:visible", { hasText: "Số điện thoại địa phương" })
    .last();
}

test.describe("Feature panel — calls & SMS", () => {
  test("prints the allowance and marks the phone number as included", async ({
    page,
  }) => {
    await mockPlans(page, { call: 50, sms: 100 });
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await expect(allowance(page)).toBeVisible();
    await expect(allowance(page)).toContainText("50 phút gọi");
    await expect(allowance(page)).toContainText("100 tin nhắn SMS");

    // The row that used to always say "Không".
    await expect(localNumberRow(page)).toContainText("Có");
  });

  test("says no to both when the plan has neither", async ({ page }) => {
    await mockPlans(page, { call: null, sms: null });
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    // Wait for the panel before asserting an absence.
    await expect(page.locator('[data-testid="plan-chip"]:visible')).toHaveCount(1);
    await expect(page.getByTestId("voice-allowance")).toHaveCount(0);
    await expect(localNumberRow(page)).toContainText("Không");
  });

  test("falls back to a plain yes when the value is only a flag", async ({
    page,
  }) => {
    await mockPlans(page, { call: 1, sms: 1 });
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await expect(page.locator('[data-testid="voice-yes"]:visible')).toBeVisible();
    await expect(page.getByTestId("voice-allowance")).toHaveCount(0);
    await expect(localNumberRow(page)).toContainText("Có");
  });

  test("uses the English units on the English locale", async ({ page }) => {
    await mockPlans(page, { call: 50, sms: 100 });
    await page.goto("/en/esim-noi-dia/test?view=plans&slug=japan&lang=en");

    await expect(allowance(page)).toContainText("50 call minutes");
    await expect(allowance(page)).toContainText("100 SMS");
  });
});
