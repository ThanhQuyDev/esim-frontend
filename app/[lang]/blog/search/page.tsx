import { Suspense } from "react";
import { BlogSearchResultsContent } from "@/components/layout/sections/blog-page/blog-search-results-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
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
      ? `Kết quả tìm kiếm "${query}" - Blog`
      : `Search results for "${query}" - Blog`;
  return { title };
}

export default async function BlogSearchPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <main role="main">
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.blog, href: `/${params.lang}/blog` },
          { label: dict.breadcrumb.blogSearch || (params.lang === "vi" ? "Tìm kiếm" : "Search") },
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
        <BlogSearchResultsContent lang={params.lang} />
      </Suspense>
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
