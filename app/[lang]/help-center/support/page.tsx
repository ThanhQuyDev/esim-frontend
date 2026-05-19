import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SupportForm } from "@/components/layout/sections/support";
import { FooterSection } from "@/components/layout/sections/footer";
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
  const basePath = `/${params.lang}/help-center`;

  return (
    <>
      <main role="main" className="min-h-[calc(100vh-200px)]">
        {/* Breadcrumb */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav aria-label="Breadcrumb" className="py-4">
              <ol className="flex items-center gap-1 list-none p-0 m-0 flex-wrap text-sm">
                <li>
                  <Link
                    href={basePath}
                    className="text-gray-700 no-underline hover:text-gray-900 transition-colors"
                  >
                    {formDict.breadcrumbHome}
                  </Link>
                </li>
                <li className="text-gray-400" aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5" />
                </li>
                <li>
                  <span
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {formDict.breadcrumbCurrent}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

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
