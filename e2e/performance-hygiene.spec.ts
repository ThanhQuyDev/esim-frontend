import { test, expect } from "@playwright/test";
import { isCloudinaryUrl, optimizeCloudinary } from "../lib/cdn-image";

/**
 * #092 — the things Lighthouse marks the site down for.
 *
 * These assert the page properties behind the audits, not a score: a score
 * depends on the machine it runs on, but "the LCP image is fetched at high
 * priority in a modern format" either holds or it does not.
 *
 * Measured on the real homepage, which is what Lighthouse would open.
 */

test.describe("image delivery", () => {
  test("asks Cloudinary for a modern format at a sensible quality", () => {
    const url =
      "https://res.cloudinary.com/deqfcfcwf/image/upload/v1782060650/hero-banner_rlrfwc.png";

    expect(optimizeCloudinary(url)).toBe(
      "https://res.cloudinary.com/deqfcfcwf/image/upload/f_auto,q_auto/v1782060650/hero-banner_rlrfwc.png",
    );
  });

  test("caps the width without ever upscaling a smaller original", () => {
    const url = "https://res.cloudinary.com/x/image/upload/v1/flag.png";

    expect(optimizeCloudinary(url, { width: 72 })).toContain("f_auto,q_auto,w_72,c_limit");
  });

  test("leaves a URL that is already tuned alone", () => {
    const tuned =
      "https://res.cloudinary.com/x/image/upload/f_auto,q_80,w_400/v1/hero.png";

    expect(optimizeCloudinary(tuned)).toBe(tuned);
  });

  test("never rewrites a URL from another host", () => {
    const airalo = "https://cdn-revamp.airalo.com/images/abc.png";
    const local = "/images/hero.png";

    expect(isCloudinaryUrl(airalo)).toBe(false);
    expect(optimizeCloudinary(airalo)).toBe(airalo);
    expect(optimizeCloudinary(local)).toBe(local);
    expect(optimizeCloudinary(null)).toBe("");
  });
});

test.describe("homepage — what Lighthouse looks at", () => {
  test("opens early connections to the origins the first paint needs", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    const preconnects = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="preconnect"]')).map(
        (l) => (l as HTMLLinkElement).href,
      ),
    );

    // Font CSS, font files and the CDN the hero image comes from.
    expect(preconnects.join(" ")).toContain("fonts.googleapis.com");
    expect(preconnects.join(" ")).toContain("fonts.gstatic.com");
    expect(preconnects.join(" ")).toContain("res.cloudinary.com");
  });

  test("fetches the hero — the LCP element — first and in a modern format", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "load" });

    // The logo is also high-priority; the hero is the one with the alt text.
    const hero = page.locator('img[alt*="eSIM app"][fetchpriority="high"]').first();
    await expect(hero).toBeVisible();

    const src = await hero.getAttribute("src");
    expect(src).toContain("f_auto,q_auto");
    // Eager, so it is not deferred behind the lazy images below the fold.
    expect(await hero.getAttribute("loading")).toBe("eager");
  });

  test("gives every image a size, so nothing reflows as they load", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    // The destination grid renders after its query resolves.
    await page.waitForTimeout(1500);

    const missing = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.getAttribute("width") || !img.getAttribute("height"))
        .map((img) => img.currentSrc || img.src),
    );

    expect(missing).toEqual([]);
  });

  test("keeps images below the fold off the critical path", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1500);

    const counts = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return {
        total: imgs.length,
        eager: imgs.filter((i) => i.loading !== "lazy").length,
      };
    });

    // A handful of above-the-fold images are eager; the rest must be lazy.
    expect(counts.total).toBeGreaterThan(10);
    expect(counts.eager).toBeLessThanOrEqual(6);
  });

  test("declares a language and a description for the crawlers", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    expect(await page.evaluate(() => document.documentElement.lang)).toBe("vi");
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
  });
});
