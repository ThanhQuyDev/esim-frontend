import { HeroSection } from "@/components/layout/sections/hero";
import { PartnerBar } from "@/components/layout/sections/partner-bar";
import { WhatIsEsim } from "@/components/layout/sections/what-is-esim";
import { DestinationsSection } from "@/components/layout/sections/destinations";
import { FeaturesSection } from "@/components/layout/sections/features";
import { SecurityFeatures } from "@/components/layout/sections/security-features";
import { HowItWorksSection } from "@/components/layout/sections/how-it-works";
import { DownloadAppSection } from "@/components/layout/sections/download-app";
import { TestimonialsSection } from "@/components/layout/sections/testimonials";
import { FAQSection } from "@/components/layout/sections/faq";
import { ReferFriendBanner } from "@/components/layout/sections/refer-friend";
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
  const dict = await getDictionary(params.lang);
  return getSeoMetadata(`/${params.lang}`, {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function Home({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <main role="main">
      <HeroSection dict={dict.hero} />
      <PartnerBar dict={dict.partnerBar} />
      <WhatIsEsim dict={dict.whatIsEsim} lang={params.lang} />
      <DestinationsSection dict={dict.destinations} lang={params.lang} />
      <FeaturesSection dict={dict.whyChoose} lang={params.lang} />
      <SecurityFeatures dict={dict.security} />
      <HowItWorksSection dict={dict.howItWorks} />
      <DownloadAppSection dict={dict.downloadApp} />
      <TestimonialsSection dict={dict.testimonials} />
      <FAQSection dict={dict.faq} lang={params.lang} />
      <ReferFriendBanner dict={dict.referFriend} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
