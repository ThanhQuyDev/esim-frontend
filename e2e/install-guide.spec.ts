import { test, expect, type Page } from "@playwright/test";

/** Open the guide and wait until the design's script has wired it up. */
async function open(page: Page, path = "/huong-dan-cai-dat-esim") {
  await page.goto(path);
  await expect(page.locator("[data-testid='install-guide'][data-ready]")).toBeAttached();
}

/**
 * "Hướng dẫn cài đặt eSIM" (#065) — the design files' own markup and script,
 * ported under `.igd` (desktop) / `.igm` (phone). Static page, no API needed.
 */

test.describe("eSIM setup guide (#065)", () => {
  test("VI and EN slugs serve the guide", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("install-guide")).toBeVisible();
    await expect(page.locator(".igd h1")).toHaveText("Hướng dẫn cài đặt eSIM trên thiết bị iOS và Android");
    await open(page, "/en/how-to-install-esim");
    await expect(page.getByTestId("install-guide")).toBeVisible();
  });

  test("desktop: device and method pick the steps; marking steps fills the progress", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    const R = page.locator(".igd");
    await expect(R).toBeVisible();
    await expect(page.locator(".igm")).toBeHidden();

    const titles = R.locator("#steps .step-t");
    await expect(titles.first()).toBeVisible();
    const iphone = await titles.allTextContents();
    await R.locator("#devTabs .tab").nth(1).click();
    await expect(R.locator("#devTabs .tab").nth(1)).toHaveAttribute("aria-pressed", "true");
    expect(await titles.allTextContents()).not.toEqual(iphone);

    await R.locator("#mtCards .mt").nth(1).click();
    const n = await R.locator("#steps .step").count();
    await R.locator("#steps [data-tg='0']").click();
    await expect(R.locator("#pbP")).toHaveText(`${Math.round(100 / n)}%`);
    await expect(R.locator("#ringP")).toHaveText(`${Math.round(100 / n)}%`);
    for (let i = 1; i < n; i++) await R.locator(`#steps [data-tg='${i}']`).click();
    await expect(R.locator("#donePanel")).toHaveClass(/show/);
    await R.locator("#pbR").click();
    await expect(R.locator("#pbP")).toHaveText("0%");
  });

  test("desktop: modal, accordion and site links", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page);
    const R = page.locator(".igd");
    await R.locator("[data-modal='eid']").click();
    await expect(R.locator("#ov-eid")).toHaveClass(/open/);
    await page.keyboard.press("Escape");
    await expect(R.locator("#ov-eid")).not.toHaveClass(/open/);

    await R.locator(".acc-q").first().click();
    await expect(R.locator(".acc").first()).toHaveClass(/on/);

    await expect(R.locator(".bc a").first()).toHaveAttribute("href", "/");
    await expect(R.locator("a[href='/thiet-bi-ho-tro-esim']").first()).toBeAttached();
    await expect(R.locator("a[href='/cong-cu-tinh-data']").first()).toBeAttached();
  });

  test("phone: mobile layout with its own ids, TOC drawer and progress", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page);
    const M = page.locator(".igm");
    await expect(M).toBeVisible();
    await expect(page.locator(".igd")).toBeHidden();
    await M.locator("#m-steps [data-tg='0']").click();
    await expect(M.locator("#m-tocBarPc")).not.toHaveText("0%");
    await M.locator("#m-tocBtn").click();
    await expect(M.locator("#m-drawerToc")).toHaveClass(/open/);
    await M.locator("#m-drawerToc .toc-l[href='#m-faq']").click();
    await expect(M.locator("#m-drawerToc")).not.toHaveClass(/open/);
  });

  test("a phone's user agent still gets the guide, not a product page (#001 routes)", async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const page = await ctx.newPage();
    await open(page);
    await expect(page.locator(".igm h1")).toContainText("Hướng dẫn cài đặt eSIM");
    await ctx.close();
  });
});
