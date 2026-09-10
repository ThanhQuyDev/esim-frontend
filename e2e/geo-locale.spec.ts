import { test, expect } from "@playwright/test";

/**
 * Geo-based default language on the home page.
 *
 * Driven through raw HTTP (`request.get` with `maxRedirects: 0`) rather than a
 * page render: the middleware answers before any page component runs, so these
 * assertions need no backend.
 *
 * The rule under test (see `i18n/geo-locale.ts`):
 *   - only `/` is ambiguous, so only `/` is ever redirected;
 *   - a visitor outside Vietnam gets `/en`;
 *   - a Vietnamese visitor, an unknown country, a bot, or anyone who already
 *     picked a language is left alone.
 */

const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml",
  "sec-fetch-mode": "navigate",
};

test.describe("Home page language by IP country", () => {
  test("sends a visitor outside Vietnam to the English home page", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { ...BROWSER_HEADERS, "x-vercel-ip-country": "US" },
    });

    expect(res.status()).toBe(307);
    expect(new URL(res.headers()["location"], "http://x").pathname).toBe("/en");
    // A per-visitor redirect must never be cached for everyone.
    expect(res.headers()["cache-control"]).toContain("no-store");
  });

  test("also reads the Cloudflare country header", async ({ request }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { ...BROWSER_HEADERS, "cf-ipcountry": "JP" },
    });

    expect(res.status()).toBe(307);
    expect(new URL(res.headers()["location"], "http://x").pathname).toBe("/en");
  });

  test("leaves a Vietnamese visitor on the Vietnamese home page", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: { ...BROWSER_HEADERS, "x-vercel-ip-country": "VN" },
    });

    expect(res.status()).not.toBe(307);
  });

  test("does nothing when the host provides no country header", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: BROWSER_HEADERS,
    });

    expect(res.status()).not.toBe(307);
  });

  test("never redirects a crawler, so the Vietnamese home page stays indexed", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: {
        ...BROWSER_HEADERS,
        "user-agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "x-vercel-ip-country": "US",
      },
    });

    expect(res.status()).not.toBe(307);
  });

  test("respects an explicit language choice over the visitor's country", async ({
    request,
  }) => {
    const res = await request.get("/", {
      maxRedirects: 0,
      headers: {
        ...BROWSER_HEADERS,
        "x-vercel-ip-country": "US",
        cookie: "esimvn_locale=vi",
      },
    });

    expect(res.status()).not.toBe(307);
  });

  test("leaves deep Vietnamese URLs alone — the URL states the language", async ({
    request,
  }) => {
    const res = await request.get("/diem-den", {
      maxRedirects: 0,
      headers: { ...BROWSER_HEADERS, "x-vercel-ip-country": "US" },
    });

    // Whatever the page does, it is never bounced to an English path.
    expect(res.headers()["location"] ?? "").not.toContain("/en");
  });
});
