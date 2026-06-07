import { AllDestinationsContent } from "@/components/layout/sections/all-destinations";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
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
