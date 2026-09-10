import { test, expect, type Page } from "@playwright/test";
import { faqItems, pickContextFaqs } from "../lib/faq-context";

/**
 * #053 — a country/region page with its own FAQs must not also show the blanket
 * ones.
 *
 * These pages query the API twice: once for their own URL, once for the shared
 * "/destination" (or "/region") record that carries the FAQs used across every
 * destination. The two sets were merged, so a page given a specific answer showed
 * it buried among generic boilerplate — sometimes contradicting it.
 */

const API_BASE = "http://localhost:3001";

function faq(id: string, question: string) {
  return {
    id,
    language: "vi",
    isActive: true,
    sortOrder: 0,
    question,
    answer: `Trả lời ${question}`,
    createdAt: "",
    updatedAt: "",
  };
}

const SPECIFIC = [faq("s1", "eSIM Nhật Bản có gọi được không?")];
const BULK = [
  faq("g1", "eSIM là gì?"),
  faq("g2", "Cách cài eSIM?"),
];

test.describe("FAQ selection", () => {
  test("keeps the page's own FAQs and drops the blanket ones", () => {
    const picked = pickContextFaqs([SPECIFIC, BULK]);

    expect(picked.map((f) => f.id)).toEqual(["s1"]);
  });

  test("falls back to the blanket FAQs when the page has none of its own", () => {
    const picked = pickContextFaqs([[], BULK]);

    expect(picked.map((f) => f.id)).toEqual(["g1", "g2"]);
  });

  test("shows nothing when neither URL matched", () => {
    // Better an absent FAQ block than unrelated questions.
    expect(pickContextFaqs([[], []])).toEqual([]);
    expect(pickContextFaqs([null, undefined])).toEqual([]);
    expect(pickContextFaqs([])).toEqual([]);
  });

  test("accepts either response shape the endpoint returns", () => {
    expect(faqItems(SPECIFIC).map((f) => f.id)).toEqual(["s1"]);
    expect(
      faqItems({ data: BULK, hasNextPage: false }).map((f) => f.id),
    ).toEqual(["g1", "g2"]);
    expect(faqItems(null)).toEqual([]);
  });

  test("de-duplicates within the winning set", () => {
    const picked = pickContextFaqs([[faq("s1", "A"), faq("s1", "A again")]]);

    expect(picked).toHaveLength(1);
  });
});

/* ── Through the real FAQ section ── */

async function mockFaqs(
  page: Page,
  bySlug: Record<string, unknown[]>,
) {
  await page.route(`${API_BASE}/api/v1/faqs/by-context**`, (route) => {
    const url = new URL(route.request().url());
    const requested = url.searchParams.get("url") ?? "";
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(bySlug[requested] ?? []),
    });
  });
}

test.describe("FAQ block on a country page", () => {
  test("shows only the page's own question when it has one", async ({ page }) => {
    await mockFaqs(page, {
      "/esim-nhat-ban": SPECIFIC,
      "/destination": BULK,
    });
    await page.goto("/esim-noi-dia/test?view=faq&slug=/esim-nhat-ban&lang=vi");

    const section = page.getByTestId("section-FAQ");
    await expect(section).toBeVisible();
    await expect(section).toContainText("eSIM Nhật Bản có gọi được không?");
    // The blanket questions must be gone, not merely pushed down the list.
    await expect(section).not.toContainText("eSIM là gì?");
    await expect(section).not.toContainText("Cách cài eSIM?");
  });

  test("falls back to the blanket questions when the page has none", async ({
    page,
  }) => {
    await mockFaqs(page, { "/destination": BULK });
    await page.goto("/esim-noi-dia/test?view=faq&slug=/esim-thai-lan&lang=vi");

    const section = page.getByTestId("section-FAQ");
    await expect(section).toContainText("eSIM là gì?");
    await expect(section).toContainText("Cách cài eSIM?");
  });

  test("renders no FAQ block at all when nothing matches", async ({ page }) => {
    await mockFaqs(page, {});
    await page.goto("/esim-noi-dia/test?view=faq&slug=/esim-lao&lang=vi");

    await expect(page.getByTestId("local-test-meta")).toBeVisible();
    await expect(page.getByTestId("section-FAQ")).toHaveCount(0);
  });
});
