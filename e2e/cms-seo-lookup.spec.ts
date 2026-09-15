import { test, expect } from "@playwright/test";

/**
 * #016 — the CMS "Script / Schema" block did not reach the English site.
 *
 * Every page looks its SEO config up by URL. The English homepage is served at
 * `/en` but its config is stored as `/en/home`; the mapping between the two
 * doubled the locale prefix (next-intl's getPathname already returns `/en`),
 * so `/en` was never recognised and the lookup asked for a URL with no row.
 *
 * Run through the client harness so the real next-intl routing is used.
 */

async function lookups(page: import("@playwright/test").Page) {
  // `domcontentloaded`: the harness renders the result straight away, while
  // `load` would also wait on the layout's server fetches, which only time out
  // with no backend running.
  await page.goto("/esim-noi-dia/test?view=seo-lookup", {
    waitUntil: "domcontentloaded",
  });
  const raw = await page.getByTestId("seo-lookup-result").textContent();
  return JSON.parse(raw ?? "{}") as Record<string, string>;
}

test.describe("SEO config lookup URLs (#016)", () => {
  // One page compile shared by the three checks; the first cold compile of the
  // harness can take longer than the default 30s.
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("maps the English homepage to its CMS row, like the Vietnamese one", async ({
    page,
  }) => {
    const result = await lookups(page);

    expect(result["vi /"]).toBe("/home");
    expect(result["en /en"]).toBe("/en/home");
    expect(result["en /en/"]).toBe("/en/home");
    expect(result["home vi"]).toBe("/home");
    expect(result["home en"]).toBe("/en/home");
    expect(result["page en /"]).toBe("/en/home");
  });

  test("keeps localized static pages on their own URL in each language", async ({
    page,
  }) => {
    const result = await lookups(page);

    expect(result["vi /ma-giam-gia"]).toBe("/ma-giam-gia");
    expect(result["en /en/coupon"]).toBe("/en/coupon");
    expect(result["vi /diem-den"]).toBe("/diem-den");
    expect(result["en /en/destinations"]).toBe("/en/destinations");
    expect(result["page vi /about-us"]).toBe("/gioi-thieu");
    // One prefix, never `/en/en/...`.
    expect(result["page en /about-us"]).toBe("/en/about-us");
  });

  test("passes country pages through unchanged", async ({ page }) => {
    const result = await lookups(page);

    expect(result["vi /esim-han-quoc"]).toBe("/esim-han-quoc");
    expect(result["en /en/esim-han-quoc"]).toBe("/en/esim-han-quoc");
    for (const value of Object.values(result)) {
      expect(value).not.toContain("/en/en");
    }
  });
});
