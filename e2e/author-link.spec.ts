import { test, expect } from "@playwright/test";
import {
  authorHref,
  authorSlug,
} from "../components/layout/sections/blog-page/blog-detail-helpers";

/**
 * #068 — clicking an author has to reach that author's page.
 *
 * The page and its API existed; what did not work was getting there. Four
 * different places built the link by guessing a slug from the display name, and
 * the guess only lowercased and hyphenated — so "Nguyễn Văn A" produced
 * "nguyễn-văn-a" while the author record holds "nguyen-van-a". Every Vietnamese
 * byline led to a 404, and a custom slug set in the CMS was ignored entirely.
 */

test.describe("Author slug", () => {
  test("strips Vietnamese accents the way the backend does", () => {
    expect(authorSlug("Nguyễn Văn A")).toBe("nguyen-van-a");
    expect(authorSlug("Trần Bình Đông")).toBe("tran-binh-dong");
    expect(authorSlug("John Doe")).toBe("john-doe");
  });

  test("collapses punctuation and repeated spaces", () => {
    expect(authorSlug("Lê   Thị  Hoa")).toBe("le-thi-hoa");
    expect(authorSlug("D'Angelo Smith")).toBe("dangelo-smith");
  });
});

test.describe("Author link", () => {
  test("uses the slug the author record carries, not the name", () => {
    // An admin can set any slug in the CMS; guessing from the name would 404.
    expect(
      authorHref({ author: "Nguyễn Văn A", authorSlug: "biên-tập-viên" }, "vi"),
    ).toBe(`/blog/author/${encodeURIComponent("biên-tập-viên")}`);
  });

  test("prefers the author profile when the blog carries one", () => {
    expect(
      authorHref(
        { author: "Nguyễn Văn A", authorProfile: { slug: "nva" } },
        "vi",
      ),
    ).toBe("/blog/author/nva");
  });

  test("falls back to the normalized name when there is no slug", () => {
    expect(authorHref({ author: "Nguyễn Văn A" }, "vi")).toBe(
      "/blog/author/nguyen-van-a",
    );
  });

  test("omits the locale prefix on Vietnamese, adds it on English", () => {
    // vi is the default locale and has no prefix (localePrefix: 'as-needed').
    expect(authorHref({ author: "John Doe" }, "vi")).toBe(
      "/blog/author/john-doe",
    );
    expect(authorHref({ author: "John Doe" }, "en")).toBe(
      "/en/blog/author/john-doe",
    );
  });

  test("returns nothing when there is no author to link to", () => {
    // The byline then renders as plain text rather than a dead link.
    expect(authorHref({ author: null }, "vi")).toBeNull();
    expect(authorHref({ author: "" }, "vi")).toBeNull();
    expect(authorHref({}, "vi")).toBeNull();
  });

  test("ignores a blank slug rather than linking to nowhere", () => {
    expect(
      authorHref({ author: "Nguyễn Văn A", authorSlug: "   " }, "vi"),
    ).toBe("/blog/author/nguyen-van-a");
  });
});
