import {
  AboutHero,
  AboutStory,
  AboutValues,
  AboutTimeline,
  AboutCrew,
  AboutLife,
  AboutBanner,
} from "@/components/layout/sections/about";
import { PartnerBar } from "@/components/layout/sections/partner-bar";
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
  return getSeoMetadata(getCmsSeoUrlForPage("/about-us", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function AboutUsPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const about = dict.aboutUs;

  return (
    <main role="main" className="overflow-hidden">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.aboutUs }]}
        lang={locale}
      />
      <AboutHero dict={about.hero} />
      <AboutStory dict={about.story} />
      <PartnerBar dict={dict.partnerBar} />
      <AboutValues dict={about.values} />
      <AboutTimeline dict={about.timeline} />
      <div className="bg-black">
        <AboutCrew dict={about.crew} />
        <AboutLife dict={about.life} />
      </div>
      <AboutBanner dict={about.banner} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
