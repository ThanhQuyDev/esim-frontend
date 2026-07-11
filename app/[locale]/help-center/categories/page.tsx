import { Suspense } from "react";
import { CategoriesContent } from "@/components/layout/sections/help-center";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  return getSeoMetadata(getCmsSeoUrlForPage("/help-center/categories", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function HelpCenterCategoriesPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.helpCenter, href: `/${locale}/help-center` },
          { label: dict.breadcrumb.helpCenterCategories },
        ]}
        lang={locale}
      />
      <Suspense fallback={<div className="min-h-screen" />}>
        <CategoriesContent lang={locale} />
      </Suspense>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
