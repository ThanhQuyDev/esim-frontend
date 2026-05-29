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
import { getFooters, getHeroBanners, getFaqs, getWhyChooseUs } from "@/lib/api";
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
  const homeUrl = `/${params.lang}`;
  const [dict, heroBanners, footerLinks, faqsRes, whyChooseUsRes] = await Promise.all([
    getDictionary(params.lang),
    getHeroBanners({ lang: params.lang }),
    getFooters({ lang: params.lang }),
    getFaqs({ lang: params.lang, url: homeUrl }),
    getWhyChooseUs({ lang: params.lang, type: "trang_chu" }),
  ]);

  return (
    <main role="main">
      <HeroSection dict={dict.hero} heroBanners={heroBanners} lang={params.lang} />
      <PartnerBar dict={dict.partnerBar} />
      <WhatIsEsim dict={dict.whatIsEsim} lang={params.lang} />
      <DestinationsSection dict={dict.destinations} lang={params.lang} />
      <FeaturesSection dict={dict.whyChoose} lang={params.lang} features={whyChooseUsRes.data} />
      <SecurityFeatures dict={dict.security} />
      <HowItWorksSection dict={dict.howItWorks} />
      <DownloadAppSection dict={dict.downloadApp} />
      <TestimonialsSection dict={dict.testimonials} />
      <FAQSection
        dict={dict.faq}
        lang={params.lang}
        initialFaqs={faqsRes.data}
        url={homeUrl}
      />
      <ReferFriendBanner dict={dict.referFriend} />
      <FooterSection
        dict={dict.footer}
        footerLinks={footerLinks}
        lang={params.lang}
      />
    </main>
  );
}
