"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { HelpCenterArticle } from "@/lib/api";

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

interface DetailContentProps {
  lang: string;
  category: string;
  parent?: string;
  titleSlug?: string;
  initialArticles?: HelpCenterArticle[];
}

interface GroupedData {
  [category: string]: {
    [parent: string]: HelpCenterArticle[];
  };
}

export function DetailContent({ lang, category, parent, titleSlug, initialArticles }: DetailContentProps) {
  const [articles, setArticles] = useState<HelpCenterArticle[]>(initialArticles ?? []);
  const [loading, setLoading] = useState(!initialArticles);
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

  // Find selected article when titleSlug is provided
  const selectedArticle = useMemo(() => {
    if (!titleSlug || !parent) return null;
    return (
      articles.find(
        (a) =>
          a.category === category &&
          a.parent === parent &&
          slugify(a.title) === titleSlug
      ) || null
    );
  }, [articles, category, parent, titleSlug]);

  // Articles for the current parent
  const parentArticles = useMemo(() => {
    if (!parent) return [];
    return articles
      .filter((a) => a.category === category && a.parent === parent)
      .sort((a, b) => a.order - b.order);
  }, [articles, category, parent]);

  if (loading) {
    return (
      <main role="main">
        <div className="bg-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center pt-4 pb-4" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main role="main">
      {/* Breadcrumb */}
      <div className="bg-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center py-2">
            <div className="text-sm">
              <nav aria-label="Current location">
                <ol className="flex items-center gap-2 list-none p-0 m-0">
                  <li>
                    <Link href={basePath} className="text-blue-600 hover:underline">
                      Saily Help Center
                    </Link>
                  </li>
                  <li className="before:content-['>'] before:mx-1 before:text-gray-400">
                    {parent ? (
                      <Link href={`${basePath}/${category}`} className="text-blue-600 hover:underline">
                        {formatLabel(category)}
                      </Link>
                    ) : (
                      <span aria-current="page">{formatLabel(category)}</span>
                    )}
                  </li>
                  {parent && (
                    <li className="before:content-['>'] before:mx-1 before:text-gray-400">
                      {titleSlug ? (
                        <Link href={`${basePath}/${category}/${parent}`} className="text-blue-600 hover:underline">
                          {formatLabel(parent)}
                        </Link>
                      ) : (
                        <span aria-current="page">{formatLabel(parent)}</span>
                      )}
                    </li>
                  )}
                  {titleSlug && selectedArticle && (
                    <li className="before:content-['>'] before:mx-1 before:text-gray-400">
                      <span aria-current="page">{selectedArticle.title}</span>
                    </li>
                  )}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Page container */}
      <div className="container mx-auto px-4 flex-1" id="page-container">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar navigation - LEFT */}
          <aside className="w-full md:w-4/12 lg:w-3/12 flex-shrink-0 order-1">
            <div className="mt-6 border-t border-b md:border rounded-sm md:py-4 md:px-6 md:my-10">
              <h3 className="flex items-center justify-between my-4 text-lg font-semibold cursor-pointer lg:hidden">
                Toggle navigation menu
                <svg
                  className="fill-current pointer-events-none ml-3"
                  width="14px"
                  viewBox="0 0 40 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20,19.5 C19.4,19.5 18.9,19.3 18.4,18.9 L1.4,4.9 C0.3,4 0.2,2.4 1.1,1.4 C2,0.3 3.6,0.2 4.6,1.1 L20,13.8 L35.5,1.1 C36.6,0.2 38.1,0.4 39,1.4 C39.9,2.5 39.7,4 38.7,4.9 L21.7,18.9 C21.1,19.3 20.5,19.5 20,19.5 Z"
                    fillRule="nonzero"
                  />
                </svg>
              </h3>

              <div className="hidden lg:flex lg:flex-col" id="sidebar-navigation">
                <ul className="list-none m-0 py-2 p-0">
                  {Object.entries(grouped).map(([catKey, parents]) => {
                    const isActive = catKey === category;
                    return (
                      <li key={catKey}>
                        <h3
                          className={`text-lg ${isActive ? "mt-2 font-bold" : "mt-6 font-semibold"}`}
                        >
                          <Link
                            href={`${basePath}/${catKey}`}
                            className="text-inherit hover:text-blue-600 no-underline"
                          >
                            {formatLabel(catKey)}
                          </Link>
                        </h3>
                        <ul className="list-none p-0 m-0 text-sm">
                          {Object.keys(parents).map((parentKey) => (
                            <li key={parentKey}>
                              <Link
                                href={`${basePath}/${catKey}/${parentKey}`}
                                className={`flex items-center py-2 no-underline ${
                                  catKey === category && parentKey === parent
                                    ? "text-blue-600 font-semibold"
                                    : "text-inherit hover:text-blue-600"
                                }`}
                              >
                                {formatLabel(parentKey)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </aside>

          {/* Main content - RIGHT */}
          <div className="flex-1 order-2">
            {/* === LEVEL 3: Article detail === */}
            {titleSlug && selectedArticle ? (
              <div className="my-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  {selectedArticle.title}
                </h1>
                <div className="text-sm text-gray-500 mb-6">
                  Last updated:{" "}
                  {new Date(selectedArticle.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div
                  className="prose prose-sm max-w-none [&_p]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-blue-600"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            ) : /* === LEVEL 2: Parent section with article list === */
            parent ? (
              <div className="my-10">
                <h1 className="text-2xl md:text-4xl font-medium mb-8">
                  {formatLabel(parent)}
                </h1>
                <ul className="list-none p-0 m-0">
                  {parentArticles.map((article) => (
                    <li key={article.id} className="w-full">
                      <div className="relative flex items-baseline py-2">
                        <div className="flex-1">
                          <Link
                            href={`${basePath}/${category}/${parent}/${slugify(article.title)}`}
                            className="text-inherit hover:text-blue-600 no-underline"
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
                    No articles found in this section.
                  </div>
                )}
              </div>
            ) : (
              /* === LEVEL 1: Category overview with all sections === */
              <div>
                <div className="mb-10">
                  <h1 className="mt-10 text-2xl md:text-4xl font-medium">
                    {formatLabel(category)}
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
                            className="text-inherit hover:text-blue-600 no-underline"
                          >
                            {formatLabel(parentKey)}
                          </Link>
                        </h2>

                        <ul className="list-none p-0 m-0">
                          {arts.slice(0, 6).map((article) => (
                            <li key={article.id} className="w-full">
                              <div className="relative flex items-baseline py-2">
                                <div className="flex-1">
                                  <Link
                                    href={`${basePath}/${category}/${parentKey}/${slugify(article.title)}`}
                                    className="text-inherit hover:text-blue-600 no-underline"
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
                              className="inline-block px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 text-inherit no-underline"
                            >
                              See all {arts.length} articles
                            </Link>
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {Object.keys(currentParents).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No articles found in this category.
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
