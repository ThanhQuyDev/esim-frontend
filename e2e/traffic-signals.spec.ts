import { test, expect, type Page } from "@playwright/test";

/**
 * "Nguồn truy cập" (vande-0411 #052): the first page of a session notes where
 * the visitor came from, later pages change nothing, and the order carries it.
 */

const API_BASE = "http://localhost:3001";

const saved = (page: Page) =>
  page
    .evaluate(() => JSON.parse(sessionStorage.getItem("esim_traffic_signals") ?? "null"))
    // The page may still be redirecting to its language.
    .catch(() => null);

async function land(page: Page, url: string, referer?: string) {
  await page.route(`${API_BASE}/api/v1/**`, (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.goto(url, { waitUntil: "domcontentloaded", referer });
  await expect.poll(() => saved(page), { timeout: 60_000 }).not.toBeNull();
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("tells a typed address from a link that hid where it was", async ({ page }) => {
  await land(page, "/vi/lien-he");
  expect(await saved(page)).toEqual({ secFetchSite: "none" });
});

test("keeps the site's name, never the address it came from", async ({ page }) => {
  await land(page, "/vi/lien-he", "https://www.example.vn/orders?email=a@b.vn");
  const signals = await saved(page);
  expect(signals.referrer).toBe("www.example.vn");
  expect(JSON.stringify(signals)).not.toContain("a@b.vn");
});

test("notes UTM words and which click ids were there, not their values", async ({ page }) => {
  await land(page, "/vi/lien-he?utm_source=chatgpt.com&fbclid=SECRETVALUE&utm_campaign=sale-11");
  const signals = await saved(page);
  expect(signals).toMatchObject({
    utmSource: "chatgpt.com",
    utmCampaign: "sale-11",
    clickIds: ["fbclid"],
  });
  expect(JSON.stringify(signals)).not.toContain("SECRETVALUE");
});

test("reports a Google passage without its words", async ({ page }) => {
  await land(page, "/vi/lien-he#:~:text=esim%20gia%20re", "https://www.google.com/");
  const signals = await saved(page);
  expect(signals.textFragment).toBe(true);
  expect(JSON.stringify(signals)).not.toContain("gia");
});

test("the first page decides, and the order carries it", async ({ page }) => {
  await land(
    page,
    "/vi/lien-he?gclid=abc&utm_medium=cpc",
    "https://www.google.com/",
  );
  await page.addInitScript(() => {
    localStorage.setItem(
      "esim_checkout_items",
      JSON.stringify([
        {
          id: "plan-1",
          planId: 1,
          name: "Vietnam 3GB / 7 days",
          description: "3 GB",
          price: 6,
          quantity: 1,
          vndPrice: 179000,
          destination: "Việt Nam",
          dataMb: 3072,
          durationDays: 7,
        },
      ]),
    );
  });
  await page.goto("/vi/thanh-toan", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("payment-method-bank_transfer")).toBeVisible({
    timeout: 60_000,
  });
  const signals = await saved(page);
  expect(signals.clickIds).toEqual(["gclid"]);
  expect(signals.referrer).toBe("www.google.com");
});
