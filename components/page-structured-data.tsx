import { headers } from 'next/headers';
import { resolveCmsSeoLookupPath } from '@/lib/cms-seo-url';
import {
  fetchSeoConfigByUrl,
  getDestinationBySlug,
  getRegionBySlug,
  getPlansByDestinationSlug,
  getPlansByRegionSlug
} from '@/lib/api';
import { buildSeoTemplateVars } from '@/lib/seo-vars';
import { buildProductSchema, hasProductSchema } from '@/lib/product-schema';
import { getUsdVndRate } from '@/lib/exchange-rate';
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
interface ResolvedEntity {
  type: 'destination' | 'region';
  name: string;
  description: string | null;
  image: string | null;
}

async function resolveEntity(
  slug: string,
  lang: string,
): Promise<ResolvedEntity | null> {
  const destination = await getDestinationBySlug(slug, lang);
  if (destination) {
    return {
      type: 'destination',
      name:
        (lang === 'vi' ? destination.titleVi : destination.title) ||
        destination.name,
      description:
        (lang === 'vi' ? destination.descriptionVi : destination.description) ??
        null,
      image: destination.avatarUrl ?? destination.flagUrl ?? null,
    };
  }

  const region = await getRegionBySlug(slug, lang);
  if (region) {
    return {
      type: 'region',
      name: (lang === 'vi' ? region.titleVi : region.title) || region.name,
      description:
        (lang === 'vi' ? region.descriptionVi : region.description) ?? null,
      image: region.avatarUrl ?? region.iconUrl ?? null,
    };
  }

  return null;
}

/** The plans of the resolved entity — both the SEO variables and the Product
 *  schema are built from this one (cached) call. */
async function entityPlans(
  type: 'destination' | 'region',
  slug: string,
  lang: string,
) {
  return type === 'destination'
    ? getPlansByDestinationSlug(slug, lang)
    : getPlansByRegionSlug(slug, lang);
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

  // Detect single-segment paths that could be destination/region detail pages,
  // e.g. `/japan` (vi) or `/en/japan` (en).
  const pathWithoutLocale = localePrefix
    ? normalizedPath.slice(localePrefix.length) || '/'
    : normalizedPath;
  const segments = pathWithoutLocale.split('/').filter(Boolean);
  const slug = segments.length === 1 ? segments[0] : null;
  const entity = slug ? await resolveEntity(slug, locale) : null;
  const plans = entity && slug ? await entityPlans(entity.type, slug, locale) : null;
  const vars = entity
    ? buildSeoTemplateVars({
        name: entity.name,
        plans,
        lang: locale,
        rate: await getUsdVndRate()
      })
    : {};

  // ── The CMS-authored block, if this page has one ──────────────────
  let cmsBlock: string | null = null;

  if (seo?.structuredData && normalizePath(seo.url) === normalizePath(lookupPath)) {
    cmsBlock = seo.structuredData;
  } else if (entity) {
    // Slug-page fallback: a destination/region page with no record of its own
    // inherits the shared `/destination` or `/region` schema.
    const fallbackSeo = await fetchSeoConfigByUrl(`${localePrefix}/${entity.type}`);
    cmsBlock = fallbackSeo?.structuredData ?? null;
  }

  // ── Product + Offer, generated from the plans actually on sale (#051) ──
  // Skipped when the CMS block already declares a Product: two Products on one
  // page make Google pick between them arbitrarily.
  const productSchema =
    entity && !hasProductSchema(cmsBlock)
      ? buildProductSchema({
          name:
            locale === 'vi' ? `eSIM ${entity.name}` : `${entity.name} eSIM`,
          url: normalizedPath,
          description: entity.description,
          image: entity.image,
          plans,
          lang: locale
        })
      : null;

  if (!cmsBlock && !productSchema) return null;

  return (
    <>
      {/* Variables are handed to StructuredData rather than applied here, so
          they reach JSON-LD only — a pasted gtag snippet must be left
          byte-for-byte, template literals included. */}
      {cmsBlock && <StructuredData data={cmsBlock} vars={vars} />}
      {productSchema && (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
    </>
  );
}
