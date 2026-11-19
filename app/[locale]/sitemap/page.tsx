import Link from "next/link";
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { FooterSection } from "@/components/layout/sections/footer";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { LEGAL_POLICIES, getPolicyHref } from "@/components/layout/sections/legal";
import {
  fetchHelpCenterArticles,
  getBlogs,
  getDestinations,
  getLocalCarriers,
  getRegions,
  pickLocalizedTitle,
} from "@/lib/api";
import { entitySlug, localePrefix, STATIC_ROUTES } from "@/lib/sitemap-entries";
import { sellable } from "@/lib/sellable";
import type { Locale } from "@/lib/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

/**
 * "Sơ đồ trang web" / "Sitemap" for people (vande-2011 #015), linked at the
 * bottom of the footer. The same pages as /sitemap.xml, read from the same
 * sources, so a new destination, region, article or help page shows here as
 * soon as it is published (within the hour).
 */
export const revalidate = 3600;

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  return {
    title: locale === "en" ? "Sitemap | esim.vn" : "Sơ đồ trang web | esim.vn",
    alternates: {
      canonical: locale === "en" ? "/en/sitemap" : "/sitemap",
      languages: { vi: "/sitemap", en: "/en/sitemap" },
    },
  };
}

const STATIC_LABELS: Record<string, { vi: string; en: string }> = {
  "/": { vi: "Trang chủ", en: "Home" },
  "/destinations": { vi: "Tất cả điểm đến", en: "All destinations" },
  "/review": { vi: "Đánh giá", en: "Reviews" },
  "/data-calculator": { vi: "Công cụ tính data", en: "Data calculator" },
  "/check-esim": { vi: "Tra cứu eSIM", en: "Check your eSIM" },
  "/what-is-esim": { vi: "eSIM là gì?", en: "What is an eSIM?" },
  "/install-guide": { vi: "Hướng dẫn cài đặt eSIM", en: "eSIM install guide" },
  "/coupon": { vi: "Mã giảm giá eSIM", en: "eSIM coupons" },
  "/blog": { vi: "Blog", en: "Blog" },
  "/about-us": { vi: "Về chúng tôi", en: "About us" },
  "/press-area": { vi: "Khu vực báo chí", en: "Press area" },
  "/help-center": { vi: "Trung tâm trợ giúp", en: "Help center" },
  "/esim-supported-devices": { vi: "Thiết bị hỗ trợ eSIM", en: "eSIM supported devices" },
  "/kyc-guide": { vi: "Hướng dẫn xác thực (KYC)", en: "KYC guide" },
  "/refer-a-friend": { vi: "Giới thiệu bạn bè", en: "Refer a friend" },
  "/affiliate": { vi: "Đối tác tiếp thị", en: "Affiliate partners" },
  "/distribution-partners": { vi: "Đối tác phân phối", en: "Distribution partners" },
  "/api-partners": { vi: "Đối tác API", en: "API partners" },
  "/affiliate/register": { vi: "Đăng ký đối tác", en: "Become a partner" },
  "/terms-of-service": { vi: "Điều khoản dịch vụ", en: "Terms of service" },
};

async function safely<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

type LinkItem = { href: string; label: string };

function hrefFor(locale: Locale, key: string, params?: Record<string, string>): string | null {
  try {
    return getPathname({
      locale,
      href: (params ? { pathname: key, params } : key) as never,
    });
  } catch {
    return null;
  }
}

export default async function SitemapPage() {
  const locale = (await getLocale()) as Locale;
  const lang = locale === "en" ? "en" : "vi";
  const dict = await getDictionary(locale);
  const [destinations, regions, blogs, helpArticles, carriers] = await Promise.all([
    safely(() => getDestinations({ limit: 1000, lang }).then((r) => r.data), []),
    safely(() => getRegions({ limit: 1000, lang }).then((r) => r.data), []),
    safely(() => getBlogs({ limit: 500, lang }).then((r) => r.data), []),
    safely(() => fetchHelpCenterArticles().then((r) => r.data), []),
    safely(() => getLocalCarriers(), []),
  ]);

  const byName = (a: LinkItem, b: LinkItem) => a.label.localeCompare(b.label, lang);

  const staticLinks: LinkItem[] = [
    ...STATIC_ROUTES.map((route) => ({
      href: hrefFor(locale, route) ?? "",
      label: STATIC_LABELS[route]?.[lang] ?? route,
    })),
    ...LEGAL_POLICIES.map((policy) => ({
      href: getPolicyHref(policy, lang),
      label: policy.navLabel[lang],
    })),
  ].filter((l) => l.href);

  const countries: LinkItem[] = (destinations ?? [])
    .filter((d) => sellable(d))
    .map((d) => {
      const slug = entitySlug(d, lang);
      return slug
        ? { href: `${localePrefix(lang)}/${slug}`, label: pickLocalizedTitle(d, lang) || d.name }
        : null;
    })
    .filter((l): l is LinkItem => !!l)
    .sort(byName);

  const regionLinks: LinkItem[] = (regions ?? [])
    .filter((r) => sellable(r) && !r.parentId)
    .map((r) => {
      const slug = entitySlug(r, lang);
      return slug
        ? { href: `${localePrefix(lang)}/${slug}`, label: pickLocalizedTitle(r, lang) || r.name }
        : null;
    })
    .filter((l): l is LinkItem => !!l)
    .sort(byName);

  const domestic: LinkItem[] = (carriers ?? [])
    .filter((c) => c?.provider)
    .map((c) => ({
      href: hrefFor(locale, "/[slug]", { slug: `esim-${c.provider}` }) ?? "",
      label:
        (c.destination ? pickLocalizedTitle(c.destination, lang) || c.destination.name : "") ||
        `eSIM ${c.provider.charAt(0).toUpperCase()}${c.provider.slice(1)}`,
    }))
    .filter((l) => l.href);

  const blogLinks: LinkItem[] = (blogs ?? [])
    .filter((b) => b?.isPublished !== false && b?.slug)
    .map((b) => ({ href: hrefFor(locale, "/blog/[slug]", { slug: b.slug }) ?? "", label: b.title }))
    .filter((l) => l.href && l.label);

  const helpLinks: LinkItem[] = (helpArticles ?? [])
    .filter((a) => a?.slug)
    .map((a) => ({
      href: hrefFor(locale, "/help-center/[slug]", { slug: a.slug }) ?? "",
      label: a.title,
    }))
    .filter((l) => l.href && l.label);

  const t = (vi: string, en: string) => (lang === "en" ? en : vi);
  const sections: { id: string; title: string; links: LinkItem[] }[] = [
    { id: "pages", title: t("Trang chính", "Main pages"), links: staticLinks },
    { id: "countries", title: t("eSIM theo quốc gia", "eSIM by country"), links: countries },
    { id: "regions", title: t("eSIM theo khu vực", "eSIM by region"), links: regionLinks },
    { id: "domestic", title: t("eSIM nội địa", "Domestic eSIM"), links: domestic },
    { id: "blog", title: "Blog", links: blogLinks },
    { id: "help", title: t("Trung tâm trợ giúp", "Help center"), links: helpLinks },
  ].filter((s) => s.links.length > 0);

  return (
    <main role="main">
      <Breadcrumb items={[{ label: t("Sơ đồ trang web", "Sitemap") }]} lang={locale} />
      <section className="container mx-auto max-w-6xl px-4 py-10" data-testid="html-sitemap">
        <h1 className="text-3xl font-semibold text-text-primary">
          {t("Sơ đồ trang web", "Sitemap")}
        </h1>
        <p className="mt-2 text-text-secondary">
          {t(
            "Tất cả các trang trên esim.vn, xếp theo nhóm.",
            "Every page on esim.vn, by section."
          )}
        </p>
        {sections.map((section) => (
          <div key={section.id} className="mt-10" data-testid={`sitemap-${section.id}`}>
            <h2 className="text-xl font-semibold text-text-primary">
              {section.title}{" "}
              <span className="text-sm font-normal text-text-tertiary">({section.links.length})</span>
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-text-secondary hover:text-text-primary hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <FooterSection dict={dict.footer} lang={locale} />
    </main>
  );
}
