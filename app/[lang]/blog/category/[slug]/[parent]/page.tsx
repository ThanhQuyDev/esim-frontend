import { FooterSection } from "@/components/layout/sections/footer";
import { BlogCategoryNav } from "@/components/layout/sections/blog-page";
import { getDictionary } from "@/lib/dictionaries";
import { getBlogsByCategoryAndParent, getBlogCategories, getBlogParentsByCategory } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

function nameFromSlug(slug: string, list: string[]): string {
  const found = list.find(
    (item) => item.toLowerCase().replace(/\s+/g, "-") === slug
  );
  return found || slug;
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; slug: string; parent: string };
}): Promise<Metadata> {
  const slug = decodeURIComponent(params.slug);
  const parent = decodeURIComponent(params.parent);
  return {
    title: `Blog - ${slug} - ${parent}`,
  };
}

export default async function BlogCategoryParentPage({
  params,
}: {
  params: { lang: Locale; slug: string; parent: string };
}) {
  const slug = decodeURIComponent(params.slug);
  const parentSlug = decodeURIComponent(params.parent);

  const [dict, categories, parentsMap] = await Promise.all([
    getDictionary(params.lang),
    getBlogCategories(params.lang),
    getBlogParentsByCategory(params.lang),
  ]);

  const categoryName = nameFromSlug(slug, categories);
  const parentsList = parentsMap[categoryName] ?? [];
  const parentName = nameFromSlug(parentSlug, parentsList);

  const blogsRes = await getBlogsByCategoryAndParent(categoryName, parentName, {
    lang: params.lang,
    limit: 20,
  });

  const blogs = blogsRes.data.filter((b) => b.isPublished);

  return (
    <main role="main">
      <BlogCategoryNav lang={params.lang} />

      <div className="container mx-auto px-4 py-12 max-w-[1168px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <Link href={`/${params.lang}/blog/`} className="text-secondary hover:text-primary transition-colors">
            Blog
          </Link>
          <ChevronRight size={12} className="text-neutral-700" />
          <Link
            href={`/${params.lang}/blog/category/${slug}/`}
            className="text-secondary hover:text-primary transition-colors"
          >
            {categoryName}
          </Link>
          <ChevronRight size={12} className="text-neutral-700" />
          <span className="text-primary font-medium">{parentName}</span>
        </div>

        <h1 className="heading-xl mb-8">{parentName}</h1>

        {blogs.length === 0 ? (
          <p className="text-secondary body-md">
            {params.lang === "vi" ? "Chưa có bài viết nào." : "No articles found."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/${params.lang}/blog/${blog.slug?.replace(/^\//, "") || blog.id}/`}
                className="group block"
              >
                <article className="h-full flex flex-col rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  {blog.coverImage && (
                    <div className="relative w-full aspect-[16/9]">
                      <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-4">
                    <h2 className="body-md-medium group-hover:text-blue-600 transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    {blog.excerpt && (
                      <p className="body-sm text-secondary mt-2 line-clamp-2">{blog.excerpt}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <FooterSection dict={dict.footer} lang={params.lang} />
    </main>
  );
}
