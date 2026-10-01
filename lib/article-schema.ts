import { SITE_BASE_URL } from "./hreflang";
import { SITE_NAME } from "./seo";
import { localizedAuthor, type Blog } from "./api";

/**
 * `BlogPosting` plus its author as a `Person` (#076).
 *
 * Blog posts carried no markup at all, so Google had nothing to go on for who
 * wrote a piece or when it was published — the two things that decide whether an
 * article is treated as having an author worth trusting.
 */

type Json = Record<string, unknown>;

/** An ISO timestamp, or undefined when the field is empty or unparseable. */
function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/**
 * The author as a `Person`, from the author record when the post has one.
 *
 * Falls back to the plain `author` name, and to the publisher when even that is
 * empty — an `Organization` author is true of an unsigned house piece, where
 * inventing a person would not be.
 */
function buildAuthor(blog: Blog, lang: string): Json {
  const profile = blog.authorProfile
    ? localizedAuthor(blog.authorProfile, lang)
    : null;

  const name = profile?.name?.trim() || blog.author?.trim();
  if (!name) {
    return { "@id": `${SITE_BASE_URL}/#organization` };
  }

  const slug = blog.authorSlug?.trim();
  const prefix = lang === "vi" ? "" : `/${lang}`;

  return {
    "@type": "Person",
    name,
    ...(slug ? { url: `${SITE_BASE_URL}${prefix}/blog/author/${slug}` } : {}),
    ...(profile?.description ? { description: profile.description } : {}),
    ...(blog.authorAvatar ? { image: blog.authorAvatar } : {}),
  };
}

export function buildArticleSchema(input: {
  blog: Blog;
  path: string;
  lang: string;
}): Json {
  const { blog, path, lang } = input;
  const url = `${SITE_BASE_URL}${path}`;

  const published = isoDate(blog.publishedAt) ?? isoDate(blog.createdAt);
  const modified = isoDate(blog.updatedAt) ?? published;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    // `mainEntityOfPage` is what ties the markup to this URL rather than to the
    // article as an abstract work.
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: blog.title,
    ...(blog.excerpt ? { description: blog.excerpt } : {}),
    ...(blog.coverImage ? { image: blog.coverImage } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author: buildAuthor(blog, lang),
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_BASE_URL}/#organization`,
      name: SITE_NAME,
    },
    inLanguage: lang === "vi" ? "vi-VN" : "en",
    isPartOf: { "@id": `${SITE_BASE_URL}/#website` },
    ...(blog.category ? { articleSection: blog.category } : {}),
  };
}
