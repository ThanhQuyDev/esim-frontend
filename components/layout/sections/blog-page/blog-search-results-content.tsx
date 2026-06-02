"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, BookOpen } from "lucide-react";
import type { Blog } from "@/lib/api";
import { BlogCategoryNav } from "./blog-category-nav";
import { blogDetailHref } from "./blog-detail-helpers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

const RESULTS_PER_PAGE = 12;

interface SearchResponse {
  data: Blog[];
  hasNextPage: boolean;
  total?: number;
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
  return cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

function BlogMeta({ date, timeRead, lang }: { date: string | null; timeRead: string | null; lang?: string }) {
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
            <p className="body-xs">{timeRead} {lang === "vi" ? "phút" : "min"}</p>
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
            <span className="text-[12px] text-secondary font-medium">
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
        href={blogDetailHref(blog, lang)}
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
              <BlogMeta date={blog.publishedAt} timeRead={String(blog.timeRead || "")} lang={lang} />
            </div>
            <div>
              <h3 className="heading-sm">
                <Link
                  href={blogDetailHref(blog, lang)}
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

interface BlogSearchResultsContentProps {
  lang: string;
}

export function BlogSearchResultsContent({ lang }: BlogSearchResultsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [results, setResults] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState(query);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const headers: Record<string, string> = { "x-custom-lang": lang };
      const params = new URLSearchParams({
        search: query,
        page: String(currentPage),
        limit: String(RESULTS_PER_PAGE),
      });
      const res = await fetch(
        `${API_BASE_URL}/api/v1/blogs?${params.toString()}`,
        { headers }
      );
      if (res.ok) {
        const json = await res.json();
        const blogs: Blog[] = json.data || [];
        setResults(blogs.filter((b) => b.isPublished));
        setHasNextPage(json.hasNextPage ?? false);
        setTotal(json.totalCount ?? json.total ?? null);
      } else {
        setResults([]);
        setHasNextPage(false);
      }
    } catch {
      setResults([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [query, currentPage, lang]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(
        `/${lang}/blog/search?q=${encodeURIComponent(searchInput.trim())}`
      );
    }
  };

  const totalPages = total ? Math.ceil(total / RESULTS_PER_PAGE) : null;

  return (
    <div>
      {/* Category Navigation */}
      <BlogCategoryNav lang={lang} />

      {/* Search Section */}
      <div
        data-section="blog-search"
        data-testid="section-blog-search"
        className="relative scroll-mt-20 xl:scroll-mt-24"
      >
        <div className="py-16 pb-10">
          <div className="mx-4 sm:mx-auto">
            <div className="container mx-auto">
              {/* Search input */}
              <form
                onSubmit={handleSearchSubmit}
                role="search"
                className="max-w-lg mb-8 relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    lang === "vi"
                      ? "Tìm kiếm bài viết..."
                      : "Search blog posts..."
                  }
                  className="w-full pl-12 pr-28 py-3 rounded-full text-base border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={lang === "vi" ? "Tìm kiếm blog" : "Search blog"}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-brand-black text-white text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
                >
                  {lang === "vi" ? "Tìm kiếm" : "Search"}
                </button>
              </form>

              {/* Results header */}
              {query.trim() && !loading && (
                <>
                  <p className="body-md text-secondary">
                    {lang === "vi" ? "Hiển thị kết quả cho:" : "Showing results for:"}
                  </p>
                  <p className="heading-lg text-primary mt-6 break-words">
                    {query}
                  </p>
                </>
              )}

              {/* No results */}
              {!loading && results.length === 0 && query.trim() && (
                <div className="py-12 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">
                    {lang === "vi"
                      ? "Không tìm thấy kết quả"
                      : "No results found"}
                  </p>
                  <p className="text-sm">
                    {lang === "vi"
                      ? "Vui lòng thử từ khóa khác hoặc kiểm tra lại chính tả."
                      : "Please try a different keyword or check your spelling."}
                  </p>
                </div>
              )}

              {/* No query */}
              {!loading && !query.trim() && (
                <div className="py-12 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">
                    {lang === "vi"
                      ? "Nhập từ khóa để tìm kiếm bài viết"
                      : "Enter a keyword to search blog posts"}
                  </p>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex flex-col gap-4">
                        <div className="w-full aspect-[968/507] bg-gray-200 rounded-sm" />
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-3 bg-gray-100 rounded w-32" />
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results grid */}
              {!loading && results.length > 0 && (
                <div className="mt-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-12">
                    {results.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} lang={lang} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {!loading && (hasNextPage || currentPage > 1) && (
                <nav
                  className="mt-12 flex items-center justify-center gap-4"
                  aria-label="Pagination"
                >
                  {currentPage > 1 && (
                    <Link
                      href={`/${lang}/blog/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                      className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      ‹ {lang === "vi" ? "Trước" : "Previous"}
                    </Link>
                  )}

                  <span className="text-sm text-gray-600">
                    {lang === "vi" ? "Trang" : "Page"} {currentPage}
                    {totalPages ? ` / ${totalPages}` : ""}
                  </span>

                  {hasNextPage && (
                    <Link
                      href={`/${lang}/blog/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                      className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {lang === "vi" ? "Tiếp" : "Next"} ›
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
