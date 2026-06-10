"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, X } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

async function fetchCategories(lang: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/blogs/categories`, {
    headers: { "x-custom-lang": lang },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchParentsByCategory(lang: string): Promise<Record<string, string[]>> {
  const res = await fetch(`${API_BASE_URL}/api/v1/blogs/parents`, {
    headers: { "x-custom-lang": lang },
  });
  if (!res.ok) return {};
  return res.json();
}

function categorySlug(cat: string): string {
  return cat
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function BlogSearchInput({ lang, mobile }: { lang: string; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/${lang}/blog/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  }

  // Mobile: dropdown panel below the navbar
  if (mobile) {
    return (
      <div className="relative">
        <button
          data-testid="toggle-blog-search"
          aria-label="Toggle on/off blog search"
          aria-haspopup="true"
          aria-controls="blog-search"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex justify-center items-center rounded-full transition-colors hover:bg-neutral-1000/[.08] w-9 h-9"
        >
          {open ? <X size={20} /> : <Search size={20} />}
        </button>
        {open && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setOpen(false)}
            />
            {/* Search dropdown panel */}
            <form
              id="blog-search"
              role="search"
              onSubmit={handleSearch}
              className="absolute mt-2 right-0 z-50 flex flex-col gap-3 w-[calc(100vw-32px)] md:w-[300px] dropdown-box bg-white rounded-sm shadow-lg border border-gray-200 p-3"
            >
              <input
                ref={inputRef}
                role="searchbox"
                data-testid="blog-search-input"
                type="text"
                name="blog-search"
                autoComplete="off"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={lang === "vi" ? "Tìm kiếm bài viết..." : "Search articles..."}
                className="outline-hidden appearance-none w-full leading-md py-[11px] px-4 text-primary placeholder-primary border-input border-md hover:border-focus active:border-focus focus-visible:outline-none transition-colors rounded-sm"
              />
              <button
                type="submit"
                data-testid="blog-search-submit"
                disabled={!keyword.trim()}
                className="max-md:w-full text-center border-md border-secondary bg-tertiary text-tertiary box-border touch-manipulation align-bottom rounded-full transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus py-[5.5px] body-sm-medium px-6 hover:opacity-80 cursor-pointer disabled:cursor-not-allowed"
              >
                {lang === "vi" ? "Tìm kiếm" : "Search"}
              </button>
            </form>
          </>
        )}
      </div>
    );
  }

  // Desktop: inline form to the right
  return (
    <div className="relative flex items-center">
      <button
        data-testid="toggle-blog-search"
        aria-label="Toggle on/off blog search"
        aria-haspopup="true"
        aria-controls="blog-search"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex justify-center items-center rounded-full transition-colors hover:bg-neutral-1000/[.08] w-9 h-9"
      >
        <Search size={20} />
      </button>
      {open && (
        <form
          id="blog-search"
          onSubmit={handleSearch}
          className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10"
        >
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={lang === "vi" ? "Tìm kiếm bài viết..." : "Search articles..."}
            className="w-48 sm:w-64 px-3 py-1.5 border border-gray-300 rounded-l-md text-sm focus:outline-none bg-white"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-brand-black text-white text-sm font-medium rounded-r-md hover:opacity-80 transition-opacity"
          >
            {lang === "vi" ? "Tìm" : "Go"}
          </button>
        </form>
      )}
    </div>
  );
}

function MobileCategoryNav({
  categories,
  parents,
  lang,
}: {
  categories: string[];
  parents: Record<string, string[]>;
  lang: string;
}) {
  const [open, setOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className="sm:hidden px-2 lg:px-11 bg-gray-50">
      <div className="relative inline-block w-full">
        <div className={`flex justify-between items-center ${open ? 'border-b border-gray-400':''}`}>
          <button
            className="py-3 px-2 cursor-pointer"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center gap-2">
              {open ? (
                <X size={24} className="text-dark" />
              ) : (
                <div className="space-y-1">
                  <div className="w-6 h-[3px] bg-dark" />
                  <div className="w-6 h-[3px] bg-dark" />
                  <div className="w-6 h-[3px] bg-dark" />
                </div>
              )}
              <p className="body-md-medium scroll-mt-20 xl:scroll-mt-24">
                {open
                  ? (lang === "vi" ? "Ẩn danh mục" : "Hide All Categories")
                  : (lang === "vi" ? "Xem danh mục" : "Show All Categories")}
              </p>
            </div>
          </button>
          <div className="px-2">
            <BlogSearchInput lang={lang} mobile />
          </div>
        </div>
        <div
          className={`bg-gray-200 sm:bg-primary relative top-0 transition-all ease-in p-4 w-full border-t-md border-secondary overflow-hidden ${open ? "" : "hidden"}`}
        >
          <ul className="flex flex-col gap-4">
            {categories.map((cat) => {
              const catParents = parents[cat] ?? [];
              const isExpanded = expandedCat === cat;

              return (
                <li key={cat}>
                  <div className="flex items-center ">
                    <Link
                      className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary body-sm-medium"
                      href={`/${lang}/blog/${categorySlug(cat)}/`}
                    >
                      {cat}
                    </Link>
                    {catParents.length > 0 && (
                      <button
                        className="flex justify-end flex-1 pl-3"
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedCat(isExpanded ? null : cat)}
                      >
                        <ChevronDown
                          size={20}
                          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  {catParents.length > 0 && isExpanded && (
                    <ul className="mt-2 ml-4 flex flex-col gap-2">
                      {catParents.map((parent) => (
                        <li key={parent}>
                          <Link
                            className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary hover:text-primary body-sm"
                            href={`/${lang}/blog/${categorySlug(cat)}/${categorySlug(parent)}/`}
                          >
                            {parent}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DesktopCategoryNav({
  categories,
  parents,
  lang,
}: {
  categories: string[];
  parents: Record<string, string[]>;
  lang: string;
}) {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCat(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hidden sm:block mx-auto bg-neutral-100">
      <ul ref={navRef} className="md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1168px] flex container items-center gap-6 py-[14px] max-w-[1168px] mx-auto">
        {categories.map((cat) => {
          const catParents = parents[cat] ?? [];
          const isOpen = openCat === cat;

          return (
            <li key={cat} className="relative flex items-center" aria-haspopup="true">
              <Link
                className="text-sm hover:underline font-medium align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary "
                href={`/${lang}/blog/${categorySlug(cat)}/`}
              >
                {cat}
              </Link>
              {catParents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpenCat(isOpen ? null : cat)}
                  className="inline-flex items-center ml-1 p-1 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              )}
              {catParents.length > 0 && isOpen && (
                <ul className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-sm py-2 min-w-[180px] z-50">
                  {catParents.map((parent) => (
                    <li key={parent}>
                      <Link
                        className="block px-4 py-2 text-sm text-primary hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        href={`/${lang}/blog/${categorySlug(cat)}/${categorySlug(parent)}/`}
                        onClick={() => setOpenCat(null)}
                      >
                        {parent}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        <li className="ml-auto">
          <BlogSearchInput lang={lang} />
        </li>
      </ul>
    </div>
  );
}

export function BlogCategoryNav({ lang }: { lang: string }) {
  const { data: categories } = useQuery({
    queryKey: ["blog-categories", lang],
    queryFn: () => fetchCategories(lang),
    staleTime: 10 * 60 * 1000,
  });

  const { data: parents } = useQuery({
    queryKey: ["blog-parents", lang],
    queryFn: () => fetchParentsByCategory(lang),
    staleTime: 10 * 60 * 1000,
  });

  const cats = categories ?? [];
  const parentMap = parents ?? {};

  return (
    <div className="bg-primary">
      <MobileCategoryNav categories={cats} parents={parentMap} lang={lang} />
      <DesktopCategoryNav categories={cats} parents={parentMap} lang={lang} />
    </div>
  );
}
