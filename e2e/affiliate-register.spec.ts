import { test, expect } from "@playwright/test";

/**
 * Affiliate sign-up page (#095).
 *
 * `POST /partners/apply` was live long before anything called it: the only way
 * into the programme was for an admin to type the record in by hand. These
 * tests pin what the new page has to get right — that it sends an application
 * the API accepts, that it only asks a company for company details, and that a
 * rejected email lands on the email field instead of a shrug.
 */

const API_BASE = "http://localhost:3001";
const APPLY_URL = `${API_BASE}/api/v1/partners/apply`;
const PAGE = "/affiliate/dang-ky";

async function fillRequiredFields(page: import("@playwright/test").Page) {
  await page.getByTestId("contact-name").fill("Nguyễn Văn A");
  await page.getByTestId("contact-phone").fill("0901234567");
  await page.getByTestId("contact-email").fill("kol@example.com");
  await page.getByTestId("password").fill("matkhau123");
  await page.getByTestId("confirm-password").fill("matkhau123");
  await page.getByTestId("accept-terms").check();
}

test("sends an application the API can accept", async ({ page }) => {
  let body: Record<string, unknown> | null = null;

  await page.route(APPLY_URL, async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ partnerId: 9, userId: 42 }),
    });
  });

  await page.goto(PAGE);
  await fillRequiredFields(page);
  await page.getByTestId("affiliate-register-submit").click();

  await expect(page.getByTestId("affiliate-register-success")).toBeVisible({
    timeout: 15000,
  });

  expect(body).toMatchObject({
    // This page is the affiliate programme; resellers join elsewhere (#094).
    partnerType: "kol",
    legalType: "individual",
    contactName: "Nguyễn Văn A",
    contactEmail: "kol@example.com",
    contactPhone: "0901234567",
    password: "matkhau123",
  });
  // An individual has no company details — sending empty ones would file them
  // as a business.
  expect(body).not.toHaveProperty("companyName");
  expect(body).not.toHaveProperty("taxCode");
});

test("does not submit an incomplete application", async ({ page }) => {
  let requests = 0;
  await page.route(APPLY_URL, async (route) => {
    requests += 1;
    await route.fulfill({ status: 201, body: "{}" });
  });

  await page.goto(PAGE);
  await page.getByTestId("affiliate-register-submit").click();

  // The form stays put and says what is missing rather than posting a half
  // application the API would 422 anyway.
  await expect(page.getByTestId("affiliate-register-form")).toBeVisible();
  await expect(page.getByText("Vui lòng nhập họ tên")).toBeVisible({
    timeout: 15000,
  });
  expect(requests).toBe(0);
});

test("asks a company for its company details, an individual for none", async ({
  page,
}) => {
  await page.goto(PAGE);

  await expect(page.getByTestId("company-name")).toHaveCount(0);

  await page.getByTestId("legal-type-company").check();
  await expect(page.getByTestId("company-name")).toBeVisible();
  await expect(page.getByTestId("tax-code")).toBeVisible();

  await page.getByTestId("legal-type-individual").check();
  await expect(page.getByTestId("company-name")).toHaveCount(0);
});

test("sends the company details when applying as a company", async ({
  page,
}) => {
  let body: Record<string, unknown> | null = null;
  await page.route(APPLY_URL, async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ partnerId: 10, userId: 43 }),
    });
  });

  await page.goto(PAGE);
  await page.getByTestId("legal-type-company").check();
  await fillRequiredFields(page);
  await page.getByTestId("company-name").fill("Công ty TNHH ABC");
  await page.getByTestId("tax-code").fill("0312345678");
  await page.getByTestId("affiliate-register-submit").click();

  await expect(page.getByTestId("affiliate-register-success")).toBeVisible({
    timeout: 15000,
  });
  expect(body).toMatchObject({
    legalType: "company",
    companyName: "Công ty TNHH ABC",
    taxCode: "0312345678",
  });
});

test("puts an already-registered email on the email field, in words", async ({
  page,
}) => {
  await page.route(APPLY_URL, async (route) => {
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      // Exactly what the API sends: a bare code, no message. An earlier
      // version of this test invented a friendly Vietnamese sentence here, so
      // it passed while the real page printed "emailAlreadyExists" at the
      // applicant.
      body: JSON.stringify({
        status: 422,
        errors: { contactEmail: "emailAlreadyExists" },
      }),
    });
  });

  await page.goto(PAGE);
  await fillRequiredFields(page);
  await page.getByTestId("affiliate-register-submit").click();

  // The applicant has to see WHICH field is the problem, in a sentence they
  // can act on; a generic banner leaves them retrying the same address.
  await expect(page.getByText("Email này đã có tài khoản")).toBeVisible({
    timeout: 15000,
  });
  await expect(page.getByText("emailAlreadyExists")).toHaveCount(0);
  await expect(page.getByTestId("affiliate-register-success")).toHaveCount(0);
});

test("tells the applicant to expect an email either way", async ({ page }) => {
  await page.route(APPLY_URL, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ partnerId: 11, userId: 44 }),
    });
  });

  await page.goto(PAGE);
  await fillRequiredFields(page);
  await page.getByTestId("affiliate-register-submit").click();

  const success = page.getByTestId("affiliate-register-success");
  await expect(success).toBeVisible({ timeout: 15000 });
  // Approval is a human decision, so the page must not imply instant access.
  await expect(success).toContainText("chờ duyệt");
  await expect(success).toContainText("email");
});
