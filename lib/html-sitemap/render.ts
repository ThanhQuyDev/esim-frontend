import { SITEMAP_TEMPLATES } from "./templates";

/**
 * The HTML sitemap at /sitemap and /en/sitemap (vande-2011 #045), as designed
 * in Drive row 52: the design's own page (header, search, table of contents,
 * styles and script, all kept as delivered) around groups built from the live
 * catalogue, so a new destination, region, article or help page shows up
 * without anybody copying files.
 */

export type SitemapLang = "vi" | "en";

export type SitemapLink = {
  href: string;
  label: string;
  /** The page's name in the other language, searched as well (`data-a`). */
  alt?: string | null;
  /** Set when the label is not in the page's language. */
  lang?: SitemapLang | null;
};

export type SitemapRegionGroup = "global" | "region" | "combo";

export type HtmlSitemapData = {
  site: string;
  countries: SitemapLink[];
  regions: (SitemapLink & { group: SitemapRegionGroup })[];
  blogIndex: string;
  posts: (SitemapLink & { date: string | null })[];
  categories: SitemapLink[];
  authors: (SitemapLink & { count: number })[];
  helpIndex: string;
  help: SitemapLink[];
  /** The legal index page (vande-2011 #043), listed first under the policies. */
  legalIndex: string;
};

const TEXT = {
  vi: {
    countriesId: "theo-quoc-gia",
    countries: "eSIM theo quốc gia",
    countriesIntro: (n: number) => `${n} quốc gia và vùng lãnh thổ, xếp theo bảng chữ cái tiếng Việt.`,
    letters: "Chữ cái đầu",
    regionsId: "khu-vuc",
    regions: "eSIM khu vực &amp; đa quốc gia",
    regionsIntro: "Một gói eSIM dùng được ở nhiều nước: toàn cầu, theo châu lục hoặc theo cụm điểm đến.",
    regionGroups: { global: "Toàn cầu", region: "Châu lục &amp; khu vực", combo: "Cụm điểm đến kết hợp" },
    blogId: "blog",
    blogIntro: "Kinh nghiệm du lịch, so sánh và hướng dẫn dùng eSIM.",
    blogIndexAlt: "Blog",
    latest: "Bài viết mới nhất",
    categories: "Chuyên mục",
    categoryAlt: "chuyên mục",
    authors: "Tác giả",
    authorAlt: "tác giả",
    posts: (n: number) => `${n} bài viết`,
    helpId: "tro-giup",
    help: "Trung tâm trợ giúp",
    helpIntro: "Bài hướng dẫn và câu trả lời cho các thắc mắc thường gặp.",
    helpIndexAlt: "Help Center",
    helpArticles: "Bài viết trợ giúp",
    legalIndex: "Chính sách pháp lý",
    legalIndexAlt: "Legal policies",
    desc: (t: number, c: number, r: number) =>
      `Toàn bộ ${t} trang của esim.vn theo nhóm: eSIM theo ${c} quốc gia và vùng lãnh thổ, ${r} gói khu vực, blog, trung tâm trợ giúp và chính sách. Có ô tìm kiếm nhanh.`,
  },
  en: {
    countriesId: "countries",
    countries: "eSIMs by country",
    countriesIntro: (n: number) => `${n} countries and territories, listed A–Z.`,
    letters: "Jump to letter",
    regionsId: "regions",
    regions: "Regional &amp; multi-country eSIMs",
    regionsIntro: "One eSIM plan that works in many countries: global, continental or destination bundles.",
    regionGroups: { global: "Global", region: "Continents &amp; regions", combo: "Combined destinations" },
    blogId: "blog",
    blogIntro: "Travel tips, comparisons and eSIM guides (articles are written in Vietnamese).",
    blogIndexAlt: "Blog",
    latest: "Latest articles",
    categories: "Categories",
    categoryAlt: "category",
    authors: "Authors",
    authorAlt: "author",
    posts: (n: number) => `${n} articles`,
    helpId: "help",
    help: "Help Center",
    helpIntro: "Guides and answers to common questions (some articles are in Vietnamese).",
    helpIndexAlt: "Trung tâm trợ giúp",
    helpArticles: "Help articles",
    legalIndex: "Legal policies",
    legalIndexAlt: "Chính sách pháp lý",
    desc: (t: number, c: number, r: number) =>
      `All ${t} pages of esim.vn by type: eSIMs for ${c} countries and territories, ${r} regional plans, blog, help center and policies, with quick search.`,
  },
} as const;

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function altAttr(link: SitemapLink): string {
  return link.alt && link.alt !== link.label ? ` data-a="${esc(link.alt)}"` : "";
}

function langAttr(link: SitemapLink): string {
  return link.lang ? ` lang="${link.lang}"` : "";
}

/** "eSIM Nhật Bản" read aloud, "Nhật Bản" shown (spec 2.2). */
function esimItem(link: SitemapLink, lang: SitemapLang): string {
  const inner =
    lang === "vi"
      ? `<span class="s">eSIM </span>${esc(link.label)}`
      : `${esc(link.label)}<span class="s"> eSIM</span>`;
  return `<li${altAttr(link)}><a href="${esc(link.href)}"${langAttr(link)}>${inner}</a></li>`;
}

function plainItem(link: SitemapLink, extra = ""): string {
  return `<li${altAttr(link)}><a href="${esc(link.href)}"${langAttr(link)}>${esc(link.label)}</a>${extra}</li>`;
}

/** Letter a name is filed under: Đ is its own letter in Vietnamese (spec 2.2). */
export function letterOf(label: string, lang: SitemapLang): string {
  const first = label.trim().charAt(0);
  if (lang === "vi" && (first === "Đ" || first === "đ")) return "Đ";
  return first.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "D").toUpperCase();
}

export function sortLabels<T extends { label: string }>(items: T[], lang: SitemapLang): T[] {
  const collator = new Intl.Collator(lang === "vi" ? "vi" : "en", { sensitivity: "base" });
  return [...items].sort((a, b) => collator.compare(a.label, b.label));
}

function section(id: string, title: string, count: number, body: string, intro?: string): string {
  return (
    `<section class="card" id="${id}" aria-labelledby="h-${id}"><div class="sh"><h2 id="h-${id}">${title}</h2>` +
    `<span class="n">${count}</span></div>${intro ? `<p class="intro">${intro}</p>` : ""}${body}</section>`
  );
}

function dateLabel(iso: string, lang: SitemapLang): string {
  const [y, m, d] = iso.split("-");
  if (lang === "vi") return `${d}/${m}/${y}`;
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1];
  return `${month} ${Number(d)}, ${y}`;
}

/** Count of `<li>` in a fixed section of the design. */
function itemCount(html: string): number {
  return (html.match(/<li[ >]/g) ?? []).length;
}

export function renderHtmlSitemap(lang: SitemapLang, data: HtmlSitemapData): string {
  const t = TEXT[lang];
  const tpl = SITEMAP_TEMPLATES[lang];
  const site = data.site.replace(/\/$/, "");
  const fill = (html: string) => html.replace(/\{\{SITE\}\}/g, site);

  // ── fixed groups, as designed ──
  const mainHtml = fill(tpl.main);
  const companyHtml = fill(tpl.company);
  const legalIndex = plainItem({
    href: data.legalIndex,
    label: t.legalIndex,
    alt: t.legalIndexAlt,
  });
  let legalHtml = fill(tpl.legal).replace('<ul class="l b">', `<ul class="l b">${legalIndex}`);
  legalHtml = legalHtml.replace(/<span class="n">\d+<\/span>/, `<span class="n">${itemCount(legalHtml)}</span>`);

  // ── countries, A–Z with a letter bar ──
  const byLetter = new Map<string, SitemapLink[]>();
  for (const country of sortLabels(data.countries, lang)) {
    const letter = letterOf(country.label, lang);
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), country]);
  }
  const letters = Array.from(byLetter.keys());
  const countriesBody =
    `<nav class="letters" aria-label="${t.letters}">` +
    letters.map((l) => `<a href="#chu-${l}">${l}</a>`).join("") +
    `</nav>` +
    letters
      .map(
        (l) =>
          `<div class="g ltr" id="chu-${l}"><h3><span>${l}</span></h3><ul class="l c">` +
          byLetter.get(l)!.map((c) => esimItem(c, lang)).join("") +
          `</ul></div>`
      )
      .join("");
  const countriesHtml = section(
    t.countriesId,
    t.countries,
    data.countries.length,
    countriesBody,
    t.countriesIntro(data.countries.length)
  );

  // ── regions, in three kinds ──
  const regionsBody = (["global", "region", "combo"] as const)
    .map((group) => {
      const items = sortLabels(
        data.regions.filter((r) => r.group === group),
        lang
      );
      if (!items.length) return "";
      return (
        `<div class="g"><h3 class="t">${t.regionGroups[group]}</h3><ul class="l c">` +
        items.map((r) => esimItem(r, lang)).join("") +
        `</ul></div>`
      );
    })
    .join("");
  const regionsHtml = section(t.regionsId, t.regions, data.regions.length, regionsBody, t.regionsIntro);

  // ── blog: index, articles newest first, then (Vietnamese) categories, authors ──
  const posts = [...data.posts].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  let blogBody =
    `<div class="g"><ul class="l b">` +
    plainItem({ href: data.blogIndex, label: "Blog", alt: t.blogIndexAlt }) +
    `</ul></div>`;
  if (posts.length) {
    blogBody +=
      `<div class="g"><h3 class="t">${t.latest}</h3><ul class="l p">` +
      posts
        .map((p) =>
          plainItem(p, p.date ? `<time datetime="${p.date}">${dateLabel(p.date, lang)}</time>` : "")
        )
        .join("") +
      `</ul></div>`;
  }
  if (data.categories.length) {
    blogBody +=
      `<div class="g"><h3 class="t">${t.categories}</h3><ul class="l c">` +
      data.categories.map((c) => plainItem({ ...c, alt: t.categoryAlt })).join("") +
      `</ul></div>`;
  }
  if (data.authors.length) {
    blogBody +=
      `<div class="g"><h3 class="t">${t.authors}</h3><ul class="l c">` +
      data.authors
        .map((a) => plainItem({ ...a, alt: t.authorAlt }, `<span class="d">${t.posts(a.count)}</span>`))
        .join("") +
      `</ul></div>`;
  }
  const blogCount = 1 + posts.length + data.categories.length + data.authors.length;
  const blogHtml = section(t.blogId, "Blog", blogCount, blogBody, t.blogIntro);

  // ── help centre ──
  let helpBody =
    `<div class="g"><ul class="l b">` +
    plainItem({ href: data.helpIndex, label: t.help, alt: t.helpIndexAlt }) +
    `</ul></div>`;
  if (data.help.length) {
    helpBody +=
      `<div class="g"><h3 class="t">${t.helpArticles}</h3><ul class="l">` +
      sortLabels(data.help, lang).map((h) => plainItem(h)).join("") +
      `</ul></div>`;
  }
  const helpHtml = section(t.helpId, t.help, 1 + data.help.length, helpBody, t.helpIntro);

  // ── table of contents, counts, description ──
  const groups = [mainHtml, countriesHtml, regionsHtml, blogHtml, helpHtml, companyHtml, legalHtml];
  const toc = groups
    .map((html) => {
      const id = html.match(/<section class="card" id="([^"]+)"/)![1];
      const title = html.match(/<h2 id="[^"]+">([^<]*)<\/h2>/)![1];
      const n = html.match(/<span class="n">(\d+)<\/span>/)![1];
      return `<li><a href="#${id}"><span>${title}</span><b>${n}</b></a></li>`;
    })
    .join("");
  const total = groups.reduce((sum, html) => sum + Number(html.match(/<span class="n">(\d+)<\/span>/)![1]), 0);
  const desc = esc(t.desc(total, data.countries.length, data.regions.length));

  const head = fill(tpl.head)
    .replace(/\{\{DESC\}\}/g, desc)
    .replace(/\{\{TOTAL\}\}/g, String(total))
    .replace("{{TOC}}", toc);
  return head + groups.join("") + fill(tpl.tail);
}

/** Which of the three region kinds a region page is (spec 2.1, group 3). */
export function regionGroupOf(nameVi: string, nameEn: string): SitemapRegionGroup {
  const all = `${nameVi} ${nameEn}`.toLowerCase();
  if (/toàn cầu|global|worldwide/.test(all)) return "global";
  const area = /châu|vùng|trung đông|latinh|caribe|bắc phi|liên minh|quần đảo|balkan|gcc|trung á|nam mỹ|bắc mỹ|safari/;
  const vi = nameVi.toLowerCase();
  if (!area.test(vi) && /( và |,|&| - )/.test(vi)) return "combo";
  return "region";
}
