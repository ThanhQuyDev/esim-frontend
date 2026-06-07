import { Suspense } from "react";
import { BlogSearchResultsContent } from "@/components/layout/sections/blog-page/blog-search-results-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const locale = await getLocale();
  const query = searchParams.q || "";
  const title =
    locale === "vi"
      ? `Kết quả tìm kiếm "${query}" - Blog`
      : `Search results for "${query}" - Blog`;
  return { title };
}

export default async function BlogSearchPage() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <main role="main">
      <Breadcrumb
        items={[
          { label: dict.breadcrumb.blog, href: `/${locale}/blog` },
          { label: dict.breadcrumb.blogSearch || (locale === "vi" ? "Tìm kiếm" : "Search") },
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
        <BlogSearchResultsContent lang={locale} />
      </Suspense>
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
