import { notFound } from "next/navigation";
import {
  getDestinationBySlug,
  getRegionBySlug,
  getWhyChooseUs,
  getDestinations,
  getRegions,
} from "@/lib/api";
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
import type { Destination, Region } from "@/lib/api";
import { PartnerBar } from "@/components/layout/sections/partner-bar";

interface UnifiedSlugPageProps {
  params: { lang: Locale; slug: string };
}

function pickLocalizedName(
  entity: { name: string; title?: string | null; titleVi?: string | null },
  lang: Locale
): string {
  if (lang === "vi") {
    return entity.titleVi || entity.title || entity.name;
  }
  return entity.title || entity.titleVi || entity.name;
}

/**
 * Attempt to resolve a slug to a Destination or Region.
 * Tries Destination first, then Region. Returns null if neither matches.
 */
async function resolveEntity(
  slug: string,
  lang: string
): Promise<
  | { type: "destination"; data: Destination }
  | { type: "region"; data: Region }
  | null
> {
  const destination = await getDestinationBySlug(slug, lang);
  if (destination) {
    return { type: "destination", data: destination };
  }

  const region = await getRegionBySlug(slug, lang);
  if (region) {
    return { type: "region", data: region };
  }

  return null;
}

export async function generateMetadata({
  params,
}: UnifiedSlugPageProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  const entity = await resolveEntity(params.slug, params.lang);

  if (!entity) {
    return { title: dict.destinationPage?.notFound ?? "Not Found" };
  }

  const localizedName = pickLocalizedName(entity.data, params.lang);
  const title = dict.destinationPage.title.replace(
    "{destination}",
    localizedName
  );
  const description = dict.destinationPage.subtitle.replace(
    "{destination}",
    localizedName
  );

  // SEO URL is always the new canonical URL: /[locale]/[slug]
  return getSeoMetadata(
    `/${params.lang}/${params.slug}`,
    { title, description },
    { name: localizedName }
  );
}

/**
 * Build static params at build time for all destinations and regions
 * across all locales. This enables SSG for every entity page.
 */
export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];

  try {
    const [destRes, regionRes] = await Promise.all([
      getDestinations({ limit: 500 }),
      getRegions({ limit: 500 }),
    ]);

    for (const locale of ["en", "vi"] as const) {
      for (const dest of destRes.data) {
        if (dest.slug) {
          params.push({ lang: locale, slug: dest.slug });
        }
      }
      for (const region of regionRes.data) {
        if (region.slug) {
          params.push({ lang: locale, slug: region.slug });
        }
      }
    }
  } catch {
    // Fallback: empty params means ISR at runtime
  }

  return params;
}

export default async function UnifiedSlugPage({
  params,
}: UnifiedSlugPageProps) {
  const [dict, entity] = await Promise.all([
    getDictionary(params.lang),
    resolveEntity(params.slug, params.lang),
  ]);

  if (!entity) {
    notFound();
  }

  const localizedName = pickLocalizedName(entity.data, params.lang);
  const pageUrl = `/${params.lang}/${params.slug}`;

  if (entity.type === "destination") {
    const destination = entity.data;
    const whyChooseUsRes = await getWhyChooseUs({
      lang: params.lang,
      type: "quoc_gia",
    });

    return (
      <main role="main">
        <Breadcrumb
          items={[
            {
              label: dict.breadcrumb.allDestinations,
              href: localizedHref(params.lang, "all-destinations"),
            },
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
        <div className="max-w-[1168px] mx-auto">
          <LazyHowItWorksSection dict={dict.howItWorks} />
          <LazyFeaturesSection
            dict={dict.whyChoose}
            lang={params.lang}
            features={whyChooseUsRes.data}
          />
          <LazyEsimComparison dict={dict.whatIsEsimPage.comparison} />
          <PartnerBar dict={dict.partnerBar} />
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

  // Region
  const region = entity.data;
  const whyChooseUsRes = await getWhyChooseUs({
    lang: params.lang,
    type: "khu_vuc",
  });

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
          {
            label: dict.breadcrumb.allDestinations,
            href: localizedHref(params.lang, "all-destinations"),
          },
          { label: localizedName },
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
        <LazyFeaturesSection
          dict={dict.whyChoose}
          lang={params.lang}
          features={whyChooseUsRes.data}
        />
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
