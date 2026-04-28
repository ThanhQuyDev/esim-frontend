import { Suspense } from "react";
import { DetailContent } from "@/components/layout/sections/help-center/detail-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
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
  const dict = await getDictionary(params.lang);
  const [category, parent, titleSlug] = params.slug;

  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <DetailContent
          lang={params.lang}
          category={category}
          parent={parent}
          titleSlug={titleSlug}
        />
      </Suspense>
      <FooterSection dict={dict.footer} />
    </>
  );
}
