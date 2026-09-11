import type { Metadata } from "next";
import { fetchSeoConfigByUrl } from "./api";
import { SITE_BASE_URL } from "./hreflang";
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

export const SITE_NAME = "esim.vn";

export interface SeoMetadataOptions {
  /** Route locale, for `og:locale`. */
  locale?: string;
  /** Canonical public path or absolute URL, for `og:url`. */
  url?: string;
}

/** Facebook / Zalo expect a territory-qualified locale, not a bare language. */
function ogLocale(locale?: string): string | undefined {
  if (!locale) return undefined;
  return locale === "vi" ? "vi_VN" : locale === "en" ? "en_US" : locale;
}

/**
 * The Open Graph fields that belong on every page (#048). Only title,
 * description and image were being emitted, so shared links carried no site
 * name, type, locale or canonical URL — the parts crawlers use to attribute the
 * link and to pick a preview language.
 */
function socialBase(options?: SeoMetadataOptions) {
  return {
    type: "website" as const,
    siteName: SITE_NAME,
    locale: ogLocale(options?.locale),
    url: options?.url,
  };
}

/**
 * The generated share card (`app/[locale]/opengraph-image.tsx`). Next only
 * attaches a file-based image at its own segment, and a page that returns its
 * own `openGraph` replaces that object whole — so every page built here lost
 * the image (#L010). Name it explicitly whenever the CMS has none.
 */
function defaultOgImages(locale?: string) {
  return [{ url: `${SITE_BASE_URL}/${locale || "vi"}/opengraph-image`, width: 1200, height: 630 }];
}

/**
 * X/Twitter falls back to OG tags, but only a declared card type gets the large
 * image treatment — without it a shared link renders as a small thumbnail.
 */
function twitterCard(
  title?: string,
  description?: string,
  images?: { url: string }[]
) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: images?.map((image) => image.url),
  };
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
  pageUrl: string | string[],
  fallback?: { title?: string; description?: string },
  templateVars?: TemplateVars,
  options?: SeoMetadataOptions
): Promise<Metadata> {
  const seo = await fetchSeoConfigByUrl(pageUrl);

  if (seo) {
    const metaTitle = applyVars(seo.metaTitle, templateVars);
    const metaDescription = applyVars(seo.metaDescription, templateVars);
    const ogTitle = applyVars(seo.ogTitle, templateVars) || metaTitle;
    const ogDescription =
      applyVars(seo.ogDescription, templateVars) || metaDescription;
    const keywords = applyVars(seo.metaKeywords, templateVars);
    const images = seo.ogImage
      ? [{ url: seo.ogImage }]
      : defaultOgImages(options?.locale);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords,
      openGraph: {
        ...socialBase(options),
        title: ogTitle,
        description: ogDescription,
        images,
      },
      twitter: twitterCard(ogTitle, ogDescription, images),
    };
  }

  const title = applyVars(fallback?.title, templateVars) ?? DEFAULT_SEO.title;
  const description =
    applyVars(fallback?.description, templateVars) ?? DEFAULT_SEO.description;

  const images = defaultOgImages(options?.locale);

  return {
    title,
    description,
    openGraph: { ...socialBase(options), title, description, images },
    twitter: twitterCard(title, description, images),
  };
}
