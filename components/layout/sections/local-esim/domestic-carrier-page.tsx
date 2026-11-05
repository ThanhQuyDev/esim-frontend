import { notFound } from "next/navigation";
import { getDestinationBySlug, getLocalPlansByCarrier, getWhyChooseUs } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { carrierCmsKeys, carrierPagePath } from "@/lib/domestic-url";
import { getUsdVndRate } from "@/lib/exchange-rate";
import { faqCandidateUrls } from "@/lib/faq-urls";
import { getSeoMetadata } from "@/lib/seo";
import { buildSeoTemplateVars } from "@/lib/seo-vars";
import { LocalEsimDetail } from "./local-esim-detail";
import { getCarrierMeta } from "./carrier-meta";
import {
  LazyHowItWorksSection,
  LazyFeaturesSection,
  LazyFAQSection,
  LazyReferFriendBanner,
  LazyFooterSection,
  LazyEsimComparison,
  LazyTestimonialsSection,
  LazyDownloadAppSection,
} from "@/components/layout/sections/destination/lazy-below-fold-sections";
import { PartnerBar } from "@/components/layout/sections/partner-bar";
import {
  prepareWhyChooseUs,
  whyChooseUsCount,
  WHY_CHOOSE_US_POOL_SIZE,
} from "@/lib/why-choose-us";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

/**
 * Domestic-eSIM carrier page, served by `app/[locale]/[slug]` at `/esim-itel`
 * (vande-0411 #072).
 *
 * The carrier list is data-driven: any `provider` with active
 * `isLocalInventory` plans gets a page. Plans are fetched grouped and rendered
 * by {@link LocalEsimDetail}.
 */

/** Same candidates for the visible FAQ block and its FAQPage schema. */
export function carrierFaqUrls(locale: Locale, carrier: string): string[] {
  return faqCandidateUrls({
    pathname: carrierPagePath(locale, carrier),
    locale,
    // Falls back on the country pages' blanket FAQs, as before.
    entityType: "destination",
    entitySlugs: [`esim-noi-dia/${carrier}`],
  });
}

/**
 * The eSIM vs physical SIM table for an eSIM used at home (vande #030):
 * activation does not wait for a destination, and "using abroad" is beside
 * the point.
 */
function domesticComparison(comparison: {
  footnote?: string;
  rows: { label: string; esim: string; sim: string }[];
}) {
  return {
    ...comparison,
    // "We don't support phone numbers yet" is untrue here: a domestic eSIM
    // always has one (vande-0411 #072).
    footnote: undefined,
    rows: comparison.rows
      .slice(0, -1)
      .map((row, i) => (i === 3 ? { ...row, esim: row.esim.replace(/\s*\([^)]*\)\s*$/, "") } : row)),
  };
}

/**
 * Title, description, keywords and share card from the CMS, with the same
 * variables as a country page: "eSIM ${name} từ ${fromPrice}" (vande-0411 #072).
 */
export async function domesticCarrierMetadata(
  carrier: string,
  locale: Locale,
  revalidate: number,
): Promise<Metadata> {
  const plans = await getLocalPlansByCarrier(carrier, locale);
  const meta = getCarrierMeta(carrier);
  const path = carrierPagePath(locale, carrier);
  const metadata = await getSeoMetadata(
    carrierCmsKeys(locale, carrier),
    locale === "vi"
      ? {
          title: `eSIM ${meta.label} nội địa Việt Nam | esim.vn`,
          description: `Mua eSIM ${meta.label} nội địa — data 4G/5G, có số thuê bao gọi/SMS, chu kỳ linh hoạt. Nhận mã QR qua email tức thì.`,
        }
      : {
          title: `${meta.label} domestic eSIM Vietnam | esim.vn`,
          description: `Buy ${meta.label} domestic eSIM — 4G/5G data with a local phone number, flexible cycles. Instant QR delivery by email.`,
        },
    buildSeoTemplateVars({
      name: meta.label,
      plans,
      lang: locale,
      rate: await getUsdVndRate(),
    }),
    { locale, url: path, revalidate },
  );
  metadata.alternates = {
    canonical: path,
    languages: {
      vi: carrierPagePath("vi", carrier),
      en: carrierPagePath("en", carrier),
    },
  };
  return metadata;
}

export async function DomesticCarrierPage({ carrier, locale }: { carrier: string; locale: Locale }) {
  const dict = await getDictionary(locale);

  const plans = await getLocalPlansByCarrier(carrier, locale);
  if (!plans) {
    notFound();
  }

  const meta = getCarrierMeta(carrier);
  // Picture and flag of the page come from Vietnam's destination in the CMS
  // (vande #029), not from the design file.
  const vietnam = await getDestinationBySlug("esim-viet-nam", locale);
  const whyChooseUsRes = await getWhyChooseUs({
    lang: locale,
    type: "quoc_gia",
    limit: WHY_CHOOSE_US_POOL_SIZE,
  }).catch(() => ({ data: [] }));
  // Carrier name fills the copy variables; a random handful of the country-page
  // reasons is shown rather than always the first six (#087).
  const whyChooseUsItems = prepareWhyChooseUs(
    whyChooseUsRes.data,
    buildSeoTemplateVars({
      name: meta.label,
      plans,
      lang: locale,
      rate: await getUsdVndRate(),
    }),
  );

  const faqSlugs = carrierFaqUrls(locale, carrier);

  return (
    <main role="main">
      {/* The breadcrumb is part of the design (#066) and drawn by LocalEsimDetail. */}
      <LocalEsimDetail
        carrier={carrier}
        dict={dict.destinationPage}
        lang={locale}
        initialPlans={plans}
        country={vietnam ? { avatarUrl: vietnam.avatarUrl ?? null, flagUrl: vietnam.flagUrl ?? null } : null}
      />
      <div className="max-w-[1168px] mx-auto px-4 sm:px-0">
        <LazyHowItWorksSection dict={dict.howItWorks} />
        <LazyFeaturesSection
          dict={dict.whyChoose}
          lang={locale}
          features={whyChooseUsItems}
          count={whyChooseUsCount("esim_noi_dia")}
        />
        <PartnerBar dict={dict.partnerBar} centered />
        <LazyEsimComparison dict={domesticComparison(dict.whatIsEsimPage.comparison)} />
      </div>
      {/* Full width, so its grey background reaches both edges (vande #030). */}
      <LazyTestimonialsSection dict={dict.testimonials} />
      <div className="max-w-[1168px] mx-auto px-4 sm:px-0">
        <LazyDownloadAppSection dict={dict.downloadApp} />
        <LazyFAQSection
          dict={dict.faq}
          lang={locale}
          url={faqSlugs[0]}
          urls={faqSlugs}
          templateVars={{ name: meta.label }}
        />
        <LazyReferFriendBanner dict={dict.referFriend} lang={locale} />
        <LazyFooterSection dict={dict.footer} lang={locale} />
      </div>
    </main>
  );
}
