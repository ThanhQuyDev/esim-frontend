import { test, expect } from "@playwright/test";
import {
  buildFooterColumns,
  footerColumnKey,
  pickLocalizedCategory,
} from "../lib/footer-groups";
import type { Footer } from "../lib/api";

/**
 * #088 — bilingual footer column headings.
 *
 * A footer row's link text was already bilingual, but the heading above it was
 * one string that showed in both languages AND doubled as the grouping key.
 * An admin who typed "Sản phẩm" on some rows and "Products" on others ended up
 * with two half-filled columns, and English visitors read Vietnamese headings.
 */

function link(overrides: Partial<Footer> = {}): Footer {
  return {
    id: "f1",
    title: "About us",
    titleVi: "Về chúng tôi",
    url: "/about",
    sortOrder: 0,
    categories: "Company",
    categoriesVi: "Công ty",
    iconUrl: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

test.describe("footer columns — headings", () => {
  test("shows the Vietnamese heading on the Vietnamese site", () => {
    const [column] = buildFooterColumns([link()], "vi", "Liên kết");

    expect(column.title).toBe("Công ty");
  });

  test("shows the default heading everywhere else", () => {
    const [column] = buildFooterColumns([link()], "en", "Links");

    expect(column.title).toBe("Company");
  });

  test("falls back to the other language rather than an empty heading", () => {
    expect(pickLocalizedCategory({ categories: "Company" }, "vi")).toBe("Company");
    expect(pickLocalizedCategory({ categoriesVi: "Công ty" }, "en")).toBe("Công ty");
  });

  test("uses the page's own wording when a row has no heading at all", () => {
    const rows = [link({ categories: null, categoriesVi: null })];

    expect(buildFooterColumns(rows, "vi", "Liên kết")[0].title).toBe("Liên kết");
    expect(buildFooterColumns(rows, "en", "Links")[0].title).toBe("Links");
  });
});

test.describe("footer columns — grouping", () => {
  test("keeps rows of one column together whichever language they were typed in", () => {
    const rows = [
      link({ id: "a", categories: "Support", categoriesVi: "Hỗ trợ" }),
      // Same column, but only the Vietnamese heading was filled in.
      link({ id: "b", categories: "Support", categoriesVi: "" }),
    ];

    const columns = buildFooterColumns(rows, "vi", "Liên kết");

    expect(columns).toHaveLength(1);
    expect(columns[0].links.map((l) => l.id)).toEqual(["a", "b"]);
    expect(columns[0].title).toBe("Hỗ trợ");
  });

  test("groups on the default heading, not on the displayed one", () => {
    expect(footerColumnKey({ categories: "Support", categoriesVi: "Hỗ trợ" })).toBe(
      "support",
    );
    // Case and padding must not split a column either.
    expect(footerColumnKey({ categories: "  SUPPORT " })).toBe("support");
  });

  test("orders links by sortOrder, then by creation", () => {
    const rows = [
      link({ id: "third", sortOrder: 2, createdAt: "2026-01-03" }),
      link({ id: "first", sortOrder: 1, createdAt: "2026-01-01" }),
      link({ id: "second", sortOrder: 1, createdAt: "2026-01-02" }),
    ];

    const [column] = buildFooterColumns(rows, "vi", "Liên kết");

    expect(column.links.map((l) => l.id)).toEqual(["first", "second", "third"]);
  });

  test("keeps the social column last, in either language", () => {
    const viRows = [
      link({ id: "social", categories: "Follow us", categoriesVi: "Theo dõi" }),
      link({ id: "company", categories: "Company", categoriesVi: "Công ty" }),
    ];

    expect(buildFooterColumns(viRows, "vi", "Liên kết").map((c) => c.title)).toEqual([
      "Công ty",
      "Theo dõi",
    ]);
    expect(buildFooterColumns(viRows, "en", "Links").map((c) => c.title)).toEqual([
      "Company",
      "Follow us",
    ]);
  });

  test("skips rows with no label or no url", () => {
    const rows = [
      link({ id: "ok" }),
      link({ id: "no-url", url: "  " }),
      link({ id: "no-label", title: "", titleVi: "" }),
    ];

    const [column] = buildFooterColumns(rows, "vi", "Liên kết");

    expect(column.links.map((l) => l.id)).toEqual(["ok"]);
  });

  test("renders nothing rather than crashing on missing data", () => {
    expect(buildFooterColumns(null, "vi", "Liên kết")).toEqual([]);
    expect(buildFooterColumns(undefined, "en", "Links")).toEqual([]);
    expect(buildFooterColumns([], "vi", "Liên kết")).toEqual([]);
  });
});
