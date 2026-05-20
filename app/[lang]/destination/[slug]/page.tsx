import { notFound } from "next/navigation";
import { getDestinationBySlug, getWhyChooseUs } from "@/lib/api";
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

interface DestinationPageProps {
  params: { lang: Locale; slug: string };
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const destination = await getDestinationBySlug(params.slug, params.lang);

  if (!destination) {
    return { title: dict.destinationPage.notFound };
  }

  const title = dict.destinationPage.title.replace(
    "{destination}",
    destination.name
  );
  const description = dict.destinationPage.subtitle.replace(
    "{destination}",
    destination.name
  );

  return getSeoMetadata(`/${params.lang}/destination/${params.slug}`, {
    title,
    description,
  });
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const [dict, destination, whyChooseUsRes] = await Promise.all([
    getDictionary(params.lang),
    getDestinationBySlug(params.slug, params.lang),
    getWhyChooseUs({ lang: params.lang, type: "quoc_gia" }),
  ]);

  if (!destination) {
    notFound();
  }

  return (
    <main role="main">
      <DestinationPlans
        destination={destination}
        slug={params.slug}
        dict={dict.destinationPage}
        lang={params.lang}
      />
      <LazyHowItWorksSection dict={dict.howItWorks} />
      <LazyFeaturesSection dict={dict.whyChoose} lang={params.lang} features={whyChooseUsRes.data} />
      <LazyEsimComparison dict={dict.whatIsEsimPage.comparison} />
      <LazyTestimonialsSection dict={dict.testimonials} />
      <LazyDownloadAppSection dict={dict.downloadApp} />
      <LazyFAQSection dict={dict.faq} lang={params.lang} />
      <LazyReferFriendBanner dict={dict.referFriend} />
      <LazyFooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
