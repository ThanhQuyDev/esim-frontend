import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Navbar } from "@/components/layout/navbar";
import { LayoutClientWidgets } from "@/components/layout/layout-client-widgets";
import { PageStructuredData } from "@/components/page-structured-data";
import { PageBreadcrumbSchema } from "@/components/page-breadcrumb-schema";
import { PageFaqSchema } from "@/components/page-faq-schema";
import { SiteScripts } from "@/components/site-scripts";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";
import { getMenuSlides, getTopBars } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import { buildLanguageAlternates, SITE_BASE_URL } from "@/lib/hreflang";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = await getDictionary(locale as Locale);

  const pathname = (await headers()).get("x-pathname") ?? "/";
  const { canonical, languages } = buildLanguageAlternates(pathname);

  return {
    metadataBase: new URL(SITE_BASE_URL),
    title: dict.metadata.title,
    description: dict.metadata.description,
    alternates: {
      canonical,
      languages,
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale() as Locale;

  // Nếu locale không hợp lệ → 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const [messages, dict, topBars, menuSlides] = await Promise.all([
    getMessages(),
    getDictionary(locale),
    getTopBars({ lang: locale }),
    // The mega-menu "Explore" carousels, managed from the CMS (#073). Fetched
    // alongside the rest so the menu costs no extra round trip.
    getMenuSlides({ lang: locale }),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Open the connections the first paint depends on (#092): the font
            CSS lives on one Google origin and the font files on another, and
            the hero image — the LCP element — comes from Cloudinary. Without
            these the browser only discovers each origin after parsing what
            came before it. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;600;700&family=Google+Sans+Text:wght@400;500;600;700&display=swap"
          crossOrigin="anonymous"
        />
        <PageBreadcrumbSchema locale={locale} />
        <PageFaqSchema locale={locale} />
        <PageStructuredData locale={locale} />
        {/* Site-wide analytics and tag snippets, on every page (#075). Last in
            the head so a page's own schema is not pushed below them. */}
        <SiteScripts placement='head' />
      </head>
      <body
        className={cn(
          "min-h-screen bg-white antialiased overflow-x-hidden font-google-sans"
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <Navbar
                lang={locale}
                dict={dict.nav}
                topBars={topBars}
                menuSlides={menuSlides}
              />
              {children}
              <LayoutClientWidgets lang={locale} />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
        {/* Snippets the admin marked "end of body" — anything that must not hold
            up the first paint (#075). */}
        <SiteScripts placement='bodyEnd' />
      </body>
    </html>
  );
}
