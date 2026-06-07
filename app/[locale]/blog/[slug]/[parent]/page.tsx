import { FooterSection } from "@/components/layout/sections/footer";
import { BlogCategoryNav } from "@/components/layout/sections/blog-page";
import { getDictionary } from "@/lib/dictionaries";
import { getBlogsByCategoryAndParent, getBlogCategories, getBlogParentsByCategory } from "@/lib/api";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BlogCard } from "@/components/layout/sections/blog-page/blog-card";
import { categorySlug } from "@/components/layout/sections/blog-page/blog-detail-helpers";

function nameFromSlug(slug: string, list: string[]): string {
  const found = list.find((item) => categorySlug(item) === slug);
  return found || slug;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; parent: string };
}): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);
  return {
    title: `${dict.metadata.title} - ${decodeURIComponent(params.slug)} - ${decodeURIComponent(params.parent)}`,
  };
}

export default async function BlogParentPage({
  params,
}: {
  params: { slug: string; parent: string };
}) {
  const locale = (await getLocale()) as Locale;
  const slug = decodeURIComponent(params.slug);
  const parentSlug = decodeURIComponent(params.parent);

  const [dict, categories, parentsMap] = await Promise.all([
    getDictionary(locale),
    getBlogCategories(locale),
    getBlogParentsByCategory(locale),
  ]);

  const categoryName = nameFromSlug(slug, categories);
  const parentsList = parentsMap[categoryName] ?? [];
  const parentName = nameFromSlug(parentSlug, parentsList);

  const blogsRes = await getBlogsByCategoryAndParent(categoryName, parentName, {
    lang: locale,
    limit: 20,
  });

  const blogs = blogsRes.data.filter((b) => b.isPublished);

  return (
    <main role="main">
      <BlogCategoryNav lang={locale} />

      <div className="bg-primary">
        <Breadcrumb
          items={[
            { label: "Blog", href: `/${locale}/blog/` },
            { label: categoryName, href: `/${locale}/blog/${slug}/` },
            { label: parentName },
          ]}
          lang={locale}
        />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-[1168px]">
        <h1 className="heading-xl mb-8">{parentName}</h1>

        {blogs.length === 0 ? (
          <p className="text-secondary body-md">
            {locale === "vi" ? "Chưa có bài viết nào." : "No articles found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} lang={locale} />
            ))}
          </div>
        )}
      </div>

      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
