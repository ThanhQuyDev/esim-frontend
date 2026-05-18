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
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/what-is-esim`);
}

export default async function WhatIsEsimPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const esim = dict.whatIsEsimPage;

  return (
    <main role="main">
      <EsimHero dict={esim.hero} lang={params.lang} />
      <EsimDefinition dict={esim.definition} />
      <EsimHowWorks dict={esim.howWorks} />
      <EsimSetup dict={esim.setup} />
      <EsimAdvantages dict={esim.whyUse} />
      <EsimComparison dict={esim.comparison} />
      <EsimCtaBanner dict={esim.ctaBanner} lang={params.lang} />
      <FAQSection dict={esim.faq} lang={params.lang} />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
