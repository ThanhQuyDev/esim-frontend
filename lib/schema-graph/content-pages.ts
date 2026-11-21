import { cache } from "react";
import { routing } from "@/i18n/routing";
import {
  fetchHelpCenterArticles,
  fetchSeoConfigByUrl,
  getBlogAuthor,
  getBlogBySlug,
  getBlogCategories,
  getBlogParentsByCategory,
  getBlogs,
  getBlogsByAuthor,
  getBlogsByCategory,
  getBlogsByCategoryAndParent,
  type Blog,
  type HelpCenterArticle,
} from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { resolveBreadcrumbTrail } from "@/lib/breadcrumb-trail";
import { buildBreadcrumbSchema, homeCrumb } from "@/lib/breadcrumb-schema";
import type { Locale } from "@/lib/i18n-config";
import { loadPageFaqs } from "@/components/page-faq-schema";
import { categorySlug } from "@/components/layout/sections/blog-page/blog-detail-helpers";
import {
  getCategoryLabel,
  getParentLabel,
  resolveCategoryKey,
  resolveParentKey,
  toLocalizedCategorySlug,
  toLocalizedParentSlug,
} from "@/components/layout/sections/help-center/category-config";
import { breadcrumbNode, faqNode, ORIGIN, usableImage } from "./product";
import STATIC from "./static-pages.json";

/**
 * Blog, help centre and author pages as one @graph each (vande-2011 #046,
 * Drive row 54 "SCHEMA TRANG BLOG VA HO TRO"): CollectionPage + ItemList for
 * the listings, WebPage + BlogPosting / Article for an article, ProfilePage +
 * Person for an author — with the shared Organization and WebSite, the page's
 * breadcrumb and, on an article, its FAQ.
 */

type Json = Record<string, any>;
type Lang = "vi" | "en";
const SHARED = (STATIC as unknown as { shared: Record<Lang, Record<"Organization" | "WebSite", Json>> }).shared;

export type ContentPage =
  | { kind: "blogIndex" }
  | { kind: "blogCategory"; category: string; parent?: string }
  | { kind: "blogPost"; slug: string }
  | { kind: "author"; slug: string }
  | { kind: "helpIndex" }
  | { kind: "helpCategory"; category: string; parent?: string }
  | { kind: "helpArticle"; slug: string };

const ogImage = (lang: Lang) => `${ORIGIN}/og/esimvn-og-${lang}.png`;
const image = (url: string) => ({ "@type": "ImageObject", url, contentUrl: url });
const pageUrl = (lang: Lang, path: string) => `${ORIGIN}${lang === "vi" ? "" : "/en"}${path}`;
const plain = (slug: string) => slug.replace(/^\/+/, "");

function helpBase(lang: Lang): string {
  return lang === "vi" ? "/ho-tro" : "/help-center";
}

const helpArticles = cache(async () =>
  (await fetchHelpCenterArticles().catch(() => ({ data: [] as HelpCenterArticle[] }))).data ?? []
);

/** Which content page a path is, if any (cached per request). */
export const resolveContentPage = cache(async function resolveContentPage(
  locale: string,
  path: string
): Promise<ContentPage | null> {
  const lang: Lang = locale === "en" ? "en" : "vi";
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const rest = (prefix && path.startsWith(prefix) ? path.slice(prefix.length) : path) || "/";
  const seg = rest.split("/").filter(Boolean).map((s) => decodeURIComponent(s));

  if (seg[0] === "blog") {
    if (seg.length === 1) return { kind: "blogIndex" };
    if (seg[1] === "author" && seg[2]) return { kind: "author", slug: seg[2] };
    if (seg[1] === "search" || seg[1] === "author") return null;
    const categories = await getBlogCategories(locale).catch(() => [] as string[]);
    const category = categories.find((c) => categorySlug(c) === seg[1]);
    if (category) {
      if (seg.length === 2) return { kind: "blogCategory", category };
      const parents = await getBlogParentsByCategory(locale).catch(() => ({}) as Record<string, string[]>);
      const parent = (parents[category] ?? []).find((p) => categorySlug(p) === seg[2]);
      return parent ? { kind: "blogCategory", category, parent } : null;
    }
    if (seg.length === 2 && (await getBlogBySlug(seg[1], locale).catch(() => null))) {
      return { kind: "blogPost", slug: seg[1] };
    }
    return null;
  }

  if (seg[0] === helpBase(lang).slice(1)) {
    if (seg.length === 1) return { kind: "helpIndex" };
    const articles = await helpArticles();
    if (seg.length === 2 && articles.some((a) => plain(a.slug) === seg[1])) {
      return { kind: "helpArticle", slug: seg[1] };
    }
    const keys = Array.from(new Set(articles.map((a) => resolveCategoryKey(a.category))));
    const category = keys.find((k) => toLocalizedCategorySlug(k, lang) === seg[1]);
    if (!category) return null;
    if (seg.length === 2) return { kind: "helpCategory", category };
    const parents = Array.from(
      new Set(articles.filter((a) => resolveCategoryKey(a.category) === category).map((a) => resolveParentKey(a.parent)))
    );
    const parent = parents.find((p) => p && toLocalizedParentSlug(p, lang) === seg[2]);
    return parent ? { kind: "helpCategory", category, parent } : null;
  }
  return null;
});

async function trailNode(url: string, locale: string, path: string): Promise<Json | null> {
  const dict = await getDictionary(locale as Locale);
  const trail = await resolveBreadcrumbTrail(path, locale, dict);
  const crumbs = buildBreadcrumbSchema([homeCrumb(locale), ...trail], path) as {
    itemListElement?: { name: string; item: string }[];
  } | null;
  return crumbs?.itemListElement?.length
    ? breadcrumbNode(url, crumbs.itemListElement.map((c) => ({ name: c.name, item: c.item })))
    : null;
}

async function seoText(path: string): Promise<{ title?: string; description?: string }> {
  const seo = await fetchSeoConfigByUrl(path).catch(() => null);
  return { title: seo?.metaTitle || undefined, description: seo?.metaDescription || undefined };
}

function itemList(id: string, name: string, items: { name: string; url: string }[]): Json {
  return {
    "@type": "ItemList",
    "@id": id,
    name,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: it.url })),
  };
}

function collectionPage(url: string, lang: Lang, name: string, description: string | undefined, mainId: string, extra: Json = {}): Json {
  return {
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name,
    ...(description ? { description } : {}),
    inLanguage: lang,
    isPartOf: { "@id": SHARED[lang].WebSite["@id"] },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    primaryImageOfPage: image(ogImage(lang)),
    mainEntity: { "@id": mainId },
    ...extra,
  };
}

const published = (list: Blog[] | null | undefined) =>
  (list ?? []).filter((b) => b?.isPublished !== false && b?.slug);
const postItems = (lang: Lang, list: Blog[]) =>
  list.map((b) => ({ name: b.title, url: pageUrl(lang, `/blog/${plain(b.slug)}`) }));

export async function contentPageGraph(page: ContentPage, locale: string, path: string): Promise<Json | null> {
  const lang: Lang = locale === "en" ? "en" : "vi";
  const vi = lang === "vi";
  const url = `${ORIGIN}${path === "/" ? "" : path}`;
  const nodes: Json[] = [];
  const seo = await seoText(path);
  // An article's trail runs through its category and sub-category: five
  // levels, as in the samples (Trang chủ › Blog › Du lịch › Cẩm nang › bài).
  let articleTrail: { name: string; item: string }[] | null = null;
  const home = { name: vi ? "Trang chủ" : "Home", item: vi ? `${ORIGIN}/` : `${ORIGIN}/en` };

  switch (page.kind) {
    case "blogIndex": {
      const latest = published((await getBlogs({ limit: 20, lang: locale }).catch(() => ({ data: [] as Blog[] }))).data)
        .sort((a, b) => String(b.publishedAt ?? b.createdAt).localeCompare(String(a.publishedAt ?? a.createdAt)))
        .slice(0, 7);
      nodes.push(
        collectionPage(url, lang, seo.title ?? "Blog | esim.vn", seo.description, `${url}#latest`, {
          about: { "@id": `${url}#blog` },
        }),
        {
          "@type": "Blog",
          "@id": `${url}#blog`,
          name: vi ? "Blog eSIM esim.vn" : "esim.vn eSIM Blog",
          url,
          description: vi
            ? "Blog eSIM của esim.vn: kinh nghiệm dùng eSIM, kết nối di động và cẩm nang du lịch các nước."
            : "The esim.vn eSIM blog: using eSIMs, staying connected abroad and travel guides by country.",
          inLanguage: lang,
          publisher: { "@id": SHARED[lang].Organization["@id"] },
        },
        itemList(`${url}#latest`, vi ? "Bài viết mới nhất" : "Latest articles", postItems(lang, latest))
      );
      break;
    }
    case "blogCategory": {
      const res = page.parent
        ? await getBlogsByCategoryAndParent(page.category, page.parent, { limit: 100, lang: locale }).catch(() => null)
        : await getBlogsByCategory(page.category, { limit: 100, lang: locale }).catch(() => null);
      const posts = published(res?.data);
      const label = page.parent ?? page.category;
      nodes.push(
        collectionPage(url, lang, seo.title ?? `${label} | Blog esim.vn`, seo.description, `${url}#posts`),
        itemList(`${url}#posts`, vi ? `Bài viết: ${label}` : `Articles: ${label}`, postItems(lang, posts))
      );
      break;
    }
    case "blogPost": {
      const post = await getBlogBySlug(page.slug, locale);
      if (!post) return null;
      const title = seo.title ?? post.title;
      const description = seo.description ?? post.excerpt ?? undefined;
      const cover = usableImage(post.coverImage) ? post.coverImage! : ogImage(lang);
      const authorSlug = post.authorSlug || post.authorProfile?.slug || null;
      {
        const blogRoot = { name: "Blog", item: pageUrl(lang, "/blog") };
        const steps = [home, blogRoot];
        if (post.category) {
          const cat = categorySlug(post.category);
          steps.push({ name: post.category, item: pageUrl(lang, `/blog/${cat}`) });
          if (post.parent) steps.push({ name: post.parent, item: pageUrl(lang, `/blog/${cat}/${categorySlug(post.parent)}`) });
        }
        articleTrail = [...steps, { name: post.title, item: url }];
      }
      const personId = authorSlug ? `${pageUrl(lang, `/blog/author/${authorSlug}`)}#person` : null;
      nodes.push({
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        headline: title,
        ...(description ? { description } : {}),
        inLanguage: lang,
        isPartOf: { "@id": SHARED[lang].WebSite["@id"] },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        primaryImageOfPage: image(cover),
        mainEntity: { "@id": `${url}#article` },
      });
      if (personId && authorSlug) {
        nodes.push({
          "@type": "Person",
          "@id": personId,
          name: (vi ? post.authorProfile?.name : post.authorProfile?.nameEn || post.authorProfile?.name) || post.author || authorSlug,
          url: pageUrl(lang, `/blog/author/${authorSlug}`),
          worksFor: { "@id": SHARED[lang].Organization["@id"] },
        });
      }
      nodes.push({
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        name: title,
        ...(description ? { description } : {}),
        url,
        inLanguage: post.language === "en" ? "en" : "vi",
        mainEntityOfPage: { "@id": `${url}#webpage` },
        image: image(cover),
        ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
        author: personId ? { "@id": personId } : { "@id": SHARED[lang].Organization["@id"] },
        publisher: { "@id": SHARED[lang].Organization["@id"] },
        isPartOf: { "@id": `${url}#webpage` },
        ...(post.category ? { articleSection: post.category } : {}),
      });
      break;
    }
    case "author": {
      const author = await getBlogAuthor(page.slug).catch(() => null);
      if (!author) return null;
      const name = (vi ? author.name : author.nameEn || author.name) || page.slug;
      const posts = published(
        (await getBlogsByAuthor(page.slug, { lang: locale, limit: 50 }).catch(() => ({ data: [] as Blog[] }))).data
      );
      const personId = `${url}#person`;
      const avatar = usableImage(author.avatar) ? author.avatar! : null;
      const about = (author as { descriptionEn?: string | null }).descriptionEn;
      const description = (vi ? author.description : about || author.description) || undefined;
      nodes.push(
        {
          "@type": "ProfilePage",
          "@id": `${url}#webpage`,
          url,
          name: seo.title ?? (vi ? `${name} — Tác giả Blog eSIM esim.vn` : `${name} — esim.vn eSIM Blog author`),
          ...(seo.description ?? description ? { description: seo.description ?? description } : {}),
          inLanguage: lang,
          isPartOf: { "@id": SHARED[lang].WebSite["@id"] },
          breadcrumb: { "@id": `${url}#breadcrumb` },
          primaryImageOfPage: image(avatar ?? ogImage(lang)),
          mainEntity: { "@id": personId },
          ...(posts.length
            ? {
                hasPart: posts.map((b) => ({
                  "@type": "BlogPosting",
                  "@id": `${pageUrl(lang, `/blog/${plain(b.slug)}`)}#article`,
                  url: pageUrl(lang, `/blog/${plain(b.slug)}`),
                  headline: b.title,
                  author: { "@id": personId },
                })),
              }
            : {}),
        },
        {
          "@type": "Person",
          "@id": personId,
          name,
          ...(author.nameEn && author.nameEn !== name ? { alternateName: author.nameEn } : {}),
          url,
          mainEntityOfPage: { "@id": `${url}#webpage` },
          ...(description ? { description } : {}),
          ...(avatar ? { image: image(avatar) } : {}),
          worksFor: { "@id": SHARED[lang].Organization["@id"] },
        }
      );
      break;
    }
    case "helpIndex": {
      const articles = await helpArticles();
      const categories = Array.from(new Set(articles.map((a) => resolveCategoryKey(a.category)))).filter(Boolean);
      const featured = articles.filter((a) => a.isPopular);
      nodes.push(
        collectionPage(url, lang, seo.title ?? (vi ? "Trung tâm trợ giúp | esim.vn" : "Help Center | esim.vn"), seo.description, `${url}#categories`),
        itemList(
          `${url}#categories`,
          vi ? "Danh mục trợ giúp" : "Help categories",
          categories.map((k) => ({ name: getCategoryLabel(k, lang), url: pageUrl(lang, `${helpBase(lang)}/${toLocalizedCategorySlug(k, lang)}`) }))
        )
      );
      if (featured.length) {
        nodes.push(
          itemList(
            `${url}#featured`,
            vi ? "Bài viết nổi bật" : "Featured articles",
            featured.map((a) => ({ name: a.title, url: pageUrl(lang, `${helpBase(lang)}/${plain(a.slug)}`) }))
          )
        );
      }
      break;
    }
    case "helpCategory": {
      const articles = (await helpArticles()).filter((a) => resolveCategoryKey(a.category) === page.category);
      const label = page.parent ? getParentLabel(page.parent, lang) : getCategoryLabel(page.category, lang);
      let items: { name: string; url: string }[];
      if (page.parent) {
        items = articles
          .filter((a) => resolveParentKey(a.parent) === page.parent)
          .map((a) => ({ name: a.title, url: pageUrl(lang, `${helpBase(lang)}/${plain(a.slug)}`) }));
      } else {
        const parents = Array.from(new Set(articles.map((a) => resolveParentKey(a.parent)).filter(Boolean)));
        items = [
          ...parents.map((p) => ({
            name: getParentLabel(p, lang),
            url: pageUrl(lang, `${helpBase(lang)}/${toLocalizedCategorySlug(page.category, lang)}/${toLocalizedParentSlug(p, lang)}`),
          })),
          ...articles.map((a) => ({ name: a.title, url: pageUrl(lang, `${helpBase(lang)}/${plain(a.slug)}`) })),
        ];
      }
      nodes.push(
        collectionPage(url, lang, seo.title ?? `${label} | esim.vn`, seo.description, `${url}#items`),
        itemList(`${url}#items`, vi ? `Nội dung trong ${label}` : `In ${label}`, items)
      );
      break;
    }
    case "helpArticle": {
      const article = (await helpArticles()).find((a) => plain(a.slug) === page.slug);
      if (!article) return null;
      const title = seo.title ?? article.title;
      {
        const cat = resolveCategoryKey(article.category);
        const par = article.parent ? resolveParentKey(article.parent) : "";
        const steps = [home, { name: vi ? "Trung tâm trợ giúp" : "Help Center", item: pageUrl(lang, helpBase(lang)) }];
        if (cat) {
          const catSlug = toLocalizedCategorySlug(cat, lang);
          steps.push({ name: getCategoryLabel(cat, lang), item: pageUrl(lang, `${helpBase(lang)}/${catSlug}`) });
          if (par) steps.push({ name: getParentLabel(par, lang), item: pageUrl(lang, `${helpBase(lang)}/${catSlug}/${toLocalizedParentSlug(par, lang)}`) });
        }
        articleTrail = [...steps, { name: article.title, item: url }];
      }
      const section = [getCategoryLabel(resolveCategoryKey(article.category), lang), article.parent ? getParentLabel(resolveParentKey(article.parent), lang) : ""]
        .filter(Boolean)
        .join(" › ");
      nodes.push(
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          url,
          name: title,
          ...(seo.description ? { description: seo.description } : {}),
          inLanguage: lang,
          isPartOf: { "@id": SHARED[lang].WebSite["@id"] },
          breadcrumb: { "@id": `${url}#breadcrumb` },
          primaryImageOfPage: image(ogImage(lang)),
          mainEntity: { "@id": `${url}#article` },
        },
        {
          "@type": "Article",
          "@id": `${url}#article`,
          headline: title,
          ...(seo.description ? { description: seo.description } : {}),
          inLanguage: (article as { language?: string }).language === "en" ? "en" : "vi",
          mainEntityOfPage: { "@id": `${url}#webpage` },
          dateModified: String(article.updatedAt).slice(0, 10),
          author: { "@id": SHARED[lang].Organization["@id"] },
          publisher: { "@id": SHARED[lang].Organization["@id"] },
          image: image(ogImage(lang)),
          ...(section ? { articleSection: section } : {}),
        }
      );
      break;
    }
  }

  const breadcrumb = articleTrail ? breadcrumbNode(url, articleTrail) : await trailNode(url, locale, path);
  if (breadcrumb) nodes.push(breadcrumb);
  if (page.kind === "blogPost" || page.kind === "helpArticle") {
    const faq = faqNode(await loadPageFaqs(locale, path), lang, url);
    if (faq) {
      nodes.push(faq);
      nodes[0].hasPart = [{ "@id": `${url}#faq` }];
    }
  }
  return { "@context": "https://schema.org", "@graph": [SHARED[lang].Organization, SHARED[lang].WebSite, ...nodes] };
}
