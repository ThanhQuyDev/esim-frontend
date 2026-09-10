import {
  AffiliateAudience,
  AffiliateBenefits,
  AffiliateCta,
  AffiliateFaq,
  AffiliateHero,
  AffiliateHowItWorks,
} from "@/components/layout/sections/affiliate-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const page = dict.affiliatePage;
  return getSeoMetadata(getCmsSeoUrlForPage("/affiliate", locale), {
    title: page.metadata.title,
    description: page.metadata.description,
  });
}

/**
 * Affiliate programme landing page (#095, ý 4).
 *
 * The programme existed end to end — links, clicks, commissions, payouts — with
 * nothing on the public site explaining it or letting anyone in. This is the
 * page that sells it; the form it points at is `/affiliate/register`.
 */
export default async function AffiliatePage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const page = dict.affiliatePage;

  return (
    <>
      <main role="main">
        <Breadcrumb items={[{ label: page.breadcrumb }]} lang={locale} />
        <AffiliateHero dict={page.hero} lang={locale} />
        <AffiliateHowItWorks dict={page.howItWorks} />
        <AffiliateBenefits dict={page.benefits} />
        <AffiliateAudience dict={page.audience} />
        <AffiliateFaq dict={page.faq} />
        <AffiliateCta dict={page.cta} lang={locale} />
      </main>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
