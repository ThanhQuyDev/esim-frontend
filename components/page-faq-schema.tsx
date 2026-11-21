import { cache } from 'react';
import { headers } from 'next/headers';
import {
  getDestinationBySlug,
  getFaqs,
  getRegionBySlug
} from '@/lib/api';
import { buildFaqSchema } from '@/lib/faq-schema';
import { faqCandidateUrls } from '@/lib/faq-urls';
import { resolveDomesticCarrier } from '@/lib/domestic-url';
import { getCarrierMeta } from '@/components/layout/sections/local-esim/carrier-meta';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/i18n-config';
import { hasPageSchemaGraph } from '@/lib/schema-graph/page-kind';

/**
 * The FAQs a page shows, with the same priority order and `${name}`
 * substitution as the visible FAQ block (#054) — shared by the stand-alone
 * FAQPage below and the page graphs that carry their FAQ inside (vande-2011
 * #046).
 */
export const loadPageFaqs = cache(async function loadPageFaqs(
  locale: string,
  path: string
): Promise<{ question: string; answer: string }[]> {
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
      } else {
        // A domestic carrier, with the candidates of its visible FAQ block.
        const carrier = await resolveDomesticCarrier(segments[0]);
        if (carrier) {
          entityType = 'destination';
          name = getCarrierMeta(carrier).label;
          entitySlugs = [`esim-noi-dia/${carrier}`];
        }
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

  // Built through the FAQPage builder so the text is substituted and cleaned
  // exactly as before.
  const schema = buildFaqSchema(faqs.data, name ? { name } : undefined) as {
    mainEntity?: { name: string; acceptedAnswer: { text: string } }[];
  } | null;
  return (schema?.mainEntity ?? []).map((q) => ({
    question: q.name,
    answer: q.acceptedAnswer.text
  }));
});

/** Request path without query, hash or trailing slash. */
export function cleanPath(pathname: string): string {
  return pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
}

/**
 * FAQPage JSON-LD for any page that has FAQ content (#054).
 *
 * Rendered in the layout head, so the schema sits in <head> like the other
 * blocks (#052) and is server-rendered for crawlers. Pages whose schema is one
 * @graph (vande-2011 #046) carry their FAQPage inside it instead: one FAQPage
 * per page.
 */
export async function PageFaqSchema({ locale }: { locale: string }) {
  const pathname = (await headers()).get('x-pathname');
  if (!pathname) return null;

  const path = cleanPath(pathname);

  // Test harnesses have no business in search results.
  if (path.includes('/test')) return null;
  if (await hasPageSchemaGraph(locale, path)) return null;

  const faqs = await loadPageFaqs(locale, path);
  if (!faqs.length) return null;

  const jsonLd = buildFaqSchema(
    faqs.map((f, i) => ({ id: String(i), question: f.question, answer: f.answer }) as never),
    undefined,
    { url: path, lang: locale }
  );
  if (!jsonLd) return null;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
