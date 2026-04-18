import {
  EsimHero,
  EsimDefinition,
  EsimHowWorks,
  EsimSetup,
  EsimAdvantages,
  EsimComparison,
  EsimCtaBanner,
  EsimFaq,
} from "@/components/layout/sections/what-is-esim-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

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
      <EsimFaq dict={esim.faq} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
