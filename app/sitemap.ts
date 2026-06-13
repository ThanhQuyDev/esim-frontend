import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';

const baseUrl = 'https://esim.vn';

// Danh sách tất cả routes (dùng tên folder EN làm key)
const routes = [
  '/',
  '/destinations',
  '/cart',
  '/checkout',
  '/review',
  '/data-calculator',
  '/what-is-esim',
  '/coupon',
  '/blog',
  '/about-us',
  '/press-area',
  '/help-center',
  '/esim-supported-devices',
  '/profile',
  '/kyc-guide',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => {
    const alternates: Record<string, string> = {};

    for (const locale of routing.locales) {
      const pathname = getPathname({ locale, href: route });
      const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
      alternates[locale] = `${baseUrl}${prefix}${pathname}`;
    }

    return {
      url: `${baseUrl}${getPathname({ locale: 'vi', href: route })}`,
      alternates: { languages: alternates },
    };
  });
}
