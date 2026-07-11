import { CartPageContent } from "@/components/layout/sections/cart";
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
  return getSeoMetadata(getCmsSeoUrlForPage("/cart", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function CartPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <main role="main">
      <Breadcrumb
        items={[{ label: dict.breadcrumb.cart }]}
        lang={locale}
      />
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <h1 className="text-[1.7rem] sm:text-2xl font-medium text-text-primary mb-8">
          {(dict as any).cart?.title || "Shopping Cart"}
        </h1>
        <CartPageContent dict={(dict as any).cart || {}} lang={locale} />
      </div>
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
