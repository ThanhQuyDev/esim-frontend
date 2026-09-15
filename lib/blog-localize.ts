import type { BlogMiniTag, Destination } from "./api";

/**
 * Language-aware copy for the widgets inside a blog post (#059): the mini tag
 * and the "need data in …?" plan box.
 */

function pick(english: string | null | undefined, vietnamese: string | null | undefined) {
  const en = english?.trim();
  return en ? en : vietnamese ?? null;
}

/** The mini tag as an English post reads it; Vietnamese posts keep it as-is. */
export function localizeMiniTag(miniTag: BlogMiniTag, lang: string): BlogMiniTag {
  if (lang === "vi") return miniTag;
  return {
    ...miniTag,
    title: pick(miniTag.titleEn, miniTag.title) ?? "",
    description: pick(miniTag.descriptionEn, miniTag.description),
    contentButton: pick(miniTag.contentButtonEn, miniTag.contentButton),
    linkUrl: pick(miniTag.linkUrlEn, miniTag.linkUrl),
  };
}

/**
 * The destination named in the plan box, and its page, in the post's
 * language. The Vietnamese post used to print the English name ("China").
 */
export function blogPlanDestination(
  destination: Pick<Destination, "name" | "slug" | "slugVi" | "title" | "titleVi"> | null | undefined,
  lang: string
): { name: string; href: string | null } {
  const vi = lang === "vi";
  const fallbackName = vi ? "nơi bạn đến" : "this country";
  if (!destination) return { name: fallbackName, href: null };

  const name =
    (vi ? destination.titleVi || destination.title : destination.title || destination.titleVi) ||
    destination.name ||
    fallbackName;

  const slug = (vi ? destination.slugVi || destination.slug : destination.slug)
    ?.trim()
    .replace(/^\/+|\/+$/g, "");
  const href = slug ? (vi ? `/${slug}` : `/${lang}/${slug}/`) : null;

  return { name, href };
}
