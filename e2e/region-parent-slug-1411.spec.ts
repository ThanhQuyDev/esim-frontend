import { test, expect } from "@playwright/test";
import { groupRegions, toRegionListItems } from "../lib/region-groups";
import { buildSitemap } from "../lib/sitemap-entries";
import type { Region } from "../lib/api";

/**
 * vande-1411 #028 — a parent region and its packs live at the parent's slug:
 * the card of "Asia (Châu Á)" links to /esim-chau-a, not to its cheapest pack
 * (/asia-5-mi); a pack's own link 301s there (app/[locale]/[slug]/page.tsx);
 * only the parent's page is in the sitemap. A standalone region is untouched.
 */

function region(o: Partial<Region> & { id: number; slug: string }): Region {
  return {
    name: o.slug,
    title: null,
    titleVi: null,
    slugVi: null,
    isActive: true,
    parentId: null,
    destinationCount: 5,
    fromPrice: 100_000,
    createdAt: "",
    updatedAt: "",
    ...o,
  } as unknown as Region;
}

const PARENT = region({ id: 38, slug: "asia-esim", slugVi: "esim-chau-a", name: "Asia (Châu Á)", titleVi: "eSIM Châu Á", isParent: true } as never);
const CHEAPEST = region({ id: 50, slug: "asia-5-mi", name: "Asia", parentId: 38, fromPrice: 66_000, destinationCount: 5 });
const OTHER = region({ id: 51, slug: "asia-11", name: "Asia 11", parentId: 38, fromPrice: 68_000, destinationCount: 11 });
const STANDALONE = region({ id: 70, slug: "greater-china-bl", name: "Greater China" });

test("should link the group to the parent's slug, not its cheapest pack's", () => {
  const items = toRegionListItems([CHEAPEST, OTHER, PARENT, STANDALONE], "vi");
  const asia = items.find((i) => i.id === CHEAPEST.id || i.id === PARENT.id)!;
  expect(asia.slugVi ?? asia.slug).toBe("esim-chau-a");
  expect(items.find((i) => i.id === STANDALONE.id)?.slug).toBe("greater-china-bl");
  // English: the parent's English slug.
  expect(groupRegions([CHEAPEST, OTHER, PARENT], "en")[0].slug).toBe("asia-esim");
});

test("should still find the parent's slug when the parent is not in the list", () => {
  const parent = { slug: "asia-esim", slugVi: "esim-chau-a", name: "Asia (Châu Á)", title: null, titleVi: "eSIM Châu Á" };
  const lone = { ...CHEAPEST, parent } as Region;
  const [item] = toRegionListItems([lone], "vi");
  expect(item.slugVi ?? item.slug).toBe("esim-chau-a");
  expect(item.titleVi).toBe("eSIM Châu Á");

  const two = toRegionListItems([lone, { ...OTHER, parent } as Region], "vi");
  expect(two).toHaveLength(1);
  expect(two[0].slugVi ?? two[0].slug).toBe("esim-chau-a");
});

test("should leave a pack under a parent out of the sitemap", () => {
  const urls = buildSitemap(
    { regions: [PARENT, CHEAPEST, STANDALONE] },
    { baseUrl: "https://esim.vn", path: () => null, lastModified: new Date(0) },
  ).map((e) => e.url);
  expect(urls.some((u) => u.endsWith("/esim-chau-a"))).toBe(true);
  expect(urls.some((u) => u.endsWith("/greater-china-bl"))).toBe(true);
  expect(urls.some((u) => u.endsWith("/asia-5-mi"))).toBe(false);
});
