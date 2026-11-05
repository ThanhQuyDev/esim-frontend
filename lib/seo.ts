import type { Metadata } from "next";
import { fetchSeoConfigByUrl } from "./api";
import { SITE_BASE_URL } from "./hreflang";
import { getCloudinaryTransformedUrl } from "./image-utils";
import { getLocale } from "next-intl/server";
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
  /**
   * Cache the CMS lookup for this many seconds. Required on statically
   * generated pages (see `fetchSeoConfigByUrl`); omit it elsewhere so an edit
   * shows at once.
   */
  revalidate?: number;
  /**
   * The page's own picture (a destination's or region's official photo), used
   * as the share image when the CMS sets none (vande-0411 #070).
   */
  image?: string | null;
}

/** Facebook / Zalo expect a territory-qualified locale, not a bare language. */
async function requestLocale(): Promise<string | undefined> {
  try {
    return await getLocale();
  } catch {
    return undefined;
  }
}

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
 * The default share card, one per language (vande-0411 #070): the designer's
 * banner, kept in `public/og` rather than drawn at request time. It replaces the
 * generated yellow card. A page that returns its own `openGraph` replaces the
 * layout's object whole, so it is named here whenever the CMS has none (#L010).
 */
export function defaultOgImages(locale?: string) {
  const lang = locale === "en" ? "en" : "vi";
  return [{ url: `${SITE_BASE_URL}/og/esimvn-og-${lang}.png`, width: 1200, height: 630 }];
}

/**
 * A destination's official photo as a share image, cropped to the 1200x630
 * card. JPEG rather than the site's WebP, which not every chat app previews.
 */
function pageOgImages(image: string | null | undefined) {
  const url = getCloudinaryTransformedUrl(image, {
    width: 1200,
    height: 630,
    quality: "auto:good",
    gravity: "center",
  });
  if (!url) return null;
  return [{ url: url.replace("/f_webp,", "/f_jpg,"), width: 1200, height: 630 }];
}

/** CMS image, else the page's own photo, else the default card. */
function fallbackOgImages(options?: SeoMetadataOptions) {
  return pageOgImages(options?.image) ?? defaultOgImages(options?.locale);
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
  // Most pages do not pass their locale, so English pages shared the
  // Vietnamese card (vande-0411 #070): read it from the request instead.
  if (!options?.locale) {
    options = { ...options, locale: await requestLocale() };
  }
  const seo = await fetchSeoConfigByUrl(pageUrl, {
    revalidate: options?.revalidate,
  });

  if (seo) {
    const metaTitle = applyVars(seo.metaTitle, templateVars);
    const metaDescription = applyVars(seo.metaDescription, templateVars);
    const ogTitle = applyVars(seo.ogTitle, templateVars) || metaTitle;
    const ogDescription =
      applyVars(seo.ogDescription, templateVars) || metaDescription;
    const keywords = applyVars(seo.metaKeywords, templateVars);
    const images = seo.ogImage
      ? [{ url: seo.ogImage }]
      : fallbackOgImages(options);

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

  const images = fallbackOgImages(options);

  return {
    title,
    description,
    openGraph: { ...socialBase(options), title, description, images },
    twitter: twitterCard(title, description, images),
  };
}
