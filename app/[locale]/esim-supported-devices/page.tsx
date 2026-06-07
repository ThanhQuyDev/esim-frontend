import { DeviceList } from "@/components/layout/sections/supported-devices";
import { FooterSection } from "@/components/layout/sections/footer";
import { FAQSection } from "@/components/layout/sections/faq";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSupportedDevices } from "@/lib/api";
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

export default async function SupportedDevicesPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  const devicesData = await getSupportedDevices(undefined, locale);

  return (
    <main role="main">
      <div className="relative z-10">
        <Breadcrumb
          items={[{ label: dict.breadcrumb.supportedDevices }]}
          lang={locale}
        />
      </div>
      <DeviceList
        initialData={devicesData.data}
        dict={dict.supportedDevicesPage}
        lang={locale}
      />
      <FAQSection dict={dict.faq} lang={locale} url={`/${locale}/esim-supported-devices`} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
