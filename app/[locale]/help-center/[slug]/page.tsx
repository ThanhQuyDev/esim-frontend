import { Suspense } from "react";
import { DetailContent } from "@/components/layout/sections/help-center/detail-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import {
  fetchHelpCenterArticles,
  fetchHelpCenterBySlug,
  fetchPopularHelpCenterArticles,
} from "@/lib/api";
import { getLocale } from "next-intl/server";
import {
  fromUrlSlug,
  resolveCategoryKey,
  resolveParentKey,
} from "@/components/layout/sections/help-center/category-config";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function HelpCenterSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const locale = (await getLocale()) as Locale;
  const slug = decodeURIComponent(params.slug);

  // Try to resolve as a category first
  const possibleCatKey = resolveCategoryKey(fromUrlSlug(slug));

  const [dict, helpCenterRes] = await Promise.all([
    getDictionary(locale),
    fetchHelpCenterArticles(locale),
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
    const category = possibleCatKey;

    return (
      <>
        <Suspense fallback={<div className="min-h-screen" />}>
          <DetailContent
            lang={locale}
            category={category}
            parent={undefined}
            titleSlug={undefined}
            initialArticles={helpCenterRes.data}
          />
        </Suspense>
        <FooterSection dict={dict.footer} lang={locale} />
      </>
    );
  }

  // Try as article by slug
  const article =
    (await fetchHelpCenterBySlug(slug, locale)) ??
    (await fetchHelpCenterBySlug(`/${slug}`, locale));

  if (article) {
    const catKey = resolveCategoryKey(article.category);
    const parentKey = resolveParentKey(article.parent);
    const [popularRes] = await Promise.all([
      fetchPopularHelpCenterArticles(locale, 6),
    ]);

    return (
      <>
        <Suspense fallback={<div className="min-h-screen" />}>
          <DetailContent
            lang={locale}
            category={catKey}
            parent={parentKey}
            titleSlug={slug}
            initialArticles={helpCenterRes.data}
            initialArticle={article}
            popularArticles={popularRes.data}
          />
        </Suspense>
        <FooterSection dict={dict.footer} lang={locale} />
      </>
    );
  }

  // Not found — pass to DetailContent as empty
  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <DetailContent
          lang={locale}
          category={slug}
          parent={undefined}
          titleSlug={undefined}
          initialArticles={helpCenterRes.data}
        />
      </Suspense>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
