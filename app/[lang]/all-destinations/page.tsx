import { AllDestinationsContent } from "@/components/layout/sections/all-destinations";
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
  return getSeoMetadata(`/${params.lang}/all-destinations`);
}

export default async function AllDestinationsPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <main role="main">
      <AllDestinationsContent
        dict={dict.allDestinations}
        lang={params.lang}
      />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
