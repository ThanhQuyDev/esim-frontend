"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RocketIcon, CreditCardIcon, Pickaxe, MessageCircleQuestionIcon, Search } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";
import {
  getCategoryLabel,
  getParentLabel,
  resolveCategoryKey,
  toLocalizedCategorySlug,
  toLocalizedParentSlug,
} from "./category-config";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

// Map API category keys to icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  getting_started: RocketIcon,
  plans_and_payments: CreditCardIcon,
  troubleshooting: Pickaxe,
  faq: MessageCircleQuestionIcon,
};

/**
 * Resolve the URL slug for a help-center article.
 * Prefers the canonical `slug` field from the API, falls back to a
 * title-derived slug only when the CMS hasn't provided one.
 */
function getArticleSlug(article: { slug?: string; title: string }): string {
  if (article.slug && article.slug.trim().length > 0) return article.slug;
  return article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface HelpCenterContentProps {
  lang: string;
  initialArticles?: HelpCenterArticle[];
}

export function HelpCenterContent({ lang, initialArticles }: HelpCenterContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HelpCenterArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [articles, setArticles] = useState<HelpCenterArticle[]>(initialArticles ?? []);
  const [loading, setLoading] = useState(!initialArticles);

  // Derive unique categories from API data
  const categoryKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const a of articles) keys.add(a.category);
    return Array.from(keys);
  }, [articles]);

  // Popular/featured articles
  const popularArticles = useMemo(() => {
    return articles.filter((a) => a.isPopular).slice(0, 6);
  }, [articles]);

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

  return (
    <div>
      {/* HERO with Search */}
      <div className="w-full min-h-[358px] -mt-16 bg-[url('/images/help-center-background.svg')] bg-cover bg-center flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full px-4 z-30 pb-6 lg:pt-6 lg:pb-8 pt-[72px]">
          <div className="my-6 text-center">
            <h1 className="text-4xl lg:text-5xl font-semibold text-white">
              {lang === "vi" ? "Chúng tôi có thể giúp gì cho bạn?" : "How can we help you?"}
            </h1>
          </div>

          <div className="max-w-xl my-4 mx-auto relative">
            <h2 className="sr-only">{lang === "vi" ? "Tìm kiếm" : "Search"}</h2>
            <form
              role="search"
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`${localizedHref(lang, "help-center")}/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder={lang === "vi" ? "Nhập chủ đề, câu hỏi hoặc vấn đề" : "Type a topic, question or issue here"}
                  className="w-full pl-12 pr-4 py-3 rounded-full text-xl border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={lang === "vi" ? "Nhập chủ đề, câu hỏi hoặc vấn đề" : "Type a topic, question or issue here"}
                />
              </div>
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-black text-white text-base font-semibold shadow-lg hover:bg-gray-600 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                aria-label={lang === "vi" ? "Tìm kiếm" : "Search"}
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{lang === "vi" ? "Tìm kiếm" : "Search"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-[1386px] mx-auto px-8 text-center">
          <h2 className="inline-flex items-baseline mt-6 text-[1.7rem] font-semibold">
            {lang === "vi" ? "Chọn danh mục chính" : "Choose main category"}
          </h2>

          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
            {categoryKeys.map((catKey) => {
              const canonicalKey = resolveCategoryKey(catKey);
              const Icon = CATEGORY_ICONS[canonicalKey] ?? RocketIcon;
              return (
                <li key={catKey}>
                  <Link
                    href={`${localizedHref(lang, "help-center")}/${toLocalizedCategorySlug(catKey, lang)}`}
                    className="flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-md p-6 h-full transition no-underline hover:border-gray-400 hover:shadow-md group"
                  >
                    <div className="w-[80px] h-[80px] bg-blue-200 rounded-full flex items-center justify-center mb-3">
                      <Icon className="w-[40px] h-[40px] text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[1.25rem] font-semibold text-gray-900">
                      {getCategoryLabel(catKey, lang)}
                    </h3>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* POPULAR ARTICLES */}
      <div className="py-8">
        <div className="max-w-[1386px] mx-auto px-8">
          <h2 className="text-[1.4rem] font-semibold mb-6">
            {lang === "vi" ? "Bài viết nổi bật" : "Popular articles"}
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : popularArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {lang === "vi" ? "Chưa có bài viết nổi bật." : "No popular articles yet."}
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {popularArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`${localizedHref(lang, "help-center")}/${toLocalizedCategorySlug(article.category, lang)}/${toLocalizedParentSlug(article.parent, lang)}/${getArticleSlug(article)}`}
                  className="block bg-gray-100 rounded-md p-5 hover:shadow-md transition no-underline"
                >
                  <p className="text-base text-gray-600 mb-2">
                    {getCategoryLabel(article.category, lang)} › {getParentLabel(article.parent, lang)}
                  </p>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href={`${localizedHref(lang, "help-center")}/categories`}
              className="text-gray-700 hover:text-gray-900 no-underline text-base"
            >
              {lang === "vi" ? "Xem thêm" : "See more"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
