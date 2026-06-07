import {
  DataCalculator,
  ContentSections,
  DataUsageTable,
  FaqTabsSection,
} from "@/components/layout/sections/data-calculator";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  const calc = dict.dataCalculator;
  return {
    title: calc.metadata.title,
    description: calc.metadata.description,
  };
}

export default async function DataCalculatorPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const calc = dict.dataCalculator;

  return (
    <main role="main">
      {/* Hero / Calculator Section */}
      <div className="relative">
        <div className="max-sm:hidden absolute -top-[116px] bottom-0 w-full bg-[linear-gradient(#9FCFF2,#F7F7F8)]" />
        <div className="relative z-10">
          <Breadcrumb
            items={[{ label: dict.breadcrumb.dataCalculator }]}
            lang={locale}
          />
        </div>
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
      <FaqTabsSection dict={calc.faqSection} lang={locale} />

      {/* Footer */}
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
