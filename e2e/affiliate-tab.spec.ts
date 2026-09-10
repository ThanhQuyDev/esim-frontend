import { test, expect, type Page } from "@playwright/test";

/**
 * Affiliates tab in the customer profile (#095, ý c).
 *
 * Everything a partner earns was already tracked — links, clicks, commissions —
 * but only an admin could see it. The partner had no screen of their own, so
 * "how many of my orders actually counted?" was a support message.
 *
 * The two things worth pinning: an order that earned nothing must not look like
 * one that paid, and a partner must be able to pick their own referral code
 * (the brief's "tối thiểu 6 ký tự tùy ý") because it gets read aloud in videos.
 */

const API_BASE = "http://localhost:3001";
const LINKS_URL = `${API_BASE}/api/v1/partners/me/links`;
const ORDERS_URL = `${API_BASE}/api/v1/partners/me/orders`;

const LINKS = [
  {
    id: 1,
    code: "VANA2026",
    label: "Video review Nhật Bản",
    targetPath: null,
    status: "active",
    clickCount: 128,
    conversionCount: 9,
    totalCommissionVnd: 450000,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
];

type MockOrder = {
  orderNumber: string;
  status: string;
  vndPrice: number;
  createdAt: string;
  commissionVnd: number | null;
  commissionStatus: string | null;
  linkCode: string | null;
  esimCount: number;
  items: { planName: string; quantity: number }[];
  validity: string;
  invalidReason: string | null;
};

const ORDERS: MockOrder[] = [
  {
    orderNumber: "ORD-VALID",
    status: "completed",
    vndPrice: 1000000,
    createdAt: "2026-09-01T00:00:00.000Z",
    commissionVnd: 50000,
    commissionStatus: "credited",
    linkCode: "VANA2026",
    esimCount: 1,
    items: [{ planName: "Japan 5GB", quantity: 1 }],
    validity: "valid",
    invalidReason: null,
  },
  {
    orderNumber: "ORD-PENDING",
    status: "paid",
    vndPrice: 500000,
    createdAt: "2026-09-02T00:00:00.000Z",
    commissionVnd: 25000,
    commissionStatus: "pending",
    linkCode: "VANA2026",
    esimCount: 1,
    items: [],
    validity: "pending",
    invalidReason: null,
  },
  {
    orderNumber: "ORD-REFUNDED",
    status: "refunded",
    vndPrice: 300000,
    createdAt: "2026-09-03T00:00:00.000Z",
    commissionVnd: 15000,
    commissionStatus: "reversed",
    linkCode: "VANA2026",
    esimCount: 0,
    items: [],
    validity: "invalid",
    invalidReason: "commission_reversed",
  },
];

async function signIn(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("esim_auth_token", "e2e-token");
    localStorage.setItem(
      "esim_auth_user",
      JSON.stringify({ id: 1, email: "kol@example.com" })
    );
  });
}

const WALLET_URL = `${API_BASE}/api/v1/partners/me/wallet`;

const WALLET = {
  balanceVnd: 1_200_000,
  availableBalanceVnd: 1_000_000,
  pendingPayoutVnd: 200_000,
  pendingCommissionVnd: 450_000,
  withdrawnVnd: 3_000_000,
  status: "active",
};

async function mockPartnerApi(
  page: Page,
  { links = LINKS, orders = ORDERS, wallet = WALLET } = {}
) {
  // Catch-all first (last route registered wins): any unmocked API call that
  // answered 401 would trip `authFetch`'s auth-expired handler, log the fake
  // session out mid-test and leave every list empty.
  await page.route(`${API_BASE}/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    })
  );
  await page.route(LINKS_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(links),
    })
  );
  await page.route(ORDERS_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(orders),
    })
  );
  await page.route(WALLET_URL, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(wallet),
    })
  );
}

function open(page: Page, status = "active", lang = "vi") {
  return page.goto(
    `/esim-noi-dia/test?view=affiliate&status=${status}&lang=${lang}`
  );
}

test.describe("Affiliates tab", () => {
  test("shows the three money buckets from the brief", async ({ page }) => {
    await signIn(page);
    await mockPartnerApi(page);
    await open(page);

    const card = page.getByTestId("affiliate-wallet");
    await expect(card).toBeVisible({ timeout: 15000 });

    // Awaiting reconciliation is its own figure — the old summary only had
    // "pending payout", so a partner with 450k earned saw nothing at all.
    await expect(page.getByTestId("affiliate-wallet-pending")).toContainText(
      "450.000đ"
    );
    await expect(page.getByTestId("affiliate-wallet-available")).toContainText(
      "1.000.000đ"
    );
    await expect(page.getByTestId("affiliate-wallet-withdrawn")).toContainText(
      "3.000.000đ"
    );
  });

  test("accounts for money a withdrawal request already claimed", async ({
    page,
  }) => {
    await signIn(page);
    await mockPartnerApi(page);
    await open(page);

    // 200k is missing from Available because it is being paid out; unexplained,
    // that reads as money that vanished.
    await expect(
      page.getByTestId("affiliate-wallet-payout-pending")
    ).toContainText("200.000đ", { timeout: 15000 });
  });

  test("shows zeroes rather than an empty card for a new partner", async ({
    page,
  }) => {
    await signIn(page);
    await mockPartnerApi(page, {
      wallet: {
        balanceVnd: 0,
        availableBalanceVnd: 0,
        pendingPayoutVnd: 0,
        pendingCommissionVnd: 0,
        withdrawnVnd: 0,
        status: "active",
      },
    });
    await open(page);

    await expect(page.getByTestId("affiliate-wallet-available")).toContainText(
      "0đ",
      { timeout: 15000 }
    );
    // Nothing claimed, so the withdrawal-in-progress line stays away.
    await expect(
      page.getByTestId("affiliate-wallet-payout-pending")
    ).toHaveCount(0);
  });

  test("shows the partner's links with their own numbers", async ({ page }) => {
    await signIn(page);
    await mockPartnerApi(page);
    await open(page);

    const list = page.getByTestId("affiliate-link-list");
    await expect(list).toBeVisible({ timeout: 15000 });
    await expect(list).toContainText("Video review Nhật Bản");
    // The full shareable URL, not just the code — that is what gets pasted.
    // Specifically the public `/go/` form: `/api/go/` is the handler behind a
    // rewrite and must not reach a partner's audience.
    await expect(list).toContainText("/go/VANA2026");
    await expect(list).not.toContainText("/api/go/");
    await expect(list).toContainText("128");
    await expect(list).toContainText("450.000đ");
  });

  test("separates orders that counted from orders that did not", async ({
    page,
  }) => {
    await signIn(page);
    await mockPartnerApi(page);
    await open(page);

    await expect(page.getByTestId("affiliate-order-list")).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByTestId("affiliate-filter-valid")).toContainText("1");
    await expect(page.getByTestId("affiliate-filter-pending")).toContainText(
      "1"
    );
    await expect(page.getByTestId("affiliate-filter-invalid")).toContainText(
      "1"
    );

    // A reversed commission must say so, not just vanish from the total.
    await expect(page.getByTestId("affiliate-order-invalid")).toContainText(
      "thu hồi"
    );
  });

  test("filters the list down to one outcome", async ({ page }) => {
    await signIn(page);
    await mockPartnerApi(page);
    await open(page);

    await expect(page.getByTestId("affiliate-order-list")).toBeVisible({
      timeout: 15000,
    });

    await page.getByTestId("affiliate-filter-valid").click();
    await expect(page.getByTestId("affiliate-order-valid")).toHaveCount(1);
    await expect(page.getByTestId("affiliate-order-invalid")).toHaveCount(0);
  });

  test("lets a partner choose their own referral code", async ({ page }) => {
    await signIn(page);
    await mockPartnerApi(page, { links: [] });

    let sent: Record<string, unknown> | null = null;
    await page.route(LINKS_URL, async (route) => {
      if (route.request().method() === "POST") {
        sent = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ ...LINKS[0], code: "MYCODE2026" }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await open(page);
    await page.getByTestId("affiliate-new-link").click();
    await page.getByTestId("affiliate-link-label").fill("TikTok tháng 9");
    await page.getByTestId("affiliate-link-code").fill("MYCODE2026");
    await page.getByTestId("affiliate-link-submit").click();

    await expect(page.getByTestId("affiliate-link-form")).toHaveCount(0, {
      timeout: 15000,
    });
    expect(sent).toMatchObject({
      label: "TikTok tháng 9",
      code: "MYCODE2026",
    });
  });

  test("refuses a code shorter than six characters before calling the API", async ({
    page,
  }) => {
    await signIn(page);
    await mockPartnerApi(page, { links: [] });

    let posts = 0;
    await page.route(LINKS_URL, async (route) => {
      if (route.request().method() === "POST") posts += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await open(page);
    await page.getByTestId("affiliate-new-link").click();
    await page.getByTestId("affiliate-link-label").fill("TikTok");
    await page.getByTestId("affiliate-link-code").fill("ABC");
    await page.getByTestId("affiliate-link-submit").click();

    await expect(page.getByTestId("affiliate-link-error")).toBeVisible({
      timeout: 15000,
    });
    expect(posts).toBe(0);
  });

  test("says plainly that an order the partner placed themselves earns nothing", async ({
    page,
  }) => {
    await signIn(page);
    await mockPartnerApi(page, {
      orders: [
        {
          ...ORDERS[0],
          orderNumber: "ORD-SELF",
          commissionVnd: null,
          commissionStatus: null,
          validity: "invalid",
          invalidReason: "self_referral",
        },
      ],
    });
    await open(page);

    // "Earned no commission" is true but leaves them guessing; naming the
    // reason is what stops the support message.
    await expect(
      page.getByTestId("affiliate-reason-self_referral")
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByTestId("affiliate-reason-self_referral")
    ).toContainText("chính bạn đặt");
  });

  test("says why there is nothing to manage while approval is pending", async ({
    page,
  }) => {
    await signIn(page);
    await mockPartnerApi(page);
    await open(page, "pending");

    // An empty screen would read as broken; a pending partner gets told.
    const notice = page.getByTestId("affiliate-status-notice");
    await expect(notice).toBeVisible({ timeout: 15000 });
    await expect(notice).toContainText("chờ duyệt");
    await expect(page.getByTestId("affiliate-link-list")).toHaveCount(0);
  });

  test("surfaces a code somebody else already took", async ({ page }) => {
    await signIn(page);
    await mockPartnerApi(page, { links: [] });

    await page.route(LINKS_URL, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 422,
          contentType: "application/json",
          body: JSON.stringify({
            status: 422,
            errors: { code: "Mã giới thiệu này đã có người dùng." },
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await open(page);
    await page.getByTestId("affiliate-new-link").click();
    await page.getByTestId("affiliate-link-label").fill("TikTok");
    await page.getByTestId("affiliate-link-code").fill("VANA2026");
    await page.getByTestId("affiliate-link-submit").click();

    // "Try another one" is only possible if we say which problem it is.
    await expect(page.getByTestId("affiliate-link-error")).toContainText(
      "đã có người dùng",
      { timeout: 15000 }
    );
  });
});
