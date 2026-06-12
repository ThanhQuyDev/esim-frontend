"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { routing } from "@/i18n/routing";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  lang: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Breadcrumb navigation component with JSON-LD structured data for SEO.
 * Follows shadcn/ui design patterns with Tailwind CSS.
 */
export function Breadcrumb({ items, lang, className = "", children }: BreadcrumbProps) {
  const pathname = usePathname();

  // Default locale (vi) has no prefix under localePrefix: 'as-needed'.
  // Strip a leading `/${defaultLocale}` segment from any href so the default
  // locale never shows `/vi` in breadcrumb links (pages still pass `/${locale}/...`).
  const normalizeHref = (href?: string): string | undefined => {
    if (!href) return href;
    if (lang !== routing.defaultLocale) return href;
    const prefix = `/${routing.defaultLocale}`;
    if (href === prefix) return "/";
    if (href.startsWith(`${prefix}/`)) return href.slice(prefix.length);
    return href;
  };

  const homeHref = lang === routing.defaultLocale ? "/" : `/${lang}`;

  // Build full breadcrumb list with Home as first item
  const allItems: BreadcrumbItem[] = [
    { label: lang === "vi" ? "Trang chủ" : "Home", href: homeHref },
    ...items.map((item) => ({ ...item, href: normalizeHref(item.href) })),
  ];

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href
        ? `https://esim.vn${item.href}`
        : `https://esim.vn${pathname}`,
    })),
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className={`w-full py-3 ${className}`}
      >
        <div className="md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1168px] px-4 sm:px-0 mx-auto flex items-center justify-between">
        <ol className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0" />
                )}
                {isLast ? (
                  <span
                    className="text-foreground font-medium truncate max-w-[200px] md:max-w-none"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href || homeHref}
                    className="hover:text-primary transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    {isFirst && <Home className="h-3.5 w-3.5" />}
                    <span className={isFirst ? "hidden sm:inline" : "inline"}>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
        {children && <div className="flex items-center shrink-0">{children}</div>}
        </div>
      </nav>
    </>
  );
}
