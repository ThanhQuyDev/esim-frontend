"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { getCategoryLabel } from "./category-config";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface CategoriesContentProps {
  lang: string;
}

export function CategoriesContent({ lang }: CategoriesContentProps) {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const articleId = searchParams.get("article") || "";

  const [articles, setArticles] = useState<HelpCenterArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<HelpCenterArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HelpCenterArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/help-center`, {
          headers: { "x-custom-lang": lang },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setArticles(json.data || []);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lang]);

  useEffect(() => {
    if (articleId && articles.length > 0) {
      setSelectedArticle(articles.find((a) => a.id === articleId) || null);
    } else {
      setSelectedArticle(null);
    }
  }, [articleId, articles]);

  // Search handler
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/help-center?page=1&limit=10&search=${encodeURIComponent(query)}`,
        { headers: { "x-custom-lang": lang } }
      );
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json.data || []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [lang]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const filtered = categoryFilter
    ? articles.filter((a) => a.category === categoryFilter)
    : articles;

  const grouped = filtered.reduce<Record<string, HelpCenterArticle[]>>((acc, article) => {
    const key = article.parent || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(article);
    return acc;
  }, {});

  Object.values(grouped).forEach((group) => group.sort((a, b) => a.order - b.order));

  if (loading) {
    return (
      <main role="main" className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-32 text-center text-gray-500">
          Loading...
        </div>
      </main>
    );
  }

  // Article detail view
  if (selectedArticle) {
    return (
      <main role="main" className="min-h-screen bg-gray-50">
        {/* Search Box */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <form role="search" className="relative max-w-lg" onSubmit={(e) => e.preventDefault()}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder={lang === "vi" ? "Nhập chủ đề, câu hỏi hoặc vấn đề" : "Type a topic, question or issue here"}
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={lang === "vi" ? "Tìm kiếm bài viết" : "Search articles"}
              />
              {searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      {lang === "vi" ? "Đang tìm kiếm..." : "Searching..."}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul className="list-none p-0 m-0">
                      {searchResults.map((article) => (
                        <li key={article.id}>
                          <Link
                            href={`/${lang}/help-center/${article.category}/${article.parent}/${slugify(article.title)}`}
                            className="block px-4 py-2.5 text-gray-900 no-underline hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <p className="text-sm font-medium">{article.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {getCategoryLabel(article.category, lang)} › {formatLabel(article.parent)}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      {lang === "vi" ? "Không tìm thấy kết quả" : "No results found"}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center pt-4 pb-4">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1 list-none p-0 m-0 text-sm">
                  <li>
                    <Link href={`/${lang}/help-center`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                      {lang === "vi" ? "Trung tâm trợ giúp" : "Help Center"}
                    </Link>
                  </li>
                  <li className="text-gray-400 mx-1">›</li>
                  <li>
                    <Link href={`/${lang}/help-center/categories?category=${selectedArticle.category}`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                      {getCategoryLabel(selectedArticle.category, lang)}
                    </Link>
                  </li>
                  <li className="text-gray-400 mx-1">›</li>
                  <li>
                    <span className="text-gray-900 font-medium">{formatLabel(selectedArticle.parent)}</span>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <article>
            <h1 className="text-2xl font-bold mb-4">{selectedArticle.title}</h1>
            <div
              className="hc-article-body prose prose-sm max-w-none
                [&_p]:mb-4
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:mb-4
                [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:mb-4
                [&_li]:mb-1
                [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:text-left [&_th]:font-semibold
                [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2
                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                [&_a]:text-gray-700 [&_a]:underline [&_a]:hover:text-gray-900
                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          </article>
        </div>
      </main>
    );
  }

  return (
    <main role="main" className="min-h-screen bg-gray-50">
      {/* Search Box */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form role="search" className="relative max-w-lg" onSubmit={(e) => e.preventDefault()}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder={lang === "vi" ? "Nhập chủ đề, câu hỏi hoặc vấn đề" : "Type a topic, question or issue here"}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={lang === "vi" ? "Tìm kiếm bài viết" : "Search articles"}
            />
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    {lang === "vi" ? "Đang tìm kiếm..." : "Searching..."}
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul className="list-none p-0 m-0">
                    {searchResults.map((article) => (
                      <li key={article.id}>
                        <Link
                          href={`/${lang}/help-center/${article.category}/${article.parent}/${slugify(article.title)}`}
                          className="block px-4 py-2.5 text-gray-900 no-underline hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-sm font-medium">{article.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getCategoryLabel(article.category, lang)} › {formatLabel(article.parent)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    {lang === "vi" ? "Không tìm thấy kết quả" : "No results found"}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center pt-4 pb-4">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1 list-none p-0 m-0 text-sm">
                <li>
                  <Link href={`/${lang}/help-center`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                    {lang === "vi" ? "Trung tâm trợ giúp" : "Saily Help Center"}
                  </Link>
                </li>
                {categoryFilter && (
                  <>
                    <li className="text-gray-400 mx-1">›</li>
                    <li>
                      <span className="text-gray-900 font-medium">{getCategoryLabel(categoryFilter, lang)}</span>
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {Object.entries(grouped).map(([parentKey, arts]) => (
          <div key={parentKey} className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">{formatLabel(parentKey)}</h2>
            <ul className="list-none p-0 m-0 space-y-1">
              {arts.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/${lang}/help-center/${article.category}/${article.parent}/${slugify(article.title)}`}
                    className="block px-3 py-2 text-gray-800 no-underline hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {lang === "vi" ? "Không tìm thấy bài viết." : "No articles found."}
          </div>
        )}
      </div>
    </main>
  );
}
