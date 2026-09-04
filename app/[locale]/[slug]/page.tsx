import { notFound, permanentRedirect } from "next/navigation";
import {
  getDestinationBySlug,
  getRegionBySlug,
  getWhyChooseUs,
  getDestinations,
  getRegions,
} from "@/lib/api";
import { localizedSlug } from "@/lib/slug";
import { getSeoMetadata } from "@/lib/seo";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import { DestinationPlans } from "@/components/layout/sections/destination";
import { Breadcrumb } from "@/components/layout/breadcrumb";
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
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const entity = await resolveEntity(params.slug, locale);

  if (!entity) {
    return { title: dict.destinationPage?.notFound ?? "Not Found" };
  }

  const localizedName = pickLocalizedName(entity.data, locale);
  const fallbackTitle = dict.destinationPage.title.replace(
    "{destination}",
    localizedName
  );
  const fallbackDescription = dict.destinationPage.subtitle.replace(
    "{destination}",
    localizedName
  );

  // The exact SEO config must be looked up with the locale-aware public path.
  // Without `/en`, English destination/region pages queried the Vietnamese
  // `/${slug}` record first, so title/description/keywords were Vietnamese
  // while structured data (which uses the request pathname) stayed English.
  const exactSeoSlug = localizedPath(params.slug, locale);
  const genericSlug = entity.type === "destination"
    ? (locale === "vi" ? "/destination" : "/en/destination")
    : (locale === "vi" ? "/region" : "/en/region");
  const seoSlugs = [exactSeoSlug, genericSlug];

  const metadata = await getSeoMetadata(
    seoSlugs,
    { title: fallbackTitle, description: fallbackDescription },
    { name: localizedName }
  );

  // SEO: canonical points at this locale's canonical slug; hreflang lists the
  // slug variant for each locale (vi → slugVi || slug, en → slug).
  const viSlug = localizedSlug(entity.data, "vi");
  const enSlug = localizedSlug(entity.data, "en");
  metadata.alternates = {
    canonical: localizedPath(localizedSlug(entity.data, locale), locale),
    languages: {
      vi: localizedPath(viSlug, "vi"),
      en: localizedPath(enSlug, "en"),
    },
  };

  return metadata;
}

/**
 * Build the public path for an entity's canonical slug in a given locale.
 * vi (default locale) has no prefix; en is prefixed with `/en`.
 */
function localizedPath(slug: string, locale: Locale): string {
  return locale === "vi" ? `/${slug}` : `/${locale}/${slug}`;
}

/**
 * Build static params at build time for all destinations and regions
 * across all locales. This enables SSG for every entity page.
 * Each locale uses its own canonical slug (vi → slugVi || slug, en → slug).
 */
export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  try {
    const [destRes, regionRes] = await Promise.all([
      getDestinations({ limit: 500 }),
      getRegions({ limit: 500 }),
    ]);

    for (const locale of ["en", "vi"] as const) {
      for (const dest of destRes.data) {
        const slug = localizedSlug(dest, locale);
        if (slug) {
          params.push({ locale, slug });
        }
      }
      for (const region of regionRes.data) {
        const slug = localizedSlug(region, locale);
        if (slug) {
          params.push({ locale, slug });
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
}: {
  params: { slug: string };
}) {
  const locale = (await getLocale()) as Locale;
  const [dict, entity] = await Promise.all([
    getDictionary(locale),
    resolveEntity(params.slug, locale),
  ]);

  if (!entity) {
    notFound();
  }

  // SEO: enforce the locale's canonical slug. If the visitor reached this page
  // via the other locale's slug (e.g. VI user on `/esim-thailand`), 308-redirect
  // to the canonical slug for this locale to avoid duplicate content.
  const canonicalSlug = localizedSlug(entity.data, locale);
  if (canonicalSlug && canonicalSlug !== params.slug) {
    permanentRedirect(localizedPath(canonicalSlug, locale));
  }

  const localizedName = pickLocalizedName(entity.data, locale);

  if (entity.type === "destination") {
    const localePrefix = locale === "vi" ? "" : `/${locale}`;
    const faqSlugs = [
      localizedPath(params.slug, locale),
      `${localePrefix}/destination`,
    ];
    const destination = entity.data;
    const whyChooseUsRes = await getWhyChooseUs({
      lang: locale,
      type: "quoc_gia",
    });

    return (
      <main role="main">
        <Breadcrumb
          items={[
            {
              label: dict.breadcrumb.destinations,
              href: (locale === "vi" ? '/diem-den' : `/${locale}/destinations`),
            },
            { label: localizedName },
          ]}
          lang={locale}
        />
        <DestinationPlans
          destination={destination}
          slug={params.slug}
          dict={dict.destinationPage}
          lang={locale}
        />
        <div className="max-w-[1168px] mx-auto">
          <LazyHowItWorksSection dict={dict.howItWorks} />
          <LazyFeaturesSection
            dict={dict.whyChoose}
            lang={locale}
            features={whyChooseUsRes.data}
          />
          <LazyEsimComparison dict={dict.whatIsEsimPage.comparison} />
          <PartnerBar dict={dict.partnerBar} />
          <LazyTestimonialsSection dict={dict.testimonials} />
          <LazyDownloadAppSection dict={dict.downloadApp} />
          <LazyFAQSection
            dict={dict.faq}
            lang={locale}
            url={faqSlugs[0]}
            urls={faqSlugs}
            templateVars={{ name: localizedName }}
          />
          <LazyReferFriendBanner dict={dict.referFriend} lang={locale} />
          <LazyFooterSection dict={dict.footer} lang={locale} />
        </div>
      </main>
    );
  }

  // Region
  const localePrefix = locale === "vi" ? "" : `/${locale}`;
  const faqSlugs = [
    localizedPath(params.slug, locale),
    `${localePrefix}/region`,
  ];
  const region = entity.data;
  const whyChooseUsRes = await getWhyChooseUs({
    lang: locale,
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
            label: dict.breadcrumb.destinations,
            href: (locale === "vi" ? '/diem-den' : `/${locale}/destinations`),
          },
          { label: localizedName },
        ]}
        lang={locale}
      />
      <DestinationPlans
        destination={destination}
        slug={params.slug}
        dict={dict.destinationPage}
        lang={locale}
        planSource="region"
        initialRegion={region}
      />
      <div className="max-w-[1168px] mx-auto px-4 sm:px-0">
        <LazyHowItWorksSection dict={dict.howItWorks} />
        <LazyFeaturesSection
          dict={dict.whyChoose}
          lang={locale}
          features={whyChooseUsRes.data}
        />
        <LazyEsimComparison dict={dict.whatIsEsimPage.comparison} />
        <LazyTestimonialsSection dict={dict.testimonials} />
        <LazyDownloadAppSection dict={dict.downloadApp} />
        <LazyFAQSection
          dict={dict.faq}
          lang={locale}
          url={faqSlugs[0]}
          urls={faqSlugs}
          templateVars={{ name: localizedName }}
        />
        <LazyReferFriendBanner dict={dict.referFriend} lang={locale} />
        <LazyFooterSection dict={dict.footer} lang={locale} />
      </div>
    </main>
  );
}
