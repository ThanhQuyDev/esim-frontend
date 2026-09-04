"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname as useIntlPathname } from "@/i18n/navigation";
import Link from "next/link";
import { Menu, X, Search, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SailyLogo } from "@/components/icons/saily-logo";
import { localizedHref } from "@/lib/route-mapping";
import type { Locale } from "@/lib/i18n-config";

interface HelpCenterNavbarProps {
    lang: Locale;
}

/**
 * Dedicated Help Center navbar.
 *
 * Mirrors the design intent of the Alpine.js + Tailwind spec while using the
 * project's React conventions:
 *  - Brand logo + "Help Center" context label separated by a vertical rule
 *  - Mobile hamburger that toggles the menu (replaces Alpine `x-show` / `x-transition`)
 *  - Inline search bar (submits to the help-center page with a `q` param)
 *  - "Submit a Ticket" + "Go to Website" links replacing commercial nav items
 *  - Language switcher integrated into the menu
 */
export function HelpCenterNavbar({ lang }: HelpCenterNavbarProps) {
    const router = useRouter();
    const intlPathname = useIntlPathname();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [hasScrolled, setHasScrolled] = useState(false);

    const isVi = lang === "vi";
    const helpCenterHome = localizedHref(lang, "help-center");
    const helpCenterSearch = localizedHref(lang, "help-center/search");
    const homeHref = localizedHref(lang, "/");

    // intlPathname (from @/i18n/navigation usePathname) returns the internal
    // route key, e.g. "/help-center" for both "/en/help-center" and "/ho-tro".
    // Sub-pages return "/help-center/[slug]", "/help-center/search", etc.
    // So we only hide the search bar when on the exact help-center root.
    const isHelpCenterHome = intlPathname === "/help-center";
    const showSearch = !isHelpCenterHome;

    // Close mobile menu on Escape (parity with `@keydown.escape="toggle"` in spec)
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [intlPathname]);

    // Track scroll for navbar background transition
    useEffect(() => {
        const handleScroll = () => setHasScrolled(window.scrollY > 8);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLangChange = useCallback(
        (newLocale: string) => {
            window.location.href = localizedHref(newLocale, "help-center");
        },
        []
    );

    const handleSearchSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const trimmed = query.trim();
            if (!trimmed) return;
            router.push(`${helpCenterSearch}?q=${encodeURIComponent(trimmed)}`);
        },
        [query, router, helpCenterSearch]
    );

    const navLinks = [
        {
            label: isVi ? "Điểm đến" : "Destinations",
            href: localizedHref(lang, "destinations"),
        },
        {
            label: isVi ? "eSIM là gì?" : "What is an eSIM",
            href: localizedHref(lang, "what-is-esim"),
        },
        {
            label: isVi ? "Về chúng tôi" : "About Us",
            href: localizedHref(lang, "about-us"),
        },
    ];

    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full transition-all duration-300 bg-white shadow-sm",
            )}
            role="banner"
        >
            <nav
                className="container mx-auto flex items-center justify-between px-4 sm:px-0 h-16"
                aria-label="Help Center navigation"
            >
                {/* LEFT: Brand logo (goes to site home) + Help Center context label */}
                <div className="flex items-center min-w-0 gap-3">
                    <Link
                        href={homeHref}
                        className="flex items-center shrink-0"
                        aria-label={isVi ? "Về trang chủ esim.vn" : "Back to esim.vn home"}
                    >
                        <SailyLogo className="w-[100px] lg:w-[140px]" />
                    </Link>
                    <span
                        className={cn("hidden sm:inline-block h-6 w-px", "bg-black")}
                        aria-hidden="true"
                    />
                    <Link
                        href={helpCenterHome}
                        className={cn("hidden sm:inline-block text-sm font-medium transition-colors", "text-gray-900")}
                    >
                        {isVi ? "Trung tâm trợ giúp" : "Help Center"}
                    </Link>
                </div>

                {/* MOBILE: Hamburger toggle */}
                <button
                    type="button"
                    onClick={() => setIsOpen((v) => !v)}
                    className="ml-2 inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors xl:hidden text-gray-700 sm:hover:bg-gray-200"
                    aria-expanded={isOpen}
                    aria-controls="help-center-menu"
                >
                    {isOpen ? (
                        <X className="w-6 h-6" aria-hidden="true" />
                    ) : (
                        <Menu className="w-6 h-6" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                        {isVi ? "Mở menu điều hướng" : "Toggle navigation menu"}
                    </span>
                </button>

                {/* MENU: Desktop inline / Mobile collapsible */}
                <div
                    id="help-center-menu"
                    className={cn(
                        // Desktop layout: compact, aligned right, inline (matches reference: nav menu menu-standard menu-links-right xl:flex xl:align-items-center xl:menu-expanded xl:justify-content-end)
                        "xl:flex xl:items-center xl:justify-end xl:gap-1",
                        // Mobile layout: drawer below header (always light background for readability)
                        "max-xl:absolute max-xl:left-0 max-xl:right-0 max-xl:top-full max-xl:bg-white max-xl:border-b max-xl:border-gray-200 max-xl:shadow-lg max-xl:flex-col max-xl:items-start max-xl:gap-0 max-xl:transition-opacity max-xl:duration-150",
                        isOpen ? "max-xl:flex max-xl:opacity-100" : "max-xl:hidden"
                    )}
                >
                    {/* SEARCH BAR — hidden on the help-center landing page (its hero already has a search) */}
                    {showSearch && (
                        <form
                            role="search"
                            onSubmit={handleSearchSubmit}
                            action={`${helpCenterHome}/search`}
                            className="flex items-center w-full xl:w-64 xl:mx-4 relative max-xl:px-4 max-xl:py-3 max-xl:border-b max-xl:border-gray-200"
                        >
                            <Search
                                className={cn("absolute left-7 sm:left-3  w-4 h-4 pointer-events-none", "text-gray-400")}
                                aria-hidden="true"
                            />
                            <input
                                type="text"
                                name="q"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={
                                    isVi
                                        ? "Nhập chủ đề, câu hỏi hoặc vấn đề"
                                        : "Type a topic, question or issue here"
                                }
                                aria-label={
                                    isVi
                                        ? "Nhập chủ đề, câu hỏi hoặc vấn đề"
                                        : "Type a topic, question or issue here"
                                }
                                className="w-full pl-9 pr-8 py-3 sm:py-1 text-base focus:border-gray-900 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700  transition-colors cursor-pointer"
                                    aria-label={isVi ? "Xóa tìm kiếm" : "Clear search"}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </form>
                    )}

                    {/* LINKS */}
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="w-full text-left px-4 py-3 xl:w-auto xl:px-3 xl:py-2 text-[0.94rem] xl:text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50 xl:hover:text-gray-700 xl:hover:bg-transparent border-b xl:border-b-0 border-gray-200 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* LOCALIZATION */}
                    <div className="w-full px-4 py-3 xl:w-auto xl:px-0 xl:py-0 border-b xl:border-b-0 border-gray-200">
                        <div className="relative inline-flex items-center px-2 py-1 rounded-md border border-gray-300 bg-white hover:border-gray-400 transition-colors">
                            <Globe
                                className="w-4 h-4 mr-1 text-gray-600"
                                aria-hidden="true"
                            />
                            <span className="text-sm font-medium uppercase min-w-5 text-gray-700">
                                {lang}
                            </span>
                            <ChevronDown
                                className="w-3 h-3 ml-1 text-gray-500"
                                aria-hidden="true"
                            />
                            <select
                                name="lang"
                                id="helpCenterLang"
                                value={lang}
                                onChange={(e) => handleLangChange(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                aria-label={isVi ? "Chọn ngôn ngữ" : "Select language"}
                            >
                                <option value="en">English</option>
                                <option value="vi">Tiếng Việt</option>
                            </select>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
