import { Suspense } from "react";
import { EsimLookupContent } from "@/components/layout/sections/esim-lookup/esim-lookup-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const lookup = dict.esimLookup;
  return getSeoMetadata(getCmsSeoUrlForPage("/check-esim", locale), {
    title: lookup.metadata.title,
    description: lookup.metadata.description,
  });
}

/**
 * Public eSIM lookup (#003): a customer checks data and expiry with the ICCID
 * alone, no account needed, and can forward the resulting link to whoever is
 * carrying the eSIM.
 */
export default async function CheckEsimPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const lookup = dict.esimLookup;

  return (
    <main role="main">
      <div className="relative">
        <div className="max-sm:hidden absolute -top-[116px] bottom-0 w-full bg-[linear-gradient(#9FCFF2,#F7F7F8)]" />
        <div className="relative z-10">
          <Breadcrumb items={[{ label: dict.breadcrumb.checkEsim }]} lang={locale} />
        </div>
        <div className="relative py-16 max-sm:pb-8">
          <div className="container mx-auto">
            <div className="lg:max-w-[768px] py-10 mx-4 lg:mx-auto relative">
              <div className="sm:hidden absolute -top-[120px] -left-4 w-[calc(100%+32px)] h-[calc(100%+220px)] bg-[linear-gradient(#9FCFF2,#F7F7F8)] z-[-1]" />
              <div className="flex flex-col items-center gap-y-6">
                <h1 className="heading-2xl text-center text-text-primary">
                  {lookup.hero.title}
                </h1>
                <p className="body-md text-text-secondary text-center">
                  {lookup.hero.subtitle}
                </p>
              </div>
            </div>
            {/* useSearchParams needs a Suspense boundary to prerender. */}
            <Suspense fallback={null}>
              <EsimLookupContent dict={lookup} lang={locale} />
            </Suspense>
          </div>
        </div>
      </div>

      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
