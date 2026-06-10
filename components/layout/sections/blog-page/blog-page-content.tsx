"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import type { Blog, PaginatedResponse } from "@/lib/api";
import type { Locale } from "@/lib/i18n-config";
import { BlogCategoryNav } from "./blog-category-nav";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BlogCard, CategoryBadge, BlogMeta, AuthorLink, blogDetailHref, categorySlug } from "./blog-card";
import { ScrollToTop } from "./scroll-to-top";

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
                <p className="body-md-medium">{lang === "vi" ? "Hiển thị tất cả danh mục" : "Show All Categories"}</p>
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
            className={`bg-primary relative top-0 transition-all ease-in p-4 w-full border-t-md border-secondary overflow-hidden ${mobileOpen ? "" : "hidden"
              }`}
          >
            <ul className="flex flex-col gap-4">
              {categories.map((cat) => (
                <li key={cat} aria-expanded="false">
                  <div className="flex items-center">
                    <Link
                      href={`/${lang}/blog/${categorySlug(cat)}/`}
                      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary body-sm-medium"
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
      <div className="hidden sm:block mx-auto lg:px-16 bg-neutral-100">
        <ul className="flex container items-center gap-6 py-3 max-w-[1168px] mx-auto ">
          {categories.map((cat) => (
            <li key={cat} className="relative" aria-expanded="false" aria-haspopup="true">
              <Link
                href={`/${lang}/blog/${categorySlug(cat)}/`}
                className="text-[18px] font-semibold salign-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary "
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
      <div className="py-8 sm:py-16">
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
                        href={blogDetailHref(blog, lang)}
                        className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus "
                      >
                        <h3 className="heading-xl !leading-[1.3] hover:underline">{blog.title}</h3>
                      </Link>
                    </div>
                    {blog.excerpt && (
                      <div>
                        <div className="line-clamp-3">
                          <div className="flex flex-col gap-6 justify-center items-start text-start">
                            <p className="body-md w-full min-h-6 line-clamp-3">
                              <span style={{ color: "#000000" }} >{blog.excerpt}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between w-full">
                  <AuthorLink author={blog.author} lang={lang} />
                  <BlogMeta date={blog.updatedAt} timeRead={String(blog.timeRead)} lang={lang} />
                </div>
              </div>
              <figure className="overflow-hidden rounded-sm self-center">
                <Link
                  href={blogDetailHref(blog, lang)}
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
                <h2 className="sm:text-[2rem] text-[1.625em]">{title}</h2>
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
          left: 0,
          transform: `translateX(${btnRect.left - parentRect.left}px)`,
          width: `${btnRect.width}px`,
          height: `${btnRect.height}px`,
          top: "50%",
          marginTop: `${-(btnRect.height / 2)}px`,
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
                <h2 className="!text-[1.3rem] body-lg-medium">{(blogTranslations[lang] || blogTranslations.en).chooseCategory}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-4 sm:mx-auto">
          <div className="container mx-auto">
            {/* Tabs */}
            <div className="container mx-auto">
              <div className="flex gap-1 pb-4 scrollbar-none overflow-auto">
                <div className="relative flex items-center gap-1 w-fit p-1 border-md border-secondary rounded-full">
                  <div
                    className="absolute pointer-events-none z-[1] bg-dark rounded-full"
                    style={indicatorStyle}
                  />
                  {categories.map((cat, i) => (
                    <button
                      key={cat}
                      ref={(el) => { tabRefs.current[i] = el; }}
                      onClick={() => setActiveTab(i)}
                      className={`relative z-[1] body-sm-medium whitespace-nowrap md:body-md-medium px-4 py-1 focus-visible:outline-hidden focus-visible:shadow-focus rounded-full min-w-[60px] bg-transparent transition-all duration-200 ${activeTab === i
                          ? "text-white"
                          : "text-primary hover:bg-bg-secondary"
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
        <h3 className="sm:text-[2rem] text-[1.625rem] font-medium">{category}</h3>
        <Link
          href={`/${lang}/blog/${categorySlug(category)}/`}
          className="align-bottom hover:underline transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus flex gap-2 items-center"
        >
          {(blogTranslations[lang] || blogTranslations.en).viewAll}
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
              {(blogTranslations[lang] || blogTranslations.en).noArticles}
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
  initialBlogs?: Blog[];
  initialCategories?: string[];
}

const blogTranslations: Record<string, Record<string, string>> = {
  en: {
    popularArticles: "Popular articles",
    recentArticles: "Recent articles",
    chooseCategory: "Choose category",
    viewAll: "View All",
    showAllCategories: "Show All Categories",
    noArticles: "No articles found in this category.",
  },
  vi: {
    popularArticles: "Bài viết phổ biến",
    recentArticles: "Bài viết mới nhất",
    chooseCategory: "Chọn danh mục",
    viewAll: "Xem tất cả",
    showAllCategories: "Hiển thị tất cả danh mục",
    noArticles: "Không tìm thấy bài viết trong danh mục này.",
  },
};

export function BlogPageContent({ lang, initialBlogs, initialCategories }: BlogPageContentProps) {
  const t = blogTranslations[lang] || blogTranslations.en;
  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["blog-categories", lang],
    queryFn: () => fetchCategories(lang),
    initialData: initialCategories,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch all blogs (page 1, limit enough for featured + popular + recent)
  const { data: allBlogs, isLoading } = useQuery({
    queryKey: ["blogs", "all", lang],
    queryFn: async ({ signal }) => {
      const res = await fetchBlogs(lang, 1, 20, undefined, signal);
      return res.data.filter((b) => b.isPublished);
    },
    initialData: initialBlogs,
    staleTime: 2 * 60 * 1000,
  });

  const cats = categories ?? [];
  const blogs = allBlogs ?? [];

  // Featured = most recent isPopular blog
  const popularAll = blogs.filter((b) => b.isPopular);
  const featuredBlog = popularAll[0] ?? blogs[0] ?? null;
  // Popular articles = remaining isPopular blogs (exclude featured)
  const popularBlogs = popularAll.filter((b) => b.id !== featuredBlog?.id).slice(0, 3);
  // Recent = all other blogs not in featured or popular
  const usedIds = new Set([featuredBlog?.id, ...popularBlogs.map((b) => b.id)].filter(Boolean));
  const recentBlogs = blogs.filter((b) => !usedIds.has(b.id)).slice(0, 6);

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
      {/* Category Navigation Bar — uses shared BlogCategoryNav with working search */}
      <BlogCategoryNav lang={lang} />

      {/* Breadcrumb */}
      <div className="sm:hidden bg-primary">
        <div className="sm:mx-auto">
          <div className="container mt-4 sm:mx-auto">
            <Breadcrumb
              items={[{ label: "Blog" }]}
              lang={lang}
            />
          </div>
        </div>
      </div>
      <Breadcrumb
        items={[{ label: "Blog" }]}
        lang={lang}
        className="hidden sm:block"
      />

      {/* Page Title (H1) */}
      <div className="mx-4 sm:mx-auto">
        <div className="container mx-auto">
          <h1
            className="pt-4 pb-2 text-[1.75rem] sm:text-[2.75rem] font-medium"
          >
            {lang === "vi" ? "Blog eSIM" : "eSIM Blog"}
          </h1>
        </div>
      </div>

      {/* Featured Article */}
      {featuredBlog && <FeaturedArticle blog={featuredBlog} lang={lang} />}

      {/* Popular Articles */}
      {popularBlogs.length > 0 && (
        <ArticleGridSection
          title={t.popularArticles}
          blogs={popularBlogs}
          lang={lang}
          testId="popular-articles"
        />
      )}

      {/* Recent Articles */}
      {recentBlogs.length > 0 && (
        <ArticleGridSection
          title={t.recentArticles}
          blogs={recentBlogs}
          lang={lang}
          testId="recent-articles"
        />
      )}

      {/* Choose Category Tabs */}
      {cats.length > 0 && (
        <ChooseCategorySection categories={cats} lang={lang} />
      )}

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}
