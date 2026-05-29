import type { Metadata } from "next";
import { fetchSeoConfigByUrl } from "./api";
import { interpolate } from "./utils";

const DEFAULT_SEO = {
  title: "esim.vn - eSIM for Global Travel",
  description:
    "Stay connected worldwide with affordable eSIM data plans. No physical SIM needed.",
};

type TemplateVars = Record<string, string | number | null | undefined>;

function applyVars(value: string | undefined | null, vars?: TemplateVars): string | undefined {
  if (!value) return value ?? undefined;
  if (!vars) return value;
  return interpolate(value, vars);
}

/**
 * Fetch SEO config from API for a given page URL and return Next.js Metadata.
 * Falls back to provided defaults or global defaults if the API returns nothing.
 *
 * `templateVars` lets callers replace `${name}`-style placeholders stored in
 * the CMS (e.g. on destination/region pages where titles look like
 * `"eSIM for ${name}"`) with the page-specific value.
 */
export async function getSeoMetadata(
  pageUrl: string,
  fallback?: { title?: string; description?: string },
  templateVars?: TemplateVars
): Promise<Metadata> {
  const seo = await fetchSeoConfigByUrl(pageUrl);

  if (seo) {
    const metaTitle = applyVars(seo.metaTitle, templateVars);
    const metaDescription = applyVars(seo.metaDescription, templateVars);
    const ogTitle = applyVars(seo.ogTitle, templateVars) || metaTitle;
    const ogDescription =
      applyVars(seo.ogDescription, templateVars) || metaDescription;
    const keywords = applyVars(seo.metaKeywords, templateVars);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
      },
    };
  }

  const title = applyVars(fallback?.title, templateVars) ?? DEFAULT_SEO.title;
  const description =
    applyVars(fallback?.description, templateVars) ?? DEFAULT_SEO.description;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}
