import { test, expect } from "@playwright/test";
import { toExploreCard, withCmsMenuSlides } from "../lib/menu-slides";
import type { MenuSlide } from "../lib/api";

/**
 * #073 — the mega-menu "Explore" carousels, managed from the CMS.
 *
 * The cards were hard-coded in `navbar.tsx`, still pointing at the reference
 * design's NordVPN CDN images. What these tests pin is the rollout rule: a panel
 * the admin has configured shows exactly those slides, and a panel they have not
 * keeps its built-in cards — so the menu can never come out blank, including when
 * the API is unreachable and the whole payload is empty.
 */

const builtIn = {
  product: {
    explore: [
      { title: "Built-in A", desc: "a", href: "/a", image: "/a.png", imageAlt: "A" },
    ],
  },
  help: {
    explore: [
      { title: "Built-in B", desc: "b", href: "/b", image: "/b.png", imageAlt: "B" },
    ],
  },
};

const slide = (over: Partial<MenuSlide>): MenuSlide =>
  ({
    id: "1",
    menuKey: "product",
    title: "CMS slide",
    description: "from the cms",
    href: "/cms",
    image: "/cms.png",
    imageAlt: "CMS",
    language: "vi",
    sortOrder: 0,
    isActive: true,
    ...over,
  }) as MenuSlide;

test.describe("mega-menu slides", () => {
  test("maps a slide onto the card shape the navbar renders", () => {
    expect(toExploreCard(slide({}))).toEqual({
      title: "CMS slide",
      desc: "from the cms",
      href: "/cms",
      image: "/cms.png",
      imageAlt: "CMS",
    });
  });

  test("keeps a blank alt blank", () => {
    // An empty alt is the correct markup for a decorative image; filling it with
    // the title would announce the picture twice to a screen reader.
    expect(toExploreCard(slide({ imageAlt: null })).imageAlt).toBe("");
  });

  test("replaces only the panels that have slides", () => {
    const merged = withCmsMenuSlides(builtIn, {
      product: [slide({ id: "x", title: "Tết" })],
      help: [],
    });

    expect(merged.product.explore.map((c) => c.title)).toEqual(["Tết"]);
    // `help` was configured as an empty list, which is not the same as being
    // configured — it keeps its built-in card.
    expect(merged.help.explore.map((c) => c.title)).toEqual(["Built-in B"]);
  });

  test("keeps every built-in card when nothing is configured", () => {
    expect(withCmsMenuSlides(builtIn, {})).toBe(builtIn);
    expect(withCmsMenuSlides(builtIn, undefined)).toBe(builtIn);
  });

  test("ignores slides for a panel that does not exist", () => {
    const merged = withCmsMenuSlides(builtIn, {
      pricing: [slide({ menuKey: "pricing" })],
    });

    expect(Object.keys(merged).sort()).toEqual(["help", "product"]);
    expect(merged.product.explore.map((c) => c.title)).toEqual(["Built-in A"]);
  });

  test("keeps the order the API returned", () => {
    const merged = withCmsMenuSlides(builtIn, {
      product: [
        slide({ id: "1", title: "first", sortOrder: 0 }),
        slide({ id: "2", title: "second", sortOrder: 1 }),
      ],
    });

    expect(merged.product.explore.map((c) => c.title)).toEqual([
      "first",
      "second",
    ]);
  });
});
