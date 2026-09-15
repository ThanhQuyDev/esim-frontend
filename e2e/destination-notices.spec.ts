import { test, expect } from "@playwright/test";
import { installBeforeTripNotice, requiresInstallBeforeTrip } from "../lib/destination-notices";

/** #060 — "install the eSIM before the trip" warning, Turkey only. */
test.describe("install-before-trip notice", () => {
  test("applies to Turkey", () => {
    expect(requiresInstallBeforeTrip({ countryCode: "TR", slug: "esim-tho-nhi-ky" })).toBe(true);
    expect(requiresInstallBeforeTrip({ countryCode: "tr" })).toBe(true);
    // No country code loaded: recognised by its slug.
    expect(requiresInstallBeforeTrip({ slug: "/esim-tho-nhi-ky" })).toBe(true);
  });

  test("does not apply anywhere else", () => {
    expect(requiresInstallBeforeTrip({ countryCode: "JP", slug: "esim-nhat-ban" })).toBe(false);
    // Turks and Caicos is not Turkey.
    expect(
      requiresInstallBeforeTrip({ countryCode: "TC", slug: "esim-quan-dao-turks-va-caicos" }),
    ).toBe(false);
    expect(requiresInstallBeforeTrip({ slug: "esim-chau-au" })).toBe(false);
    expect(requiresInstallBeforeTrip(null)).toBe(false);
  });

  test("tells the customer to install before leaving, in both languages", () => {
    expect(installBeforeTripNotice("vi").title).toBe("Cài đặt eSIM trước chuyến đi");
    expect(installBeforeTripNotice("vi").body).toContain("trước khi khởi hành");
    expect(installBeforeTripNotice("en").title).toBe("Install your eSIM before you travel");
    expect(installBeforeTripNotice("en").body).toContain("before you leave");
  });
});
