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
  params: { lang: Locale; slug: string; parent: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const parent = decodeURIComponent(params.parent);
  const basePath = localizedHref(params.lang, "help-center");
  return getSeoMetadata(`${basePath}/${slug}/${parent}`);
}

export default async function HelpCenterParentPage({
  params,
}: {
  params: { lang: Locale; slug: string; parent: string };
}) {
  const slug = decodeURIComponent(params.slug);
  const parentSlug = decodeURIComponent(params.parent);

  const category = resolveCategoryKey(fromUrlSlug(slug));
  const parent = resolveParentKey(fromUrlSlug(parentSlug));

  const [dict, helpCenterRes] = await Promise.all([
    getDictionary(params.lang),
    fetchHelpCenterArticles(params.lang),
  ]);

  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <DetailContent
          lang={params.lang}
          category={category}
          parent={parent}
          titleSlug={undefined}
          initialArticles={helpCenterRes.data}
        />
      </Suspense>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
