import {
  DataCalculator,
  ContentSections,
  DataUsageTable,
  FaqTabsSection,
} from "@/components/layout/sections/data-calculator";
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
  const calc = dict.dataCalculator;
  return getSeoMetadata(`/${params.lang}/cong-cu-tinh-data`, {
    title: calc.metadata.title,
    description: calc.metadata.description,
  });
}

export default async function DataCalculatorPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const calc = dict.dataCalculator;

  return (
    <main role="main">
      {/* Hero / Calculator Section */}
      <div className="relative">
        <div className="max-sm:hidden absolute -top-[72px] bottom-0 w-full bg-[linear-gradient(#9FCFF2,#F7F7F8)]" />
        <div className="relative py-16 max-sm:pb-0">
          <div className="sm:mx-auto">
            <div className="container mx-auto">
              {/* Title */}
              <div className="lg:max-w-[768px] py-10 mx-4 lg:mx-auto relative">
                <div className="sm:hidden absolute -top-[120px] -left-4 w-[calc(100%+32px)] h-[calc(100%+220px)] bg-[linear-gradient(#9FCFF2,#F7F7F8)] z-[-1]" />
                <div className="flex flex-col items-center gap-y-6">
                  <h1 className="heading-2xl text-center text-text-primary">
                    {calc.hero.title}
                  </h1>
                  <p className="body-md text-text-secondary text-center">
                    {calc.hero.subtitle}
                  </p>
                </div>
              </div>

              {/* Calculator */}
              <DataCalculator dict={calc.calculator} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <ContentSections dict={calc} />

      {/* Data Usage Table */}
      <DataUsageTable dict={calc.dataTable} />

      {/* FAQ with Tabs */}
      <FaqTabsSection dict={calc.faqSection} lang={params.lang} />

      {/* Footer */}
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
