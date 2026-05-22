import { SupportForm } from "@/components/layout/sections/support";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return getSeoMetadata(`/${params.lang}/help-center/support`, {
    title: dict.support?.form?.pageTitle,
    description: dict.support?.form?.pageSubtitle,
  });
}

export default async function SupportPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const formDict = dict.support.form;

  return (
    <>
      <main role="main" className="min-h-[calc(100vh-200px)]">
        <Breadcrumb
          items={[
            { label: dict.breadcrumb.helpCenter, href: `/${params.lang}/help-center` },
            { label: dict.breadcrumb.helpCenterSupport },
          ]}
          lang={params.lang}
        />

        {/* Hero header */}
        <section className="bg-gradient-to-b from-blue-50/60 to-white border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
              {formDict.pageTitle}
            </h1>
            <p className="mt-3 text-base text-gray-600 max-w-xl mx-auto">
              {formDict.pageSubtitle}
            </p>
          </div>
        </section>

        {/* Form card */}
        <section className="py-10 md:py-14">
          <div className="max-w-[720px] mx-auto px-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <SupportForm lang={params.lang} dict={formDict} />
            </div>
          </div>
        </section>
      </main>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
