import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("[data-testid='install-guide'][data-ready]")).toBeAttached();
}

const VIET = /[À-ỹđĐ]/;

/**
 * vande #036 — the setup guide in English, no blue ring round the progress,
 * real flags, the site's own chat instead of Zalo, and the Hong Kong title.
 */
test.describe("eSIM setup guide fixes (vande #036)", () => {
  test("the English page has no Vietnamese, whichever device and method", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "/en/how-to-install-esim");
    const R = page.locator(".igd");
    await expect(R.locator("h1")).toHaveText("How to install an eSIM on iOS and Android");
    const devs = R.locator("[data-dev]");
    const mts = R.locator("[data-mt]");
    for (let i = 0; i < (await devs.count()); i++) {
      await devs.nth(i).click();
      for (let j = 0; j < (await mts.count()); j++) {
        await mts.nth(j).click();
        const text = await R.innerText();
        expect(text.split("\n").filter((l) => VIET.test(l))).toEqual([]);
      }
    }
  });

  test("progress ring without Tailwind's ring, flags as pictures, Hong Kong title", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "/huong-dan-cai-dat-esim");
    const R = page.locator(".igd");
    expect(await R.locator(".ring").evaluate((e) => getComputedStyle(e).boxShadow)).toBe("none");
    await expect(R.locator(".dflag svg")).toHaveCount(5);
    await expect(R.locator(".dcard h3").first()).toHaveText("Hồng Kông/ Đài Loan/ Macau");
  });

  test("“Chat với chuyên viên” opens the site chat, not Zalo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "/huong-dan-cai-dat-esim");
    const chat = page.locator(".igd [data-open-chat]");
    await expect(chat).toHaveAttribute("href", "#");
    await expect(page.locator(".ig-page a[href*='zalo.me']")).toHaveCount(0);
    const url = page.url();
    await expect(page.locator("#chat-bubble-toggle")).toBeAttached({ timeout: 30000 });
    await chat.click();
    // A guest is asked to sign in first, as with the chat bubble itself.
    await expect(page.getByText("Đăng nhập / Đăng ký")).toBeVisible();
    expect(page.url()).toBe(url);
  });
});
