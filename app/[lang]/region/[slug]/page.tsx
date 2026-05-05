import { notFound } from "next/navigation";
import { getRegionBySlug, getPlansByRegionSlug } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { DestinationPlans } from "@/components/layout/sections/destination";
import { HowItWorksSection } from "@/components/layout/sections/how-it-works";
import { FeaturesSection } from "@/components/layout/sections/features";
import { EsimComparison } from "@/components/layout/sections/what-is-esim-page/comparison";
import { TestimonialsSection } from "@/components/layout/sections/testimonials";
import { DownloadAppSection } from "@/components/layout/sections/download-app";
import { FAQSection } from "@/components/layout/sections/faq";
import { ReferFriendBanner } from "@/components/layout/sections/refer-friend";
import { FooterSection } from "@/components/layout/sections/footer";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import type { Destination } from "@/lib/api";

interface RegionPageProps {
  params: { lang: Locale; slug: string };
}

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const region = await getRegionBySlug(params.slug, params.lang);

  if (!region) {
    return { title: dict.destinationPage.notFound };
  }

  const title = dict.destinationPage.title.replace("{destination}", region.name);
  const description = dict.destinationPage.subtitle.replace(
    "{destination}",
    region.name
  );

  return getSeoMetadata(`/${params.lang}/region/${params.slug}`, {
    title,
    description,
  });
}

export default async function RegionPage({ params }: RegionPageProps) {
  const [dict, region, plans] = await Promise.all([
    getDictionary(params.lang),
    getRegionBySlug(params.slug, params.lang),
    getPlansByRegionSlug(params.slug, params.lang),
  ]);

  if (!region) {
    notFound();
  }

  // Adapt Region to Destination shape for shared components
  const destination: Destination = {
    id: region.id,
    name: region.name,
    slug: region.slug,
    countryCode: "",
    avatarUrl: region.avatarUrl,
    isPopular: false,
    isActive: region.isActive,
    createdAt: region.createdAt,
    updatedAt: region.updatedAt,
  };

  return (
    <main role="main">
      <DestinationPlans
        destination={destination}
        slug={params.slug}
        dict={dict.destinationPage}
        lang={params.lang}
        planSource="region"
        initialPlans={plans}
      />
      <HowItWorksSection dict={dict.howItWorks} />
      <FeaturesSection dict={dict.whyChoose} lang={params.lang} />
      <EsimComparison dict={dict.whatIsEsimPage.comparison} />
      <TestimonialsSection dict={dict.testimonials} />
      <DownloadAppSection dict={dict.downloadApp} />
      <FAQSection dict={dict.faq} lang={params.lang} />
      <ReferFriendBanner dict={dict.referFriend} />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
