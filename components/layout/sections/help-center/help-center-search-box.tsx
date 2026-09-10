"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { HelpCenterArticle } from "@/lib/api";
import { localizedHref } from "@/lib/route-mapping";
import {
  helpCenterArticleSlug,
  helpCenterResults,
  helpCenterSearchUrl,
  moveActiveIndex,
} from "@/lib/help-center-search";
import { getCategoryLabel, getParentLabel } from "./category-config";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

const DEBOUNCE_MS = 250;
const MAX_SUGGESTIONS = 8;

interface HelpCenterSearchBoxProps {
  lang: string;
  /**
   * `hero` — the big box on the help-center landing page, with its own submit
   * button. `compact` — the slim bar reused on the inner pages.
   */
  variant?: "hero" | "compact";
  /** Pre-fill, used on the results page so the box shows the current query. */
  initialQuery?: string;
  className?: string;
}

/**
 * Help-center search with a live results popup (#074).
 *
 * Customers were typing a question and getting nothing back until they pressed
 * Enter — the answer usually exists, it was just one navigation away. The popup
 * now opens while typing, so the top matches show up under the cursor.
 *
 * One component for every help-center search box: the landing hero, the inner
 * pages and the results page each had their own copy of the debounce + fetch,
 * all three pointing at a URL that no longer exists.
 */
export function HelpCenterSearchBox({
  lang,
  variant = "compact",
  initialQuery = "",
  className,
}: HelpCenterSearchBoxProps) {
  const router = useRouter();
  const listboxId = useId();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<HelpCenterArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVi = lang === "vi";
  const trimmed = query.trim();
  const searchPageHref = `${localizedHref(lang, "help-center/search")}?q=${encodeURIComponent(trimmed)}`;

  // Keep the box in step with the URL when the results page re-renders with a
  // new `q` (browser back/forward, or a second search).
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced fetch. The in-flight request is aborted on every keystroke so a
  // slow response for "ju" can never land after the one for "japan".
  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(helpCenterSearchUrl(API_BASE_URL, trimmed, {
          limit: MAX_SUGGESTIONS,
          lang,
        }), {
          headers: { "x-custom-lang": lang },
          signal: controller.signal,
        });
        setResults(res.ok ? helpCenterResults(await res.json()) : []);
      } catch {
        if (controller.signal.aborted) return;
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
          setHasSearched(true);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, lang]);

  // Clicking anywhere else closes the popup without losing what was typed.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const goToArticle = useCallback(
    (article: HelpCenterArticle) => {
      setOpen(false);
      router.push(
        `${localizedHref(lang, "help-center")}/${helpCenterArticleSlug(article)}`,
      );
    },
    [lang, router],
  );

  const submitQuery = useCallback(() => {
    if (!trimmed) return;
    setOpen(false);
    router.push(searchPageHref);
  }, [router, searchPageHref, trimmed]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!open || results.length === 0) return;
      event.preventDefault();
      setActiveIndex((current) =>
        moveActiveIndex(current, event.key === "ArrowDown" ? 1 : -1, results.length),
      );
      return;
    }
    if (event.key === "Enter") {
      // Enter on a highlighted row opens that article; otherwise it runs the
      // full search, which is what the box did before the popup existed.
      const active = activeIndex >= 0 ? results[activeIndex] : undefined;
      if (active) {
        event.preventDefault();
        goToArticle(active);
      }
    }
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    setOpen(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const showPopup = open && trimmed.length > 0;
  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <form
        role="search"
        className={isHero ? "flex items-center gap-2" : "relative"}
        onSubmit={(e) => {
          e.preventDefault();
          submitQuery();
        }}
      >
        <div className={isHero ? "relative flex-1" : "relative"}>
          <Search
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${
              isHero ? "left-4 w-5 h-5" : "left-3 w-4 h-4"
            }`}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showPopup}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              showPopup && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            data-testid="help-center-search-input"
            placeholder={
              isVi ? "Nhập chủ đề, câu hỏi hoặc vấn đề" : "Type a topic, question or issue here"
            }
            aria-label={isVi ? "Tìm kiếm bài viết trợ giúp" : "Search help articles"}
            className={
              isHero
                ? "w-full pl-12 pr-10 py-3 rounded-full text-sm sm:text-base border-0 border-black focus:border-[0.5px] focus:py-[11.5px] shadow-lg focus:outline-none"
                : "w-full pl-10 pr-10 py-2.5 rounded-full text-base sm:text-sm border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              data-testid="help-center-search-clear"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
              aria-label={isVi ? "Xóa tìm kiếm" : "Clear search"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isHero && (
          <button
            type="submit"
            disabled={!trimmed}
            className="inline-flex items-center justify-center gap-2 px-3 py-3 rounded-full bg-black text-white text-base sm:text-sm font-semibold shadow-lg hover:bg-gray-600 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            aria-label={isVi ? "Tìm kiếm" : "Search"}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{isVi ? "Tìm kiếm" : "Search"}</span>
          </button>
        )}
      </form>

      {showPopup && (
        <div
          data-testid="help-center-search-popup"
          className={`absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50 ${
            isHero ? "right-0 sm:right-[7.5rem]" : "right-0"
          }`}
        >
          {isSearching && results.length === 0 ? (
            <p
              data-testid="help-center-search-loading"
              className="p-3 m-0 text-center text-gray-500 text-base sm:text-sm"
            >
              {isVi ? "Đang tìm kiếm..." : "Searching..."}
            </p>
          ) : results.length > 0 ? (
            <>
              <ul id={listboxId} role="listbox" className="list-none p-0 m-0">
                {results.map((article, index) => (
                  <li key={article.id} role="presentation">
                    <Link
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={index === activeIndex}
                      data-testid={`help-center-search-result-${index}`}
                      href={`${localizedHref(lang, "help-center")}/${helpCenterArticleSlug(article)}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`block px-4 py-2.5 text-gray-900 no-underline transition-colors border-b border-gray-100 last:border-b-0 ${
                        index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="block text-base sm:text-sm font-medium">
                        {article.title}
                      </span>
                      <span className="block text-sm text-gray-500 mt-0.5">
                        {getCategoryLabel(article.category, lang)} ›{" "}
                        {getParentLabel(article.parent, lang)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={searchPageHref}
                onClick={() => setOpen(false)}
                data-testid="help-center-search-see-all"
                className="block px-4 py-2.5 text-center text-sm font-medium text-gray-700 no-underline bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {isVi ? "Xem tất cả kết quả" : "See all results"}
              </Link>
            </>
          ) : hasSearched ? (
            <div className="p-3 text-center text-base sm:text-sm">
              <p className="m-0 text-gray-500" data-testid="help-center-search-empty">
                {isVi ? "Không tìm thấy kết quả" : "No results found"}
              </p>
              {/* A dead end helps nobody: offer the support form instead. */}
              <Link
                href={localizedHref(lang, "help-center/support")}
                onClick={() => setOpen(false)}
                className="mt-1 inline-block text-gray-700 hover:text-gray-900 underline"
              >
                {isVi ? "Liên hệ hỗ trợ" : "Contact support"}
              </Link>
            </div>
          ) : (
            <p
              data-testid="help-center-search-loading"
              className="p-3 m-0 text-center text-gray-500 text-base sm:text-sm"
            >
              {isVi ? "Đang tìm kiếm..." : "Searching..."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
