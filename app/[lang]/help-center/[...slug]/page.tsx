import { Suspense } from "react";
import { DetailContent } from "@/components/layout/sections/help-center/detail-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

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
