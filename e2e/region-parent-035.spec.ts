import { test, expect } from "@playwright/test";
import type { Region } from "../lib/api";
import { findRegionGroupBySlug, groupRegions } from "../lib/region-groups";

/**
 * vande #035 — the CMS's "Khu vực cha" decides which regions share one page,
 * instead of a guess from same-named titles.
 */
function region(id: number, titleVi: string, slug: string, destinationCount: number, parentId?: number | null) {
  return {
    id,
    name: titleVi,
    slug,
    slugVi: null,
    title: titleVi,
    titleVi,
    destinationCount,
    isActive: true,
    createdAt: "",
    updatedAt: "",
    ...(parentId !== undefined && { parentId }),
  } as unknown as Region;
}

test("packs are grouped under their parent, whatever their titles", () => {
  const regions = [
    region(38, "Châu Á", "esim-chau-a", 20, null),
    region(24, "Châu Á 12+ Quốc Gia", "esim-chau-a-12-quoc-gia", 12, 38),
    region(49, "Đông Nam Á", "esim-dong-nam-a", 8, 38),
    region(50, "Châu Á 13 Quốc Gia", "esim-chau-a-13-quoc-gia", 13, null),
  ];
  const groups = groupRegions(regions, "vi");
  expect(groups.map((g) => [g.label, g.members.map((m) => m.id)])).toEqual([
    ["Châu Á", [49, 24, 38]],
    ["Châu Á", [50]],
  ]);
  // "esim-chau-a" + "esim-dong-nam-a" share only "esim": the parent's page.
  expect(groups[0].slug).toBe("esim-chau-a");
  expect(findRegionGroupBySlug(regions, "esim-dong-nam-a", "vi")?.slug).toBe("esim-chau-a");
});

test("the group is named after the parent even when a pack comes first", () => {
  const regions = [
    region(46, "Châu Âu 33 Quốc Gia", "esim-chau-au-33-quoc-gia", 33, 12),
    region(12, "Châu Âu", "esim-chau-au", 41, null),
  ];
  const [group] = groupRegions(regions, "vi");
  expect(group.label).toBe("Châu Âu");
  expect(group.slug).toBe("esim-chau-au");
});

test("an API without the field keeps the old same-name grouping", () => {
  const regions = [
    region(50, "Châu Á 13 Quốc Gia", "esim-chau-a-13-quoc-gia", 13),
    region(19, "Châu Á 7 Quốc Gia", "esim-chau-a-7-quoc-gia", 7),
  ];
  const groups = groupRegions(regions, "vi");
  expect(groups).toHaveLength(1);
  expect(groups[0].slug).toBe("esim-chau-a");
});
