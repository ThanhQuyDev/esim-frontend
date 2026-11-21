import { test, expect } from "@playwright/test";
import {
  letterOf,
  regionGroupOf,
  renderHtmlSitemap,
  sortLabels,
  type HtmlSitemapData,
} from "../lib/html-sitemap/render";
import { blogHubs, buildSitemap } from "../lib/sitemap-entries";
import type { Blog } from "../lib/api";

/**
 * vande-2011 #045 — the HTML sitemap designed in Drive row 52, filled from the
 * live catalogue, and the sitemap.xml fixes from the same spec.
 */

const data = (over: Partial<HtmlSitemapData> = {}): HtmlSitemapData => ({
  site: "https://esim.vn",
  countries: [
    { href: "https://esim.vn/esim-nhat-ban", label: "Nhật Bản", alt: "Japan" },
    { href: "https://esim.vn/esim-duc", label: "Đức", alt: "Germany" },
    { href: "https://esim.vn/esim-a-rap-xe-ut", label: "Ả Rập Xê Út", alt: "Saudi Arabia" },
    { href: "https://esim.vn/esim-dan-mach", label: "Đan Mạch", alt: "Denmark" },
  ],
  regions: [
    { href: "https://esim.vn/esim-toan-cau-118-quoc-gia", label: "Toàn Cầu 118 Quốc Gia", group: "global" },
    { href: "https://esim.vn/esim-chau-a", label: "Châu Á", group: "region" },
  ],
  blogIndex: "https://esim.vn/blog",
  posts: [
    { href: "https://esim.vn/blog/a", label: "Cũ", date: "2026-07-01" },
    { href: "https://esim.vn/blog/b", label: "Mới", date: "2026-11-07" },
  ],
  categories: [{ href: "https://esim.vn/blog/du-lich", label: "Du lịch" }],
  authors: [{ href: "https://esim.vn/blog/author/duc-tho", label: "Đức Thọ", count: 16 }],
  helpIndex: "https://esim.vn/ho-tro",
  help: [{ href: "https://esim.vn/ho-tro/x", label: "How to check", lang: "en" }],
  legalIndex: "https://esim.vn/phap-ly",
  ...over,
});

test.describe("HTML sitemap page", () => {
  test("keeps the design's page and fills every placeholder", () => {
    const html = renderHtmlSitemap("vi", data());
    expect(html).toContain('<html lang="vi">');
    expect(html).toContain("<h1>Sơ đồ trang web</h1>");
    expect(html).not.toContain("{{");
    expect((html.match(/<section class="card"/g) ?? []).length).toBe(7);
  });

  test("counts match what is listed, in the table of contents and the status line", () => {
    const html = renderHtmlSitemap("vi", data());
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    const links = (main.match(/<li[ >]/g) ?? []).length;
    expect(html).toContain(`data-n="${links}"`);
    expect(html).toContain(`Hiển thị ${links} / ${links} trang`);
    expect(html).toContain('<a href="#theo-quoc-gia"><span>eSIM theo quốc gia</span><b>4</b></a>');
    expect(html).toContain(`Toàn bộ ${links} trang của esim.vn`);
  });

  test("files Đ apart from D and sorts in Vietnamese order", () => {
    expect(letterOf("Đức", "vi")).toBe("Đ");
    expect(letterOf("Ả Rập Xê Út", "vi")).toBe("A");
    expect(letterOf("Đức", "en")).toBe("D");
    const html = renderHtmlSitemap("vi", data());
    expect(html).toContain('<a href="#chu-Đ">Đ</a>');
    expect(sortLabels(data().countries, "vi").map((c) => c.label)).toEqual([
      "Ả Rập Xê Út",
      "Đan Mạch",
      "Đức",
      "Nhật Bản",
    ]);
  });

  test("lists articles newest first, with categories and authors on the Vietnamese page", () => {
    const html = renderHtmlSitemap("vi", data());
    expect(html.indexOf("Mới</a>")).toBeLessThan(html.indexOf("Cũ</a>"));
    expect(html).toContain('<time datetime="2026-11-07">07/11/2026</time>');
    expect(html).toContain('<span class="d">16 bài viết</span>');
    expect(html).toContain('<a href="https://esim.vn/ho-tro/x" lang="en">');
    expect(html).toContain('<a href="https://esim.vn/phap-ly">Chính sách pháp lý</a>');
  });

  test("speaks English on the English page", () => {
    const html = renderHtmlSitemap("en", data({ categories: [], authors: [] }));
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("Showing ");
    expect(html).toContain('<time datetime="2026-11-07">Nov 7, 2026</time>');
    expect(html).toContain("Nhật Bản<span class=\"s\"> eSIM</span>");
  });

  test("sorts regions into global, continental and combined", () => {
    expect(regionGroupOf("Toàn Cầu 125+ Quốc Gia", "Global 125+ Countries")).toBe("global");
    expect(regionGroupOf("Nhật Bản và Hàn Quốc", "Japan & South Korea")).toBe("combo");
    expect(regionGroupOf("Thái Lan, Singapore và Malaysia", "Thailand, Singapore & Malaysia")).toBe("combo");
    expect(regionGroupOf("Liên Minh Châu Âu và Anh Quốc", "European Union & United Kingdom")).toBe("region");
    expect(regionGroupOf("Trung Đông và Bắc Phi", "Middle East and North Africa")).toBe("region");
    expect(regionGroupOf("Mỹ Latinh và Caribe 17 Quốc Gia", "Latin America and Caribbean")).toBe("region");
    expect(regionGroupOf("Africa (21 areas)", "Africa (21 areas)")).toBe("region");
  });
});

test.describe("sitemap.xml fixes", () => {
  const blog = (over: Partial<Blog>): Blog =>
    ({
      slug: "x",
      title: "x",
      language: "vi",
      isPublished: true,
      category: "Du lịch",
      parent: "Cẩm nang du lịch",
      authorSlug: "duc-tho",
      updatedAt: "2026-11-01T00:00:00.000Z",
      ...over,
    }) as Blog;
  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/\s+/g, "-");

  test("lists a category or author page only with five articles or more", () => {
    const five = Array.from({ length: 5 }, (_, i) => blog({ slug: `p${i}` }));
    const hubs = blogHubs([...five, blog({ slug: "q", category: "Kết nối", parent: null, authorSlug: "lai-ha" })], slugify);
    expect(hubs.map((h) => h.path)).toEqual([
      "/blog/author/duc-tho",
      "/blog/du-lich",
      "/blog/du-lich/cam-nang-du-lich",
    ]);
  });

  test("never publishes a double slash, nor the noindex KYC guide", () => {
    const entries = buildSitemap(
      { helpArticles: [{ slug: "/khai-niem" } as never], blogHubs: [{ path: "/blog/du-lich" }] },
      {
        baseUrl: "https://esim.vn",
        path: (locale, key, params) =>
          params ? `${locale === "en" ? "/en" : ""}/ho-tro//${params.slug}` : key,
      }
    );
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://esim.vn/ho-tro/khai-niem");
    expect(urls.some((u) => /[^:]\/\//.test(u))).toBe(false);
    expect(urls.some((u) => u.includes("kyc-guide"))).toBe(false);
    // A Vietnamese-only hub has no English alternate.
    const hub = entries.find((e) => e.url.endsWith("/blog/du-lich"));
    expect(Object.keys(hub?.alternates?.languages ?? {})).toEqual(["vi"]);
  });
});
