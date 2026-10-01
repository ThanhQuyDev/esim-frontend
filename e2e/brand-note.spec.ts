import { test, expect } from "@playwright/test";
import { brandNote } from "../lib/brand-note";

/**
 * #079 — the extra note under a brand on the supported-devices page.
 *
 * The page showed exactly one note: a string in the locale file, rendered only
 * when the brand was literally called "iPhone". Any other brand needing a caveat
 * had nowhere to put it. The note now comes from the CMS per brand and per
 * language, and what these tests pin is that the rollout cannot make the page
 * worse than it is today: iPhone keeps its wording until something replaces it.
 */

const FALLBACK = "iPhone bán ở Trung Quốc đại lục không hỗ trợ eSIM…";

test.describe("brand note", () => {
  test("prefers what the admin configured", () => {
    expect(
      brandNote({ manufacturer: "iPhone", note: "Ghi chú mới" }, FALLBACK),
    ).toBe("Ghi chú mới");
  });

  test("gives any brand a note, not just iPhone", () => {
    // The whole point: Samsung could not carry a caveat before.
    expect(
      brandNote({ manufacturer: "Samsung", note: "Máy bán ở Mỹ bị lock" }, FALLBACK),
    ).toBe("Máy bán ở Mỹ bị lock");
  });

  test("keeps the old iPhone wording until something replaces it", () => {
    // So the page reads the same the moment this ships, before anything is
    // configured and even if the notes come back empty.
    expect(brandNote({ manufacturer: "iPhone", note: null }, FALLBACK)).toBe(
      FALLBACK,
    );
    expect(brandNote({ manufacturer: "iPhone" }, FALLBACK)).toBe(FALLBACK);
    // Whitespace is not a note.
    expect(brandNote({ manufacturer: "iPhone", note: "   " }, FALLBACK)).toBe(
      FALLBACK,
    );
  });

  test("does not lose the fallback to a differently typed brand name", () => {
    // The brand is typed by hand in the CMS.
    expect(brandNote({ manufacturer: "IPHONE" }, FALLBACK)).toBe(FALLBACK);
    expect(brandNote({ manufacturer: "  iphone  " }, FALLBACK)).toBe(FALLBACK);
  });

  test("shows nothing for a brand with no note", () => {
    expect(brandNote({ manufacturer: "Samsung" }, FALLBACK)).toBeNull();
    expect(brandNote({ manufacturer: "Google", note: null }, FALLBACK)).toBeNull();
  });

  test("shows nothing when there is no fallback either", () => {
    expect(brandNote({ manufacturer: "iPhone" }, undefined)).toBeNull();
    expect(brandNote({ manufacturer: "iPhone" }, "  ")).toBeNull();
  });
});
