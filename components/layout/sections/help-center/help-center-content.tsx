"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RocketIcon, CreditCardIcon, Pickaxe, MessageCircleQuestionIcon } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";
import { helpCenterArticleSlug } from "@/lib/help-center-search";
import { HelpCenterSearchBox } from "./help-center-search-box";
import { ScrollToTop } from "./scroll-to-top";
import {
  getCategoryLabel,
  getParentLabel,
  resolveCategoryKey,
  toLocalizedCategorySlug,
  toLocalizedParentSlug,
} from "./category-config";

// Map API category keys to icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  getting_started: RocketIcon,
  plans_and_payments: CreditCardIcon,
  troubleshooting: Pickaxe,
  faq: MessageCircleQuestionIcon,
};

interface HelpCenterContentProps {
  lang: string;
  initialArticles?: HelpCenterArticle[];
}

export function HelpCenterContent({ lang, initialArticles }: HelpCenterContentProps) {
  const [articles] = useState<HelpCenterArticle[]>(initialArticles ?? []);
  const [loading] = useState(!initialArticles);

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

          <div className="max-w-xl my-4 mx-auto">
            <h2 className="sr-only">{lang === "vi" ? "Tìm kiếm" : "Search"}</h2>
            {/* Results now drop down as the customer types (#074) */}
            <HelpCenterSearchBox lang={lang} variant="hero" />
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="bg-primary py-8">
        <div className="container sm:px-0 px-4 text-center">
          <h2 className="inline-flex items-baseline mt-6 text-[1.7rem] sm:text-2xl font-semibold">
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
        <div className="container px-4 sm:px-0">
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
                  href={`${localizedHref(lang, "help-center")}/${helpCenterArticleSlug(article)}`}
                  className="block bg-gray-100 rounded-md p-5 hover:shadow-md transition no-underline"
                >
                  <p className="text-base sm:text-sm text-gray-600 mb-2">
                    {getCategoryLabel(article.category, lang)} › {getParentLabel(article.parent, lang)}
                  </p>
                  <h3 className="text-xl sm:text-base font-medium text-gray-900 mb-3">
                    {article.title}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href={`${localizedHref(lang, "help-center/categories")}`}
              className="text-gray-700 hover:text-gray-900 no-underline text-base sm:text-sm"
            >
              {lang === "vi" ? "Xem thêm" : "See more"}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}
