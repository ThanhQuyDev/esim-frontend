import { test, expect } from "@playwright/test";
import {
  activationDeadlineText,
  formatActivationDate,
} from "../lib/plan-activation";
import { dailyResetText, hasDailyAllowance } from "../lib/plan-daily-reset";

/**
 * The two rows added to the "Giao hàng & Kích hoạt" tab: when the eSIM must be
 * activated by (#070) and when the daily allowance comes back (#071).
 *
 * Both replace sentences that were hard-coded for the whole catalogue and wrong
 * for much of it. Both are read as commitments, so the behaviour worth pinning is
 * that they say nothing at all when the supplier has not told us — never a
 * plausible-looking default.
 */

test.describe("activation deadline row (#070)", () => {
  test("prints the API's date the way Vietnamese customers read it", () => {
    expect(formatActivationDate("2026-09-26")).toBe("26/09/2026");
    expect(
      activationDeadlineText({ activationDeadline: "2026-09-26" }, "vi"),
    ).toBe("Kích hoạt eSIM trước ngày 26/09/2026");
    expect(
      activationDeadlineText({ activationDeadline: "2026-09-26" }, "en"),
    ).toBe("Activate the eSIM before 26/09/2026");
  });

  test("says nothing when the supplier stated no window", () => {
    // Airalo and Billion expose no activation window; the row keeps its generic
    // wording rather than inheriting somebody else's 180 days.
    expect(activationDeadlineText({ activationDeadline: null }, "vi")).toBeNull();
    expect(activationDeadlineText({}, "vi")).toBeNull();
    expect(activationDeadlineText(null, "vi")).toBeNull();
  });

  test("refuses a value that is not a date", () => {
    expect(formatActivationDate("soon")).toBeNull();
    expect(
      activationDeadlineText({ activationDeadline: "26/09/2026" }, "vi"),
    ).toBeNull();
  });
});

test.describe("daily reset row (#071)", () => {
  const daily = { type: "daily" as const };

  test("describes a rolling 24-hour cycle", () => {
    expect(
      dailyResetText({ ...daily, dailyResetPolicy: "rolling_24h" }, "vi"),
    ).toBe("Mỗi ngày được tính theo chu kỳ 24 giờ kể từ lúc bạn cài eSIM.");
  });

  test("names the supplier's own timezone, not a fixed one", () => {
    // Viettel and the domestic eSIMs run on UTC+7, the Chinese suppliers UTC+8.
    // The ticket's sample copy says UTC+8, which would be wrong for half the
    // catalogue if it were pinned.
    expect(
      dailyResetText(
        { ...daily, dailyResetPolicy: "calendar_day", dailyResetUtcOffset: 7 },
        "vi",
      ),
    ).toBe(
      "Mỗi ngày được tính đến 23:59 (UTC+7) không phụ thuộc vào múi giờ nơi bạn cài SIM vào thiết bị.",
    );
    expect(
      dailyResetText(
        { ...daily, dailyResetPolicy: "calendar_day", dailyResetUtcOffset: 8 },
        "vi",
      ),
    ).toContain("(UTC+8)");
  });

  test("omits the row for a plan that has no daily allowance", () => {
    // A single total pool of data has no "each day" to reset.
    expect(hasDailyAllowance({ type: "fixed" })).toBe(false);
    expect(
      dailyResetText({ type: "fixed", dailyResetPolicy: "rolling_24h" }, "vi"),
    ).toBeNull();
    expect(hasDailyAllowance({ type: "unlimited" })).toBe(true);
  });

  test("omits the row when the supplier has not stated the cycle", () => {
    // Billion and MicroEsim, until their API field is confirmed.
    expect(dailyResetText({ ...daily, dailyResetPolicy: null }, "vi")).toBeNull();
    expect(dailyResetText(daily, "vi")).toBeNull();
    expect(dailyResetText(null, "vi")).toBeNull();
  });
});
