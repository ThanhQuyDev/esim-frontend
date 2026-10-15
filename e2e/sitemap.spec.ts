import { test, expect } from "@playwright/test";
import {
  buildSitemap,
  entitySlug,
  entryFor,
  renderSitemapXml,
  EXCLUDED_ROUTES,
  STATIC_ROUTES,
} from "../lib/sitemap-entries";

/**
 * #091 — the sitemap.
 *
 * One existed, but it listed fifteen static routes: every country page, region
 * page, blog post, help article and carrier page — the entire catalogue — was
 * missing, and cart/checkout/profile were listed even though none of them can
 * rank. There was no robots.txt pointing at any of it.
 */

/** Stand-in for next-intl: it returns the locale prefix itself. */
function path(locale: "vi" | "en", key: string, params?: Record<string, string>) {
  const filled = params
    ? key.replace(/\[(\w+)\]/g, (_, name: string) => params[name] ?? "")
    : key;
  // A crude translation of the two keys the tests care about.
  if (locale === "en") {
    const translated = filled.startsWith("/esim-noi-dia")
      ? filled.replace("/esim-noi-dia", "/domestic-esim")
      : filled;
    return translated === "/" ? "/en" : `/en${translated}`;
  }
  return filled;
}

const BASE = "https://esim.vn";

test.describe("sitemap — contents", () => {
  test("lists the catalogue, not just the static pages", () => {
    const entries = buildSitemap(
      {
        destinations: [
          { slug: "japan", slugVi: "esim-nhat-ban", isActive: true } as never,
          { slug: "korea", slugVi: "esim-han-quoc", isActive: true } as never,
        ],
        regions: [{ slug: "asia", slugVi: "esim-chau-a", isActive: true } as never],
        blogs: [{ slug: "cach-cai-esim", isPublished: true } as never],
        helpArticles: [{ slug: "kich-hoat-esim" } as never],
        carriers: [{ provider: "wintel" } as never],
      },
      { baseUrl: BASE, path },
    );

    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${BASE}/esim-nhat-ban`);
    expect(urls).toContain(`${BASE}/esim-han-quoc`);
    expect(urls).toContain(`${BASE}/esim-chau-a`);
    expect(urls).toContain(`${BASE}/blog/cach-cai-esim`);
    expect(urls).toContain(`${BASE}/help-center/kich-hoat-esim`);
    expect(urls).toContain(`${BASE}/esim-noi-dia/wintel`);
    // …and the static ones are still there.
    expect(urls).toContain(BASE);
    expect(urls).toContain(`${BASE}/destinations`);
  });

  test("#048 — lists the legal pages under each language's own slug", () => {
    const entries = buildSitemap(
      {
        legalPolicies: [
          { urlSlug: { vi: "chinh-sach-hoan-tien", en: "refund-policy" } },
          { urlSlug: { vi: "chinh-sach-bao-mat", en: "privacy-policy" } },
        ],
      },
      { baseUrl: BASE, path },
    );

    const refund = entries.find((e) => e.url === `${BASE}/legal/chinh-sach-hoan-tien`);
    expect(refund).toBeDefined();
    expect(refund?.alternates?.languages).toEqual({
      vi: `${BASE}/legal/chinh-sach-hoan-tien`,
      en: `${BASE}/en/legal/refund-policy`,
    });
    expect(entries.map((e) => e.url)).toContain(`${BASE}/legal/chinh-sach-bao-mat`);
  });

  test("gives every URL its language alternates", () => {
    const [entry] = buildSitemap(
      { destinations: [{ slug: "japan", slugVi: "esim-nhat-ban" } as never] },
      { baseUrl: BASE, path: () => null },
    );

    expect(entry.alternates?.languages).toEqual({
      vi: `${BASE}/esim-nhat-ban`,
      en: `${BASE}/en/japan`,
    });
    // The Vietnamese URL is the canonical one listed.
    expect(entry.url).toBe(`${BASE}/esim-nhat-ban`);
  });

  test("uses each language's own slug", () => {
    const destination = { slug: "japan", slugVi: "esim-nhat-ban" };

    expect(entitySlug(destination, "vi")).toBe("esim-nhat-ban");
    expect(entitySlug(destination, "en")).toBe("japan");
    // No Vietnamese slug: fall back rather than emit a broken URL.
    expect(entitySlug({ slug: "japan" }, "vi")).toBe("japan");
  });

  test("keeps cart, checkout and the account area out", () => {
    const entries = buildSitemap({}, { baseUrl: BASE, path });
    const urls = entries.map((e) => e.url);

    for (const route of EXCLUDED_ROUTES) {
      expect(urls).not.toContain(`${BASE}${route}`);
    }
    expect(STATIC_ROUTES).not.toContain("/cart" as never);
    expect(STATIC_ROUTES).not.toContain("/profile" as never);
  });

  test("skips inactive or unpublished records", () => {
    const entries = buildSitemap(
      {
        destinations: [{ slug: "hidden", slugVi: "an", isActive: false } as never],
        blogs: [{ slug: "draft", isPublished: false } as never],
      },
      { baseUrl: BASE, path: () => null },
    );

    expect(entries.map((e) => e.url)).not.toContain(`${BASE}/an`);
    expect(entries.map((e) => e.url)).not.toContain(`${BASE}/blog/draft`);
  });

  test("never repeats a URL", () => {
    const entries = buildSitemap(
      {
        destinations: [
          { slug: "japan", slugVi: "esim-nhat-ban" } as never,
          { slug: "japan", slugVi: "esim-nhat-ban" } as never,
        ],
      },
      { baseUrl: BASE, path },
    );

    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  test("drops a record with no usable slug instead of emitting a bare domain", () => {
    const entries = buildSitemap(
      {
        destinations: [{ slug: "", slugVi: "  " } as never],
        blogs: [{ slug: "", isPublished: true } as never],
        carriers: [{ provider: "  " } as never],
      },
      { baseUrl: BASE, path: () => null },
    );

    expect(entries).toEqual([]);
  });

  test("carries lastModified when the record has one", () => {
    const entry = entryFor(BASE, () => "/esim-nhat-ban", "2026-02-01T00:00:00.000Z");

    expect(entry?.lastModified).toEqual(new Date("2026-02-01T00:00:00.000Z"));
    // A nonsense date is dropped rather than published as "Invalid Date".
    expect(entryFor(BASE, () => "/x", "not-a-date")?.lastModified).toBeUndefined();
  });
});

test.describe("sitemap — served", () => {
  test("publishes an XML sitemap with the site's own pages", async ({ request }) => {
    const res = await request.get("/sitemap.xml");

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    // Static routes are present even with the backend unavailable, under
    // their Vietnamese paths (the default locale carries no prefix).
    expect(body).toContain("/cong-cu-tinh-data");
    expect(body).toContain("/en/data-usage-calculator");
    expect(body).toContain("xhtml:link");
    // Legal pages, through next-intl's real localized paths (#048).
    expect(body).toContain("/phap-ly/chinh-sach-hoan-tien");
    expect(body).toContain("/en/legal/refund-policy");
    // The excluded areas never appear.
    expect(body).not.toContain("<loc>http://localhost:3102/checkout</loc>");
  });

  test("publishes robots.txt pointing at the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");

    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Sitemap:");
    expect(body).toContain("sitemap.xml");
    expect(body).toContain("Disallow: /checkout");
    expect(body).toContain("Disallow: /profile");
  });
});

test.describe("sitemap — laid out like the reference file (common-issue #004)", () => {
  const entries = buildSitemap(
    {
      destinations: [
        { slug: "japan", slugVi: "esim-nhat-ban", isPopular: true, updatedAt: "2026-09-11T08:00:00Z" } as never,
        { slug: "libya", slugVi: "esim-libya", isPopular: false } as never,
      ],
      regions: [{ slug: "europe-42", slugVi: "esim-chau-au-42-quoc-gia" } as never],
      blogs: [{ slug: "esim-trung-quoc-la-gi" } as never],
      helpArticles: [{ slug: "khai-niem-ve-esim" } as never],
      carriers: [{ provider: "viettel" } as never],
    },
    { baseUrl: BASE, path },
  );
  const xml = renderSitemapXml(entries);

  test("is styled by /sitemap.xsl and grouped in the reference's order", () => {
    expect(xml).toContain('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>');
    const headers = [
      "TRANG TĨNH / STATIC PAGES",
      "TRANG QUỐC GIA (1 nước)",
      "GÓI ĐA QUỐC GIA / KHU VỰC",
      "ESIM NỘI ĐỊA",
      "BLOG",
      "TRUNG TÂM TRỢ GIÚP",
    ].map((h) => xml.indexOf(`<!-- ============ ${h} ============ -->`));
    expect(headers.every((i) => i > 0)).toBe(true);
    expect([...headers].sort((a, b) => a - b)).toEqual(headers);
  });

  test("lists every language as its own <url>, each with x-default", () => {
    expect(xml).toContain(`<loc>${BASE}/esim-nhat-ban</loc>`);
    expect(xml).toContain(`<loc>${BASE}/en/japan</loc>`);
    const block = xml.split("<url>").find((u) => u.includes(`<loc>${BASE}/en/japan</loc>`))!;
    expect(block).toContain(`hreflang="vi" href="${BASE}/esim-nhat-ban"`);
    expect(block).toContain(`hreflang="x-default" href="${BASE}/esim-nhat-ban"`);
    expect(block).toContain("<lastmod>2026-09-11</lastmod>");
  });

  test("uses the reference's changefreq and priority per group", () => {
    const block = (loc: string) => xml.split("<url>").find((u) => u.includes(`<loc>${BASE}${loc}</loc>`))!;
    expect(block("")).toMatch(/<changefreq>daily<\/changefreq>\s*<priority>1\.0<\/priority>/);
    expect(block("/esim-nhat-ban")).toMatch(/weekly<\/changefreq>\s*<priority>0\.9</);
    expect(block("/esim-libya")).toMatch(/weekly<\/changefreq>\s*<priority>0\.7</);
    expect(block("/esim-chau-au-42-quoc-gia")).toMatch(/<priority>0\.85</);
    expect(block("/esim-noi-dia/viettel")).toMatch(/<priority>0\.75</);
    expect(block("/blog/esim-trung-quoc-la-gi")).toMatch(/weekly<\/changefreq>\s*<priority>0\.7</);
    expect(block("/help-center/khai-niem-ve-esim")).toMatch(/monthly<\/changefreq>\s*<priority>0\.6</);
    expect(block("/terms-of-service")).toMatch(/yearly<\/changefreq>\s*<priority>0\.3</);
  });
});
