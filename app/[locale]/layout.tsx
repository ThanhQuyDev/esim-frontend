import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Navbar } from "@/components/layout/navbar";
import { LayoutClientWidgets } from "@/components/layout/layout-client-widgets";
import { PageStructuredData } from "@/components/page-structured-data";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/lib/auth";
import { getTopBars } from "@/lib/api";
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

  const [messages, dict, topBars] = await Promise.all([
    getMessages(),
    getDictionary(locale),
    getTopBars({ lang: locale }),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@300;400;500;600;700&family=Google+Sans+Text:wght@400;500;600;700&display=swap"
          crossOrigin="anonymous"
        />
        <PageStructuredData locale={locale} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-white antialiased overflow-x-hidden font-google-sans"
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <Navbar lang={locale} dict={dict.nav} topBars={topBars} />
              {children}
              <LayoutClientWidgets lang={locale} />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
