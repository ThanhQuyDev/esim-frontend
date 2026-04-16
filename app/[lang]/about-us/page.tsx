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
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export default async function AboutUsPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const about = dict.aboutUs;

  return (
    <main role="main">
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
      <FooterSection dict={dict.footer} />
    </main>
  );
}
