"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home, MapPin, LifeBuoy, Newspaper } from "lucide-react";
import { localizedHref } from "@/lib/route-mapping";

interface NotFoundContentProps {
  lang: string;
  dict: {
    code?: string;
    title?: string;
    description?: string;
    searchLabel?: string;
    searchPlaceholder?: string;
    searchCta?: string;
    backHome?: string;
    linksTitle?: string;
    destinations?: string;
    helpCenter?: string;
    blog?: string;
    support?: string;
  };
}

/**
 * The 404 page (#093).
 *
 * There was no `not-found` boundary at all, so a wrong URL fell through to
 * Next's built-in page: a bare white screen with one line of small text, no
 * header and no footer — which reads as "the site is broken / still loading"
 * rather than "that address does not exist".
 *
 * The page now says what happened and offers the two things a lost visitor
 * actually wants: a destination search, and links to the places they were
 * probably heading.
 */
export function NotFoundContent({ lang, dict }: NotFoundContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    // The destinations page owns country search; sending the term there beats
    // guessing a slug that may not exist and 404-ing a second time.
    router.push(`${localizedHref(lang, "destinations")}?q=${encodeURIComponent(term)}`);
  }

  const links = [
    {
      href: localizedHref(lang, "destinations"),
      label: dict.destinations,
      icon: MapPin,
    },
    {
      href: localizedHref(lang, "help-center"),
      label: dict.helpCenter,
      icon: LifeBuoy,
    },
    { href: localizedHref(lang, "blog"), label: dict.blog, icon: Newspaper },
    {
      href: localizedHref(lang, "help-center/support"),
      label: dict.support,
      icon: LifeBuoy,
    },
  ].filter((link) => !!link.label);

  return (
    <main role="main" className="min-h-[60vh]">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:py-24">
        <p className="text-6xl font-semibold tracking-tight text-text-tertiary sm:text-7xl">
          {dict.code ?? "404"}
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-text-primary sm:text-3xl">
          {dict.title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-secondary">
          {dict.description}
        </p>

        <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-md" role="search">
          <label htmlFor="not-found-search" className="sr-only">
            {dict.searchLabel}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="not-found-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={dict.searchPlaceholder}
                data-testid="not-found-search"
                className="w-full rounded-full border border-gray-200 bg-white py-3 pl-12 pr-4 text-base shadow-sm outline-none transition-colors focus:border-black"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {dict.searchCta}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <Link
            href={localizedHref(lang, "/")}
            data-testid="not-found-home"
            className="inline-flex items-center gap-2 text-base font-medium text-text-primary underline underline-offset-4"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {dict.backHome}
          </Link>
        </div>

        {links.length > 0 && (
          <div className="mt-12">
            <p className="text-sm font-medium text-text-tertiary">{dict.linksTitle}</p>
            <ul className="mt-4 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
              {links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left text-base text-text-primary no-underline transition-colors hover:border-gray-400"
                  >
                    <link.icon className="h-5 w-5 shrink-0 text-text-tertiary" aria-hidden="true" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
