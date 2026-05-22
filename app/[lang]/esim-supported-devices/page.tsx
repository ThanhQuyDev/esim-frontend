import { DeviceList } from "@/components/layout/sections/supported-devices";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSupportedDevices } from "@/lib/api";
import { getSeoMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/esim-supported-devices`);
}

export default async function SupportedDevicesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const devicesData = await getSupportedDevices(undefined, params.lang);

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.supportedDevices }]}
        lang={params.lang}
      />
      <DeviceList
        initialData={devicesData.data}
        dict={dict.supportedDevicesPage}
        lang={params.lang}
      />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
