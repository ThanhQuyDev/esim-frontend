import { SupportForm } from "@/components/layout/sections/support";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.support?.form?.pageTitle ?? "Support",
    description: dict.support?.form?.pageSubtitle ?? "",
  };
}

export default async function SupportPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const formDict = dict.support.form;

  return (
    <>
      <main role="main" className="min-h-[calc(100vh-200px)]">
        <Breadcrumb
          items={[
            { label: dict.breadcrumb.helpCenter, href: `/${locale}/help-center` },
            { label: dict.breadcrumb.helpCenterSupport },
          ]}
          lang={locale}
        />

        {/* Hero header */}
        <section className="bg-gradient-to-b from-blue-50/60 to-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              {formDict.pageTitle}
            </h1>
            <p className="mt-3 text-xl sm:text-base text-gray-600 max-w-xl mx-auto">
              {formDict.pageSubtitle}
            </p>
          </div>
        </section>

        {/* Form card */}
        <section className="py-10 md:py-14">
          <div className="max-w-[720px] mx-auto px-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <SupportForm lang={locale} dict={formDict} />
            </div>
          </div>
        </section>
      </main>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
