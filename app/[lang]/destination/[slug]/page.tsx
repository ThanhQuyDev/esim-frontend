import { notFound } from "next/navigation";
import { getDestinationBySlug, getWhyChooseUs } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { DestinationPlans } from "@/components/layout/sections/destination";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { localizedHref } from "@/lib/route-mapping";
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

function pickLocalizedName(
  dest: { name: string; title?: string | null; titleVi?: string | null },
  lang: Locale
): string {
  if (lang === "vi") {
    return dest.titleVi || dest.title || dest.name;
  }
  return dest.title || dest.titleVi || dest.name;
}

export async function generateMetadata({
  params,
}: DestinationPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const destination = await getDestinationBySlug(params.slug, params.lang);

  if (!destination) {
    return { title: dict.destinationPage.notFound };
  }

  const localizedName = pickLocalizedName(destination, params.lang);
  const title = dict.destinationPage.title.replace(
    "{destination}",
    localizedName
  );
  const description = dict.destinationPage.subtitle.replace(
    "{destination}",
    localizedName
  );

  return getSeoMetadata(
    `/${params.lang}/destination/${params.slug}`,
    { title, description },
    { name: localizedName }
  );
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

  const localizedName = pickLocalizedName(destination, params.lang);
  const pageUrl = `/${params.lang}/destination/${params.slug}`;

  return (
    <main role="main">
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.allDestinations, href: localizedHref(params.lang, "all-destinations") },
          { label: localizedName },
        ]}
        lang={params.lang}
      />
      <DestinationPlans
        destination={destination}
        slug={params.slug}
        dict={dict.destinationPage}
        lang={params.lang}
      />
      <div className="max-w-[1168px] mx-auto px-0 md:px-6">
        <LazyHowItWorksSection dict={dict.howItWorks} />
        <LazyFeaturesSection dict={dict.whyChoose} lang={params.lang} features={whyChooseUsRes.data} />
        <LazyEsimComparison dict={dict.whatIsEsimPage.comparison} />
        <LazyTestimonialsSection dict={dict.testimonials} />
        <LazyDownloadAppSection dict={dict.downloadApp} />
        <LazyFAQSection
          dict={dict.faq}
          lang={params.lang}
          url={pageUrl}
          templateVars={{ name: localizedName }}
        />
        <LazyReferFriendBanner dict={dict.referFriend} />
        <LazyFooterSection dict={dict.footer} lang={params.lang} />
      </div>
    </main>
  );
}
