import { test, expect } from "@playwright/test";
import { authorSlugFromPath, buildAuthorPageSchema } from "../lib/author-schema";

/**
 * #050 (test round 4) — the author page carried only a breadcrumb, so the
 * profile every post's `author` points to said nothing about the author.
 */

const author = {
  id: 1,
  userId: 1,
  name: "Đức Thọ",
  nameEn: "Duc Tho",
  slug: "duc-tho",
  avatar: "https://cdn.example/tho.jpg",
  description: "Chuyên gia eSIM du lịch",
  descriptionEn: "Travel eSIM specialist",
};

const blog = (slug: string, title: string) =>
  ({
    slug: `/${slug}`,
    title,
    publishedAt: "2026-09-01T00:00:00.000Z",
    createdAt: "2026-08-30T00:00:00.000Z",
    isPublished: true,
  }) as never;

test("reads the author slug only from an author path", () => {
  expect(authorSlugFromPath("/blog/author/duc-tho")).toBe("duc-tho");
  expect(authorSlugFromPath("/blog/author/duc-tho/")).toBe("duc-tho");
  expect(authorSlugFromPath("/blog/esim-trung-quoc")).toBeNull();
  expect(authorSlugFromPath("/blog/author")).toBeNull();
});

test("describes the author as a Person on a ProfilePage", () => {
  const schema = buildAuthorPageSchema({
    author,
    blogs: [blog("bang-gia-esim-trung-quoc", "Bảng giá eSIM Trung Quốc")],
    path: "/blog/author/duc-tho",
    lang: "vi",
  }) as Record<string, any>;

  expect(schema["@type"]).toBe("ProfilePage");
  expect(schema.mainEntity).toMatchObject({
    "@type": "Person",
    name: "Đức Thọ",
    description: "Chuyên gia eSIM du lịch",
    image: "https://cdn.example/tho.jpg",
  });
  expect(schema.mainEntity.url).toContain("/blog/author/duc-tho");
  // Same @id the post page gives its BlogPosting, so the two join up.
  expect(schema.hasPart[0]["@id"]).toMatch(/\/blog\/bang-gia-esim-trung-quoc#article$/);
  expect(schema.hasPart[0].author).toEqual({ "@id": schema.mainEntity["@id"] });
});

test("uses the English name and bio on the English page", () => {
  const schema = buildAuthorPageSchema({
    author,
    blogs: [],
    path: "/en/blog/author/duc-tho",
    lang: "en",
  }) as Record<string, any>;

  expect(schema.mainEntity.name).toBe("Duc Tho");
  expect(schema.mainEntity.description).toBe("Travel eSIM specialist");
  expect(schema.hasPart).toBeUndefined();
});
