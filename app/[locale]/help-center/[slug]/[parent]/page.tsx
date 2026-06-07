import { Suspense } from "react";
import { DetailContent } from "@/components/layout/sections/help-center/detail-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { fetchHelpCenterArticles } from "@/lib/api";
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
  params: { slug: string; parent: string };
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function HelpCenterParentPage({
  params,
}: {
  params: { slug: string; parent: string };
}) {
  const locale = (await getLocale()) as Locale;
  const slug = decodeURIComponent(params.slug);
  const parentSlug = decodeURIComponent(params.parent);

  const category = resolveCategoryKey(fromUrlSlug(slug));
  const parent = resolveParentKey(fromUrlSlug(parentSlug));

  const [dict, helpCenterRes] = await Promise.all([
    getDictionary(locale),
    fetchHelpCenterArticles(locale),
  ]);

  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <DetailContent
          lang={locale}
          category={category}
          parent={parent}
          titleSlug={undefined}
          initialArticles={helpCenterRes.data}
        />
      </Suspense>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
