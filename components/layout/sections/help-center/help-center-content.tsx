"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { RocketIcon, CreditCardIcon, Pickaxe, MessageCircleQuestionIcon, Search } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

// Map API category keys to icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  getting_started: RocketIcon,
  plans_and_payments: CreditCardIcon,
  troubleshooting: Pickaxe,
  faq: MessageCircleQuestionIcon,
};

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "today";
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

interface HelpCenterContentProps {
  lang: string;
}

export function HelpCenterContent({ lang }: HelpCenterContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<HelpCenterArticle[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Derive unique categories from API data
  const categoryKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const a of articles) keys.add(a.category);
    return Array.from(keys);
  }, [articles]);

  // Recent articles sorted by createdAt desc
  const recentArticles = useMemo(() => {
    return [...articles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [articles]);

  return (
    <div>
      {/* HERO */}
      <div className="w-full min-h-[358px] bg-[url('/images/help-center-background.svg')] bg-cover bg-center flex items-center justify-center">
        <div className="container z-30 pb-6 lg:pt-6 lg:pb-8 pt-[72px]">
          <div className="my-6 text-center">
            <h1 className="text-4xl lg:text-5xl font-semibold text-white">
              How can we help you?
            </h1>
          </div>

          <div className="max-w-md my-4 mx-auto relative">
            <h2 className="sr-only">Search</h2>
            <form
              role="search"
              className="relative"
              onSubmit={(e) => e.preventDefault()}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Type a topic, question or issue here"
                className="w-full pl-12 pr-4 py-3 rounded-full text-base border-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Type a topic, question or issue here"
              />
            </form>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="bg-gray-50 py-8">
        <div className="container text-center">
          <h2 className="inline-flex items-baseline mt-6 text-2xl font-semibold">
            Choose main category
          </h2>

          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 list-none p-0">
            {categoryKeys.map((catKey) => {
              const Icon = CATEGORY_ICONS[catKey] ?? RocketIcon;
              return (
                <li key={catKey}>
                  <Link
                    href={`/${lang}/help-center/${catKey}`}
                    className="flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-md p-6 h-full transition hover:no-underline hover:text-blue-600 hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="w-[80px] h-[80px] bg-blue-200 rounded-full flex items-center justify-center mb-3">
                      <Icon className="w-[40px] h-[40px] text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
                      {formatLabel(catKey)}
                    </h3>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="py-8">
        <div className="container">
          <h2 className="text-xl font-semibold mb-6">Recent activity</h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div
              role="status"
              aria-relevant="additions"
              aria-atomic="false"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/${lang}/help-center/${article.category}`}
                  className="block bg-gray-100 rounded-md p-5 hover:shadow-md transition hover:no-underline"
                >
                  <p className="text-sm text-blue-600 mb-2">
                    {formatLabel(article.parent)}
                  </p>
                  <h3 className="text-base font-medium text-gray-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Article created {timeAgo(article.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href={`/${lang}/help-center/categories`}
              className="text-blue-600 hover:underline text-sm"
            >
              See more
              <span className="sr-only"> items from recent activity</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
