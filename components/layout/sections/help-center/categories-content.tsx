"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { localizedHref } from "@/lib/route-mapping";
import type { HelpCenterArticle } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/help-center`);
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
  }, []);

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
      <main role="main" className="min-h-screen" style={{ background: "#f7f7f7" }}>
        <div className="hc-container" style={{ paddingTop: 120, textAlign: "center", color: "#999" }}>
          Loading...
        </div>
      </main>
    );
  }

  // Article detail view
  if (selectedArticle) {
    return (
      <main role="main" className="min-h-screen" style={{ background: "#f7f7f7" }}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
          <div className="hc-container" style={{ paddingTop: 88, paddingBottom: 16 }}>
            <nav className="hc-breadcrumb" aria-label="Breadcrumb">
              <Link href={`/${lang}/help-center`} className="hc-breadcrumb__link">Help Center</Link>
              <span className="hc-breadcrumb__sep">›</span>
              <Link href={`/${lang}/help-center/categories?category=${selectedArticle.category}`} className="hc-breadcrumb__link">
                {formatLabel(selectedArticle.category)}
              </Link>
              <span className="hc-breadcrumb__sep">›</span>
              <span className="hc-breadcrumb__current">{formatLabel(selectedArticle.parent)}</span>
            </nav>
          </div>
        </div>

        <div className="hc-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
          <article className="hc-article">
            <h1 className="hc-article__title">{selectedArticle.title}</h1>
            <div
              className="hc-article__body"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
            <div className="hc-article__meta">
              Last updated:{" "}
              {new Date(selectedArticle.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </article>
        </div>
      </main>
    );
  }

  // Category listing view
  return (
    <main role="main" className="min-h-screen" style={{ background: "#f7f7f7" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div className="hc-container" style={{ paddingTop: 88, paddingBottom: 16 }}>
          <nav className="hc-breadcrumb" aria-label="Breadcrumb">
            <Link href={`/${lang}/help-center`} className="hc-breadcrumb__link">Help Center</Link>
            {categoryFilter && (
              <>
                <span className="hc-breadcrumb__sep">›</span>
                <span className="hc-breadcrumb__current">{formatLabel(categoryFilter)}</span>
              </>
            )}
          </nav>
          <h1 className="hc-cat-page__title">
            {categoryFilter ? formatLabel(categoryFilter) : "All Categories"}
          </h1>
        </div>
      </div>

      <div className="hc-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#999" }}>
            No articles found in this category.
          </div>
        ) : (
          Object.entries(grouped).map(([parent, parentArticles]) => (
            <div key={parent} className="hc-section-group">
              <h2 className="hc-section-group__title">{formatLabel(parent)}</h2>
              <ul className="hc-article-list">
                {parentArticles.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/${lang}/help-center/categories?category=${article.category}&article=${article.id}`}
                      className="hc-article-item"
                    >
                      <svg className="hc-article-item__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="hc-article-item__title">{article.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
