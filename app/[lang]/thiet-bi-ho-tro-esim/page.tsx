import { DeviceList } from "@/components/layout/sections/supported-devices";
import { FooterSection } from "@/components/layout/sections/footer";
import { FAQSection } from "@/components/layout/sections/faq";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSupportedDevices } from "@/lib/api";
import { getSeoMetadata } from "@/lib/seo";
import { localizedHref } from "@/lib/route-mapping";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/thiet-bi-ho-tro-esim`);
}

export default async function ThietBiHoTroEsimPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const devicesData = await getSupportedDevices(undefined, params.lang);

  return (
    <main role="main">
      <div className="relative z-10">
        <Breadcrumb
          items={[{ label: dict.breadcrumb.supportedDevices }]}
          lang={params.lang}
        />
      </div>
      <DeviceList
        initialData={devicesData.data}
        dict={dict.supportedDevicesPage}
        lang={params.lang}
      />
      <FAQSection dict={dict.faq} lang={params.lang} url={localizedHref(params.lang, "thiet-bi-ho-tro-esim")} />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
