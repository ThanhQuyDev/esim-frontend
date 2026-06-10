"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";
import { getCategoryLabel, getParentLabel, toLocalizedCategorySlug, toLocalizedParentSlug } from "./category-config";
import { ScrollToTop } from "./scroll-to-top";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

const RESULTS_PER_PAGE = 10;

interface SearchResponse {
  data: HelpCenterArticle[];
  hasNextPage: boolean;
  total?: number;
}

function getArticleSlug(article: { slug?: string; title: string }): string {
  if (article.slug && article.slug.trim().length > 0) return article.slug;
  return article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function getSnippet(content: string, query: string, maxLen = 160): string {
  const plain = stripHtml(content);
  const lowerPlain = plain.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerPlain.indexOf(lowerQuery);

  if (idx === -1) {
    return plain.slice(0, maxLen) + (plain.length > maxLen ? "..." : "");
  }

  const start = Math.max(0, idx - 40);
  const end = Math.min(plain.length, idx + query.length + maxLen - 40);
  let snippet = plain.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < plain.length) snippet = snippet + "...";
  return snippet;
}

function highlightQuery(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <em key={i} className="font-medium not-italic bg-yellow-100">
        {part}
      </em>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface SearchResultsContentProps {
  lang: string;
}

export function SearchResultsContent({ lang }: SearchResultsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [results, setResults] = useState<HelpCenterArticle[]>([]);
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
        q: query,
        page: String(currentPage),
        limit: String(RESULTS_PER_PAGE),
        language: lang,
      });
      const res = await fetch(
        `${API_BASE_URL}/api/v1/help-center/search?${params.toString()}`,
        { headers }
      );
      if (res.ok) {
        const json: SearchResponse = await res.json();
        setResults(json.data || []);
        setHasNextPage(json.hasNextPage ?? false);
        setTotal(json.total ?? null);
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
      router.push(`${localizedHref(lang, "help-center")}/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const totalPages = total ? Math.ceil(total / RESULTS_PER_PAGE) : null;

  return (
    <main role="main">
      {/* Mobile search bar — visible only on mobile, below breadcrumb */}
      <div className="xl:hidden bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <form
            role="search"
            onSubmit={handleSearchSubmit}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={lang === "vi" ? "Nhập chủ đề, câu hỏi hoặc vấn đề" : "Type a topic, question or issue here"}
              aria-label={lang === "vi" ? "Tìm kiếm" : "Search"}
              className="w-full pl-10 pr-9 py-2.5 text-base rounded-full border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label={lang === "vi" ? "Xóa tìm kiếm" : "Clear search"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-0">
        <div className="mt-6 mb-8">
          <section>
            <header>
              <h1 className="text-2xl sm:text-xl font-semibold pb-3 border-b border-gray-200">
                {loading ? (
                  <span className="text-gray-500">
                    {lang === "vi" ? "Đang tìm kiếm..." : "Searching..."}
                  </span>
                ) : total !== null ? (
                  <>
                    {total} {lang === "vi" ? "kết quả cho" : "results for"} &quot;{query}&quot;
                  </>
                ) : (
                  <>
                    {results.length} {lang === "vi" ? "kết quả cho" : "results for"} &quot;{query}&quot;
                  </>
                )}
              </h1>
            </header>

            {/* Results list */}
            {!loading && results.length === 0 && query.trim() && (
              <div className="py-8 text-center text-gray-500">
                {lang === "vi"
                  ? "Không tìm thấy kết quả nào. Vui lòng thử từ khóa khác."
                  : "No results found. Please try a different keyword."}
              </div>
            )}

            {!loading && results.length > 0 && (
              <ul className="list-none p-0 m-0 divide-y divide-gray-200">
                {results.map((article) => (
                  <li key={article.id} className="py-5">
                    <article>
                      <header>
                        <h3 className="text-lg font-semibold mb-2">
                          <Link
                            href={`${localizedHref(lang, "help-center")}/${getArticleSlug(article)}`}
                            className="text-primary "
                          >
                            {article.title}
                          </Link>
                        </h3>
                        <nav>
                          <ol className="flex items-center flex-wrap gap-1 text-xs sm:text-sm text-gray-500 list-none p-0 m-0">
                            <li>
                              <Link
                                href={localizedHref(lang, "help-center")}
                                className="text-gray-500 "
                              >
                                {lang === "vi" ? "Trung tâm trợ giúp" : "Help Center"}
                              </Link>
                            </li>
                            <li className="text-gray-400">›</li>
                            <li>
                              <Link
                                href={`${localizedHref(lang, "help-center")}/${toLocalizedCategorySlug(article.category, lang)}`}
                                className="text-gray-500 "
                              >
                                {getCategoryLabel(article.category, lang)}
                              </Link>
                            </li>
                            <li className="text-gray-400">›</li>
                            <li>
                              <Link
                                href={`${localizedHref(lang, "help-center")}/${toLocalizedCategorySlug(article.category, lang)}/${toLocalizedParentSlug(article.parent, lang)}`}
                                className="text-gray-500 "
                              >
                                {getParentLabel(article.parent, lang)}
                              </Link>
                            </li>
                          </ol>
                        </nav>
                        <p className="text-base sm:text-sm text-primary mt-2 leading-relaxed">
                          {highlightQuery(getSnippet(article.content, query), query)}
                        </p>
                      </header>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-6 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && (hasNextPage || currentPage > 1) && (
              <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
                {currentPage > 1 && (
                  <Link
                    href={`${localizedHref(lang, "help-center")}/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                    className="px-4 py-2 text-base sm:text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    ‹ {lang === "vi" ? "Trước" : "Previous"}
                  </Link>
                )}

                <span className="text-base sm:text-sm text-gray-600">
                  {lang === "vi" ? "Trang" : "Page"} {currentPage}
                  {totalPages ? ` / ${totalPages}` : ""}
                </span>

                {hasNextPage && (
                  <Link
                    href={`${localizedHref(lang, "help-center")}/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                    className="px-4 py-2 text-base sm:text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {lang === "vi" ? "Tiếp" : "Next"} ›
                  </Link>
                )}
              </nav>
            )}
          </section>
        </div>
      </div>
      <ScrollToTop />
    </main>
  );
}
