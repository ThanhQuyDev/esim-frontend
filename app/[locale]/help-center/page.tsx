import { HelpCenterContent } from "@/components/layout/sections/help-center";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { fetchHelpCenterArticles } from "@/lib/api";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  const seoUrl = locale === "vi" ? "/ho-tro" : "/en/help-center";
  return getSeoMetadata(seoUrl, {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function HelpCenterPage() {
  const locale = (await getLocale()) as Locale;
  const [dict, helpCenterRes] = await Promise.all([
    getDictionary(locale),
    fetchHelpCenterArticles(locale),
  ]);

  return (
    <>
      <HelpCenterContent lang={locale} initialArticles={helpCenterRes.data} />
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
