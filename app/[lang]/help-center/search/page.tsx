import { Suspense } from "react";
import { SearchResultsContent } from "@/components/layout/sections/help-center/search-results-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { localizedHref } from "@/lib/route-mapping";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { lang: Locale };
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = searchParams.q || "";
  const title =
    params.lang === "vi"
      ? `Kết quả tìm kiếm "${query}" - Trung tâm trợ giúp`
      : `Search results for "${query}" - Help Center`;
  return { title };
}

export default async function HelpCenterSearchPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <>
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.helpCenter, href: localizedHref(params.lang, "help-center") },
          { label: dict.breadcrumb.helpCenterSearch },
        ]}
        lang={params.lang}
      />
      <Suspense
        fallback={
          <div className="max-w-[1386px] mx-auto px-8 py-12 text-center text-gray-500">
            {params.lang === "vi" ? "Đang tải..." : "Loading..."}
          </div>
        }
      >
        <SearchResultsContent lang={params.lang} />
      </Suspense>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </>
  );
}
