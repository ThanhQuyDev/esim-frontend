import { notFound } from "next/navigation";
import { getRegionBySlug, getWhyChooseUs } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { DestinationPlans } from "@/components/layout/sections/destination";
import {
  LazyDownloadAppSection,
  LazyEsimComparison,
  LazyFAQSection,
  LazyFeaturesSection,
  LazyFooterSection,
  LazyHowItWorksSection,
  LazyReferFriendBanner,
  LazyTestimonialsSection,
} from "@/components/layout/sections/destination/lazy-below-fold-sections";
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
  const [dict, region, whyChooseUsRes] = await Promise.all([
    getDictionary(params.lang),
    getRegionBySlug(params.slug, params.lang),
    getWhyChooseUs({ lang: params.lang }),
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
        initialRegion={region}
      />
      <LazyHowItWorksSection dict={dict.howItWorks} />
      <LazyFeaturesSection dict={dict.whyChoose} lang={params.lang} features={whyChooseUsRes.data} />
      <LazyEsimComparison dict={dict.whatIsEsimPage.comparison} />
      <LazyTestimonialsSection dict={dict.testimonials} />
      <LazyDownloadAppSection dict={dict.downloadApp} />
      <LazyFAQSection dict={dict.faq} lang={params.lang} />
      <LazyReferFriendBanner dict={dict.referFriend} />
      <LazyFooterSection dict={dict.footer} />
    </main>
  );
}
