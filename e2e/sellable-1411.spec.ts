import { test, expect } from "@playwright/test";
import { sellable } from "../lib/sellable";
import { toRegionListItems } from "../lib/region-groups";
import { buildSitemap } from "../lib/sitemap-entries";
import type { Destination, Region } from "../lib/api";

/**
 * vande-1411 #031 — a country or region with no plan on sale is not listed,
 * nor counted as an option; it stays "active" in the CMS and comes back when
 * its supplier adds plans. One switched off goes at once.
 */

test("should list only what is switched on and sells", () => {
  expect(sellable({ isActive: true, planCount: 12 })).toBe(true);
  expect(sellable({ isActive: true, planCount: 0 })).toBe(false); // e.g. /esim-tay-an-thuoc-phap
  expect(sellable({ isActive: false, planCount: 12 })).toBe(false); // "CO Asia 10 test" switched off
  // An older API without planCount: the "from" price stands in.
  expect(sellable({ isActive: true, fromPrice: 66_000 })).toBe(true);
  expect(sellable({ isActive: true, fromPrice: null })).toBe(false);
});

const r = (o: Partial<Region> & { id: number }): Region =>
  ({ slug: `r${o.id}`, slugVi: null, name: `R${o.id}`, isActive: true, parentId: null, destinationCount: 5, ...o }) as unknown as Region;

test("should not count a parent with no plan of its own as an option", () => {
  // 26 packs sell; the parent sells nothing itself.
  const parentInfo = { slug: "esim-chau-a", slugVi: null, name: "Asia", title: null, titleVi: null, childCount: 26, isActive: true, hasPlans: false };
  const [asia] = toRegionListItems([r({ id: 50, parentId: 38, parent: parentInfo } as never)], "vi");
  expect(asia.variantCount).toBe(26);
  // The same parent selling plans of its own: 27.
  const selling = { ...parentInfo, hasPlans: true };
  const [asia2] = toRegionListItems([r({ id: 50, parentId: 38, parent: selling } as never)], "vi");
  expect(asia2.variantCount).toBe(27);
});

test("should leave what does not sell out of the sitemap", () => {
  const urls = buildSitemap(
    {
      destinations: [
        { id: 1, slug: "esim-phap", slugVi: "esim-phap", isActive: true, planCount: 30 } as unknown as Destination,
        { id: 2, slug: "esim-tay-an-thuoc-phap", slugVi: "esim-tay-an-thuoc-phap", isActive: true, planCount: 0 } as unknown as Destination,
      ],
      regions: [r({ id: 9, slug: "co-asia-10-test", isActive: false, planCount: 3 } as never)],
    },
    { baseUrl: "https://esim.vn", path: () => null, lastModified: new Date(0) },
  ).map((e) => e.url);
  expect(urls.some((u) => u.endsWith("/esim-phap"))).toBe(true);
  expect(urls.some((u) => u.endsWith("/esim-tay-an-thuoc-phap"))).toBe(false);
  expect(urls.some((u) => u.endsWith("/co-asia-10-test"))).toBe(false);
});
