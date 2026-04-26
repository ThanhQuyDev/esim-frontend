import { HelpCenterContent } from "@/components/layout/sections/help-center";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export default async function HelpCenterPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <HelpCenterContent lang={params.lang} />
      <FooterSection dict={dict.footer} />
    </>
  );
}
