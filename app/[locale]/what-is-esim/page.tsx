import {
  EsimHero,
  EsimDefinition,
  EsimHowWorks,
  EsimSetup,
  EsimAdvantages,
  EsimComparison,
  EsimCtaBanner,
} from "@/components/layout/sections/what-is-esim-page";
import { FAQSection } from "@/components/layout/sections/faq";
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
  return getSeoMetadata(getCmsSeoUrlForPage("/what-is-esim", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function WhatIsEsimPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const esim = dict.whatIsEsimPage;

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.whatIsEsim }]}
        lang={locale}
      />
      <EsimHero dict={esim.hero} lang={locale} />
      <EsimDefinition dict={esim.definition} />
      <EsimHowWorks dict={esim.howWorks} />
      <EsimSetup dict={esim.setup} />
      <EsimAdvantages dict={esim.whyUse} />
      <EsimComparison dict={esim.comparison} />
      <EsimCtaBanner dict={esim.ctaBanner} lang={locale} />
      <FAQSection dict={esim.faq} lang={locale} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
