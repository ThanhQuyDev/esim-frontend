import { headers } from 'next/headers';
import { fetchSeoConfigByUrl } from '@/lib/api';
import { StructuredData } from '@/components/structured-data';

/**
 * Server component that automatically fetches and renders structured data
 * for the current page URL. Place in layout to cover all pages.
 */
export async function PageStructuredData() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname');

  if (!pathname) return null;

  const seo = await fetchSeoConfigByUrl(pathname);
  return <StructuredData data={seo?.structuredData ?? null} />;
}
