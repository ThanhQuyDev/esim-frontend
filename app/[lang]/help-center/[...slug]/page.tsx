import { Suspense } from "react";
import { DetailContent } from "@/components/layout/sections/help-center/detail-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import {
  fetchHelpCenterArticles,
  fetchHelpCenterBySlug,
  fetchPopularHelpCenterArticles,
} from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";
import {
  fromUrlSlug,
  resolveCategoryKey,
  resolveParentKey,
  toLocalizedCategorySlug,
  toLocalizedParentSlug,
} from "@/components/layout/sections/help-center/category-config";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string[] };
}): Promise<Metadata> {
  // Build the public URL using localized category/parent slugs for SEO lookup
  const [rawCategory, rawParent, titleSlug] = params.slug;
  const basePath = localizedHref(params.lang, "help-center");

  let publicUrl: string;
  if (rawCategory && rawParent && titleSlug) {
    const catKey = resolveCategoryKey(fromUrlSlug(rawCategory));
    const parentKey = resolveParentKey(fromUrlSlug(rawParent));
    publicUrl = `${basePath}/${toLocalizedCategorySlug(catKey, params.lang)}/${toLocalizedParentSlug(parentKey, params.lang)}/${titleSlug}`;
  } else if (rawCategory && rawParent) {
    const catKey = resolveCategoryKey(fromUrlSlug(rawCategory));
    const parentKey = resolveParentKey(fromUrlSlug(rawParent));
    publicUrl = `${basePath}/${toLocalizedCategorySlug(catKey, params.lang)}/${toLocalizedParentSlug(parentKey, params.lang)}`;
  } else if (rawCategory) {
    const catKey = resolveCategoryKey(fromUrlSlug(rawCategory));
    publicUrl = `${basePath}/${toLocalizedCategorySlug(catKey, params.lang)}`;
  } else {
    publicUrl = basePath;
  }

  return getSeoMetadata(publicUrl);
}

export default async function HelpCenterDetailPage({
  params,
}: {
  params: { lang: Locale; slug: string[] };
}) {
  // URL uses dashes (`bat-dau`), internal data uses underscores (`bat_dau`),
  // and articles in the API are stored with the canonical EN key (`getting_started`).
  // Normalize URL → canonical key so the sidebar tree, comparisons, and lookups
  // all work regardless of the locale used in the URL.
  const [rawCategory, rawParent, titleSlug] = params.slug;
  const category = rawCategory
    ? resolveCategoryKey(fromUrlSlug(rawCategory))
    : rawCategory;
  const parent = rawParent
    ? resolveParentKey(fromUrlSlug(rawParent))
    : rawParent;

  // Fetch the article list (for the sidebar tree) and — if we're on a
  // specific article — the article itself by its canonical slug, in parallel.
  // The CMS slug may include a leading "/" (e.g. "/honest-review2"); the URL
  // strips that, so we try the bare slug first and fall back to "/${slug}".
  const [dict, helpCenterRes, slugArticle, popularRes] = await Promise.all([
    getDictionary(params.lang),
    fetchHelpCenterArticles(params.lang),
    titleSlug
      ? fetchHelpCenterBySlug(titleSlug, params.lang).then(
          (a) => a ?? fetchHelpCenterBySlug(`/${titleSlug}`, params.lang)
        )
      : Promise.resolve(null),
    // Fetch popular articles only when rendering an article detail page —
    // that's the only place the "Related articles" block appears.
    titleSlug
      ? fetchPopularHelpCenterArticles(params.lang, 6)
      : Promise.resolve({ data: [], hasNextPage: false }),
  ]);

  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <DetailContent
          lang={params.lang}
          category={category}
          parent={parent}
          titleSlug={titleSlug}
          initialArticles={helpCenterRes.data}
          initialArticle={slugArticle ?? undefined}
          popularArticles={popularRes.data}
        />
      </Suspense>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
