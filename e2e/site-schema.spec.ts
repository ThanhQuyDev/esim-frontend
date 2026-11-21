import { test, expect } from "@playwright/test";
import {
  buildItemPageSchema,
  buildWebSiteSchema,
} from "../lib/site-schema";
import { buildArticleSchema } from "../lib/article-schema";
import type { Blog } from "../lib/api";

/**
 * #076 — the schema.org types that were missing: `WebSite` and `Service` on the
 * homepage, `ItemPage` on product pages, and `BlogPosting` + author on posts.
 *
 * Schema is a statement to a search engine about what a page is, so what these
 * tests guard is that nothing is asserted that is not true: no search box the site
 * does not have, no author invented for an unsigned post, no date made up from a
 * missing field.
 */

const blog = (over: Partial<Blog>): Blog =>
  ({
    id: "1",
    title: "eSIM Nhật Bản dùng thế nào",
    slug: "esim-nhat-ban",
    excerpt: "Hướng dẫn ngắn",
    coverImage: "https://cdn/x.png",
    content: "",
    language: "vi",
    isPublished: true,
    publishedAt: "2026-03-01T00:00:00.000Z",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-03-05T00:00:00.000Z",
    author: null,
    category: "Hướng dẫn",
    miniTag: null,
    planIds: null,
    plans: null,
    timeRead: 5,
    ...over,
  }) as Blog;

test.describe("WebSite schema", () => {
  test("names the site so Google does not guess from the domain", () => {
    const schema = buildWebSiteSchema("vi") as Record<string, unknown>;

    expect(schema["@type"]).toBe("WebSite");
    expect(schema.name).toBe("esim.vn");
    expect(schema.inLanguage).toBe("vi-VN");
  });

  test("claims no site search, because there is none", () => {
    // A SearchAction advertises a site-wide search box. This site only has search
    // inside the blog and the help centre, so pointing it there would send
    // somebody looking for an eSIM into a list of articles.
    const schema = buildWebSiteSchema("vi") as Record<string, unknown>;

    expect(schema).not.toHaveProperty("potentialAction");
  });

  test("carries the description from the schema document (vande-2011 #046)", () => {
    expect(String(buildWebSiteSchema("vi").description)).toMatch(/^esim\.vn là website chính thức/);
    expect(String(buildWebSiteSchema("en").description)).toMatch(/^esim\.vn is the official website/);
  });

  test("points at the right origin per language", () => {
    expect(buildWebSiteSchema("en").url).toMatch(/\/en$/);
    expect(buildWebSiteSchema("vi").url).toMatch(/\/$/);
  });
});

test.describe("ItemPage schema", () => {
  test("ties the page to the site and leaves out an empty description", () => {
    const schema = buildItemPageSchema({
      path: "/nhat-ban",
      name: "eSIM Nhật Bản",
      description: null,
      lang: "vi",
    }) as Record<string, unknown>;

    expect(schema["@type"]).toBe("ItemPage");
    expect(schema.url).toBe("https://esim.vn/nhat-ban");
    expect(schema.isPartOf).toEqual({ "@id": "https://esim.vn/#website" });
    expect(schema).not.toHaveProperty("description");
  });
});

test.describe("BlogPosting schema", () => {
  test("carries the headline, dates and section", () => {
    const schema = buildArticleSchema({
      blog: blog({}),
      path: "/blog/esim-nhat-ban",
      lang: "vi",
    }) as Record<string, unknown>;

    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("eSIM Nhật Bản dùng thế nào");
    expect(schema.datePublished).toBe("2026-03-01T00:00:00.000Z");
    expect(schema.dateModified).toBe("2026-03-05T00:00:00.000Z");
    expect(schema.articleSection).toBe("Hướng dẫn");
  });

  test("names the author as a Person, with a link to their page", () => {
    const schema = buildArticleSchema({
      blog: blog({
        author: "Nguyễn Văn A",
        authorSlug: "nguyen-van-a",
        authorAvatar: "https://cdn/a.png",
      }),
      path: "/blog/x",
      lang: "vi",
    }) as Record<string, unknown>;

    expect(schema.author).toEqual({
      "@type": "Person",
      name: "Nguyễn Văn A",
      url: "https://esim.vn/blog/author/nguyen-van-a",
      image: "https://cdn/a.png",
    });
  });

  test("credits the publisher rather than inventing a person", () => {
    // An unsigned house piece has no author; making one up is a lie in markup.
    const schema = buildArticleSchema({
      blog: blog({ author: null, authorProfile: null }),
      path: "/blog/x",
      lang: "vi",
    }) as Record<string, unknown>;

    expect(schema.author).toEqual({ "@id": "https://esim.vn/#organization" });
  });

  test("falls back to the created date, and omits a date it cannot read", () => {
    expect(
      buildArticleSchema({
        blog: blog({ publishedAt: null }),
        path: "/blog/x",
        lang: "vi",
      }).datePublished,
    ).toBe("2026-02-01T00:00:00.000Z");

    const undated = buildArticleSchema({
      blog: blog({ publishedAt: null, createdAt: "not a date", updatedAt: "" }),
      path: "/blog/x",
      lang: "vi",
    }) as Record<string, unknown>;
    expect(undated).not.toHaveProperty("datePublished");
    expect(undated).not.toHaveProperty("dateModified");
  });
});
