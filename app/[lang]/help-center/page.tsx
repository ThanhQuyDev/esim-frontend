import { HelpCenterContent } from "@/components/layout/sections/help-center";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { fetchHelpCenterArticles } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/help-center`);
}

export default async function HelpCenterPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const [dict, helpCenterRes] = await Promise.all([
    getDictionary(params.lang),
    fetchHelpCenterArticles(params.lang),
  ]);

  return (
    <>
      <Breadcrumb
        items={[{ label: dict.breadcrumb.helpCenter }]}
        lang={params.lang}
      />
      <HelpCenterContent lang={params.lang} initialArticles={helpCenterRes.data} />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
