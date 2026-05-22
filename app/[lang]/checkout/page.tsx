import { Suspense } from "react";
import { CheckoutPageContent } from "@/components/layout/sections/checkout";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  return getSeoMetadata(`/${params.lang}/checkout`);
}

export default async function CheckoutPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.checkout }]}
        lang={params.lang}
      />
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <h1 className="text-2xl font-bold text-text-primary mb-8">
          {(dict as any).checkout?.title || "Checkout"}
        </h1>
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-600 rounded-full" /></div>}>
          <CheckoutPageContent dict={(dict as any).checkout || {}} lang={params.lang} />
        </Suspense>
      </div>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
