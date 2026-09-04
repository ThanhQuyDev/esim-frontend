"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronRight, Star } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";
import {
  getCategoryLabel,
  getParentLabel,
  toLocalizedCategorySlug,
  toLocalizedParentSlug,
  resolveCategoryKey,
  resolveParentKey,
} from "./category-config";
import { ArticleFooter } from "./article-footer";
import { ArticleToc, processArticleContent } from "./article-toc";
import { ScrollToTop } from "./scroll-to-top";

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
  /**
   * Popular articles fetched server-side (`?isPopular=true&limit=6`) — rendered
   * inside the bottom "Related articles" block on the article detail view.
   */
  popularArticles?: HelpCenterArticle[];
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
  popularArticles,
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
  const basePath = localizedHref(lang, "help-center");

  // Group all articles by category → parent.
  // Articles from the API may use either canonical EN keys (`getting_started`)
  // or locale-specific variants (`bat_dau`). We normalize to canonical keys so
  // the sidebar, comparisons, and URL params all line up regardless of locale.
  const grouped = useMemo<GroupedData>(() => {
    const result: GroupedData = {};
    for (const article of articles) {
      const catKey = resolveCategoryKey(article.category) || article.category;
      const parentKey = resolveParentKey(article.parent) || article.parent;
      if (!result[catKey]) result[catKey] = {};
      if (!result[catKey][parentKey]) result[catKey][parentKey] = [];
      result[catKey][parentKey].push(article);
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
          (!parent || resolveParentKey(a.parent) === parent) &&
          (!category || resolveCategoryKey(a.category) === category) &&
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

  // Articles for the current parent (compare against canonical keys)
  const parentArticles = useMemo(() => {
    if (!parent) return [];
    return articles
      .filter(
        (a) =>
          resolveCategoryKey(a.category) === category &&
          resolveParentKey(a.parent) === parent
      )
      .sort((a, b) => a.order - b.order);
  }, [articles, category, parent]);

  // Process article content: inject ids into <h2> headings and extract TOC items
  const articleProcessed = useMemo(() => {
    if (!selectedArticle?.content) return { headings: [], html: "" };
    return processArticleContent(selectedArticle.content);
  }, [selectedArticle?.content]);

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
        <div className="bg-gray-100">
          <div className="container mx-auto px-4 sm:px-0">
            <div className="flex items-center pt-4 pb-4" />
          </div>
        </div>
        <div className="container mx-auto py-16 text-center text-gray-500">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main role="main">
      {/* Search Box on top for sub-pages (Bug 2.8 + Layout 2.3) */}
     

      {/* Breadcrumb (Style 2.9) — merged: Trang chủ > Trung tâm trợ giúp > ... */}
      <div className="bg-gray-100">
        <div className="container mx-auto px-4 sm:px-0">
          <div className="flex items-center pt-4 pb-4">
            <div className="text-sm">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1 list-none p-0 m-0 flex-wrap">
                  <li>
                    <Link href={localizedHref(lang, "/")} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                      {lang === "vi" ? "Trang chủ" : "Home"}
                    </Link>
                  </li>
                  <li className="text-gray-400 mx-1">›</li>
                  <li>
                    <Link href={basePath} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                      {lang === "vi" ? "Trung tâm trợ giúp" : "Help Center"}
                    </Link>
                  </li>
                  <li className="text-gray-400 mx-1">›</li>
                  <li>
                    {parent ? (
                      <Link href={`${basePath}/${toLocalizedCategorySlug(category, lang)}`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
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
                          <Link href={`${basePath}/${toLocalizedCategorySlug(category, lang)}/${toLocalizedParentSlug(parent, lang)}`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
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
      <div className="container mx-auto px-4 sm:px-0 flex-1" id="page-container">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
          {/* Category navigation - LEFT, restored for desktop Help pages. */}
          <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0 order-1">
            <nav
              aria-label={lang === "vi" ? "Danh mục trợ giúp" : "Help categories"}
              className="sticky top-[120px] max-h-[calc(100vh-150px)] overflow-y-auto py-10 pr-2"
            >
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {lang === "vi" ? "Danh mục" : "Categories"}
              </h2>
              <ul className="m-0 list-none space-y-1 p-0">
                {Object.entries(grouped).map(([catKey, parents]) => {
                  const categoryExpanded = expandedCategories.has(catKey);
                  const categoryActive = catKey === category;
                  return (
                    <li key={catKey}>
                      <div
                        className={`flex items-center rounded-md ${
                          categoryActive ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        <Link
                          href={`${basePath}/${toLocalizedCategorySlug(catKey, lang)}`}
                          className={`min-w-0 flex-1 px-3 py-2 text-sm no-underline ${
                            categoryActive
                              ? "font-semibold text-gray-950"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {getCategoryLabel(catKey, lang)}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleCategory(catKey)}
                          className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-200"
                          aria-label={
                            categoryExpanded
                              ? lang === "vi" ? "Thu gọn danh mục" : "Collapse category"
                              : lang === "vi" ? "Mở rộng danh mục" : "Expand category"
                          }
                          aria-expanded={categoryExpanded}
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              categoryExpanded ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                        </button>
                      </div>

                      {categoryExpanded && (
                        <ul className="m-0 ml-3 list-none border-l border-gray-200 py-1 pl-3">
                          {Object.entries(parents).map(([parentKey, parentItems]) => {
                            const parentPath = `${catKey}/${parentKey}`;
                            const parentExpanded = expandedParents.has(parentPath);
                            const parentActive = categoryActive && parentKey === parent;
                            return (
                              <li key={parentKey}>
                                <div className="flex items-center">
                                  <Link
                                    href={`${basePath}/${toLocalizedCategorySlug(catKey, lang)}/${toLocalizedParentSlug(parentKey, lang)}`}
                                    className={`min-w-0 flex-1 py-1.5 text-sm no-underline ${
                                      parentActive
                                        ? "font-semibold text-gray-950"
                                        : "text-gray-600 hover:text-gray-950"
                                    }`}
                                  >
                                    {getParentLabel(parentKey, lang)}
                                  </Link>
                                  {parentItems.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => toggleParent(catKey, parentKey)}
                                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100"
                                      aria-expanded={parentExpanded}
                                    >
                                      <ChevronRight
                                        className={`h-3.5 w-3.5 transition-transform ${
                                          parentExpanded ? "rotate-90" : ""
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>
                                {parentExpanded && (
                                  <ul className="m-0 list-none space-y-1 pb-2 pl-2 pt-1">
                                    {parentItems.map((article) => {
                                      const articleSlug = getArticleSlug(article);
                                      const isActive = articleSlug === activeArticleSlug;
                                      return (
                                        <li key={article.id}>
                                          <Link
                                            href={`${basePath}/${articleSlug}`}
                                            className={`block break-words py-1 text-xs leading-5 no-underline ${
                                              isActive
                                                ? "font-semibold text-gray-950"
                                                : "text-gray-500 hover:text-gray-900"
                                            }`}
                                            aria-current={isActive ? "page" : undefined}
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
          </aside>


          {/* Main content - CENTER */}
          <div className="flex-1 order-2 min-w-0">
            {/* === LEVEL 3: Article detail (Bug 2.4: Rich Text) === */}
            {titleSlug && selectedArticle ? (
              <div className="my-10">
                <h1 className="text-[1.9rem] sm:text-2xl md:text-3xl font-medium mb-4">
                  {selectedArticle.title}
                  {selectedArticle.isPopular && (
                    <Star className="inline-block w-5 h-5 ml-2 text-yellow-400 fill-yellow-400" aria-label="Popular article" />
                  )}
                </h1>
                <div className="text-sm text-gray-500 mb-6">
                  {lang === "vi" ? "Cập nhật lần cuối: " : "Last updated: "}
                  {new Date(selectedArticle.updatedAt).toLocaleDateString(
                    lang === "vi" ? "vi-VN" : "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </div>
                {/* Mobile TOC — visible only below lg, desktop uses right sidebar */}
                {articleProcessed.headings.length > 0 && (
                  <div className="lg:hidden mb-8">
                    <ArticleToc headings={articleProcessed.headings} lang={lang} />
                  </div>
                )}
                {/* Rich Text Content (Bug 2.4: full formatting with prose) */}
                <div
                  className="article-body hc-article-body prose prose-sm max-w-[800px]
                    [&_p]:text-base [&_p]:leading-[1.625] [&_p]:mb-4
                    [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
                    [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                    [&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2
                    [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:mb-4
                    [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:mb-4
                    [&_li]:mb-1
                    [&_table]:!border-collapse [&_table]:!border [&_table]:!border-gray-300 [&_table]:!mb-4 [&_table]:!rounded-none sm:[&_table]:!w-full sm:[&_table]:!table-fixed
                    [&_th]:!border [&_th]:!border-gray-300 [&_th]:!px-3 [&_th]:!py-2 [&_th]:!bg-gray-100 [&_th]:!text-left [&_th]:!font-semibold [&_th]:!rounded-none
                    [&_td]:!border [&_td]:!border-gray-300 [&_td]:!px-3 [&_td]:!py-2 [&_td]:!rounded-none
                    [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                    [&_a]:text-gray-700 [&_a]:no-underline [&_a]:hover:underline [&_a]:hover:text-gray-900
                    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded
                    [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
                    [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm"
                  dangerouslySetInnerHTML={{ __html: articleProcessed.html || selectedArticle.content }}
                />
              </div>
            ) : /* === LEVEL 2: Parent section with article list === */
            parent ? (
              <div className="my-10">
                <h1 className="text-[1.8rem] md:text-4xl font-medium mb-8">
                  {getParentLabel(parent, lang)}
                </h1>
                <ul className="list-none p-0 m-0">
                  {parentArticles.map((article) => (
                    <li key={article.id} className="w-full">
                      <div className="relative flex items-baseline py-2">
                        <div className="flex-1">
                          <Link
                            href={`${basePath}/${getArticleSlug(article)}`}
                            className="text-gray-800 hover:text-gray-900 no-underline transition-colors"
                          >
                            {article.title}
                            {article.isPopular && (
                              <Star className="inline-block w-4 h-4 ml-1.5 text-yellow-400 fill-yellow-400" aria-label="Popular" />
                            )}
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
                  <h1 className="mt-10 text-[1.8rem] sm:text-2xl md:text-4xl font-medium">
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
                        <h2 className="text-2xl font-semibold mb-2">
                          <Link
                            href={`${basePath}/${toLocalizedCategorySlug(category, lang)}/${toLocalizedParentSlug(parentKey, lang)}`}
                            className="hover:text-gray-700 no-underline transition-colors"
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
                                    href={`${basePath}/${getArticleSlug(article)}`}
                                    className="text-gray-800 hover:text-gray-900 no-underline transition-colors"
                                  >
                                    {article.title}
                                    {article.isPopular && (
                                      <Star className="inline-block w-4 h-4 ml-1.5 text-yellow-400 fill-yellow-400" aria-label="Popular" />
                                    )}
                                  </Link>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>

                        {arts.length > 6 && (
                          <p className="mt-2">
                            <Link
                              href={`${basePath}/${toLocalizedCategorySlug(category, lang)}/${toLocalizedParentSlug(parentKey, lang)}`}
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

          {/* TOC Sidebar - RIGHT (only on article detail, desktop only) */}
          {titleSlug && selectedArticle && articleProcessed.headings.length > 0 && (
            <aside className="hidden lg:block w-48 xl:w-52 flex-shrink-0 order-3">
              <div className="sticky top-[120px] pt-16">
                <ArticleToc headings={articleProcessed.headings} lang={lang} />
              </div>
            </aside>
          )}
        </div>

        {/* Article Footer — full width, outside the flex row so TOC doesn't constrain it */}
        {titleSlug && selectedArticle && (
          <div className="mt-4">
            <ArticleFooter
              lang={lang}
              currentArticle={selectedArticle}
              popularArticles={popularArticles ?? []}
              buildHref={(a) =>
                `${basePath}/${getArticleSlug(a)}`
              }
            />
          </div>
        )}
      </div>

      {/* Scroll to top button */}
      <ScrollToTop />
    </main>
  );
}
