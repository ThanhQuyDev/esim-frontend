"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Blog } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import { getSocialLinks } from "./blog-detail-helpers";
import { BlogCategoryNav } from "./blog-category-nav";
import { BlogArticleHeading } from "./blog-article-heading";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { categorySlug } from "./blog-detail-helpers";
import { BlogTableOfContents, processBlogContent } from "./blog-toc";
import { BlogMiniTagWidget } from "./blog-mini-tag";
import { BlogCountryPlansList } from "./blog-country-plans";
import { BlogSidebarBanner } from "./blog-sidebar-banner";
import { BlogArticleFooter } from "./blog-article-footer";
import { ScrollToTop } from "./scroll-to-top";
import { BlogFaqAccordion } from "./blog-faq-accordion";
import { BlogRelatedPosts } from "./blog-related-posts";
import { BlogDisclaimer } from "./blog-disclaimer";

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

async function fetchRandomRelatedPosts(
  currentBlogId: string,
  lang: string,
  signal?: AbortSignal
): Promise<Blog[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/blogs?page=1&limit=10&filters=${encodeURIComponent(JSON.stringify({ isPublished: true }))}`,
    {
      headers: { "x-custom-lang": lang },
      signal,
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const blogs: Blog[] = data.data || data.items || data || [];
  // Defense in depth: public related-article cards must never expose drafts,
  // even if an older/cached API response includes them.
  const filtered = blogs.filter(
    (b: Blog) => b.id !== currentBlogId && b.isPublished === true
  );
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

interface BlogDetailContentProps {
  lang: Locale;
  slug?: string;
  initialBlog?: Blog | null;
}

export function BlogDetailContent({ lang, slug, initialBlog }: BlogDetailContentProps) {
  const {
    data: blog,
    isLoading,
    isError,
    error,
  } = useQuery<Blog>({
    queryKey: ["blog-detail", slug, lang],
    queryFn: ({ signal }) => fetchBlogDetail(slug!, lang, signal),
    initialData: initialBlog ?? undefined,
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery<Blog[]>({
    queryKey: ["blog-related-random", blog?.id, lang],
    queryFn: ({ signal }) => fetchRandomRelatedPosts(blog!.id, lang, signal),
    enabled: !!blog?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Social links sourced from the footer "Follow us" / "Theo dõi" category,
  // so blog and footer stay in sync from a single data source.
  const { data: socialLinks } = useQuery({
    queryKey: ["footer-social-links", lang],
    queryFn: () => getSocialLinks(lang),
    staleTime: 5 * 60 * 1000,
  });

  // Inject ids into <h1> headings and extract them for the Table of Contents
  // Must be called before any early returns to satisfy React hooks rules
  const { headings: tocHeadings, html: processedContent } = useMemo(
    () => processBlogContent(blog?.content || ""),
    [blog?.content]
  );

  // Breadcrumb items — moved before early returns to satisfy rules-of-hooks
  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [{ label: "Blog", href: `/${lang}/blog/` }];
    if (blog?.category) {
      items.push({ label: blog.category, href: `/${lang}/blog/${categorySlug(blog.category)}/` });
    }
    if (blog?.parent) {
      items.push({ label: blog.parent, href: `/${lang}/blog/${categorySlug(blog?.category || "")}/${categorySlug(blog.parent)}/` });
    }
    if (blog?.title) {
      items.push({ label: blog.title });
    }
    return items;
  }, [blog?.category, blog?.parent, blog?.title, lang]);

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

      {/* Breadcrumb — below category nav */}
      <div className="bg-primary sm:mx-0 mt-4">
        <Breadcrumb
          items={breadcrumbItems}
          lang={lang}
        />
      </div>

      <div>
        {/* Article Heading with Last Updated (SEO 1.6) */}
        <BlogArticleHeading blog={blog} lang={lang} socialLinks={socialLinks ?? []} />
        {/* Last Updated meta info */}
        {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
          <div className="mx-4 mb-8 sm:mx-auto">
            <div className="container mx-auto">
              <div className="grid sm:gap-x-8 grid-cols-12">
                <div className="col-span-12 lg:col-start-2 lg:col-span-10">
                  <p className="body-xs text-secondary italic mb-4">
                    {lang === "vi" ? "Cập nhật lần cuối:" : "Last updated:"}{" "}
                    <time dateTime={blog.updatedAt}>
                      {new Date(blog.updatedAt).toLocaleDateString(
                        lang === "vi" ? "vi-VN" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </time>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Table of Contents — placed right below the hero image */}
        {tocHeadings.length > 0 && (
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="grid sm:gap-x-8 grid-cols-12">
                <div className="col-span-12 lg:col-start-2 lg:col-span-7 -mt-8 mb-8">
                  <BlogTableOfContents headings={tocHeadings} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        )}



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
                      {/* Article body */}
                      <div
                        className="article-body prose prose-slate max-w-[800px] prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-img:rounded-lg prose-a:no-underline hover:prose-a:underline [&_p]:text-base [&_p]:leading-[1.625] [&_table]:!border-collapse [&_table]:!border [&_table]:!border-gray-300 [&_table]:!my-4 [&_table]:!rounded-none [&_th]:!border [&_th]:!border-gray-300 [&_th]:!p-2 [&_th]:!text-left [&_th]:!rounded-none [&_td]:!border [&_td]:!border-gray-300 [&_td]:!p-2 [&_td]:!rounded-none"
                        dangerouslySetInnerHTML={{ __html: processedContent }}
                      />

                      {/* Mini Tag Widget — only show if API returns miniTag */}
                      {hasMiniTag && <BlogMiniTagWidget miniTag={blog.miniTag!} />}

                      {/* Country Plans — only show if API returns plans */}
                      {hasPlans && <BlogCountryPlansList plans={blog.plans!} lang={lang} />}

                      {/* FAQ Accordion */}
                      {blog.faqEnabled && blog.faqs && blog.faqs.length > 0 && (
                        <BlogFaqAccordion faqs={blog.faqs} lang={lang} />
                      )}

                      {/* Disclaimer */}
                      <BlogDisclaimer lang={lang} />
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
        <BlogArticleFooter blog={blog} lang={lang} socialLinks={socialLinks ?? []} />

        {/* Related Posts — below footer, inside main content column */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              <div className="grid sm:gap-x-8 grid-cols-12">
                <div className="col-span-12 lg:col-start-2 lg:col-span-7">
                  <BlogRelatedPosts posts={relatedPosts} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top - Feature 1.2 */}
      <ScrollToTop />
    </div>
  );
}
