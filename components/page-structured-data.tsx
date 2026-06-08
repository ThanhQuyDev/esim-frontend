import { headers } from 'next/headers';
import { fetchSeoConfigByUrl } from '@/lib/api';
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
 * Server component that fetches and renders the structured data (JSON-LD)
 * configured for the *current* page only.
 *
 * The backend `by-url` lookup falls back to ancestor paths (so `/blog/x`
 * inherits an ancestor's meta). That inheritance is correct for meta tags but
 * NOT for structured data — otherwise a schema configured for one page (e.g.
 * the home page at `/`) leaks onto every descendant page. We therefore only
 * emit structured data when the returned config URL matches the current path
 * exactly.
 */
export async function PageStructuredData() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname');

  if (!pathname) return null;

  const normalizedPath = normalizePath(pathname);
  const seo = await fetchSeoConfigByUrl(normalizedPath);

  if (!seo?.structuredData) return null;

  // Only render when this is an exact match for the current page, not an
  // inherited ancestor config.
  if (normalizePath(seo.url) !== normalizedPath) return null;

  return <StructuredData data={seo.structuredData} />;
}
