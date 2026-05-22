import { Suspense } from "react";
import { DetailContent } from "@/components/layout/sections/help-center/detail-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import {
  fetchHelpCenterArticles,
  fetchHelpCenterBySlug,
} from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string[] };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/help-center/${params.slug.join("/")}`);
}

export default async function HelpCenterDetailPage({
  params,
}: {
  params: { lang: Locale; slug: string[] };
}) {
  const [category, parent, titleSlug] = params.slug;

  // Fetch the article list (for the sidebar tree) and — if we're on a
  // specific article — the article itself by its canonical slug, in parallel.
  // The CMS slug may include a leading "/" (e.g. "/honest-review2"); the URL
  // strips that, so we try the bare slug first and fall back to "/${slug}".
  const [dict, helpCenterRes, slugArticle] = await Promise.all([
    getDictionary(params.lang),
    fetchHelpCenterArticles(params.lang),
    titleSlug
      ? fetchHelpCenterBySlug(titleSlug, params.lang).then(
          (a) => a ?? fetchHelpCenterBySlug(`/${titleSlug}`, params.lang)
        )
      : Promise.resolve(null),
  ]);

  return (
    <>
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.helpCenter, href: `/${params.lang}/help-center` },
          ...(slugArticle ? [{ label: slugArticle.title }] : []),
        ]}
        lang={params.lang}
      />
      <Suspense fallback={<div className="min-h-screen" />}>
        <DetailContent
          lang={params.lang}
          category={category}
          parent={parent}
          titleSlug={titleSlug}
          initialArticles={helpCenterRes.data}
          initialArticle={slugArticle ?? undefined}
        />
      </Suspense>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
