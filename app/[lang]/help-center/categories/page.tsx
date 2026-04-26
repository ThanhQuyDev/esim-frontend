import { Suspense } from "react";
import { CategoriesContent } from "@/components/layout/sections/help-center";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export default async function HelpCenterCategoriesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <Suspense fallback={<div className="min-h-screen" />}>
        <CategoriesContent lang={params.lang} />
      </Suspense>
      <FooterSection dict={dict.footer} />
    </>
  );
}
