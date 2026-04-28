"use client";

import { useQuery } from "@tanstack/react-query";
import type { Blog } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import { BlogCategoryNav } from "./blog-category-nav";
import { BlogArticleHeading } from "./blog-article-heading";
import { BlogTableOfContents } from "./blog-toc";
import { BlogMiniTagWidget } from "./blog-mini-tag";
import { BlogCountryPlansList } from "./blog-country-plans";
import { BlogSidebarBanner } from "./blog-sidebar-banner";
import { BlogArticleFooter } from "./blog-article-footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

async function fetchBlogDetail(
  slug: string,
  lang: string,
  signal?: AbortSignal
): Promise<Blog> {
  const res = await fetch(`${API_BASE_URL}/api/v1/blogs/by-slug/${slug}`, {
    headers: { "x-custom-lang": lang },
    signal,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function BlogDetailContent({ lang, slug }: { lang: Locale; slug?: string }) {
  const {
    data: blog,
    isLoading,
    isError,
    error,
  } = useQuery<Blog>({
    queryKey: ["blog-detail", slug, lang],
    queryFn: ({ signal }) => fetchBlogDetail(slug!, lang, signal),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div>
        <BlogCategoryNav lang={lang} />
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto text-center">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-neutral-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto" />
                <div className="h-64 bg-neutral-200 rounded-lg w-full max-w-[968px] mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div>
        <BlogCategoryNav lang={lang} />
        <div className="py-16">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto text-center">
              <p className="heading-lg text-primary">Blog post not found</p>
              <p className="body-md text-secondary mt-4">
                {error instanceof Error ? error.message : "Something went wrong."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasMiniTag = blog.miniTag && (blog.miniTag.title || blog.miniTag.image);
  const hasPlans = blog.plans && blog.plans.length > 0;

  return (
    <div>
      {/* Category Navigation */}
      <BlogCategoryNav lang={lang} />

      <div>
        {/* Article Heading */}
        <BlogArticleHeading blog={blog} lang={lang} />

        {/* Article Content */}
        <div
          data-section="blog article content"
          data-testid="section-blog article content"
          className="pb-12 [&_.CountryPlansList]:my-4 relative scroll-mt-20 xl:scroll-mt-24"
        >
          <div>
            <div className="mx-4 sm:mx-auto">
              <div className="container mx-auto">
                <div className="grid sm:gap-x-8 grid-cols-12 gap-y-8">
                  {/* Main content column */}
                  <div className="col-span-12 lg:odd:col-start-2 lg:odd:col-span-7 lg:col-span-3">
                    <div className="flex flex-col gap-12">
                      {/* Table of Contents */}
                      <BlogTableOfContents content={blog.content} />

                      {/* Article body */}
                      <div
                        className="flex flex-col gap-6 justify-center items-start text-start"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                      />

                      {/* Mini Tag Widget — only show if API returns miniTag */}
                      {hasMiniTag && <BlogMiniTagWidget miniTag={blog.miniTag!} />}

                      {/* Country Plans — only show if API returns plans */}
                      {hasPlans && <BlogCountryPlansList plans={blog.plans!} lang={lang} />}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="col-span-12 lg:odd:col-start-2 lg:odd:col-span-7 lg:col-span-3">
                    <BlogSidebarBanner lang={lang} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Footer */}
        <BlogArticleFooter blog={blog} lang={lang} />
      </div>
    </div>
  );
}
