import { AffiliateRegisterForm } from "@/components/layout/sections/affiliate-register";
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
  const page = dict.affiliateRegister;
  return getSeoMetadata(getCmsSeoUrlForPage("/affiliate/register", locale), {
    title: page.pageTitle,
    description: page.pageSubtitle,
  });
}

/**
 * Affiliate sign-up (#095).
 *
 * `POST /partners/apply` was already live but had no screen behind it, so
 * joining the programme meant emailing someone. Applications arrive as
 * `pending` and an admin decides in the CMS.
 */
export default async function AffiliateRegisterPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const page = dict.affiliateRegister;

  return (
    <>
      <main role="main" className="min-h-[calc(100vh-200px)]">
        <Breadcrumb items={[{ label: page.breadcrumb }]} lang={locale} />

        <section className="bg-gradient-to-b from-blue-50/60 to-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              {page.pageTitle}
            </h1>
            <p className="mt-3 text-xl sm:text-base text-gray-600 max-w-xl mx-auto">
              {page.pageSubtitle}
            </p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="max-w-[760px] mx-auto px-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <AffiliateRegisterForm lang={locale} dict={page} />
            </div>
          </div>
        </section>
      </main>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
