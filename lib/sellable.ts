/**
 * A country or region the storefront lists (vande-1411 #031): switched on in
 * the CMS and selling plans now. One with no plan stays "active" in the CMS and
 * comes back by itself when its supplier adds plans; one switched off goes at
 * once.
 */
export function sellable(item: {
  isActive?: boolean | null;
  planCount?: number | null;
  fromPrice?: number | string | null;
}): boolean {
  if (!item || item.isActive === false) return false;
  if (typeof item.planCount === "number") return item.planCount > 0;
  return Number(item.fromPrice) > 0;
}
