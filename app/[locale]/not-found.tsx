import { getLocale } from "next-intl/server";
import { NotFoundContent } from "@/components/layout/sections/not-found-content";
import { FooterSection } from "@/components/layout/sections/footer";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n-config";
import type { Metadata } from "next";

/**
 * 404 inside the site chrome (#093).
 *
 * Every `notFound()` in the locale segment — an unknown country slug, a deleted
 * blog post, a mistyped URL — lands here, so the visitor keeps the navbar, the
 * footer and their language instead of dropping onto Next's bare white default.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return {
    title: `${dict.notFound.title} — esim.vn`,
    description: dict.notFound.description,
    // A 404 must never be indexed, whatever URL produced it.
    robots: { index: false, follow: true },
  };
}

export default async function LocaleNotFound() {
  const locale = (await getLocale()) as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <NotFoundContent lang={locale} dict={dict.notFound} />
      <FooterSection dict={dict.footer} lang={locale} />
    </>
  );
}
