import { test, expect } from "@playwright/test";
import {
  pickWhyChooseUs,
  prepareWhyChooseUs,
  whyChooseUsCount,
  WHY_CHOOSE_US_COUNT,
  WHY_CHOOSE_US_DEFAULT_COUNT,
} from "../lib/why-choose-us";
import type { WhyChooseUs } from "../lib/api";

/**
 * #087 — "TẠI SAO" blocks: variables and a random subset per page.
 *
 * The copy was fixed text and the page always took the first six by sort
 * order, so a seventh reason was written and never seen, and one record could
 * not say "eSIM ${name} chỉ từ ${fromPrice}" for every country at once.
 */

function reason(overrides: Partial<WhyChooseUs> = {}): WhyChooseUs {
  return {
    id: "r1",
    title: "Lý do",
    description: "Mô tả",
    icon: null,
    sortOrder: 0,
    isActive: true,
    language: "vi",
    type: "quoc_gia",
    createdAt: "",
    updatedAt: "",
    ...overrides,
  } as WhyChooseUs;
}

/** Ten reasons, sorted 0…9. */
function pool(): WhyChooseUs[] {
  return Array.from({ length: 10 }, (_, i) =>
    reason({ id: `r${i}`, title: `Lý do ${i}`, sortOrder: i }),
  );
}

/** RNG that walks a fixed sequence, so a draw can be asserted exactly. */
function seededRandom(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

test.describe("why-choose-us — how many are shown", () => {
  test("shows the configured number out of the whole pool", () => {
    const picked = pickWhyChooseUs(pool(), { count: 6 });

    expect(picked).toHaveLength(6);
    // Six of the ten, all distinct.
    expect(new Set(picked.map((p) => p.id)).size).toBe(6);
  });

  test("shows everything when the pool is smaller than the count", () => {
    const picked = pickWhyChooseUs(pool().slice(0, 4), { count: 6 });

    expect(picked).toHaveLength(4);
  });

  test("keeps the admin's sort order inside the drawn set", () => {
    const picked = pickWhyChooseUs(pool(), { count: 6 });
    const orders = picked.map((p) => p.sortOrder);

    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  test("leaves out inactive reasons", () => {
    const items = [
      reason({ id: "on", isActive: true }),
      reason({ id: "off", isActive: false }),
    ];

    expect(pickWhyChooseUs(items, { count: 6 }).map((p) => p.id)).toEqual(["on"]);
  });

  test("draws a different handful on another render", () => {
    // Two different RNG sequences must be able to produce different sets —
    // otherwise "random" would just be the first six again.
    const first = pickWhyChooseUs(pool(), {
      count: 6,
      random: seededRandom([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45]),
    });
    const second = pickWhyChooseUs(pool(), {
      count: 6,
      random: seededRandom([0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55]),
    });

    expect(first.map((p) => p.id)).not.toEqual(second.map((p) => p.id));
  });

  test("never shows the same reason twice", () => {
    for (let run = 0; run < 20; run += 1) {
      const picked = pickWhyChooseUs(pool(), { count: 6 });
      expect(new Set(picked.map((p) => p.id)).size).toBe(picked.length);
    }
  });

  test("has a per-page count, defaulting for anything unlisted", () => {
    expect(whyChooseUsCount("quoc_gia")).toBe(WHY_CHOOSE_US_COUNT.quoc_gia);
    expect(whyChooseUsCount("khong_co_trang_nay")).toBe(WHY_CHOOSE_US_DEFAULT_COUNT);
    expect(whyChooseUsCount(undefined)).toBe(WHY_CHOOSE_US_DEFAULT_COUNT);
  });

  test("#042 — the homepage type has its own count", () => {
    expect(WHY_CHOOSE_US_COUNT.trang_chu).toBeDefined();
    expect(whyChooseUsCount("trang_chu")).toBe(WHY_CHOOSE_US_COUNT.trang_chu);
  });

  test("#042 — the server hands over the whole pool, filled and ordered", () => {
    const items = [...pool()].reverse();
    items[0] = { ...items[0], title: "eSIM ${name}" };
    items.push(reason({ id: "off", isActive: false }));

    const prepared = prepareWhyChooseUs(items, { name: "Nhật Bản" });

    // All ten active reasons — the browser draws the handful, not the server.
    expect(prepared).toHaveLength(10);
    expect(prepared.map((p) => p.sortOrder)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(prepared.find((p) => p.sortOrder === 9)?.title).toBe("eSIM Nhật Bản");
  });

  test("#042 — drawing again from the prepared pool keeps the filled copy", () => {
    const prepared = prepareWhyChooseUs(
      [reason({ id: "a", title: "eSIM ${name}" }), ...pool()],
      { name: "Hàn Quốc" },
    );
    const drawn = pickWhyChooseUs(prepared, { count: 11 });

    expect(drawn.find((p) => p.id === "a")?.title).toBe("eSIM Hàn Quốc");
  });

  test("shows nothing rather than crashing on missing data", () => {
    expect(pickWhyChooseUs(null, { count: 6 })).toEqual([]);
    expect(pickWhyChooseUs(undefined, { count: 6 })).toEqual([]);
    expect(pickWhyChooseUs(pool(), { count: 0 })).toEqual([]);
  });
});

test.describe("why-choose-us — in the browser (#042)", () => {
  test.describe.configure({ mode: "serial", timeout: 600_000 });

  test("shows the configured count, and a different handful across visits", async ({ page }) => {
    // No backend in this test: answer any stray API call at once.
    await page.route("http://localhost:3001/**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: '{"data":[]}' }),
    );
    const cards = page.locator('[data-testid="why-choose-us-card"]:visible');
    const seen = new Set<string>();

    for (let visit = 0; visit < 6; visit += 1) {
      // The first visit compiles the harness page under `next dev`.
      await page.goto("/esim-noi-dia/test?view=why-choose-us&count=6", {
        waitUntil: "domcontentloaded",
        timeout: visit === 0 ? 300_000 : 60_000,
      });
      await expect(page.getByTestId("local-test-meta")).toBeVisible({ timeout: 60_000 });
      await expect(cards).toHaveCount(6, { timeout: 30_000 });

      // Wait for the post-hydration draw to settle before reading the set.
      await page.waitForTimeout(500);
      const titles = await cards.locator("h3").allTextContents();
      expect(new Set(titles).size).toBe(6);
      // Still in the admin's order inside the drawn set.
      const orders = titles.map((t) => Number(t.replace(/\D/g, "")));
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      seen.add(titles.join("|"));
    }

    // Six random 6-of-10 draws all landing on the same set is ~1 in 10^11.
    expect(seen.size).toBeGreaterThan(1);
  });
});

test.describe("why-choose-us — template variables", () => {
  test("fills the country name and price into the copy", () => {
    const items = [
      reason({
        title: "eSIM ${name} chỉ từ ${fromPrice}",
        description: "${planCount} gói cho ${name}, dung lượng ${dataRange}",
      }),
    ];

    const [picked] = pickWhyChooseUs(items, {
      count: 1,
      vars: {
        name: "Nhật Bản",
        fromPrice: "120.000đ",
        planCount: "12",
        dataRange: "1GB – 20GB",
      },
    });

    expect(picked.title).toBe("eSIM Nhật Bản chỉ từ 120.000đ");
    expect(picked.description).toBe("12 gói cho Nhật Bản, dung lượng 1GB – 20GB");
  });

  test("leaves an unknown variable visible so the admin spots it", () => {
    const items = [reason({ title: "eSIM ${name} từ ${fromPrice}" })];

    const [picked] = pickWhyChooseUs(items, {
      count: 1,
      vars: { name: "Hàn Quốc" },
    });

    // The price is unknown on this page; the placeholder stays rather than
    // silently becoming an empty gap in the sentence.
    expect(picked.title).toBe("eSIM Hàn Quốc từ ${fromPrice}");
  });

  test("leaves plain copy untouched", () => {
    const items = [reason({ title: "Kích hoạt trong 2 phút" })];

    expect(pickWhyChooseUs(items, { count: 1, vars: { name: "Nhật Bản" } })[0].title).toBe(
      "Kích hoạt trong 2 phút",
    );
  });

  test("does not mutate the records it was given", () => {
    const items = [reason({ title: "eSIM ${name}" })];

    pickWhyChooseUs(items, { count: 1, vars: { name: "Thái Lan" } });

    expect(items[0].title).toBe("eSIM ${name}");
  });
});
