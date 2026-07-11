import { BlogPageContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { getBlogs, getBlogCategories } from "@/lib/api";
import { getCmsSeoUrlForPage } from "@/lib/cms-seo-url";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);
  return getSeoMetadata(getCmsSeoUrlForPage("/blog", locale), {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function BlogPage() {
  const locale = (await getLocale()) as Locale;
  const [dict, blogsRes, categories] = await Promise.all([
    getDictionary(locale),
    getBlogs({ lang: locale, limit: 20 }),
    getBlogCategories(locale),
  ]);

  const blogs = blogsRes.data.filter((b) => b.isPublished);

  return (
    <main role="main">
      <BlogPageContent
        lang={locale}
        initialBlogs={blogs}
        initialCategories={categories}
      />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
