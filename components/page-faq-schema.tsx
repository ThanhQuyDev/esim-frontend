import { headers } from 'next/headers';
import {
  getDestinationBySlug,
  getFaqs,
  getRegionBySlug
} from '@/lib/api';
import { buildFaqSchema } from '@/lib/faq-schema';
import { faqCandidateUrls } from '@/lib/faq-urls';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/i18n-config';

/**
 * FAQPage JSON-LD for any page that has FAQ content (#054).
 *
 * Rendered in the layout head, so the schema sits in <head> like the other
 * blocks (#052) and is server-rendered for crawlers. The FAQs come from the same
 * `/faqs/by-context` records the visible FAQ block renders — including the same
 * priority order and the same `${name}` substitution — because Google requires
 * the marked-up questions to be the ones on the page.
 *
 * Pages with no FAQ record produce nothing at all.
 */
export async function PageFaqSchema({ locale }: { locale: string }) {
  const pathname = (await headers()).get('x-pathname');
  if (!pathname) return null;

  const path = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

  // Test harnesses have no business in search results.
  if (path.includes('/test')) return null;

  const localePrefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const withoutPrefix =
    localePrefix && path.startsWith(localePrefix)
      ? path.slice(localePrefix.length) || '/'
      : path;
  const segments = withoutPrefix.split('/').filter(Boolean);

  // A bare slug may be a country or a region, which also has blanket FAQs and a
  // name to substitute into templated questions.
  let entityType: 'destination' | 'region' | null = null;
  let name: string | null = null;
  let entitySlugs: (string | null | undefined)[] = [];

  if (segments.length === 1) {
    const destination = await getDestinationBySlug(segments[0], locale);
    if (destination) {
      entityType = 'destination';
      name =
        (locale === 'vi' ? destination.titleVi : destination.title) ||
        destination.name;
      entitySlugs = [destination.slugVi, destination.slug];
    } else {
      const region = await getRegionBySlug(segments[0], locale);
      if (region) {
        entityType = 'region';
        name = (locale === 'vi' ? region.titleVi : region.title) || region.name;
        entitySlugs = [region.slugVi, region.slug];
      }
    }
  }

  const urls = faqCandidateUrls({
    pathname: path,
    locale: locale as Locale,
    entityType,
    entitySlugs
  });

  const faqs = await getFaqs({ lang: locale, urls }).catch(() => ({
    data: [],
    hasNextPage: false
  }));

  const jsonLd = buildFaqSchema(faqs.data, name ? { name } : undefined, {
    url: path,
    lang: locale
  });
  if (!jsonLd) return null;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
