import { notFound, permanentRedirect } from "next/navigation";
import {
  getDestinationBySlug,
  getRegionBySlug,
  getWhyChooseUs,
  getDestinations,
  getRegions,
  getPlansByDestinationSlug,
  getPlansByRegionSlug,
} from "@/lib/api";
import { localizedSlug } from "@/lib/slug";
import {
  findRegionGroupBySlug,
  groupRegions,
  regionAsDestination,
  type RegionGroup,
} from "@/lib/region-groups";
import { RegionVariantTabs } from "@/components/layout/sections/region-group/region-variant-tabs";
import { faqCandidateUrls } from "@/lib/faq-urls";
import { RegionSuggestions } from "@/components/layout/sections/destination/region-suggestions";
import { buildRegionSuggestions } from "@/lib/region-suggestions";
import { buildHowItWorksDict } from "@/lib/how-it-works";
import { buildSeoTemplateVars } from "@/lib/seo-vars";
import {
  prepareWhyChooseUs,
  whyChooseUsCount,
  WHY_CHOOSE_US_POOL_SIZE,
} from "@/lib/why-choose-us";
import { getUsdVndRate } from "@/lib/exchange-rate";
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

/**
 * Regions that share a name but cover a different number of countries are
 * listed once, under a group slug (`esim-chau-a`). Resolve that slug — and
 * also a variant's own slug, so a variant page can offer its siblings.
 *
 * Returns null when the backend is unreachable: the caller then behaves
 * exactly as before this grouping existed.
 */
async function resolveRegionGroup(
  slug: string,
  locale: Locale
): Promise<RegionGroup | null> {
  try {
    const regions = await getRegions({ limit: 500 });
    return findRegionGroupBySlug(regions.data, slug, locale);
  } catch {
    return null;
  }
}

/**
 * These pages are statically generated, so their SEO lookup has to be cached
 * (an uncached one made every destination page answer 500). A CMS edit reaches
 * them within this window.
 */
const SEO_REVALIDATE_SECONDS = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const entity = await resolveEntity(params.slug, locale);

  if (!entity) {
    // Group landing page (`/esim-chau-a`): no record of its own, so build the
    // metadata from the group label and the generic region SEO config.
    const group = await resolveRegionGroup(params.slug, locale);
    if (group && group.slug === params.slug) {
      return getSeoMetadata(
        [
          localizedPath(params.slug, locale),
          locale === "vi" ? "/region" : "/en/region",
        ],
        {
          title: dict.destinationPage.title.replace("{destination}", group.label),
          description: dict.destinationPage.subtitle.replace(
            "{destination}",
            group.label
          ),
        },
        { name: group.label },
        { revalidate: SEO_REVALIDATE_SECONDS }
      );
    }
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

  // Price / lineup variables, so a CMS record can read "eSIM ${name} từ
  // ${fromPrice}" and stay correct as prices move (#047). The plans call is the
  // same cached one the page body makes.
  const seoVars = buildSeoTemplateVars({
    name: localizedName,
    plans:
      entity.type === "destination"
        ? await getPlansByDestinationSlug(params.slug, locale)
        : await getPlansByRegionSlug(params.slug, locale),
    lang: locale,
    // English copy quotes USD, converted at the live rate (#050).
    rate: await getUsdVndRate(),
  });

  const canonicalPath = localizedPath(
    localizedSlug(entity.data, locale),
    locale
  );

  const metadata = await getSeoMetadata(
    seoSlugs,
    { title: fallbackTitle, description: fallbackDescription },
    seoVars,
    { locale, url: canonicalPath, revalidate: SEO_REVALIDATE_SECONDS }
  );

  // SEO: canonical points at this locale's canonical slug; hreflang lists the
  // slug variant for each locale (vi → slugVi || slug, en → slug).
  const viSlug = localizedSlug(entity.data, "vi");
  const enSlug = localizedSlug(entity.data, "en");
  metadata.alternates = {
    canonical: canonicalPath,
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
      // Landing pages for same-named region groups (`esim-chau-a`). Only
      // multi-variant groups get one; single regions already have their own.
      for (const group of groupRegions(regionRes.data, locale)) {
        if (
          group.members.length > 1 &&
          group.slug &&
          !params.some((p) => p.locale === locale && p.slug === group.slug)
        ) {
          params.push({ locale, slug: group.slug });
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
    const group = await resolveRegionGroup(params.slug, locale);
    if (group && group.slug === params.slug) {
      const groupFaqSlugs = faqCandidateUrls({
        pathname: localizedPath(params.slug, locale),
        locale,
        entityType: "region",
      });
      return (
        <main role="main">
          <Breadcrumb
            items={[
              {
                label: dict.breadcrumb.destinations,
                href: locale === "vi" ? "/diem-den" : `/${locale}/destinations`,
              },
              { label: group.label },
            ]}
            lang={locale}
          />
          {/* Every pack of the group on one page: the tabs swap the plans in
              place, so the URL stays `/esim-chau-a` (#004). The plan picker
              renders the page's h1. */}
          <RegionVariantTabs
            members={group.members}
            lang={locale}
            dict={dict.destinationPage}
            fromLabel={dict.allDestinations.from}
          />
          <div className="max-w-[1168px] mx-auto px-4 sm:px-0">
            <LazyEsimComparison dict={dict.whatIsEsimPage.comparison} />
            <LazyTestimonialsSection dict={dict.testimonials} />
            <LazyDownloadAppSection dict={dict.downloadApp} />
            <LazyFAQSection
              dict={dict.faq}
              lang={locale}
              url={groupFaqSlugs[0]}
              urls={groupFaqSlugs}
              templateVars={{ name: group.label }}
            />
            <LazyReferFriendBanner dict={dict.referFriend} lang={locale} />
            <LazyFooterSection dict={dict.footer} lang={locale} />
          </div>
        </main>
      );
    }
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
    // Same candidates, in the same priority, as the FAQPage schema in <head>:
    // the page's own FAQs under any of its slugs, then the blanket ones (#019).
    const faqSlugs = faqCandidateUrls({
      pathname: localizedPath(params.slug, locale),
      locale,
      entityType: "destination",
      entitySlugs: [entity.data.slugVi, entity.data.slug],
    });
    const destination = entity.data;
    // The whole pool, so the draw below has something to draw from: the
    // default limit of 6 meant a seventh reason was never shown (#087).
    const whyChooseUsRes = await getWhyChooseUs({
      lang: locale,
      type: "quoc_gia",
      limit: WHY_CHOOSE_US_POOL_SIZE,
    });
    // Copy can read "eSIM ${name} chỉ từ ${fromPrice}"; the page shows a
    // random handful of the reasons written for country pages (#087), drawn in
    // the browser because this page is prerendered (#042).
    const whyChooseUsItems = prepareWhyChooseUs(
      whyChooseUsRes.data,
      buildSeoTemplateVars({
        name: localizedName,
        plans: await getPlansByDestinationSlug(params.slug, locale),
        lang: locale,
        rate: await getUsdVndRate(),
      })
    );
    // Regional / global packs that cover this country (#043). A failure here
    // must not take the country page down, so it degrades to no suggestions.
    const regionSuggestions = await getRegions({ limit: 500 })
      .then((res) => buildRegionSuggestions(destination, res.data, locale))
      .catch(() => []);
    // The usage steps describe THIS country's plan lineup (#044).
    const howItWorks = buildHowItWorksDict(dict.howItWorks, {
      name: localizedName,
      plans: await getPlansByDestinationSlug(params.slug, locale),
      lang: locale,
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
          {/* Regional / global alternatives — above the usage steps, per #043 */}
          <RegionSuggestions
            items={regionSuggestions}
            countryName={localizedName}
            dict={{
              ...dict.regionSuggestions,
              from: dict.allDestinations.from,
              country: dict.allDestinations.country,
              countries: dict.allDestinations.countries,
            }}
            lang={locale}
          />
          <LazyHowItWorksSection dict={howItWorks} />
          <LazyFeaturesSection
            dict={dict.whyChoose}
            lang={locale}
            features={whyChooseUsItems}
            count={whyChooseUsCount("quoc_gia")}
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
  const faqSlugs = faqCandidateUrls({
    pathname: localizedPath(params.slug, locale),
    locale,
    entityType: "region",
    entitySlugs: [entity.data.slugVi, entity.data.slug],
  });
  const region = entity.data;
  const whyChooseUsRes = await getWhyChooseUs({
    lang: locale,
    type: "khu_vuc",
    limit: WHY_CHOOSE_US_POOL_SIZE,
  });
  const whyChooseUsItems = prepareWhyChooseUs(
    whyChooseUsRes.data,
    buildSeoTemplateVars({
      name: localizedName,
      plans: await getPlansByRegionSlug(params.slug, locale),
      lang: locale,
      rate: await getUsdVndRate(),
    })
  );
  // The usage steps describe THIS region's plan lineup (#044).
  const howItWorks = buildHowItWorksDict(dict.howItWorks, {
    name: localizedName,
    plans: await getPlansByRegionSlug(params.slug, locale),
    lang: locale,
  });

  // Same-named regions with a different country count are siblings: offer them
  // here too, so landing straight on `/esim-chau-a-13-quoc-gia` still shows the
  // other packs.
  const variantGroup = await resolveRegionGroup(params.slug, locale);

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
      {variantGroup ? (
        // The other packs are tabs over the plans, switched in place (#004).
        // The pack being viewed uses the full record fetched above rather than
        // its list entry.
        <RegionVariantTabs
          members={variantGroup.members.map((m) =>
            m.id === region.id ? region : m
          )}
          lang={locale}
          dict={dict.destinationPage}
          fromLabel={dict.allDestinations.from}
          initialSlug={params.slug}
        />
      ) : (
        <DestinationPlans
          destination={regionAsDestination(region)}
          slug={params.slug}
          dict={dict.destinationPage}
          lang={locale}
          planSource="region"
          initialRegion={region}
        />
      )}
      <div className="max-w-[1168px] mx-auto px-4 sm:px-0">
        <LazyHowItWorksSection dict={howItWorks} />
        <LazyFeaturesSection
          dict={dict.whyChoose}
          lang={locale}
          features={whyChooseUsItems}
          count={whyChooseUsCount("khu_vuc")}
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
