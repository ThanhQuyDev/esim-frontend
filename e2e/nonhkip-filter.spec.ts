import { test, expect, type Page } from "@playwright/test";

/**
 * The "works with TikTok & ChatGPT" filter — #041, rewritten for #068.
 *
 * #041 built this around the esimaccess "nonhkip" package marker, which was the
 * only evidence available then. #065 replaced that with an APN table the team
 * uploads, #067 made the API judge every plan against it, and #068 changed three
 * things that this spec now pins:
 *
 *   - the filter is offered on CHINA pages only. Nothing is blocked elsewhere, so
 *     the checkbox would imply a problem that does not exist on the Japan page;
 *   - turning it on also surfaces plans the price de-duplication had removed. The
 *     TikTok-capable variant is usually the dearer of two identical configurations,
 *     so `markCheapestPlans` dropped it and the storefront never saw it at all;
 *   - the green box states the apps from the APN table instead of claiming
 *     "supports TikTok, ChatGPT…" for every plan in the catalogue.
 *
 * The real destination page is a server component whose SSR fetch throws with no
 * backend, so the real DestinationPlans is mounted through the client harness
 * (`/esim-noi-dia/test?view=plans`) against a mocked plans API. The harness derives
 * `countryCode` from the first two letters of the slug, so `cn-…` is a China page
 * and `japan` is not.
 */

const API_BASE = "http://localhost:3001";

/** A plan whose APN the table has nothing to say about — the default. */
function plan(overrides: Record<string, unknown>) {
  return {
    id: 0,
    provider: "esimaccess",
    providerPlanId: "x",
    name: "",
    durationDays: 30,
    dataMb: 3072,
    costPrice: 0,
    price: 2,
    retailPrice: 2.6,
    currency: "USD",
    sms: 0,
    call: 0,
    type: "fixed",
    topUp: false,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice: 150000,
    isNonHkIp: false,
    appSupport: {
      tiktokIos: false,
      tiktokAndroid: false,
      tiktokAllDevices: false,
      chatGpt: false,
      known: false,
    },
    ...overrides,
  };
}

/** The verdict for a plan that works with both apps on both platforms. */
const WORKS = {
  tiktokIos: true,
  tiktokAndroid: true,
  tiktokAllDevices: true,
  chatGpt: true,
  known: true,
};

/** ChatGPT works, TikTok does not — the common China case. */
const CHATGPT_ONLY = {
  tiktokIos: false,
  tiktokAndroid: false,
  tiktokAllDevices: false,
  chatGpt: true,
  known: true,
};

/** Two plans TikTok does not work on + one it does, all fixed-data. */
function mixedPlans() {
  return {
    dataPlans: [
      plan({ id: 11, name: "China 3GB / 30day", dataMb: 3072, vndPrice: 150000, appSupport: CHATGPT_ONLY }),
      plan({ id: 12, name: "China 5GB / 30day", dataMb: 5120, vndPrice: 210000, appSupport: CHATGPT_ONLY }),
      plan({
        id: 13,
        name: "China 10GB / 30day",
        dataMb: 10240,
        vndPrice: 420000,
        appSupport: WORKS,
      }),
    ],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
    // Typed so a test can push into it; an empty literal infers `never[]`.
    tiktokHiddenByPrice: [] as ReturnType<typeof plan>[],
  };
}

/** No TikTok-capable plan at all — the toggle must not appear. */
function ordinaryPlansOnly() {
  const payload = mixedPlans();
  payload.dataPlans = payload.dataPlans.filter(
    (p) => !(p.appSupport as typeof WORKS).tiktokAllDevices,
  );
  return payload;
}

async function mockPlans(page: Page, payload: unknown, slug = "cn-china") {
  await page.route(
    `${API_BASE}/api/v1/plans/by-destination/${slug}**`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload),
      });
    },
  );
}

/** Desktop and mobile layouts both render the toggle; keep the visible one. */
const visibleToggle = (page: Page) =>
  page.locator('[data-testid="nonhkip-toggle"]:visible');
const visibleHint = (page: Page) =>
  page.locator('[data-testid="nonhkip-hint"]:visible');
const visibleChips = (page: Page) =>
  page.locator('[data-testid="plan-chip"]:visible');

test.describe("works-with-TikTok filter", () => {
  test("is offered, off by default, and narrows the list to capable plans", async ({
    page,
  }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/esim-noi-dia/test?view=plans&slug=cn-china&lang=vi");

    // Off by default: every plan is listed, including the pricier capable one.
    await expect(visibleChips(page)).toHaveCount(3);
    await expect(visibleToggle(page)).toHaveAttribute("aria-checked", "false");

    // The copy names the apps customers actually come here for.
    await expect(visibleToggle(page)).toContainText("TikTok");
    await expect(visibleToggle(page)).toContainText("ChatGPT");
    // …and says outright that these cost more, so the toggle is an informed choice.
    await expect(visibleHint(page)).toContainText("Giá cao hơn");

    await visibleToggle(page).click();

    await expect(visibleToggle(page)).toHaveAttribute("aria-checked", "true");
    await expect(visibleChips(page)).toHaveCount(1);
    await expect(visibleChips(page).first()).toHaveAttribute(
      "data-plan-id",
      "13",
    );
  });

  test("restores the full list when turned back off", async ({ page }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/esim-noi-dia/test?view=plans&slug=cn-china&lang=vi");

    await expect(visibleChips(page)).toHaveCount(3);
    await visibleToggle(page).click();
    await expect(visibleChips(page)).toHaveCount(1);
    await visibleToggle(page).click();

    await expect(visibleChips(page)).toHaveCount(3);
    await expect(visibleToggle(page)).toHaveAttribute("aria-checked", "false");
  });

  test("selects a surviving plan, so the price never belongs to a hidden one", async ({
    page,
  }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/esim-noi-dia/test?view=plans&slug=cn-china&lang=vi");

    // Auto-selection lands on the first (cheapest) plan.
    await expect(visibleChips(page).first()).toHaveAttribute(
      "data-plan-id",
      "11",
    );
    await visibleToggle(page).click();

    // After filtering, the only remaining plan must be the selected one —
    // otherwise the CTA would charge for a plan no longer on screen.
    const remaining = visibleChips(page).first();
    await expect(remaining).toHaveAttribute("data-plan-id", "13");
    await expect(remaining).toHaveClass(/border-\[#1a1a1a\]/);
  });

  test("is not offered when nothing on the page works with TikTok", async ({
    page,
  }) => {
    await mockPlans(page, ordinaryPlansOnly());
    await page.goto("/esim-noi-dia/test?view=plans&slug=cn-china&lang=vi");

    await expect(visibleChips(page)).toHaveCount(2);
    await expect(page.getByTestId("nonhkip-toggle")).toHaveCount(0);
  });

  test("is not offered away from China, where nothing is blocked (#068)", async ({
    page,
  }) => {
    // Same capable plans, a Japanese destination: the filter would imply a
    // problem that does not exist there.
    await mockPlans(page, mixedPlans(), "japan");
    await page.goto("/esim-noi-dia/test?view=plans&slug=japan&lang=vi");

    await expect(visibleChips(page)).toHaveCount(3);
    await expect(page.getByTestId("nonhkip-toggle")).toHaveCount(0);
  });

  test("surfaces a capable plan that the price de-duplication had removed (#068)", async ({
    page,
  }) => {
    // The ticket's capitalised note. Plan 99 never reached the page before: it is
    // the dearer of two identical configurations, so `markCheapestPlans` dropped it.
    const payload = mixedPlans();
    payload.tiktokHiddenByPrice = [
      plan({
        id: 99,
        name: "China 5GB / 30day (local IP)",
        dataMb: 5120,
        vndPrice: 390000,
        appSupport: WORKS,
      }),
    ];
    await mockPlans(page, payload);
    await page.goto("/esim-noi-dia/test?view=plans&slug=cn-china&lang=vi");

    // Not in the default view: that stays the de-duplicated list.
    await expect(visibleChips(page)).toHaveCount(3);
    await expect(
      visibleChips(page).filter({ has: page.locator('[data-plan-id="99"]') }),
    ).toHaveCount(0);

    await visibleToggle(page).click();

    // Both capable plans now, cheapest first.
    await expect(visibleChips(page)).toHaveCount(2);
    await expect(visibleChips(page).nth(0)).toHaveAttribute("data-plan-id", "99");
    await expect(visibleChips(page).nth(1)).toHaveAttribute("data-plan-id", "13");
  });

  test("states the apps from the APN table, not a blanket claim (#068)", async ({
    page,
  }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/esim-noi-dia/test?view=plans&slug=cn-china&lang=vi");

    // Scoped to what is on screen: the desktop and mobile layouts both render the
    // green box, so an unscoped locator would read the hidden one.
    const appsLine = page.locator('[data-testid="green-box-apps"]:visible');

    // Plan 11 is selected first, and ChatGPT works on it while TikTok does not.
    await expect(appsLine.first()).toContainText("Không dùng được Tiktok");

    await visibleToggle(page).click();

    // Plan 13 works with both, so the denial must be gone.
    await expect(appsLine.first()).toContainText("Hỗ trợ sử dụng Tiktok");
    await expect(appsLine.first()).not.toContainText("Không dùng được");
  });

  test("reads in English on the English locale", async ({ page }) => {
    await mockPlans(page, mixedPlans());
    await page.goto("/en/esim-noi-dia/test?view=plans&slug=cn-china&lang=en");

    await expect(visibleToggle(page)).toContainText("Works with TikTok");
    await expect(visibleHint(page)).toContainText("local exit IP");
  });
});
