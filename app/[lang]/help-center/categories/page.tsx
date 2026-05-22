import { Suspense } from "react";
import { CategoriesContent } from "@/components/layout/sections/help-center";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/help-center/categories`);
}

export default async function HelpCenterCategoriesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.helpCenter, href: `/${params.lang}/help-center` },
          { label: dict.breadcrumb.helpCenterCategories },
        ]}
        lang={params.lang}
      />
      <Suspense fallback={<div className="min-h-screen" />}>
        <CategoriesContent lang={params.lang} />
      </Suspense>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
