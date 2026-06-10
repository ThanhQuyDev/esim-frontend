import { BlogDetailContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { BlogCategoryNav } from "@/components/layout/sections/blog-page";
import { getDictionary } from "@/lib/dictionaries";
import { getBlogsByCategory, getBlogCategories, getBlogBySlug } from "@/lib/api";
import { getSeoMetadata } from "@/lib/seo";
import { categorySlug } from "@/components/layout/sections/blog-page/blog-detail-helpers";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BlogCard } from "@/components/layout/sections/blog-page/blog-card";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const locale = await getLocale();
  const slug = decodeURIComponent(params.slug);
  const dict = await getDictionary(locale as Locale);
  const seoUrl = locale === "vi" ? `/blog/${slug}` : `/${locale}/blog/${slug}`;
  return getSeoMetadata(seoUrl, {
    title: dict.metadata.title,
    description: dict.metadata.description,
  });
}

export default async function BlogSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const locale = (await getLocale()) as Locale;
  const slug = decodeURIComponent(params.slug);

  const [dict, categories] = await Promise.all([
    getDictionary(locale),
    getBlogCategories(locale),
  ]);

  // Check if slug matches a category
  const categoryName = categories.find((c) => categorySlug(c) === slug);

  if (categoryName) {
    // Render category listing
    const blogsRes = await getBlogsByCategory(categoryName, { lang: locale, limit: 20 });
    let blogs = blogsRes.data.filter((b) => b.isPublished);

    if (blogs.length === 0) {
      const retry = await getBlogsByCategory(slug, { lang: locale, limit: 20 });
      blogs = retry.data.filter((b) => b.isPublished);
    }

    return (
      <main role="main">
        <BlogCategoryNav lang={locale} />

        <div className="bg-primary">
          <Breadcrumb
            items={[
              { label: "Blog", href: `/${locale}/blog/` },
              { label: categoryName },
            ]}
            lang={locale}
          />
        </div>

        <div className="container mx-auto px-4 py-12 max-w-[1168px]">
          <h1 className="text-[1.625rem] sm:text-[2rem] mb-8">{categoryName}</h1>

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

  // Not a category — try as article
  const blog = await getBlogBySlug(slug, locale);
  if (!blog) notFound();

  return (
    <main role="main">
      <BlogDetailContent lang={locale} slug={slug} initialBlog={blog} />
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
