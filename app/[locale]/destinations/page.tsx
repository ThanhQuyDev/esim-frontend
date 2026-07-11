import { AllDestinationsContent } from "@/components/layout/sections/all-destinations";
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
  return getSeoMetadata(getCmsSeoUrlForPage("/destinations", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function AllDestinationsPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.allDestinations }]}
        lang={locale}
      />
      <AllDestinationsContent
        dict={dict.allDestinations}
        lang={locale}
      />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
