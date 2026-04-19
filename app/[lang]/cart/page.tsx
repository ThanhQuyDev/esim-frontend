import { CartPageContent } from "@/components/layout/sections/cart";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";

export default async function CartPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <main role="main">
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <h1 className="text-2xl font-bold text-text-primary mb-8">
          {(dict as any).cart?.title || "Shopping Cart"}
        </h1>
        <CartPageContent dict={(dict as any).cart || {}} lang={params.lang} />
      </div>
      <FooterSection dict={dict.footer} />
    </main>
  );
}
