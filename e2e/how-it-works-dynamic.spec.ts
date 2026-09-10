import { test, expect, type Page } from "@playwright/test";
import {
  buildHowItWorksDict,
  summarizePlanFacts,
  placeName,
} from "../lib/how-it-works";
import vi from "../messages/vi.json";
import en from "../messages/en.json";

/**
 * #044 — the "how it works" steps read differently per country / region.
 *
 * The homepage keeps the generic copy; a country or region page gets the place
 * name and that place's real plan lineup (how many packs, data sizes, durations,
 * cheapest price) written into the steps.
 *
 * The two failure modes worth pinning: a literal `${name}` leaking to a visitor,
 * and a plan-facts sentence built from data we don't have.
 */

const API_BASE = "http://localhost:3001";

function plan(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    provider: "esimaccess",
    providerPlanId: "x",
    name: "",
    durationDays: 7,
    dataMb: 1024,
    costPrice: 0,
    price: 2,
    retailPrice: 2,
    currency: "USD",
    type: "fixed",
    topUp: false,
    isCheapest: false,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    vndPrice: 150_000,
    ...overrides,
  } as never;
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    dataPlans: [],
    slowUnlimited: [],
    fastUnlimited: [],
    dailyUnlimited: [],
    smsCallEsim: [],
    localEsim: [],
    ...overrides,
  } as never;
}

const JAPAN_PLANS = payload({
  dataPlans: [
    plan({ id: 1, dataMb: 1024, durationDays: 3, vndPrice: 120_000 }),
    plan({ id: 2, dataMb: 20480, durationDays: 30, vndPrice: 800_000 }),
  ],
});

test.describe("Per-place plan facts", () => {
  test("summarizes the range a country actually sells", () => {
    const facts = summarizePlanFacts(JAPAN_PLANS, "vi");

    expect(facts).toMatchObject({
      planCount: 2,
      dataRange: "1GB – 20GB",
      dayRange: "3 – 30 ngày",
      fromPrice: "120.000đ",
      hasUnlimited: false,
    });
  });

  test("leaves unlimited plans out of the data range", () => {
    // Unlimited plans carry dataMb 0; counting them would advertise "0MB – 5GB".
    const facts = summarizePlanFacts(
      payload({
        dataPlans: [plan({ dataMb: 5120, durationDays: 10 })],
        fastUnlimited: [plan({ id: 9, dataMb: 0, durationDays: 15 })],
      }),
      "vi",
    );

    expect(facts?.dataRange).toBe("5GB");
    expect(facts?.hasUnlimited).toBe(true);
    // The duration range still covers both plans.
    expect(facts?.dayRange).toBe("10 – 15 ngày");
  });

  test("says nothing when the place has no plans", () => {
    expect(summarizePlanFacts(payload(), "vi")).toBeNull();
    expect(summarizePlanFacts(null, "vi")).toBeNull();
  });

  test("uses the English day unit on the English locale", () => {
    expect(summarizePlanFacts(JAPAN_PLANS, "en")?.dayRange).toBe("3 – 30 days");
  });
});

test.describe("Dynamic step copy", () => {
  test("names the place in every step", () => {
    const built = buildHowItWorksDict(vi.howItWorks, {
      name: "Nhật Bản",
      plans: JAPAN_PLANS,
      lang: "vi",
    });

    expect(built.title).toContain("Nhật Bản");
    expect(built.steps).toHaveLength(3);
    for (const step of built.steps) {
      expect(step.title).toContain("Nhật Bản");
    }
    // …and differs from the generic homepage wording.
    expect(built.title).not.toBe(vi.howItWorks.title);
  });

  test("writes the real plan lineup into the first step", () => {
    const built = buildHowItWorksDict(vi.howItWorks, {
      name: "Nhật Bản",
      plans: JAPAN_PLANS,
      lang: "vi",
    });

    expect(built.steps[0].note).toContain("2 gói");
    expect(built.steps[0].note).toContain("1GB – 20GB");
    expect(built.steps[0].note).toContain("3 – 30 ngày");
    expect(built.steps[0].note).toContain("120.000đ");
    // Only the plan-picking step carries the lineup.
    expect(built.steps[1].note).toBeUndefined();
  });

  test("mentions unlimited plans only when the place sells them", () => {
    const withUnlimited = buildHowItWorksDict(vi.howItWorks, {
      name: "Nhật Bản",
      lang: "vi",
      plans: payload({
        dataPlans: [plan({ dataMb: 3072, durationDays: 7 })],
        dailyUnlimited: [plan({ id: 8, dataMb: 0, durationDays: 7 })],
      }),
    });

    expect(withUnlimited.steps[0].note).toContain("không giới hạn");
    expect(
      buildHowItWorksDict(vi.howItWorks, {
        name: "Nhật Bản",
        plans: JAPAN_PLANS,
        lang: "vi",
      }).steps[0].note,
    ).not.toContain("không giới hạn");
  });

  test("drops the lineup sentence rather than printing a hole in it", () => {
    const built = buildHowItWorksDict(vi.howItWorks, {
      name: "Nhật Bản",
      plans: null,
      lang: "vi",
    });

    expect(built.steps[0].note).toBeUndefined();
    // The rest of the copy still names the country.
    expect(built.steps[0].title).toContain("Nhật Bản");
  });

  test("never leaks a raw ${...} placeholder to a visitor", () => {
    const built = buildHowItWorksDict(vi.howItWorks, {
      name: "Nhật Bản",
      plans: null,
      lang: "vi",
    });

    const strings = [
      built.subtitle,
      built.title,
      built.description,
      ...built.steps.flatMap((s) => [
        s.title,
        s.description,
        s.imageAlt,
        s.note ?? "",
      ]),
    ];
    for (const value of strings) {
      expect(value).not.toMatch(/\$\{\w+\}/);
    }
  });

  test("leaves the homepage copy alone", () => {
    const built = buildHowItWorksDict(vi.howItWorks, { lang: "vi" });

    expect(built.title).toBe(vi.howItWorks.title);
    expect(built.steps[0].description).toBe(
      vi.howItWorks.steps[0].description,
    );
  });

  test("does not double the word eSIM when the CMS name already has it", () => {
    // Region titles often read "eSIM Châu Âu"; "eSIM ${name}" would then say
    // "eSIM eSIM Châu Âu".
    expect(placeName("eSIM Châu Âu")).toBe("Châu Âu");
    expect(placeName("Nhật Bản")).toBe("Nhật Bản");

    const built = buildHowItWorksDict(vi.howItWorks, {
      name: "eSIM Châu Âu",
      plans: JAPAN_PLANS,
      lang: "vi",
    });
    expect(built.title).not.toMatch(/eSIM eSIM/i);
    expect(built.title).toContain("Châu Âu");
  });

  test("uses the English copy on the English locale", () => {
    const built = buildHowItWorksDict(en.howItWorks, {
      name: "Japan",
      plans: JAPAN_PLANS,
      lang: "en",
    });

    expect(built.title).toContain("Japan");
    expect(built.steps[0].note).toContain("3 – 30 days");
  });
});

/* ── Rendered section ── */

async function mockApi(page: Page, plans: unknown, slug = "esim-nhat-ban") {
  await page.route(`${API_BASE}/api/v1/destinations/slug/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: 10,
        name: "Japan",
        title: "Japan",
        titleVi: "Nhật Bản",
        slug: "esim-japan",
        slugVi: slug,
        countryCode: "JP",
        isPopular: true,
        isActive: true,
        createdAt: "",
        updatedAt: "",
      }),
    }),
  );
  await page.route(
    `${API_BASE}/api/v1/plans/by-destination/${slug}**`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(plans),
      }),
  );
}

test.describe("How it works on a country page", () => {
  test("renders the country's name and its plan lineup", async ({ page }) => {
    await mockApi(page, JAPAN_PLANS);
    await page.goto(
      "/esim-noi-dia/test?view=how-it-works&slug=esim-nhat-ban&lang=vi",
    );

    const section = page.getByTestId("section-HowSailyWorks");
    await expect(section).toBeVisible();
    await expect(section).toContainText("Nhật Bản");

    const note = page.getByTestId("how-it-works-note-0");
    await expect(note).toBeVisible();
    await expect(note).toContainText("1GB – 20GB");
    await expect(note).toContainText("120.000đ");
  });

  test("shows the steps without the lineup line when the place has no plans", async ({
    page,
  }) => {
    await mockApi(page, payload());
    await page.goto(
      "/esim-noi-dia/test?view=how-it-works&slug=esim-nhat-ban&lang=vi",
    );

    const section = page.getByTestId("section-HowSailyWorks");
    await expect(section).toContainText("Nhật Bản");
    await expect(page.getByTestId("how-it-works-note-0")).toHaveCount(0);
    // No placeholder leaked into the visible copy.
    await expect(section).not.toContainText("${");
  });
});
