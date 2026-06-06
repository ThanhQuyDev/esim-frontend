import { BlogDetailContent } from "@/components/layout/sections/blog-page";
import { FooterSection } from "@/components/layout/sections/footer";
import { BlogCategoryNav } from "@/components/layout/sections/blog-page";
import { getDictionary } from "@/lib/dictionaries";
import { getSeoMetadata } from "@/lib/seo";
import { getBlogsByCategory, getBlogCategories, getBlogBySlug } from "@/lib/api";
import { categorySlug } from "@/components/layout/sections/blog-page/blog-detail-helpers";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BlogCard } from "@/components/layout/sections/blog-page/blog-card";

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  return getSeoMetadata(`/${params.lang}/blog/${slug}`);
}

export default async function BlogSlugPage({
  params,
}: {
  params: { lang: Locale; slug: string };
}) {
  const slug = decodeURIComponent(params.slug);

  const [dict, categories] = await Promise.all([
    getDictionary(params.lang),
    getBlogCategories(params.lang),
  ]);

  // Check if slug matches a category
  const categoryName = categories.find((c) => categorySlug(c) === slug);

  if (categoryName) {
    // Render category listing
    const blogsRes = await getBlogsByCategory(categoryName, { lang: params.lang, limit: 20 });
    let blogs = blogsRes.data.filter((b) => b.isPublished);

    if (blogs.length === 0) {
      const retry = await getBlogsByCategory(slug, { lang: params.lang, limit: 20 });
      blogs = retry.data.filter((b) => b.isPublished);
    }

    return (
      <main role="main">
        <BlogCategoryNav lang={params.lang} />

        <div className="bg-primary">
          <Breadcrumb
            items={[
              { label: "Blog", href: `/${params.lang}/blog/` },
              { label: categoryName },
            ]}
            lang={params.lang}
          />
        </div>

        <div className="container mx-auto px-4 py-12 max-w-[1168px]">
          <h1 className="heading-xl mb-8">{categoryName}</h1>

          {blogs.length === 0 ? (
            <p className="text-secondary body-md">
              {params.lang === "vi" ? "Chưa có bài viết nào." : "No articles found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} lang={params.lang} />
              ))}
            </div>
          )}
        </div>

        <FooterSection dict={dict.footer} lang={params.lang} />
      </main>
    );
  }

  // Not a category — try as article
  const blog = await getBlogBySlug(slug, params.lang);
  if (!blog) notFound();

  return (
    <main role="main">
      <BlogDetailContent lang={params.lang} slug={slug} initialBlog={blog} />
      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
