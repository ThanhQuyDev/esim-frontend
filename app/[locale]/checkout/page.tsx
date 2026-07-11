import { Suspense } from "react";
import { CheckoutPageContent } from "@/components/layout/sections/checkout";
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
  return getSeoMetadata(getCmsSeoUrlForPage("/checkout", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function CheckoutPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.checkout }]}
        lang={locale}
      />
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <h1 className="text-[1.7rem] sm:text-2xl font-medium text-text-primary mb-8">
          {(dict as any).checkout?.title || "Checkout"}
        </h1>
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-600 rounded-full" /></div>}>
          <CheckoutPageContent dict={(dict as any).checkout || {}} lang={locale} />
        </Suspense>
      </div>
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
