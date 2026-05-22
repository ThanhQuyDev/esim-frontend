"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.saily.example.com";

async function fetchCategories(lang: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/blogs/categories`, {
    headers: { "x-custom-lang": lang },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function categorySlug(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-");
}

function BlogSearchInput({ lang }: { lang: string }) {
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
      router.push(`/${lang}/blog?search=${encodeURIComponent(keyword.trim())}`);
    }
  }

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
          className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center z-10"
        >
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={lang === "vi" ? "Tìm kiếm bài viết..." : "Search articles..."}
            className="w-48 sm:w-64 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </form>
      )}
    </div>
  );
}

function MobileCategoryNav({ categories, lang }: { categories: string[]; lang: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden px-2 lg:px-11 bg-gray-200">
      <div className="relative inline-block w-full">
        <div className="flex justify-between items-center">
          <button
            className="py-3 px-2 cursor-pointer"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <div className="w-6 h-[3px] bg-dark" />
                <div className="w-6 h-[3px] bg-dark" />
                <div className="w-6 h-[3px] bg-dark" />
              </div>
              <p className="body-md-medium scroll-mt-20 xl:scroll-mt-24">Show All Categories</p>
            </div>
          </button>
          <div className="px-2">
            <BlogSearchInput lang={lang} />
          </div>
        </div>
        <div
          className={`bg-primary relative top-0 transition-all ease-in p-4 w-full border-t-md border-secondary overflow-hidden ${open ? "" : "hidden"}`}
        >
          <ul className="flex flex-col gap-4">
            {categories.map((cat) => (
              <li key={cat} aria-expanded="false">
                <div className="flex items-center">
                  <Link
                    className="align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary body-sm-medium"
                    href={`/${lang}/blog/category/${categorySlug(cat)}/`}
                  >
                    {cat}
                  </Link>
                  <button className="flex justify-end flex-1 pl-3" aria-haspopup="true" aria-controls="menu">
                    <ChevronDown size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DesktopCategoryNav({ categories, lang }: { categories: string[]; lang: string }) {
  return (
    <div className="hidden sm:block mx-auto lg:px-16 bg-gray-200">
      <ul className="flex container items-center gap-6 py-[14px] max-w-[1168px] mx-auto">
        {categories.map((cat) => (
          <li key={cat} className="relative" aria-expanded="false" aria-haspopup="true" aria-controls="menu">
            <Link
              className="text=[18px] font-semibold align-bottom transition-colors ease-out focus-visible:outline-hidden focus-visible:shadow-focus text-primary active:text-primary hover:text-secondary "
              href={`/${lang}/blog/category/${categorySlug(cat)}/`}
            >
              {cat}
            </Link>
            <ChevronDown size={12} className="inline ml-2" />
          </li>
        ))}
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

  const cats = categories ?? [];

  return (
    <div className="bg-primary">
      <MobileCategoryNav categories={cats} lang={lang} />
      <DesktopCategoryNav categories={cats} lang={lang} />
    </div>
  );
}
