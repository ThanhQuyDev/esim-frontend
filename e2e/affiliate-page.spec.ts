import { test, expect } from "@playwright/test";

/**
 * Affiliate programme landing page (#095, ý 4).
 *
 * The programme worked end to end — links, clicks, commissions, payouts — with
 * nothing on the public site explaining it or letting anyone in. This page is
 * what turns a reader into an applicant, so what these tests guard is mostly
 * that: the page renders in both languages, and every road on it leads to the
 * sign-up form.
 */

test("explains the programme and its sections", async ({ page }) => {
  await page.goto("/affiliate");

  await expect(page.getByTestId("section-affiliate-hero")).toBeVisible();
  await expect(page.getByTestId("section-affiliate-how-it-works")).toBeVisible();
  await expect(page.getByTestId("section-affiliate-benefits")).toBeVisible();
  await expect(page.getByTestId("section-affiliate-audience")).toBeVisible();
  await expect(page.getByTestId("section-affiliate-faq")).toBeVisible();
  await expect(page.getByTestId("section-affiliate-cta")).toBeVisible();

  // One h1, and it is the programme's own headline — not a stray heading from
  // a shared section.
  await expect(page.locator("h1")).toHaveCount(1);
});

test("sends the reader to the sign-up form from both ends of the page", async ({
  page,
}) => {
  await page.goto("/affiliate");

  await expect(page.getByTestId("affiliate-hero-cta")).toHaveAttribute(
    "href",
    "/affiliate/dang-ky"
  );
  await expect(page.getByTestId("affiliate-cta-button")).toHaveAttribute(
    "href",
    "/affiliate/dang-ky"
  );

  await page.getByTestId("affiliate-hero-cta").click();
  await expect(page).toHaveURL(/\/affiliate\/dang-ky$/);
  await expect(page.getByTestId("affiliate-register-form")).toBeVisible({
    timeout: 15000,
  });
});

test("states the 30-day rule where an affiliate will read it", async ({
  page,
}) => {
  await page.goto("/affiliate");

  // The one thing that decides whether they get paid — it belongs on the page,
  // not only in the small print.
  await expect(
    page.getByTestId("section-affiliate-how-it-works")
  ).toContainText("30 ngày");
});

test("opens an answer when a question is clicked", async ({ page }) => {
  await page.goto("/affiliate");

  const faq = page.getByTestId("section-affiliate-faq");
  const first = faq.getByRole("button", {
    name: /Tham gia có mất phí không/,
  });
  const second = faq.getByRole("button", {
    name: /hồ sơ được duyệt hay không/,
  });

  // The first answer is open on arrival, so the section never reads as a wall
  // of unanswered questions.
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await expect(faq).toContainText("hoàn toàn miễn phí");

  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  // One at a time: opening another closes the previous one.
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(faq).toContainText("1-3 ngày làm việc");
});

test("reads in English on the English site and keeps its links localized", async ({
  page,
}) => {
  await page.goto("/en/affiliate");

  await expect(page.getByTestId("section-affiliate-hero")).toContainText(
    "Affiliate programme"
  );
  await expect(page.getByTestId("affiliate-hero-cta")).toHaveAttribute(
    "href",
    "/en/affiliate/register"
  );
});
