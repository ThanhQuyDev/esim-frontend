import { notFound } from "next/navigation";
import { getDestinationBySlug, getPlansByDestinationSlug } from "@/lib/api";
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
  const [dict, destination, plans] = await Promise.all([
    getDictionary(params.lang),
    getDestinationBySlug(params.slug, params.lang),
    getPlansByDestinationSlug(params.slug, params.lang),
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
