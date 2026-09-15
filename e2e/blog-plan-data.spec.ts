import { test, expect } from "@playwright/test";
import { formatBlogPlanData, formatDataSize } from "../lib/blog-plan-data";

/**
 * #057 — plans embedded in a blog post: unlimited plans read "0MB", and daily
 * plans did not say their allowance is per day.
 */
test.describe("blog plan data line", () => {
  test("shows a fixed plan's total allowance", () => {
    expect(formatBlogPlanData({ type: "fixed", dataMb: 5120 }, "vi")).toBe("5 GB");
    expect(formatBlogPlanData({ type: "fixed", dataMb: 500 }, "vi")).toBe("500 MB");
    expect(formatBlogPlanData({ type: "fixed", dataMb: 20480 }, "en")).toBe("20 GB");
  });

  test("shows a daily plan's allowance per day", () => {
    expect(formatBlogPlanData({ type: "daily", dataMb: 2048 }, "vi")).toBe("2 GB/ngày");
    expect(formatBlogPlanData({ type: "daily", dataMb: 3072 }, "en")).toBe("3 GB/day");
    expect(formatBlogPlanData({ type: "daily", dataMb: 500 }, "vi")).toBe("500 MB/ngày");
  });

  test("shows an unlimited plan as unlimited, never 0 MB", () => {
    expect(formatBlogPlanData({ type: "unlimited", dataMb: 0 }, "vi")).toBe("Không giới hạn");
    expect(formatBlogPlanData({ type: "unlimited", dataMb: 0 }, "en")).toBe("Unlimited");
    expect(formatBlogPlanData({ type: "unlimited-reduce", dataMb: 0 }, "vi")).toBe("Không giới hạn");
    expect(formatBlogPlanData({ type: "fixed", dataMb: 0 }, "vi")).toBe("Không giới hạn");
  });

  test("shows the high-speed daily allowance of a throttled unlimited plan", () => {
    expect(formatBlogPlanData({ type: "unlimited-reduce", dataMb: 2048 }, "vi")).toBe(
      "Không giới hạn (2 GB/ngày tốc độ cao)",
    );
    expect(formatBlogPlanData({ type: "unlimited-reduce", dataMb: 1536 }, "en")).toBe(
      "Unlimited (1.5 GB/day high-speed)",
    );
  });

  test("rounds sizes like the destination page", () => {
    expect(formatDataSize(1536)).toBe("1.5 GB");
    expect(formatDataSize(10240)).toBe("10 GB");
    expect(formatDataSize(300)).toBe("300 MB");
  });
});
