import { notFound } from "next/navigation";
import { getLocalPlansByCarrier, getLocalCarriers } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LocalEsimDetail } from "@/components/layout/sections/local-esim/local-esim-detail";
import { getCarrierMeta } from "@/components/layout/sections/local-esim/carrier-meta";
import {
  LazyHowItWorksSection,
  LazyFeaturesSection,
  LazyFAQSection,
  LazyReferFriendBanner,
  LazyFooterSection,
} from "@/components/layout/sections/destination/lazy-below-fold-sections";
import { PartnerBar } from "@/components/layout/sections/partner-bar";
import { getWhyChooseUs } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

/**
 * Domestic-eSIM carrier detail page (`/esim-noi-dia/[carrier]`).
 *
 * The carrier list is data-driven: any `provider` with active
 * `isLocalInventory` plans gets a page. Plans are fetched grouped and rendered
 * by {@link LocalEsimDetail}. Returns 404 when the carrier has no plans.
 */

export async function generateStaticParams() {
  try {
    const carriers = await getLocalCarriers();
    return carriers.map((c) => ({ carrier: c.provider }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { carrier: string };
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const meta = getCarrierMeta(params.carrier);
  const title =
    locale === "vi"
      ? `eSIM ${meta.label} nội địa Việt Nam | esim.vn`
      : `${meta.label} domestic eSIM Vietnam | esim.vn`;
  const description =
    locale === "vi"
      ? `Mua eSIM ${meta.label} nội địa — data 4G/5G, có số thuê bao gọi/SMS, chu kỳ linh hoạt. Nhận mã QR qua email tức thì.`
      : `Buy ${meta.label} domestic eSIM — 4G/5G data with a local phone number, flexible cycles. Instant QR delivery by email.`;
  return { title, description };
}

export default async function DomesticEsimCarrierPage({
  params,
}: {
  params: { carrier: string };
}) {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const carrier = params.carrier.toLowerCase();

  const plans = await getLocalPlansByCarrier(carrier, locale);
  if (!plans) {
    notFound();
  }

  const meta = getCarrierMeta(carrier);
  const whyChooseUsRes = await getWhyChooseUs({
    lang: locale,
    type: "quoc_gia",
  }).catch(() => ({ data: [] }));

  const faqSlugs = [`/esim-noi-dia/${carrier}`, "/destination"];

  return (
    <main role="main">
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.domesticEsim },
          { label: `eSIM ${meta.label}` },
        ]}
        lang={locale}
      />
      <LocalEsimDetail
        carrier={carrier}
        dict={dict.destinationPage}
        lang={locale}
        initialPlans={plans}
      />
      <div className="max-w-[1168px] mx-auto px-4 sm:px-0">
        <LazyHowItWorksSection dict={dict.howItWorks} />
        <LazyFeaturesSection
          dict={dict.whyChoose}
          lang={locale}
          features={whyChooseUsRes.data}
        />
        <PartnerBar dict={dict.partnerBar} />
        <LazyFAQSection
          dict={dict.faq}
          lang={locale}
          url={faqSlugs[0]}
          urls={faqSlugs}
          templateVars={{ name: `eSIM ${meta.label}` }}
        />
        <LazyReferFriendBanner dict={dict.referFriend} lang={locale} />
        <LazyFooterSection dict={dict.footer} lang={locale} />
      </div>
    </main>
  );
}
