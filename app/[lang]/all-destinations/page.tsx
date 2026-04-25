import { AllDestinationsContent } from "@/components/layout/sections/all-destinations";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

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
