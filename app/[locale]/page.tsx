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
import { getCmsSeoUrlForHome } from "@/lib/cms-seo-url";
import { getSeoMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return getSeoMetadata(
    getCmsSeoUrlForHome(locale as Locale),
    { title: dict.metadata.title, description: dict.metadata.description }
  );
}

export default async function Home() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const homeSlug = getCmsSeoUrlForHome(locale);
  const [heroBanners, footerLinks, faqsRes, whyChooseUsRes] = await Promise.all([
    getHeroBanners({ lang: locale }),
    getFooters({ lang: locale }),
    getFaqs({ lang: locale, urls: [homeSlug] }),
    getWhyChooseUs({ lang: locale, type: "trang_chu" }),
  ]);

  return (
    <main role="main">
      <HeroSection dict={dict.hero} heroBanners={heroBanners} lang={locale} />
      <PartnerBar dict={dict.partnerBar} />
      <WhatIsEsim dict={dict.whatIsEsim} lang={locale} />
      <DestinationsSection dict={dict.destinations} lang={locale} />
      <FeaturesSection dict={dict.whyChoose} lang={locale} features={whyChooseUsRes.data} />
      <SecurityFeatures dict={dict.security} />
      <HowItWorksSection dict={dict.howItWorks} />
      <DownloadAppSection dict={dict.downloadApp} />
      <TestimonialsSection dict={dict.testimonials} />
      <FAQSection
        dict={dict.faq}
        lang={locale}
        initialFaqs={faqsRes.data}
        url={homeSlug}
      />
      <ReferFriendBanner dict={dict.referFriend} lang={locale} />
      <FooterSection
        dict={dict.footer}
        footerLinks={footerLinks}
        lang={locale}
      />
    </main>
  );
}
