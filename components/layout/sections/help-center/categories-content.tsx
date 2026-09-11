"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { HelpCenterArticle } from "@/lib/api";
import { ScrollToTop } from "./scroll-to-top";
import { localizedHref } from "@/lib/route-mapping";
import { helpCenterArticleSlug as getArticleSlug } from "@/lib/help-center-search";
import { HelpCenterSearchBox } from "./help-center-search-box";
import { getCategoryLabel, getParentLabel, toLocalizedCategorySlug, toLocalizedParentSlug } from "./category-config";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

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
        <div className="container mx-auto py-32 text-center text-gray-500">
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
          <div className="container mx-auto py-3">
            <HelpCenterSearchBox lang={lang} className="max-w-lg" />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-gray-100">
          <div className="container mx-auto">
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
                      <Link href={localizedHref(lang, "help-center")} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                        {lang === "vi" ? "Trung tâm trợ giúp" : "Help Center"}
                      </Link>
                    </li>
                    <li className="text-gray-400 mx-1">›</li>
                    <li>
                      <Link href={`${localizedHref(lang, "help-center/categories")}?category=${selectedArticle.category}`} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                        {getCategoryLabel(selectedArticle.category, lang)}
                      </Link>
                    </li>
                    <li className="text-gray-400 mx-1">›</li>
                    <li>
                      <span className="text-gray-900 font-medium" aria-current="page">{getParentLabel(selectedArticle.parent, lang)}</span>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto py-8 px-4 sm:px-0">
          <article>
            <h1 className="text-[1.7rem] sm:text-2xl font-medium mb-4">{selectedArticle.title}</h1>
            <div
              className="hc-article-body prose prose-sm max-w-[800px]
                [&_p]:text-base [&_p]:leading-[1.625] [&_p]:mb-4
                [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
                [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:mb-4
                [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:mb-4
                [&_li]:mb-1
                sm:[&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:text-left [&_th]:font-semibold
                [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2
                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                [&_a]:text-gray-700 [&_a]:no-underline [&_a]:hover:underline [&_a]:hover:text-gray-900
                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          </article>
        </div>
      <ScrollToTop />
      </main>
    );
  }

  return (
    <main role="main" className="min-h-screen bg-gray-50">
      {/* Search Box */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-3">
          <HelpCenterSearchBox lang={lang} className="max-w-lg" />
        </div>
      </div>

      {/* Breadcrumb */}
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
                    <Link href={localizedHref(lang, "help-center")} className="text-gray-700 no-underline hover:text-gray-900 transition-colors">
                      {lang === "vi" ? "Trung tâm trợ giúp" : "Help Center"}
                    </Link>
                  </li>
                  {categoryFilter && (
                    <>
                      <li className="text-gray-400 mx-1">›</li>
                      <li>
                        <span className="text-gray-900 font-medium" aria-current="page">{getCategoryLabel(categoryFilter, lang)}</span>
                      </li>
                    </>
                  )}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8">
        {/* The article view has its own h1; this listing view had none. */}
        <h1 className="sr-only">
          {categoryFilter
            ? getCategoryLabel(categoryFilter, lang)
            : lang === "vi"
              ? "Danh mục trợ giúp"
              : "Help center categories"}
        </h1>
        {Object.entries(grouped).map(([parentKey, arts]) => (
          <div key={parentKey} className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">{getParentLabel(parentKey, lang)}</h2>
            <ul className="list-none p-0 m-0 space-y-1">
              {arts.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`${localizedHref(lang, "help-center")}/${getArticleSlug(article)}`}
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
      <ScrollToTop />
    </main>
  );
}
