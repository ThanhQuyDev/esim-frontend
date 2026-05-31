"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Search, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SailyLogo } from "@/components/icons/saily-logo";
import { localizedHref, routeMap } from "@/lib/route-mapping";
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
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [hasScrolled, setHasScrolled] = useState(false);

    const isVi = lang === "vi";
    const helpCenterHome = localizedHref(lang, "help-center");

    // The landing `/help-center` page already has its own hero search,
    // so the inline navbar search is only shown on inner pages (categories, detail, etc.).
    const isHelpCenterHome =
        pathname === helpCenterHome ||
        pathname === `${helpCenterHome}/` ||
        pathname === `/${lang}/help-center` ||
        pathname === `/${lang}/help-center/`;
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
    }, [pathname]);

    // Track scroll for navbar background transition
    useEffect(() => {
        const handleScroll = () => setHasScrolled(window.scrollY > 8);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLangChange = useCallback(
        (value: string) => {
            const segments = pathname.split("/");
            const currentLocale = segments[1];
            const currentSlug = segments[2];
            segments[1] = value;
            if (currentSlug) {
                for (const entry of routeMap) {
                    if (entry.slugs[currentLocale] === currentSlug) {
                        segments[2] = entry.slugs[value] || currentSlug;
                        break;
                    }
                }
            }
            window.location.href = segments.join("/");
        },
        [pathname]
    );

    const handleSearchSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const trimmed = query.trim();
            if (!trimmed) return;
            router.push(`${helpCenterHome}/search?q=${encodeURIComponent(trimmed)}`);
        },
        [query, router, helpCenterHome]
    );

    const navLinks = [
        {
            label: isVi ? "Điểm đến" : "Destinations",
            href: localizedHref(lang, "all-destinations"),
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
                "sticky top-0 z-40 w-full transition-all duration-300",
                hasScrolled
                    ? "bg-gray-100 shadow-sm"
                    : "bg-transparent"
            )}
            role="banner"
        >
            <nav
                className="container mx-auto flex items-center justify-between px-4 lg:px-6 h-16"
                aria-label="Help Center navigation"
            >
                {/* LEFT: Brand logo (goes to site home) + Help Center context label */}
                <div className="flex items-center min-w-0 gap-3">
                    <Link
                        href={`/${lang}`}
                        className="flex items-center shrink-0"
                        aria-label={isVi ? "Về trang chủ esim.vn" : "Back to esim.vn home"}
                    >
                        <SailyLogo className="w-[57px] lg:w-[120px]" />
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
                    className={cn("ml-2 inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors xl:hidden", hasScrolled ? "text-gray-700 hover:bg-gray-200" : "text-white hover:bg-white/10")}
                    aria-expanded={isOpen}
                    aria-controls="help-center-menu"
                >
                    {isOpen ? (
                        <X className="w-5 h-5" aria-hidden="true" />
                    ) : (
                        <Menu className="w-5 h-5" aria-hidden="true" />
                    )}
                    <span className="sr-only">
                        {isVi ? "Mở menu điều hướng" : "Toggle navigation menu"}
                    </span>
                </button>

                {/* MENU: Desktop inline / Mobile collapsible */}
                <div
                    id="help-center-menu"
                    className={cn(
                        // Desktop layout: aligned right, inline
                        "xl:flex xl:items-center xl:flex-1 xl:justify-end xl:gap-4",
                        // Mobile layout: drawer below header
                        hasScrolled
                            ? "max-xl:absolute max-xl:left-0 max-xl:right-0 max-xl:top-full max-xl:bg-gray-100 max-xl:border-b max-xl:border-gray-200 max-xl:shadow-md max-xl:p-4 max-xl:flex-col max-xl:items-stretch max-xl:gap-3 max-xl:transition-opacity max-xl:duration-150"
                            : "max-xl:absolute max-xl:left-0 max-xl:right-0 max-xl:top-full max-xl:bg-[rgba(0,0,0,0.6)] max-xl:backdrop-blur-[98px] max-xl:[-webkit-backdrop-filter:blur(98px)] max-xl:border-b max-xl:border-white/10 max-xl:shadow-md max-xl:p-4 max-xl:flex-col max-xl:items-stretch max-xl:gap-3 max-xl:transition-opacity max-xl:duration-150",
                        isOpen ? "max-xl:flex max-xl:opacity-100" : "max-xl:hidden"
                    )}
                >
                    {/* SEARCH BAR — hidden on the help-center landing page (its hero already has a search) */}
                    {showSearch && (
                        <form
                            role="search"
                            onSubmit={handleSearchSubmit}
                            action={`${helpCenterHome}/search`}
                            className="flex items-center w-full xl:max-w-md xl:flex-1 xl:mx-4 relative"
                        >
                            <Search
                                className={cn("absolute left-3 w-4 h-4 pointer-events-none", hasScrolled ? "text-gray-400" : "text-white/60")}
                                aria-hidden="true"
                            />
                            <input
                                type="search"
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
                                className={cn(
                                    "w-full pl-9 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-2",
                                    hasScrolled
                                        ? "text-gray-900 placeholder-gray-400 border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500"
                                        : "text-white placeholder-white/50 border-white/30 bg-white/10 focus:ring-white/40 focus:border-white/50"
                                )}
                            />
                        </form>
                    )}

                    {/* LINKS */}
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn("inline-flex items-center justify-center px-3 py-2 text-[0.94rem] font-medium whitespace-nowrap", "text-gray-900 hover:text-gray-900")}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* LOCALIZATION */}
                    <div className={cn("relative inline-flex items-center px-2 py-1 rounded-md border transition-colors","border-black bg-white/10 hover:border-white/50")}>
                        <Globe
                            className={cn("w-4 h-4 mr-1", "text-gray-600")}
                            aria-hidden="true"
                        />
                        <span className={cn("text-sm font-medium uppercase min-w-5", "text-gray-700" )}>
                            {lang}
                        </span>
                        <ChevronDown
                            className={cn("w-3 h-3 ml-1",  "text-gray-500" )}
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
            </nav>
        </header>
    );
}
