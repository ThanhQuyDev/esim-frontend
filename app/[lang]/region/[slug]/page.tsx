import { notFound } from "next/navigation";
import { getRegionBySlug, getWhyChooseUs } from "@/lib/api";
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
import type { Destination } from "@/lib/api";

interface RegionPageProps {
  params: { lang: Locale; slug: string };
}

function pickLocalizedName(
  region: { name: string; title?: string | null; titleVi?: string | null },
  lang: Locale
): string {
  if (lang === "vi") {
    return region.titleVi || region.title || region.name;
  }
  return region.title || region.titleVi || region.name;
}

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const region = await getRegionBySlug(params.slug, params.lang);

  if (!region) {
    return { title: dict.destinationPage.notFound };
  }

  const localizedName = pickLocalizedName(region, params.lang);
  const title = dict.destinationPage.title.replace(
    "{destination}",
    localizedName
  );
  const description = dict.destinationPage.subtitle.replace(
    "{destination}",
    localizedName
  );

  return getSeoMetadata(
    `/${params.lang}/region/${params.slug}`,
    { title, description },
    { name: localizedName }
  );
}

export default async function RegionPage({ params }: RegionPageProps) {
  const [dict, region, whyChooseUsRes] = await Promise.all([
    getDictionary(params.lang),
    getRegionBySlug(params.slug, params.lang),
    getWhyChooseUs({ lang: params.lang, type: "khu_vuc" }),
  ]);

  if (!region) {
    notFound();
  }

  const localizedName = pickLocalizedName(region, params.lang);
  const pageUrl = `/${params.lang}/region/${params.slug}`;

  // Adapt Region to Destination shape for shared components
  const destination: Destination = {
    id: region.id,
    name: region.name,
    slug: region.slug,
    countryCode: "",
    avatarUrl: region.avatarUrl,
    title: region.title,
    titleVi: region.titleVi,
    description: region.description,
    descriptionVi: region.descriptionVi,
    isPopular: false,
    isActive: region.isActive,
    createdAt: region.createdAt,
    updatedAt: region.updatedAt,
  };

  return (
    <main role="main">
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.allDestinations, href: localizedHref(params.lang, "all-destinations") },
          { label: region.name },
        ]}
        lang={params.lang}
      />
      <DestinationPlans
        destination={destination}
        slug={params.slug}
        dict={dict.destinationPage}
        lang={params.lang}
        planSource="region"
        initialRegion={region}
      />
      <div className="max-w-[1168px] mx-auto px-6">
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
