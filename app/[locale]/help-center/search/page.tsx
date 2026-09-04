import { Suspense } from "react";
import { SearchResultsContent } from "@/components/layout/sections/help-center/search-results-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { localizedHref } from "@/lib/route-mapping";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const query = searchParams.q || "";
  const title =
    locale === "vi"
      ? `Kết quả tìm kiếm "${query}" - Trung tâm trợ giúp`
      : `Search results for "${query}" - Help Center`;
  const cms = await getSeoMetadata(
    getCmsSeoUrlForPage("/help-center/search", locale),
    { title }
  );
  return { ...cms, title };
}

export default async function HelpCenterSearchPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.helpCenter, href: localizedHref(locale, "help-center") },
          { label: dict.breadcrumb.helpCenterSearch },
        ]}
        lang={locale}
      />
      <Suspense
        fallback={
          <div className="container mx-auto px-8 py-12 text-center text-gray-500">
            {locale === "vi" ? "Đang tải..." : "Loading..."}
          </div>
        }
      >
        <SearchResultsContent lang={locale} />
      </Suspense>
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
