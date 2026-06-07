import { BlogPageContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import { getBlogs, getBlogCategories } from "@/lib/api";
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
