import { test, expect } from "@playwright/test";

/**
 * A partner link built as `esim.vn/<page>?ref=<code>` (#095).
 *
 * The brief lists that shape as one a partner may create and asks whether it
 * counts. It did not: `?ref=` is read by `ReferralCapture` and stored as the
 * CUSTOMER referral code — a different programme, which discounts the buyer and
 * rewards a referring user. A partner whose link looked like that earned
 * nothing, and nothing on the page said so.
 *
 * `/api/ref/<code>` now attributes the visit, but ONLY when the backend
 * confirms the code is an active partner link — because that parameter also
 * carries ordinary customer referral codes, which must never credit a partner.
 *
 * The click API is not running during e2e, so every code here looks
 * unconfirmable: exactly the "do not attribute on a guess" path, which is the
 * half that must not go wrong.
 */

const CODE = "REFPARAM01";

test("still captures the customer referral code as before", async ({
  page,
}) => {
  await page.goto(`/?ref=${CODE}`);

  // The capture component is loaded dynamically, so it runs after hydration
  // rather than on first paint.
  await expect
    .poll(
      () =>
        page.evaluate(() => localStorage.getItem("esim_referral_code")),
      { timeout: 15000 }
    )
    .toBe(CODE);
});

test("does not credit a partner for a code it could not confirm", async ({
  page,
  context,
}) => {
  await page.goto(`/?ref=${CODE}`);
  // Give the fire-and-forget lookup time to answer.
  await page.waitForTimeout(2000);

  const cookies = await context.cookies();
  // An ordinary customer referral code shares this parameter. Attributing on
  // sight would hand a partner commission on every order placed by anyone who
  // used a friend's code.
  expect(cookies.find((c) => c.name === "esim_partner_link")).toBeUndefined();
  expect(cookies.find((c) => c.name === "esim_partner_link_at")).toBeUndefined();
});

test("answers the lookup without redirecting the visitor away", async ({
  page,
}) => {
  const response = await page.goto(`/api/ref/${CODE}`);

  // Unlike /go/<code> this must not redirect — the visitor is already on the
  // page they asked for.
  expect(response?.status()).toBe(200);
  expect(await response?.json()).toEqual({ attributed: false });
});

test("leaves the visitor on the page they asked for", async ({ page }) => {
  await page.goto(`/?ref=${CODE}`);
  await page.waitForTimeout(1000);

  // No redirect, no interruption: the lookup is invisible to the visitor.
  await expect(page).toHaveURL(new RegExp(`\\?ref=${CODE}$`));
});
