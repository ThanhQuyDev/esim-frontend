"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { getCategoryLabel, getParentLabel } from "./category-config";
import { ArticleFooter } from "./article-footer";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

/**
 * Normalize a slug for comparison/URL building.
 * Strips an optional leading slash and trims whitespace, since the CMS may
 * return slugs like "/honest-review2" while URLs only carry "honest-review2".
 */
function normalizeSlug(slug: string | undefined | null): string {
  if (!slug) return "";
  return slug.trim().replace(/^\/+/, "");
}

/**
 * Resolve the URL slug for a help-center article.
 * Prefers the canonical `slug` field from the API (normalized to drop a
 * leading "/"); falls back to a title-derived slug only when the CMS hasn't
 * provided one.
 */
function getArticleSlug(article: { slug?: string; title: string }): string {
  const fromApi = normalizeSlug(article.slug);
  if (fromApi.length > 0) return fromApi;
  return article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface DetailContentProps {
  lang: string;
  category: string;
  parent?: string;
  titleSlug?: string;
  initialArticles?: HelpCenterArticle[];
  /**
   * Article fetched server-side via /api/v1/help-center/by-slug/{slug}.
   * Preferred over an in-memory lookup since the article-list endpoint may
   * not contain the article (paging / locale variants).
   */
  initialArticle?: HelpCenterArticle;
}

interface GroupedData {
  [category: string]: {
    [parent: string]: HelpCenterArticle[];
  };
}

export function DetailContent({
  lang,
  category,
  parent,
  titleSlug,
  initialArticles,
  initialArticle,
}: DetailContentProps) {
  const [articles, setArticles] = useState<HelpCenterArticle[]>(initialArticles ?? []);
  const [loading, setLoading] = useState(!initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HelpCenterArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set([category]));
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(parent ? [`${category}/${parent}`] : [])
  );
  const basePath = `/${lang}/help-center`;

  // Group all articles by category → parent
  const grouped = useMemo<GroupedData>(() => {
    const result: GroupedData = {};
    for (const article of articles) {
      if (!result[article.category]) result[article.category] = {};
      if (!result[article.category][article.parent])
        result[article.category][article.parent] = [];
      result[article.category][article.parent].push(article);
    }
    for (const cat of Object.values(result)) {
      for (const parentKey of Object.keys(cat)) {
        cat[parentKey].sort((a, b) => a.order - b.order);
      }
    }
    return result;
  }, [articles]);

  // Current category's parents
  const currentParents = grouped[category] || {};

  const normalizedTitleSlug = useMemo(
    () => normalizeSlug(titleSlug),
    [titleSlug]
  );

  // Resolve the selected article. Order of preference:
  //  1. The server-fetched `initialArticle` (always authoritative).
  //  2. A match in the in-memory list by canonical slug.
  //  3. A match by title-derived slug (legacy URLs).
  const selectedArticle = useMemo(() => {
    if (!normalizedTitleSlug) return null;
    if (initialArticle) return initialArticle;
    return (
      articles.find(
        (a) =>
          (!parent || a.parent === parent) &&
          (!category || a.category === category) &&
          getArticleSlug(a) === normalizedTitleSlug
      ) || null
    );
  }, [articles, category, parent, normalizedTitleSlug, initialArticle]);

  // Slug used to drive sidebar "active" state. We prefer the
  // server-fetched article's slug (most authoritative) and fall back to the
  // raw URL segment.
  const activeArticleSlug = useMemo(
    () =>
      normalizeSlug(selectedArticle?.slug) || normalizedTitleSlug,
    [selectedArticle, normalizedTitleSlug]
  );

  // Articles for the current parent
  const parentArticles = useMemo(() => {
    if (!parent) return [];
    return articles
      .filter((a) => a.category === category && a.parent === parent)
      .sort((a, b) => a.order - b.order);
  }, [articles, category, parent]);

  // Auto-expand to current article location
  useEffect(() => {
    if (category) {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        next.add(category);
        return next;
      });
    }
    if (parent) {
      setExpandedParents((prev) => {
        const next = new Set(prev);
        next.add(`${category}/${parent}`);
        return next;
      });
    }
  }, [category, parent]);

  // Toggle category expand/collapse
  const toggleCategory = (catKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else next.add(catKey);
      return next;
    });
  };

  // Toggle parent expand/collapse
  const toggleParent = (catKey: string, parentKey: string) => {
    const key = `${catKey}/${parentKey}`;
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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

  if (loading) {
    return (
      <main role="main">
        <div className="bg-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center pt-4 pb-4" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main role="main">
      {/* Search Box on top for sub-pages (Bug 2.8 + Layout 2.3) */}
     

      {/* Breadcrumb (Style 2.9) */}
      <div className="bg-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center pt-4 pb-4">
            <div className="text-sm">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1 list-none p-0 m-0 flex-wrap">
                  <li>
                    <Link href={basePath} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                      {lang === "vi" ? "Trung tâm trợ giúp" : "Help Center"}
                    </Link>
                  </li>
                  <li className="text-gray-400 mx-1">›</li>
                  <li>
                    {parent ? (
                      <Link href={`${basePath}/${category}`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                        {getCategoryLabel(category, lang)}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium" aria-current="page">{getCategoryLabel(category, lang)}</span>
                    )}
                  </li>
                  {parent && (
                    <>
                      <li className="text-gray-400 mx-1">›</li>
                      <li>
                        {titleSlug ? (
                          <Link href={`${basePath}/${category}/${parent}`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                            {getParentLabel(parent, lang)}
                          </Link>
                        ) : (
                          <span className="text-gray-900 font-medium" aria-current="page">{getParentLabel(parent, lang)}</span>
                        )}
                      </li>
                    </>
                  )}
                  {titleSlug && selectedArticle && (
                    <>
                      <li className="text-gray-400 mx-1">›</li>
                      <li>
                        <span className="text-gray-900 font-medium" aria-current="page">{selectedArticle.title}</span>
                      </li>
                    </>
                  )}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Page container (Layout 2.2: max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-4 flex-1" id="page-container">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar navigation - LEFT (Navigation 2.5: 3-level tree) */}
          <aside className="w-full md:w-4/12 lg:w-3/12 flex-shrink-0 order-1">
            <div className="mt-6 border-t border-b md:border rounded-sm md:py-4 md:px-4 md:my-10">
              <h3 className="flex items-center justify-between my-4 text-lg font-semibold cursor-pointer lg:hidden">
                {lang === "vi" ? "Menu điều hướng" : "Toggle navigation menu"}
              </h3>

              <nav className="hidden lg:flex lg:flex-col" id="sidebar-navigation" aria-label="Help Center navigation">
                <ul className="list-none m-0 py-2 p-0">
                  {Object.entries(grouped).map(([catKey, parents]) => {
                    const isCatActive = catKey === category;
                    const isCatExpanded = expandedCategories.has(catKey);
                    return (
                      <li key={catKey} className="mb-1">
                        {/* Level 1: Category */}
                        <button
                          onClick={() => toggleCategory(catKey)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left rounded transition-colors cursor-pointer ${
                            isCatActive
                              ? "bg-gray-100 font-bold text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          aria-expanded={isCatExpanded}
                        >
                          <Link
                            href={`${basePath}/${catKey}`}
                            className="flex-1 text-inherit no-underline hover:text-inherit"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getCategoryLabel(catKey, lang)}
                          </Link>
                          {isCatExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                        </button>

                        {/* Level 2: Parents/Sections */}
                        {isCatExpanded && (
                          <ul className="list-none p-0 m-0 ml-3 mt-1">
                            {Object.entries(parents).map(([parentKey, arts]) => {
                              const isParentActive = catKey === category && parentKey === parent;
                              const parentExpandKey = `${catKey}/${parentKey}`;
                              const isParentExpanded = expandedParents.has(parentExpandKey);
                              return (
                                <li key={parentKey} className="mb-0.5">
                                  <button
                                    onClick={() => toggleParent(catKey, parentKey)}
                                    className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left rounded transition-colors cursor-pointer ${
                                      isParentActive
                                        ? "bg-gray-100 font-semibold text-gray-900"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                    aria-expanded={isParentExpanded}
                                  >
                                    <Link
                                      href={`${basePath}/${catKey}/${parentKey}`}
                                      className="flex-1 text-inherit no-underline hover:text-inherit"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {getParentLabel(parentKey, lang)}
                                    </Link>
                                    {isParentExpanded ? (
                                      <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                                    )}
                                  </button>

                                  {/* Level 3: Articles (UX 2.11: active state) */}
                                  {isParentExpanded && (
                                    <ul className="list-none p-0 m-0 ml-3 mt-0.5">
                                      {arts.map((article) => {
                                        const artSlug = getArticleSlug(article);
                                        const isArticleActive =
                                          catKey === category &&
                                          parentKey === parent &&
                                          artSlug === activeArticleSlug;
                                        return (
                                          <li key={article.id}>
                                            <Link
                                              href={`${basePath}/${catKey}/${parentKey}/${artSlug}`}
                                              className={`block px-3 py-2 text-xs rounded transition-colors no-underline ${
                                                isArticleActive
                                                  ? "bg-gray-100 font-medium text-gray-900 border-l-[3px] border-l-[#ffdc52]"
                                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-[3px] border-l-transparent"
                                              }`}
                                            >
                                              {article.title}
                                            </Link>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main content - RIGHT */}
          <div className="flex-1 order-2">
            {/* === LEVEL 3: Article detail (Bug 2.4: Rich Text) === */}
            {titleSlug && selectedArticle ? (
              <div className="my-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  {selectedArticle.title}
                </h1>
                <div className="text-sm text-gray-500 mb-6">
                  {lang === "vi" ? "Cập nhật lần cuối: " : "Last updated: "}
                  {new Date(selectedArticle.updatedAt).toLocaleDateString(
                    lang === "vi" ? "vi-VN" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </div>
                {/* Rich Text Content (Bug 2.4: full formatting with prose) */}
                <div
                  className="hc-article-body prose prose-sm max-w-none
                    [&_p]:mb-4
                    [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                    [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2
                    [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:mb-4
                    [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:mb-4
                    [&_li]:mb-1
                    [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                    [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:text-left [&_th]:font-semibold
                    [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                    [&_a]:text-gray-700 [&_a]:underline [&_a]:hover:text-gray-900
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded
                    [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
                    [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />

                {/* Content 5.1: Support CTA + related articles */}
                <ArticleFooter
                  lang={lang}
                  currentArticle={selectedArticle}
                  allArticles={articles}
                  buildHref={(a) =>
                    `${basePath}/${a.category}/${a.parent}/${getArticleSlug(a)}`
                  }
                />
              </div>
            ) : /* === LEVEL 2: Parent section with article list === */
            parent ? (
              <div className="my-10">
                <h1 className="text-2xl md:text-4xl font-medium mb-8">
                  {getParentLabel(parent, lang)}
                </h1>
                <ul className="list-none p-0 m-0">
                  {parentArticles.map((article) => (
                    <li key={article.id} className="w-full">
                      <div className="relative flex items-baseline py-2">
                        <div className="flex-1">
                          <Link
                            href={`${basePath}/${category}/${parent}/${getArticleSlug(article)}`}
                            className="text-gray-800 hover:text-gray-900 no-underline transition-colors"
                          >
                            {article.title}
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {parentArticles.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    {lang === "vi" ? "Không tìm thấy bài viết trong mục này." : "No articles found in this section."}
                  </div>
                )}
              </div>
            ) : (
              /* === LEVEL 1: Category overview with all sections === */
              <div>
                <div className="mb-10">
                  <h1 className="mt-10 text-2xl md:text-4xl font-medium">
                    {getCategoryLabel(category, lang)}
                  </h1>
                </div>

                <div className="space-y-0">
                  {Object.entries(currentParents).map(([parentKey, arts], idx) => {
                    const isLast = idx === Object.keys(currentParents).length - 1;
                    return (
                      <div
                        key={parentKey}
                        className={`mb-6 pb-8 ${!isLast ? "border-b border-gray-200" : ""}`}
                      >
                        <h2 className="text-xl font-semibold mb-2">
                          <Link
                            href={`${basePath}/${category}/${parentKey}`}
                            className="text-gray-900 hover:text-gray-700 no-underline transition-colors"
                          >
                            {getParentLabel(parentKey, lang)}
                          </Link>
                        </h2>

                        <ul className="list-none p-0 m-0">
                          {arts.slice(0, 6).map((article) => (
                            <li key={article.id} className="w-full">
                              <div className="relative flex items-baseline py-2">
                                <div className="flex-1">
                                  <Link
                                    href={`${basePath}/${category}/${parentKey}/${getArticleSlug(article)}`}
                                    className="text-gray-800 hover:text-gray-900 no-underline transition-colors"
                                  >
                                    {article.title}
                                  </Link>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>

                        {arts.length > 6 && (
                          <p className="mt-2">
                            <Link
                              href={`${basePath}/${category}/${parentKey}`}
                              className="inline-block px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-800 no-underline transition-colors"
                            >
                              {lang === "vi" ? `Xem tất cả ${arts.length} bài viết` : `See all ${arts.length} articles`}
                            </Link>
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {Object.keys(currentParents).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      {lang === "vi" ? "Không tìm thấy bài viết trong danh mục này." : "No articles found in this category."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
