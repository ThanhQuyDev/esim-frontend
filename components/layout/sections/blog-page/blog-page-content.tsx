"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ChevronDown, ChevronRight } from "lucide-react";
import type { Blog, PaginatedResponse } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

async function fetchBlogs(
  lang: string,
  page = 1,
  limit = 10,
  category?: string,
  signal?: AbortSignal
): Promise<PaginatedResponse<Blog>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (category) {
    params.set("filters", JSON.stringify({ category }));
  }
  const res = await fetch(`${API_BASE_URL}/api/v1/blogs?${params}`, {
    headers: { "x-custom-lang": lang },
    signal,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchCategories(lang: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/blogs/categories`, {
    headers: { "x-custom-lang": lang },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function categorySlug(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-");
}

// ===== Sub-components =====

function CategoryBadge({ category, lang }: { category: string | null; lang: string }) {
  if (!category) return null;
  return (
    <Link
      href={`/${lang}/blog/category/${categorySlug(category)}/`}
      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
    >
      <span className="text-center whitespace-nowrap rounded-full inline-block bg-tertiary text-primary py-0.5 px-2 body-2xs-medium hover:bg-neutral-300">
        {category}
      </span>
    </Link>
  );
}

function BlogMeta({ date, timeRead }: { date: string | null; timeRead: string | null }) {
  return (
    <div className="h-full w-full flex flex-row justify-start flex-wrap items-center gap-x-4 gap-y-4">
      {date && (
        <div>
          <time dateTime={date} className="flex gap-2 items-center text-secondary">
            <p className="body-xs">{formatDate(date)}</p>
          </time>
        </div>
      )}
      {timeRead && (
        <div>
          <div className="flex gap-2 items-center text-secondary">
            <BookOpen size={16} />
            <p className="body-xs">{timeRead}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthorLink({ author, lang }: { author: string | null; lang: string }) {
  if (!author) return null;
  const authorSlug = author.toLowerCase().replace(/\s+/g, "-");
  return (
    <Link
      href={`/${lang}/blog/author/${authorSlug}/`}
      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline"
    >
      <div className="flex flex-row items-center gap-3">
        <div className="relative rounded-full overflow-hidden w-[24px] min-w-[24px] h-[24px] bg-tertiary">
          <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
            <span className="text-[10px] text-secondary font-medium">
              {author.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <address className="body-sm text-secondary not-italic">{author}</address>
      </div>
    </Link>
  );
}

function BlogCard({ blog, lang }: { blog: Blog; lang: string }) {
  return (
    <article className="flex flex-col gap-4">
      <Link
        href={`/${lang}/blog/${blog.slug}/`}
        className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline"
      >
        <figure className="overflow-hidden rounded-sm">
          <div>
            {blog.coverImage ? (
              <Image
                alt={blog.title}
                loading="lazy"
                width={968}
                height={507}
                className="w-full h-auto"
                style={{ color: "transparent" }}
                src={blog.coverImage}
              />
            ) : (
              <div className="w-full aspect-[968/507] bg-tertiary flex items-center justify-center">
                <span className="text-4xl opacity-40">📝</span>
              </div>
            )}
          </div>
        </figure>
      </Link>
      <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-4">
        <div>
          <CategoryBadge category={blog.category} lang={lang} />
        </div>
        <div>
          <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-2">
            <div>
              <BlogMeta date={blog.publishedAt} timeRead={String(blog.timeRead)} />
            </div>
            <div>
              <h3 className="heading-sm">
                <Link
                  href={`/${lang}/blog/${blog.slug}/`}
                  className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline"
                >
                  {blog.title}
                </Link>
              </h3>
            </div>
          </div>
        </div>
        <div>
          <AuthorLink author={blog.author} lang={lang} />
        </div>
      </div>
    </article>
  );
}

// ===== Section: Category Navigation Bar =====

function CategoryNavBar({
  categories,
  lang,
}: {
  categories: string[];
  lang: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-primary">
      {/* Mobile */}
      <div className="sm:hidden px-2 lg:px-11">
        <div className="relative inline-block w-full">
          <div className="flex justify-between items-center">
            <button
              className="py-3 px-2 cursor-pointer"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <div className="flex items-center gap-2">
                <div className="space-y-1">
                  <div className="w-6 h-[3px] bg-dark" />
                  <div className="w-6 h-[3px] bg-dark" />
                  <div className="w-6 h-[3px] bg-dark" />
                </div>
                <p className="body-md-medium">Show All Categories</p>
              </div>
            </button>
            <div className="px-2">
              <div>
                <div aria-expanded="false" className="relative">
                  <button
                    aria-label="Toggle on/off blog search"
                    className="flex justify-center items-center rounded-full transition-colors hover:bg-neutral-1000/[.08] w-9 h-9"
                  >
                    <Search size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`bg-primary relative top-0 transition-all ease-in p-4 w-full border-t-md border-secondary overflow-hidden ${
              mobileOpen ? "" : "hidden"
            }`}
          >
            <ul className="flex flex-col gap-4">
              {categories.map((cat) => (
                <li key={cat} aria-expanded="false">
                  <div className="flex items-center">
                    <Link
                      href={`/${lang}/blog/category/${categorySlug(cat)}/`}
                      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary hover:underline body-sm-medium"
                    >
                      {cat}
                    </Link>
                    <button className="flex justify-end flex-1 pl-3" aria-haspopup="true">
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block mx-auto lg:px-16 bg-gray-200">
        <ul className="flex container items-center gap-6 py-3 max-w-[1168px] mx-auto ">
          {categories.map((cat) => (
            <li key={cat} className="relative" aria-expanded="false" aria-haspopup="true">
              <Link
                href={`/${lang}/blog/category/${categorySlug(cat)}/`}
                className="text-[18px] font-semibold salign-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary hover:underline"
              >
                {cat}
              </Link>
              <ChevronDown size={12} className="inline ml-2" />
            </li>
          ))}
          <li className="ml-auto">
            <div>
              <div aria-expanded="false" className="relative">
                <button
                  aria-label="Toggle on/off blog search"
                  className="flex justify-center items-center rounded-full transition-colors hover:bg-neutral-1000/[.08] w-9 h-9"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

// ===== Section: Featured Article =====

function FeaturedArticle({ blog, lang }: { blog: Blog; lang: string }) {
  return (
    <div data-section="featured-article" className="relative">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <article className="flex flex-col lg:flex-row gap-8">
              <div className="h-full flex flex-col text-start items-start justify-start gap-y-4 w-full lg:max-w-[368px] self-center">
                <div>
                  <CategoryBadge category={blog.category} lang={lang} />
                </div>
                <div>
                  <div className="h-full w-full flex flex-col text-start items-start justify-start gap-y-2">
                    <div>
                      <Link
                        href={`/${lang}/blog/${blog.slug}/`}
                        className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline"
                      >
                        <h3 className="heading-xl">{blog.title}</h3>
                      </Link>
                    </div>
                    {blog.excerpt && (
                      <div>
                        <div className="line-clamp-3">
                          <div className="flex flex-col gap-6 justify-center items-start text-start">
                            <p className="body-md w-full min-h-6">
                              <span style={{ color: "#000000" }}>{blog.excerpt}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <BlogMeta date={blog.publishedAt} timeRead={String(blog.timeRead)} />
                </div>
                <div>
                  <AuthorLink author={blog.author} lang={lang} />
                </div>
              </div>
              <figure className="overflow-hidden rounded-sm self-center">
                <Link
                  href={`/${lang}/blog/${blog.slug}/`}
                  className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus"
                >
                  <div>
                    {blog.coverImage ? (
                      <Image
                        alt={blog.title}
                        loading="lazy"
                        width={968}
                        height={507}
                        style={{ color: "transparent" }}
                        src={blog.coverImage}
                      />
                    ) : (
                      <div className="w-[968px] max-w-full aspect-[968/507] bg-tertiary flex items-center justify-center">
                        <span className="text-6xl opacity-40">📝</span>
                      </div>
                    )}
                  </div>
                </Link>
              </figure>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Section: Article Grid (Popular / Recent) =====

function ArticleGridSection({
  title,
  blogs,
  lang,
  testId,
}: {
  title: string;
  blogs: Blog[];
  lang: string;
  testId: string;
}) {
  return (
    <div data-section={testId} className="relative">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="body-lg-medium">{title}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} lang={lang} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Section: Choose Category Tabs =====

function ChooseCategorySection({
  categories,
  lang,
}: {
  categories: string[];
  lang: string;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  const updateIndicator = useCallback(() => {
    const btn = tabRefs.current[activeTab];
    if (btn) {
      const parent = btn.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        setIndicatorStyle({
          transform: `translateX(${btnRect.left - parentRect.left}px)`,
          width: `${btnRect.width}px`,
          height: `${btnRect.height}px`,
          top: `${btnRect.top - parentRect.top}px`,
          borderRadius: "1524px",
          transition: "transform 0.3s ease-in-out, width 0.3s ease-in-out",
        });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  return (
    <div data-section="choose-category" className="relative">
      <div className="py-16">
        <div className="mx-4 sm:mx-auto">
          <div className="container grid sm:gap-x-8 grid-cols-12 mb-10 mx-auto">
            <div className="col-span-12 md:col-span-8">
              <div className="grid grid-cols-1 gap-y-6">
                <h2 className="body-lg-medium">Choose category</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Tabs */}
            <div className="container mx-auto">
              <div className="flex gap-1 pb-4 scrollbar-none overflow-auto">
                <div className="relative flex gap-1 w-fit p-1 border-md border-secondary rounded-full">
                  <div
                    className="absolute inset-0 pointer-events-none z-[1] bg-dark"
                    style={indicatorStyle}
                  />
                  {categories.map((cat, i) => (
                    <button
                      key={cat}
                      ref={(el) => { tabRefs.current[i] = el; }}
                      onClick={() => setActiveTab(i)}
                      className={`relative z-[1] body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 hover:text-primary focus-visible:outline-hidden focus-visible:shadow-focus rounded-full transition-[color] ${
                        activeTab === i
                          ? "text-white bg-transparent"
                          : "text-primary hover:bg-primary bg-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Panels */}
            <div className="sm:mx-auto">
              <div className="container mx-auto">
                {categories.map((cat, i) => (
                  <CategoryTabPanel
                    key={cat}
                    category={cat}
                    lang={lang}
                    isActive={activeTab === i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryTabPanel({
  category,
  lang,
  isActive,
}: {
  category: string;
  lang: string;
  isActive: boolean;
}) {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs", "category", category, lang],
    queryFn: ({ signal }) => fetchBlogs(lang, 1, 6, category, signal),
    select: (data) => data.data.filter((b) => b.isPublished),
    enabled: isActive,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className={`pt-6 ${isActive ? "" : "hidden"}`}>
      <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center mb-10">
        <h3 className="heading-lg">{category}</h3>
        <Link
          href={`/${lang}/blog/category/${categorySlug(category)}/`}
          className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus hover:underline flex gap-2 items-center"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-secondary border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
          {blogs?.map((blog) => (
            <BlogCard key={blog.id} blog={blog} lang={lang} />
          ))}
          {(!blogs || blogs.length === 0) && (
            <p className="body-md text-secondary col-span-3 text-center py-8">
              No articles found in this category.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ===== Main Blog Page Content =====

interface BlogPageContentProps {
  lang: Locale;
}

export function BlogPageContent({ lang }: BlogPageContentProps) {
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["blog-categories", lang],
    queryFn: () => fetchCategories(lang),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch all blogs (page 1, limit enough for featured + popular + recent)
  const { data: allBlogs, isLoading } = useQuery({
    queryKey: ["blogs", "all", lang],
    queryFn: ({ signal }) => fetchBlogs(lang, 1, 20, undefined, signal),
    select: (data) => data.data.filter((b) => b.isPublished),
    staleTime: 2 * 60 * 1000,
  });

  const cats = categories ?? [];
  const blogs = allBlogs ?? [];

  // Split blogs into sections
  const featuredBlog = blogs[0] ?? null;
  const popularBlogs = blogs.slice(1, 4);
  const recentBlogs = blogs.slice(4, 10);

  if (isLoading) {
    return (
      <div>
        <div className="bg-primary py-4">
          <div className="container mx-auto">
            <div className="h-8 bg-tertiary rounded-full w-64 animate-pulse" />
          </div>
        </div>
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-2 border-secondary border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Category Navigation Bar */}
      <CategoryNavBar categories={cats} lang={lang} />

      {/* Featured Article */}
      {featuredBlog && <FeaturedArticle blog={featuredBlog} lang={lang} />}

      {/* Popular Articles */}
      {popularBlogs.length > 0 && (
        <ArticleGridSection
          title="Popular articles"
          blogs={popularBlogs}
          lang={lang}
          testId="popular-articles"
        />
      )}

      {/* Recent Articles */}
      {recentBlogs.length > 0 && (
        <ArticleGridSection
          title="Recent articles"
          blogs={recentBlogs}
          lang={lang}
          testId="recent-articles"
        />
      )}

      {/* Choose Category Tabs */}
      {cats.length > 0 && (
        <ChooseCategorySection categories={cats} lang={lang} />
      )}
    </div>
  );
}
