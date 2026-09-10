import { test, expect } from "@playwright/test";
import {
  buildDonutSegments,
  formatData,
  formatHours,
  formatShare,
  monthlyMb,
  totalDailyMb,
} from "../lib/data-calculator-chart";
import { CHART_COLORS, DATA_RATES } from "../components/layout/sections/data-calculator/calculator-data";

/**
 * #077 — the ring in the data calculator did not match its own numbers.
 *
 * `paddingAngle={1}` took a fixed degree off every slice, which erased the
 * small activities (email at 4 MB/h, maps at 10 MB/h) while they stayed in the
 * legend; activities with hours but no data still occupied a slot, so the
 * hover index landed on the wrong activity; and nothing said what share a
 * colour stood for.
 *
 * Thọ's note "đổi lại vị trí data với time": the centre now leads with the
 * data and keeps the hours as the caption.
 */

const HARNESS = "/esim-noi-dia/test?view=donut&lang=vi";

const OPTS = { rates: DATA_RATES, colors: CHART_COLORS };

test.describe("data calculator ring — maths", () => {
  test("sizes every slice by the data it actually uses", () => {
    // 1h social (150MB) + 1h video call (1000MB) → 13% / 87%.
    const segments = buildDonutSegments({ socialMedia: 1, videoCalls: 1 }, OPTS);

    expect(segments.map((s) => s.key)).toEqual(["videoCalls", "socialMedia"]);
    expect(totalDailyMb(segments)).toBe(1150);
    expect(formatShare(segments[0].share)).toBe("87%");
    expect(formatShare(segments[1].share)).toBe("13%");
    expect(segments.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1, 10);
  });

  test("keeps a tiny activity as its own slice instead of dropping it", () => {
    // 30 minutes of email is 2MB against a gigabyte — it must still be there.
    const segments = buildDonutSegments(
      { videoCalls: 1, emailsMessaging: 0.5 },
      OPTS,
    );

    expect(segments.map((s) => s.key)).toEqual(["videoCalls", "emailsMessaging"]);
    expect(segments[1].dailyMb).toBe(2);
    expect(formatShare(segments[1].share)).toBe("<1%");
  });

  test("drops activities that consume no data, so hover cannot land on them", () => {
    const segments = buildDonutSegments(
      { socialMedia: 1, unknownActivity: 3, streamingMusic: 0 },
      OPTS,
    );

    expect(segments.map((s) => s.key)).toEqual(["socialMedia"]);
  });

  test("ignores nonsense hour values rather than drawing NaN", () => {
    const segments = buildDonutSegments(
      { socialMedia: Number.NaN, webBrowsing: -2, streamingMusic: 1 },
      OPTS,
    );

    expect(segments.map((s) => s.key)).toEqual(["streamingMusic"]);
    expect(totalDailyMb(segments)).toBe(100);
  });

  test("gives every slice the colour configured for its activity", () => {
    const segments = buildDonutSegments({ socialMedia: 1, videoCalls: 1 }, OPTS);

    for (const segment of segments) {
      expect(segment.color).toBe(CHART_COLORS[segment.key]);
    }
  });

  test("a month is thirty days of the same usage", () => {
    expect(monthlyMb(1150)).toBe(34_500);
    expect(formatData(monthlyMb(1150))).toBe("34.5 GB");
  });

  test("shows MB below a gigabyte and GB above it", () => {
    expect(formatData(0)).toBe("0 GB");
    expect(formatData(2)).toBe("2 MB");
    expect(formatData(999)).toBe("999 MB");
    expect(formatData(1000)).toBe("1.0 GB");
    expect(formatHours(2)).toBe("2");
    expect(formatHours(1.5)).toBe("1.5");
  });
});

test.describe("data calculator ring — on screen", () => {
  test("draws one slice per activity that uses data", async ({ page }) => {
    await page.goto(`${HARNESS}&values=videoCalls:1,socialMedia:1,emailsMessaging:0.5`);

    // Three activities with data → three sectors, small one included.
    await expect(page.locator("path.recharts-sector")).toHaveCount(3, {
      timeout: 20_000,
    });
    await expect(page.getByTestId("donut-legend-emailsMessaging")).toBeVisible();
  });

  test("leaves out an activity that consumes nothing", async ({ page }) => {
    await page.goto(`${HARNESS}&values=videoCalls:1,streamingMusic:0`);

    await expect(page.locator("path.recharts-sector")).toHaveCount(1, {
      timeout: 20_000,
    });
    await expect(page.getByTestId("donut-legend-streamingMusic")).toHaveCount(0);
  });

  test("spells out the data and share behind every colour", async ({ page }) => {
    await page.goto(`${HARNESS}&values=videoCalls:1,socialMedia:1`);

    await expect(page.getByTestId("donut-legend-videoCalls")).toContainText("1.0 GB", {
      timeout: 20_000,
    });
    await expect(page.getByTestId("donut-legend-videoCalls")).toContainText("87%");
    await expect(page.getByTestId("donut-legend-socialMedia")).toContainText("150 MB");
    await expect(page.getByTestId("donut-legend-socialMedia")).toContainText("13%");
  });

  test("shows the monthly total, with the daily figure underneath", async ({ page }) => {
    await page.goto(`${HARNESS}&values=videoCalls:1,socialMedia:1`);

    await expect(page.getByTestId("donut-total-monthly")).toHaveText("34.5 GB", {
      timeout: 20_000,
    });
    await expect(page.getByTestId("donut-total-daily")).toContainText("1.1 GB");
    await expect(page.getByTestId("donut-total-daily")).toContainText("mỗi ngày");
  });

  test("hovering the legend leads with the data and keeps the hours as caption", async ({
    page,
  }) => {
    await page.goto(`${HARNESS}&values=videoCalls:2,socialMedia:1`);

    await page.getByTestId("donut-legend-socialMedia").hover({ timeout: 20_000 });

    // Data is the headline (#077 — "đổi lại vị trí data với time")…
    await expect(page.getByTestId("donut-active-data")).toHaveText("150 MB");
    // …and the time it came from is the caption, with the share.
    await expect(page.getByTestId("donut-active-time")).toContainText("1 giờ/ngày");
    await expect(page.getByTestId("donut-active-time")).toContainText("7%");
  });

  test("goes back to the total when the pointer leaves", async ({ page }) => {
    await page.goto(`${HARNESS}&values=videoCalls:2,socialMedia:1`);

    const legendRow = page.getByTestId("donut-legend-socialMedia");
    await legendRow.hover({ timeout: 20_000 });
    await expect(page.getByTestId("donut-active-data")).toBeVisible();

    await page.getByTestId("local-test-meta").hover();
    await expect(page.getByTestId("donut-total-monthly")).toBeVisible();
  });
});
