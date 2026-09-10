import { test, expect } from "@playwright/test";

/**
 * Regression test for "the site switches itself to English after a while".
 *
 * Destination / region / plan endpoints are localized through the
 * `x-custom-lang` header, but the slug in the URL is identical in both locales
 * (`/thailand` and `/en/thailand`). Those queries used to be cached WITHOUT the
 * language in the key, so once a payload had been fetched in one language the
 * other language reused it from cache — no request, wrong language on screen.
 *
 * The harness mounts the same query twice, once per language, and we count the
 * requests that actually leave the browser.
 */

const API_BASE = "http://localhost:3001";

const EMPTY_GROUPS = {
  dataPlans: [],
  slowUnlimited: [],
  fastUnlimited: [],
  dailyUnlimited: [],
  smsCallEsim: [],
  localEsim: [],
};

test("a localized query is fetched once per language, not shared across them", async ({
  page,
}) => {
  const langsRequested: string[] = [];

  await page.route(`${API_BASE}/api/v1/plans/local/wintel**`, async (route) => {
    langsRequested.push(route.request().headers()["x-custom-lang"] ?? "none");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(EMPTY_GROUPS),
    });
  });

  await page.goto("/esim-noi-dia/test?view=lang-cache&carrier=wintel");

  await expect(page.getByTestId("lang-cache-vi")).toHaveText("vi:ok");
  await expect(page.getByTestId("lang-cache-en")).toHaveText("en:ok");

  // Two separate cache entries → BOTH languages actually hit the network.
  // (Deduplicated: React's dev StrictMode mounts each query twice.)
  // Before the fix only the first language was ever requested and the second
  // one silently rendered that same payload.
  expect(Array.from(new Set(langsRequested)).sort()).toEqual(["en", "vi"]);
});
