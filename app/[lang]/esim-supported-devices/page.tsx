import { DeviceList } from "@/components/layout/sections/supported-devices";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { getSupportedDevices } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

export default async function SupportedDevicesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);
  const devicesData = await getSupportedDevices(undefined, params.lang);

  return (
    <main role="main">
      <DeviceList
        initialData={devicesData.data}
        dict={dict.supportedDevicesPage}
        lang={params.lang}
      />
      <FooterSection dict={dict.footer} />
    </main>
  );
}
