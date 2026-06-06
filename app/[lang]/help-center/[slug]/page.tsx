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
  getCategoryLabel,
  getParentLabel,
} from "@/components/layout/sections/help-center/category-config";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const basePath = localizedHref(params.lang, "help-center");
  return getSeoMetadata(`${basePath}/${slug}`);
}

export default async function HelpCenterSlugPage({
  params,
}: {
  params: { lang: Locale; slug: string };
}) {
  const slug = decodeURIComponent(params.slug);

  // Try to resolve as a category first
  const possibleCatKey = resolveCategoryKey(fromUrlSlug(slug));

  const [dict, helpCenterRes] = await Promise.all([
    getDictionary(params.lang),
    fetchHelpCenterArticles(params.lang),
  ]);

  // Check if the resolved key is a valid category
  const isCategory =
    possibleCatKey &&
    possibleCatKey !== slug &&
    helpCenterRes.data.some(
      (a) =>
        resolveCategoryKey(a.category) === possibleCatKey ||
        a.category === possibleCatKey
    );

  if (isCategory) {
    // Render category listing
    const category = possibleCatKey;

    return (
      <>
        <Suspense fallback={<div className="min-h-screen" />}>
          <DetailContent
            lang={params.lang}
            category={category}
            parent={undefined}
            titleSlug={undefined}
            initialArticles={helpCenterRes.data}
          />
        </Suspense>
        <FooterSection dict={dict.footer} lang={params.lang} />
      </>
    );
  }

  // Try as article by slug
  const article =
    (await fetchHelpCenterBySlug(slug, params.lang)) ??
    (await fetchHelpCenterBySlug(`/${slug}`, params.lang));

  if (article) {
    const catKey = resolveCategoryKey(article.category);
    const parentKey = resolveParentKey(article.parent);
    const [popularRes] = await Promise.all([
      fetchPopularHelpCenterArticles(params.lang, 6),
    ]);

    return (
      <>
        <Suspense fallback={<div className="min-h-screen" />}>
          <DetailContent
            lang={params.lang}
            category={catKey}
            parent={parentKey}
            titleSlug={slug}
            initialArticles={helpCenterRes.data}
            initialArticle={article}
            popularArticles={popularRes.data}
          />
        </Suspense>
        <FooterSection dict={dict.footer} lang={params.lang} />
      </>
    );
  }

  // Not found — pass to DetailContent as empty
  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <DetailContent
          lang={params.lang}
          category={slug}
          parent={undefined}
          titleSlug={undefined}
          initialArticles={helpCenterRes.data}
        />
      </Suspense>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
