import {
  PressAreaHero,
  WhyChooseSaily,
  ResearchHub,
  MeetSpeakers,
  PressResources,
  NonprofitBanner,
} from "@/components/layout/sections/press-area";
import { pressAreaTranslations } from "@/components/layout/sections/press-area/translations";
import { PartnerBar } from "@/components/layout/sections/partner-bar";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function PressAreaPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const t = locale === "vi" ? pressAreaTranslations.vi : pressAreaTranslations.en;

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.pressArea }]}
        lang={locale}
      />
      <PressAreaHero dict={t.hero} />
      <PartnerBar dict={dict.partnerBar} />
      <WhyChooseSaily dict={t.whyChoose} />
      <ResearchHub dict={t.researchHub} />
      <MeetSpeakers dict={t.speakers} />
      <PressResources dict={t.pressResources} />
      <NonprofitBanner dict={t.banner} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
