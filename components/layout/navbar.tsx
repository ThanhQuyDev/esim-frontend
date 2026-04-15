"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SailyLogo } from "@/components/icons/saily-logo";
import { DestinationSearch } from "@/components/layout/destination-search";
import {
  ChevronDown,
  Search,
  Menu,
  X,
  Globe,
} from "lucide-react";
import type { Locale } from "@/lib/i18n-config";

interface NavbarProps {
  lang: Locale;
  dict: Record<string, any>;
}

const navItems = ["product", "resources", "offers", "help"] as const;

export function Navbar({ lang, dict }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-bg-brand-yellow text-text-primary">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-center py-2 gap-2">
            <span className="body-sm-medium">{dict.announcement}</span>
            <Link
              href="#"
              className="body-sm-medium underline hover:no-underline"
            >
              {dict.announcementCta}
            </Link>
            <ChevronDown className="w-3 h-3 -rotate-90" />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-bg-primary border-b border-border-primary">
        <div className="p-4 lg:px-6 lg:py-5">
          <nav className="flex items-center justify-between max-w-[1600px] h-6 lg:h-8 mx-auto">
            {/* Logo */}
            <div className="pr-12">
              <Link href={`/${lang}`} className="block">
                <SailyLogo />
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="flex gap-4" data-testid="desktop-nav">
              <div className="hidden lg:flex gap-3">
                {navItems.map((item) => (
                  <button
                    key={item}
                    className="inline-flex items-center px-3 py-2 body-md-medium text-text-primary rounded-lg hover:bg-black/[0.06] transition-colors"
                  >
                    <span>{dict[item]}</span>
                    <ChevronDown className="w-3 h-3 ml-1 text-text-tertiary" />
                  </button>
                ))}
              </div>

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-full body-md text-text-tertiary hover:bg-border-primary transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>{dict.searchPlaceholder}</span>
              </button>

              {/* Desktop Right */}
              <div className="hidden lg:flex justify-end whitespace-nowrap">
                <div className="flex gap-4 items-center">
                  {/* Language Selector */}
                  <div className="relative inline-flex items-center px-3 py-2 font-medium text-text-primary rounded-lg hover:bg-black/[0.06] transition-colors">
                    <Globe className="w-4 h-4 mr-1" />
                    <span className="body-md-medium">
                      {lang === "en" ? "EN" : "VI"}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-1 text-text-tertiary" />
                    <select
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      value={lang}
                      onChange={(e) => {
                        window.location.href = `/${e.target.value}`;
                      }}
                    >
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>

                  {/* Login */}
                  <Link
                    href="#"
                    className="body-md-medium text-text-primary hover:text-text-secondary transition-colors"
                  >
                    {dict.login}
                  </Link>

                  {/* CTA Button */}
                  <Link
                    href="#"
                    className="inline-flex items-center px-5 py-2.5 bg-bg-accent text-text-primary-on-color body-md-medium rounded-full hover:bg-bg-accent-hover transition-colors"
                  >
                    {dict.getStarted}
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex ml-6 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-lg hover:bg-black/[0.06] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 top-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-bg-secondary overflow-y-auto">
              <div className="flex flex-col h-full justify-between">
                <div className="px-4">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between py-4">
                    <Link href={`/${lang}`}>
                      <SailyLogo />
                    </Link>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-lg hover:bg-black/[0.06]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Mobile Search */}
                  <div className="relative mb-4">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        setSearchOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-bg-primary rounded-lg border border-border-primary body-md text-text-tertiary"
                    >
                      <Search className="w-4 h-4" />
                      <span>{dict.searchPlaceholder}</span>
                    </button>
                  </div>

                  {/* Mobile Nav Items */}
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <button
                        key={item}
                        className="flex items-center justify-between w-full px-4 py-3 body-md-medium text-text-primary rounded-lg hover:bg-bg-primary transition-colors"
                      >
                        <span>{dict[item]}</span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                      </button>
                    ))}
                  </div>

                  {/* Mobile Language */}
                  <div className="relative mt-4 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="body-md-medium">
                        {lang === "en" ? "English" : "Tiếng Việt"}
                      </span>
                    </div>
                    <select
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      value={lang}
                      onChange={(e) => {
                        window.location.href = `/${e.target.value}`;
                      }}
                    >
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Bottom CTAs */}
                <div className="p-4 space-y-3 border-t border-border-primary">
                  <Link
                    href="#"
                    className="block w-full text-center px-5 py-3 bg-bg-accent text-text-primary-on-color body-md-medium rounded-full hover:bg-bg-accent-hover transition-colors"
                  >
                    {dict.downloadApp}
                  </Link>
                  <Link
                    href="#"
                    className="block w-full text-center px-5 py-3 border border-border-focus text-text-primary body-md-medium rounded-full hover:bg-bg-primary transition-colors"
                  >
                    {dict.getStarted}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Destination Search Modal */}
      <DestinationSearch
        lang={lang}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder={dict.searchPlaceholder}
      />
    </>
  );
}
