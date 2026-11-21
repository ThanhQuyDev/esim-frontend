import {
  fetchHelpCenterArticles,
  getBlogs,
  getDestinations,
  getRegions,
} from "@/lib/api";
import { blogHubs, entitySlug, localePrefix } from "@/lib/sitemap-entries";
import { sellable } from "@/lib/sellable";
import { SITE_BASE_URL } from "@/lib/hreflang";
import { categorySlug } from "@/components/layout/sections/blog-page/blog-detail-helpers";
import {
  regionGroupOf,
  renderHtmlSitemap,
  type HtmlSitemapData,
  type SitemapLang,
} from "@/lib/html-sitemap/render";

/**
 * "Sơ đồ trang web" / "Sitemap" (vande-2011 #045): the page designed in Drive
 * row 52, filled from the same sources as /sitemap.xml so it never needs
 * copying by hand. Rebuilt at most once an hour.
 */
export const revalidate = 3600;

async function safely<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

/** "2026-11-07" from an ISO date, in Vietnam's day. */
function day(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function GET(
  _request: Request,
  { params }: { params: { locale: string } }
): Promise<Response> {
  const lang: SitemapLang = params.locale === "en" ? "en" : "vi";
  const other: SitemapLang = lang === "vi" ? "en" : "vi";
  const prefix = localePrefix(lang);
  const site = SITE_BASE_URL;

  const [destinations, regions, blogs, helpArticles] = await Promise.all([
    safely(() => getDestinations({ limit: 1000 }).then((r) => r.data), []),
    safely(() => getRegions({ limit: 1000 }).then((r) => r.data), []),
    safely(() => getBlogs({ limit: 500 }).then((r) => r.data), []),
    safely(() => fetchHelpCenterArticles().then((r) => r.data), []),
  ]);

  const nameIn = (e: { title?: string | null; titleVi?: string | null; name?: string | null }, l: SitemapLang) =>
    ((l === "vi" ? e.titleVi : e.title) || "").trim();

  const countries: HtmlSitemapData["countries"] = (destinations ?? [])
    .filter((d) => sellable(d) && (d as { esimType?: string }).esimType !== "local")
    .map((d) => {
      const slug = entitySlug(d, lang);
      if (!slug) return null;
      const own = nameIn(d, lang);
      const label = own || nameIn(d, other) || d.name;
      return {
        href: `${site}${prefix}/${slug}`,
        label,
        alt: nameIn(d, other) || null,
        lang: own ? null : other,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const regionLinks: HtmlSitemapData["regions"] = (regions ?? [])
    .filter((r) => sellable(r) && !r.parentId && (r as { esimType?: string }).esimType !== "local")
    .map((r) => {
      const slug = entitySlug(r, lang);
      if (!slug) return null;
      const own = nameIn(r, lang);
      const vi = nameIn(r, "vi") || r.name;
      const en = nameIn(r, "en") || r.name;
      return {
        href: `${site}${prefix}/${slug}`,
        label: own || r.name,
        alt: nameIn(r, other) || null,
        // A region named only in English on the Vietnamese page (es-* packs).
        lang: own ? null : lang === "vi" ? ("en" as const) : null,
        group: regionGroupOf(vi, en),
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const published = (blogs ?? []).filter((b) => b?.isPublished !== false && b?.slug);
  const posts: HtmlSitemapData["posts"] = published.map((b) => ({
    href: `${site}${prefix}/blog/${b.slug.replace(/^\/+/, "")}`,
    label: b.title,
    lang: (b.language || "vi") !== lang ? ((b.language === "en" ? "en" : "vi") as SitemapLang) : null,
    date: day(b.publishedAt ?? b.createdAt),
  }));

  // Category and author pages: Vietnamese only, and only when they have
  // enough articles (spec 13.6, same rule as /sitemap.xml).
  const names = new Map<string, string>();
  for (const b of published) {
    if ((b.language ?? "vi") !== "vi") continue;
    if (b.category) {
      const cat = categorySlug(b.category);
      names.set(`/blog/${cat}`, b.category);
      if (b.parent) names.set(`/blog/${cat}/${categorySlug(b.parent)}`, b.parent);
    }
    if (b.authorSlug) names.set(`/blog/author/${b.authorSlug}`, b.authorProfile?.name || b.author || b.authorSlug);
  }
  const hubs = lang === "vi" ? blogHubs(published, categorySlug) : [];
  const categories = hubs
    .filter((h) => !h.path.startsWith("/blog/author/"))
    .map((h) => ({ href: `${site}${h.path}`, label: names.get(h.path) ?? h.path }));
  const authors = hubs
    .filter((h) => h.path.startsWith("/blog/author/"))
    .map((h) => ({ href: `${site}${h.path}`, label: names.get(h.path) ?? h.path, count: h.count }));

  const help: HtmlSitemapData["help"] = (helpArticles ?? [])
    .filter((a) => a?.slug && a?.title)
    .map((a) => {
      const slug = a.slug.replace(/^\/+/, "");
      const language = (a as { language?: string }).language === "en" ? "en" : "vi";
      return {
        href: `${site}${lang === "vi" ? `/ho-tro/${slug}` : `/en/help-center/${slug}`}`,
        label: a.title,
        lang: language !== lang ? (language as SitemapLang) : null,
      };
    });

  const html = renderHtmlSitemap(lang, {
    site,
    countries,
    regions: regionLinks,
    blogIndex: `${site}${prefix}/blog`,
    posts,
    categories,
    authors,
    helpIndex: `${site}${lang === "vi" ? "/ho-tro" : "/en/help-center"}`,
    help,
    legalIndex: `${site}${lang === "vi" ? "/phap-ly" : "/en/legal"}`,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600",
    },
  });
}
