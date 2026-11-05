import { getLocalCarriers } from "./api";

/**
 * The domestic eSIM carrier page lives at `/esim-itel` (`/en/esim-itel`), next
 * to the country and region pages, with no `/esim-noi-dia` in front
 * (vande-0411 #072). `app/[locale]/[slug]` serves it.
 */

/** `itel` → `esim-itel`. */
export function carrierPageSlug(carrier: string): string {
  return `esim-${carrier}`;
}

/** Public path of a carrier's page in one language. */
export function carrierPagePath(lang: string, carrier: string): string {
  return lang === "vi" ? `/${carrierPageSlug(carrier)}` : `/${lang}/${carrierPageSlug(carrier)}`;
}

/** The carrier a page slug addresses, when one sells under it right now. */
export async function resolveDomesticCarrier(slug: string): Promise<string | null> {
  if (!slug.startsWith("esim-")) return null;
  const carriers = await getLocalCarriers();
  return carriers.find((c) => carrierPageSlug(c.provider) === slug)?.provider ?? null;
}

/** The URLs a carrier page answers to in the CMS (SEO, FAQ), its own first. */
export function carrierCmsKeys(lang: string, carrier: string): string[] {
  const prefix = lang === "vi" ? "" : `/${lang}`;
  return [
    carrierPagePath(lang, carrier),
    // Records written before the move.
    `${prefix}/esim-noi-dia/${carrier}`,
    // The one record shared by every carrier, like /destination and /region.
    `${prefix}/esim-noi-dia`,
  ];
}
