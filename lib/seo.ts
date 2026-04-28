import type { Metadata } from "next";
import { fetchSeoConfigByUrl } from "./api";

const DEFAULT_SEO = {
  title: "esim.vn - eSIM for Global Travel",
  description:
    "Stay connected worldwide with affordable eSIM data plans. No physical SIM needed.",
};

/**
 * Fetch SEO config from API for a given page URL and return Next.js Metadata.
 * Falls back to provided defaults or global defaults if the API returns nothing.
 */
export async function getSeoMetadata(
  pageUrl: string,
  fallback?: { title?: string; description?: string }
): Promise<Metadata> {
  const seo = await fetchSeoConfigByUrl(pageUrl);

  if (seo) {
    return {
      title: seo.metaTitle,
      description: seo.metaDescription,
      keywords: seo.metaKeywords,
      openGraph: {
        title: seo.ogTitle || seo.metaTitle,
        description: seo.ogDescription || seo.metaDescription,
        images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      },
    };
  }

  const title = fallback?.title ?? DEFAULT_SEO.title;
  const description = fallback?.description ?? DEFAULT_SEO.description;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}
