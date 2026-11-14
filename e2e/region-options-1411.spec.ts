import { test, expect } from "@playwright/test";
import { toRegionListItems } from "../lib/region-groups";
import type { Region } from "../lib/api";

/**
 * vande-1411 #030 — "Asia (Châu Á)" with 27 packs offers 28 options (the packs
 * and the parent itself). The list holds at most 200 regions, so it counts by
 * what the API says, not by the packs that happen to be in this page of it.
 */

const r = (o: Partial<Region> & { id: number }): Region =>
  ({ slug: `r${o.id}`, slugVi: null, name: `R${o.id}`, isActive: true, parentId: null, destinationCount: 5, ...o }) as unknown as Region;

test("should count every active pack and the parent, not just those loaded", () => {
  const parent = r({ id: 38, slug: "esim-chau-a", isParent: true, childCount: 27, planCount: 4 });
  const loaded = [r({ id: 50, parentId: 38 }), r({ id: 51, parentId: 38 })];
  const [asia] = toRegionListItems([parent, ...loaded], "vi");
  expect(asia.variantCount).toBe(28);
});

test("should count from the parent info when the parent row is not loaded", () => {
  const parentInfo = { slug: "esim-chau-a", slugVi: null, name: "Asia", title: null, titleVi: null, childCount: 27 };
  const [asia] = toRegionListItems([r({ id: 50, parentId: 38, parent: parentInfo } as never)], "vi");
  expect(asia.variantCount).toBe(28);
  expect(asia.slug).toBe("esim-chau-a");
});

test("should leave a standalone region at one option", () => {
  const [one] = toRegionListItems([r({ id: 70, slug: "greater-china-bl" })], "vi");
  expect(one.variantCount).toBe(1);
});
