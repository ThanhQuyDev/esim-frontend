import { test, expect } from "@playwright/test";
import { ownOrParent } from "../components/layout/sections/region-group/design/rg-state";
import { groupRegions } from "../lib/region-groups";
import type { Region } from "../lib/api";

/**
 * vande-1411 #029 — a pack's own picture and icon are for that pack alone: the
 * parent ("Asia (Châu Á)") keeps its own, a pack with none shows its parent's,
 * and no pack ever shows a sibling's.
 */

const r = (o: Partial<Region> & { id: number }): Region =>
  ({ slug: `r${o.id}`, name: `R${o.id}`, isActive: true, parentId: null, ...o }) as unknown as Region;

const PARENT = r({ id: 38, slug: "esim-chau-a", avatarUrl: "parent.jpg", iconUrl: "parent-icon.png" });
const CO_ASIA_10 = r({ id: 50, parentId: 38, avatarUrl: "co-asia-10.jpg", iconUrl: "co-icon.png" });
const PLAIN = r({ id: 51, parentId: 38 });
const members = [CO_ASIA_10, PLAIN, PARENT];

test("should keep the parent's own picture on its page", () => {
  expect(ownOrParent({ member: PARENT, members }, "avatarUrl")).toBe("parent.jpg");
  expect(ownOrParent({ member: PARENT, members }, "iconUrl")).toBe("parent-icon.png");
});

test("should show a pack its own picture, else its parent's — never a sibling's", () => {
  expect(ownOrParent({ member: CO_ASIA_10, members }, "avatarUrl")).toBe("co-asia-10.jpg");
  expect(ownOrParent({ member: PLAIN, members }, "avatarUrl")).toBe("parent.jpg");
  expect(ownOrParent({ member: PLAIN, members }, "iconUrl")).toBe("parent-icon.png");
  // The parent not loaded: the pack's parent info stands in.
  const lone = { ...PLAIN, parent: { slug: "esim-chau-a", slugVi: null, name: "Asia", title: null, titleVi: null, avatarUrl: "parent.jpg" } } as Region;
  expect(ownOrParent({ member: lone, members: [lone] }, "avatarUrl")).toBe("parent.jpg");
});

test("should picture a group card with its parent, not with a pack", () => {
  const [group] = groupRegions([CO_ASIA_10, PLAIN, PARENT], "vi");
  expect(group.iconUrl).toBe("parent.jpg");
});
