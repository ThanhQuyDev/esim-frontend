import { SITE_BASE_URL } from "./hreflang";
import { SITE_NAME } from "./seo";
import { localizedAuthor, type Blog, type BlogAuthor } from "./api";

/**
 * The author page as a `ProfilePage` about a `Person` (#050, test round 4).
 *
 * Posts already named their author as a `Person` linking to this page (#076),
 * but the page itself carried only a breadcrumb — so the profile the articles
 * point to said nothing about who the author is. The `Person` here uses the same
 * URL as the articles' author, and the posts are listed with the same `@id` the
 * post pages give their `BlogPosting`, so the pieces join up.
 */

type Json = Record<string, unknown>;

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** `/blog/author/<slug>` (any locale prefix) → the slug, else null. */
export function authorSlugFromPath(pathWithoutLocale: string): string | null {
  const match = pathWithoutLocale.match(/^\/?blog\/author\/([^/?#]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function buildAuthorPageSchema(input: {
  author: BlogAuthor;
  blogs: Blog[];
  path: string;
  lang: string;
}): Json {
  const { author, blogs, path, lang } = input;
  const url = `${SITE_BASE_URL}${path}`;
  const { name, description } = localizedAuthor(author, lang);
  const prefix = lang === "vi" ? "" : `/${lang}`;

  const person: Json = {
    "@type": "Person",
    "@id": `${url}#person`,
    name,
    url,
    ...(description ? { description } : {}),
    ...(author.avatar ? { image: author.avatar } : {}),
    worksFor: { "@id": `${SITE_BASE_URL}/#organization`, name: SITE_NAME },
  };

  const articles = blogs.slice(0, 20).map((blog) => {
    const slug = (blog.slug || "").replace(/^\//, "");
    const articleUrl = `${SITE_BASE_URL}${prefix}/blog/${encodeURIComponent(slug)}`;
    const published = isoDate(blog.publishedAt) ?? isoDate(blog.createdAt);
    return {
      "@type": "BlogPosting",
      "@id": `${articleUrl}#article`,
      url: articleUrl,
      headline: blog.title,
      ...(published ? { datePublished: published } : {}),
      author: { "@id": `${url}#person` },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": url,
    url,
    name,
    ...(description ? { description } : {}),
    mainEntity: person,
    ...(articles.length ? { hasPart: articles } : {}),
  };
}
