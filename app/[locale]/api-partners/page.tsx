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
  const page = dict.apiPage;
  return getSeoMetadata(getCmsSeoUrlForPage("/api-partners", locale), {
    title: page.metadata.title,
    description: page.metadata.description,
  });
}

/**
 * API partners (doitac-1410 #014): platforms that sell eSIMs inside their own
 * product. Documentation is shared once an application is approved, so the
 * page promises the process, not endpoints.
 */
export default async function ApiPartnersPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const page = dict.apiPage;
  // Opens the sign-up form on this kind of partner (doitac-1410 #014).
  const registerHref = `${localizedHref(locale, "/affiliate/register")}?loai=api`;

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
