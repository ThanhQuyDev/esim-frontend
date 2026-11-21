import { headers } from 'next/headers';
import { getDictionary } from '@/lib/dictionaries';
import { buildBreadcrumbSchema, homeCrumb } from '@/lib/breadcrumb-schema';
import { resolveBreadcrumbTrail } from '@/lib/breadcrumb-trail';
import type { Locale } from '@/lib/i18n-config';
import { hasPageSchemaGraph } from '@/lib/schema-graph/page-kind';

/**
 * BreadcrumbList JSON-LD for the current page, rendered inside <head> (#052).
 *
 * It used to be emitted by the visual Breadcrumb component, which sits in the
 * page body. Placed in the layout head instead, it is server-rendered for every
 * page — including the ones that show no breadcrumb bar — and there is exactly
 * one per page rather than one per Breadcrumb instance.
 *
 * The trail is derived from the request path (see lib/breadcrumb-trail.ts), which
 * is what makes a head-level component possible at all: a page body cannot inject
 * into a head that has already been flushed.
 */
export async function PageBreadcrumbSchema({ locale }: { locale: string }) {
  const pathname = (await headers()).get('x-pathname');
  if (!pathname) return null;

  const path = pathname.split('?')[0].split('#')[0];
  // A page whose schema is one @graph has its BreadcrumbList inside it
  // (vande-2011 #046).
  if (await hasPageSchemaGraph(locale, path.replace(/\/+$/, '') || '/')) return null;
  const dict = await getDictionary(locale as Locale);
  const trail = await resolveBreadcrumbTrail(path, locale, dict);
  const jsonLd = buildBreadcrumbSchema([homeCrumb(locale), ...trail], path);

  if (!jsonLd) return null;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
