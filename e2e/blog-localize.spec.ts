import { test, expect } from "@playwright/test";
import { blogPlanDestination, localizeMiniTag } from "../lib/blog-localize";
import type { BlogMiniTag } from "../lib/api";

/** #059 — English copy for the mini tag and the plan box in blog posts. */

const miniTag: BlogMiniTag = {
  id: "tag-1",
  image: null,
  title: "Mua eSIM du lịch quốc tế tại esim.vn",
  description: "eSIM Du Lịch tại hơn 200 quốc gia",
  contentButton: "Xem tất cả điểm đến",
  linkUrl: "https://esim.vn/diem-den",
  titleEn: "Buy a travel eSIM at esim.vn",
  descriptionEn: null,
  contentButtonEn: "See all destinations",
  linkUrlEn: "https://esim.vn/en/destinations",
};

test.describe("mini tag language", () => {
  test("keeps the Vietnamese copy on a Vietnamese post", () => {
    expect(localizeMiniTag(miniTag, "vi")).toEqual(miniTag);
  });

  test("uses the English copy on an English post", () => {
    const en = localizeMiniTag(miniTag, "en");
    expect(en.title).toBe("Buy a travel eSIM at esim.vn");
    expect(en.contentButton).toBe("See all destinations");
    expect(en.linkUrl).toBe("https://esim.vn/en/destinations");
  });

  test("falls back to Vietnamese for any English field left empty", () => {
    expect(localizeMiniTag(miniTag, "en").description).toBe("eSIM Du Lịch tại hơn 200 quốc gia");
    expect(localizeMiniTag({ ...miniTag, titleEn: "  " }, "en").title).toBe(miniTag.title);
  });
});

test.describe("plan box destination", () => {
  const china = { name: "China", slug: "esim-trung-quoc", slugVi: undefined, title: "China", titleVi: "Trung Quốc" };

  test("names the destination in the post's language", () => {
    expect(blogPlanDestination(china, "vi").name).toBe("Trung Quốc");
    expect(blogPlanDestination(china, "en").name).toBe("China");
  });

  test("links to the destination page in the post's language", () => {
    expect(blogPlanDestination(china, "vi").href).toBe("/esim-trung-quoc");
    expect(blogPlanDestination(china, "en").href).toBe("/en/esim-trung-quoc/");
    expect(blogPlanDestination({ ...china, slugVi: "esim-trung-quoc-vn" }, "vi").href).toBe(
      "/esim-trung-quoc-vn",
    );
  });

  test("has a readable fallback and no link without a destination", () => {
    expect(blogPlanDestination(null, "vi")).toEqual({ name: "nơi bạn đến", href: null });
    expect(blogPlanDestination(undefined, "en")).toEqual({ name: "this country", href: null });
  });
});
