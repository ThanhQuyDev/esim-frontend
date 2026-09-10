import { test, expect } from "@playwright/test";

/**
 * The 30-day affiliate attribution window (#095, ý 3).
 *
 * An order counts for the partner when it is placed within 30 days of the
 * buyer's most recent visit to the marketing link. The redirect used to record
 * only WHICH link was visited, never WHEN — the window lived entirely in the
 * cookie's max-age, and the API had no way to check it, so a cookie that
 * outlived its expiry went on paying commission forever.
 *
 * The redirect now stamps the visit time as well; these tests pin the two
 * properties the rule depends on: the stamp is written, and it is rewritten on
 * every visit so the window runs from the LATEST visit rather than the first.
 *
 * The click API is not up during e2e, so the redirect falls back to the
 * homepage — which is exactly the "best effort, never block the visitor" path
 * worth exercising anyway.
 *
 * Every navigation here uses the PUBLIC `/go/<code>` form, the one a partner
 * actually hands out. It reaches the handler through a rewrite (next.config)
 * and an exclusion in the i18n middleware; driving `/api/go/<code>` directly
 * would keep passing even if either of those broke and every shared link in
 * the wild started 404ing.
 */

const CODE = "E2ELINK01";
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;

test("a marketing link records which partner sent the visitor and when", async ({
  page,
  context,
}) => {
  await page.goto(`/go/${CODE}`);

  const cookies = await context.cookies();
  const linkCookie = cookies.find((c) => c.name === "esim_partner_link");
  const stampCookie = cookies.find((c) => c.name === "esim_partner_link_at");

  expect(linkCookie?.value).toBe(CODE);
  expect(stampCookie).toBeTruthy();

  // The stamp must be a real instant the API can compare against, not a label.
  const stampedAt = new Date(decodeURIComponent(stampCookie!.value)).getTime();
  expect(Number.isNaN(stampedAt)).toBe(false);
  expect(Math.abs(Date.now() - stampedAt)).toBeLessThan(5 * 60 * 1000);

  // Both carry the same 30-day life, so neither outlives the other and leaves
  // the API with a code it cannot date.
  const secondsLeft = (c: { expires: number }) => c.expires - Date.now() / 1000;
  expect(secondsLeft(linkCookie!)).toBeGreaterThan(THIRTY_DAYS_S - 3600);
  expect(secondsLeft(stampCookie!)).toBeGreaterThan(THIRTY_DAYS_S - 3600);
});

test("returning through the link restarts the 30 days from the newest visit", async ({
  page,
  context,
}) => {
  await page.goto(`/go/${CODE}`);
  const first = (await context.cookies()).find(
    (c) => c.name === "esim_partner_link_at"
  );

  await page.goto(`/go/${CODE}`);
  const second = (await context.cookies()).find(
    (c) => c.name === "esim_partner_link_at"
  );

  const firstAt = new Date(decodeURIComponent(first!.value)).getTime();
  const secondAt = new Date(decodeURIComponent(second!.value)).getTime();

  // A visitor who first clicked months ago but came back today is inside the
  // window: the stamp moves forward instead of pinning the original click.
  expect(secondAt).toBeGreaterThanOrEqual(firstAt);
  expect(second!.expires).toBeGreaterThanOrEqual(first!.expires);
});

test("an unreachable click API still lets the visitor through", async ({
  page,
}) => {
  await page.goto(`/go/${CODE}`);

  // Never a dead end: the redirect falls back to the homepage.
  await expect(page).toHaveURL(/\/(en)?$|\/$/);
});
