import { headers } from 'next/headers';
import { resolveCmsSeoLookupPath } from '@/lib/cms-seo-url';
import { fetchSeoConfigByUrl, getDestinationBySlug, getRegionBySlug } from '@/lib/api';
import { StructuredData } from '@/components/structured-data';

/**
 * Normalize a path for exact comparison: strip query/hash, collapse duplicate
 * slashes, and drop a trailing slash (except root).
 */
function normalizePath(path: string): string {
  let p = path.split('?')[0].split('#')[0].replace(/\/+/g, '/');
  if (p.length > 1 && p.endsWith('/')) p = p.replace(/\/+$/, '');
  return p || '/';
}

/**
 * Resolve a slug to determine whether it is a destination or a region.
 * Returns `"destination"`, `"region"`, or `null`.
 */
async function resolveEntityType(
  slug: string,
  lang: string,
): Promise<'destination' | 'region' | null> {
  const destination = await getDestinationBySlug(slug, lang);
  if (destination) return 'destination';

  const region = await getRegionBySlug(slug, lang);
  if (region) return 'region';

  return null;
}

/**
 * Server component that fetches and renders the structured data (JSON-LD)
 * configured for the *current* page only.
 *
 * Lookup strategy:
 * 1. Homepage: CMS stores `/home` (vi) or `/en/home` (en) but the browser
 *    shows `/` or `/en` → map accordingly.
 * 2. Exact path: try the current normalized path as-is.
 * 3. Slug-page fallback: for destination/region detail pages that have no
 *    dedicated SEO config, fall back to `/destination` or `/region` (with
 *    locale prefix for non-vi) based on the resolved entity type.
 */
export async function PageStructuredData({ locale }: { locale: string }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname');

  if (!pathname) return null;

  const normalizedPath = normalizePath(pathname);
  const localePrefix = locale !== 'vi' ? `/${locale}` : '';

  const lookupPath = resolveCmsSeoLookupPath(normalizedPath, locale as 'vi' | 'en');

  const seo = await fetchSeoConfigByUrl(lookupPath);

  if (seo?.structuredData && normalizePath(seo.url) === normalizePath(lookupPath)) {
    return <StructuredData data={seo.structuredData} />;
  }

  // ── Step 2: Slug-page fallback ────────────────────────────────────
  // Detect single-segment paths that could be destination/region detail pages.
  // e.g. `/japan` (vi) or `/en/japan` (en)
  const pathWithoutLocale = localePrefix
    ? normalizedPath.slice(localePrefix.length) || '/'
    : normalizedPath;

  const segments = pathWithoutLocale.split('/').filter(Boolean);

  if (segments.length === 1) {
    const slug = segments[0];
    const entityType = await resolveEntityType(slug, locale);

    if (entityType) {
      const fallbackPath = `${localePrefix}/${entityType}`;
      const fallbackSeo = await fetchSeoConfigByUrl(fallbackPath);

      if (fallbackSeo?.structuredData) {
        return <StructuredData data={fallbackSeo.structuredData} />;
      }
    }
  }

  return null;
}
