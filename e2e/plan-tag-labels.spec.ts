import { test, expect } from "@playwright/test";
import { planTagLabel } from "../components/layout/sections/destination/plan-badges";

/**
 * #058 — plan chips on the product page showed "Best Seller" on the
 * Vietnamese site; it should read "Bán chạy".
 */
test.describe("plan tag labels", () => {
  test("reads Vietnamese on the Vietnamese site", () => {
    expect(planTagLabel("best-seller", "vi")).toBe("Bán chạy");
    expect(planTagLabel("hot-deal", "vi")).toBe("Giá sốc");
    expect(planTagLabel("popular", "vi")).toBe("Phổ biến");
    expect(planTagLabel("new", "vi")).toBe("Mới");
  });

  test("keeps the English labels on the English site", () => {
    expect(planTagLabel("best-seller", "en")).toBe("Best Seller");
    expect(planTagLabel("hot-deal", "en")).toBe("Hot deal");
  });

  test("recognises the tag however the CMS spelled it", () => {
    expect(planTagLabel("Best Seller", "vi")).toBe("Bán chạy");
    expect(planTagLabel("bestseller", "vi")).toBe("Bán chạy");
    expect(planTagLabel("HOT", "vi")).toBe("Giá sốc");
    expect(planTagLabel("something-else", "vi")).toBeNull();
  });
});
