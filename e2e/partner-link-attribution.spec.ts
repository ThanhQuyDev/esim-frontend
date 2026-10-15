import { test, expect } from "@playwright/test";

/**
 * The marketing-link redirect (#095, #039, doitac-1410 #026).
 *
 * The click is now a token the API signs, kept in an HttpOnly cookie that the
 * page cannot read or rewrite, and never written on the landing URL. These
 * tests run without the click API, which pins the parts that must hold even
 * then: the visitor always gets through, nothing readable is ever set as
 * attribution, a HEAD request or a link-preview bot is not a click, and the
 * landing URL carries no click id to share.
 *
 * Every navigation uses the PUBLIC `/go/<code>` form, the one a partner hands
 * out. It reaches the handler through a rewrite (next.config) and an exclusion
 * in the i18n middleware; driving `/api/go/<code>` directly would keep passing
 * even if either of those broke.
 */

const CODE = "E2ELINK01";

test("an unreachable click API still lets the visitor through", async ({
  page,
}) => {
  await page.goto(`/go/${CODE}`);

  // Never a dead end: the redirect falls back to the homepage.
  await expect(page).toHaveURL(/\/(en)?$|\/$/);
});

test("never sets an attribution cookie a script could read or edit", async ({
  page,
  context,
}) => {
  await page.goto(`/go/${CODE}`);

  const cookies = await context.cookies();
  // The plain code and time used to sit in readable cookies anybody could
  // forge (cookie stuffing). Only the signed HttpOnly token may exist now.
  expect(cookies.find((c) => c.name === "esim_partner_link")).toBeUndefined();
  expect(cookies.find((c) => c.name === "esim_partner_link_at")).toBeUndefined();
  expect(cookies.find((c) => c.name === "esim_partner_click")).toBeUndefined();
  for (const c of cookies.filter((c) => c.name === "esim_partner_ct")) {
    expect(c.httpOnly).toBe(true);
  }
});

test("puts no click id on the landing URL", async ({ page }) => {
  await page.goto(`/go/${CODE}`);

  // A URL gets shared, screenshotted and sent in Referer headers; whoever
  // receives it must not inherit the visitor's click.
  expect(page.url()).not.toMatch(/[?&](pcid|subid)=/);
});

test("a HEAD request is redirected without counting as a visit", async ({
  request,
}) => {
  const res = await request.head(`/go/${CODE}`, { maxRedirects: 0 });

  expect([301, 302, 303, 307, 308]).toContain(res.status());
  expect(res.headers()["set-cookie"] ?? "").not.toContain("esim_partner");
});

test("a link-preview bot is redirected without counting as a visit", async ({
  request,
}) => {
  const res = await request.get(`/go/${CODE}`, {
    maxRedirects: 0,
    headers: { "User-Agent": "facebookexternalhit/1.1" },
  });

  expect([301, 302, 303, 307, 308]).toContain(res.status());
  expect(res.headers()["set-cookie"] ?? "").not.toContain("esim_partner");
});

test("hands the page no click token when there is none", async ({ request }) => {
  const res = await request.get("/api/partner-attribution");

  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ clickToken: null });
  expect(res.headers()["cache-control"]).toContain("no-store");
});
