import {
  PressAreaHero,
  WhyChooseSaily,
  ResearchHub,
  MeetSpeakers,
  PressResources,
  NonprofitBanner,
  ProductFamily,
} from "@/components/layout/sections/press-area";
import { pressAreaTranslations } from "@/components/layout/sections/press-area/translations";
import { PartnerBar } from "@/components/layout/sections/partner-bar";
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
  return getSeoMetadata(`/${params.lang}/khu-vuc-bao-chi`);
}

export default async function KhuVucBaoChiPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const t = params.lang === "vi" ? pressAreaTranslations.vi : pressAreaTranslations.en;

  return (
    <main role="main">
      <PressAreaHero dict={t.hero} />
      <PartnerBar dict={dict.partnerBar} />
      <WhyChooseSaily dict={t.whyChoose} />
      <ResearchHub dict={t.researchHub} />
      <MeetSpeakers dict={t.speakers} />
      <PressResources dict={t.pressResources} />
      <NonprofitBanner dict={t.banner} />
      <ProductFamily dict={t.productFamily} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
