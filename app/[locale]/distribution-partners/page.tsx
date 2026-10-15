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
import { localizedHref } from "@/lib/route-mapping";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const page = dict.distributionPage;
  return getSeoMetadata(getCmsSeoUrlForPage("/distribution-partners", locale), {
    title: page.metadata.title,
    description: page.metadata.description,
  });
}

/**
 * Distribution partners (doitac-1410 #014): resellers who top up a deposit and
 * buy eSIMs at their tier's price in the partner portal. Same sections as the
 * affiliate page, its own words, and "Đăng ký" opens the form on this kind.
 */
export default async function DistributionPartnersPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const page = dict.distributionPage;
  // Opens the sign-up form on this kind of partner (doitac-1410 #014).
  const registerHref = `${localizedHref(locale, "/affiliate/register")}?loai=distribution`;

  return (
    <>
      <main role="main">
        <Breadcrumb items={[{ label: page.breadcrumb }]} lang={locale} />
        <AffiliateHero dict={page.hero} lang={locale} registerHref={registerHref} />
        <AffiliateHowItWorks dict={page.howItWorks} />
        <AffiliateBenefits dict={page.benefits} />
        <AffiliateAudience dict={page.audience} />
        <AffiliateFaq dict={page.faq} />
        <AffiliateCta dict={page.cta} lang={locale} registerHref={registerHref} />
      </main>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
