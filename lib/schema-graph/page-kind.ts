import { cache } from "react";
import { getDestinationBySlug, getRegionBySlug } from "@/lib/api";
import { routing } from "@/i18n/routing";
import { staticSchemaKey } from "./static-page";
import { resolveContentPage, type ContentPage } from "./content-pages";

/**
 * Which pages carry their whole schema as one JSON-LD @graph (vande-2011
 * #046). On those, the separate BreadcrumbList, FAQPage and Product blocks the
 * layout used to emit step aside — the graph has them, and a page must have
 * exactly one of each.
 */
export type GraphPageKind =
  | { kind: "destination"; slug: string }
  | { kind: "region"; slug: string }
  | { kind: "static"; key: string }
  | { kind: "content"; page: ContentPage };

export const resolveGraphPage = cache(async function resolveGraphPage(
  locale: string,
  path: string
): Promise<GraphPageKind | null> {
  const staticKey = staticSchemaKey(locale, path);
  if (staticKey) return { kind: "static", key: staticKey };
  const content = await resolveContentPage(locale, path);
  if (content) return { kind: "content", page: content };

  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const rest = prefix && path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path;
  const segments = rest.split("/").filter(Boolean);
  if (segments.length !== 1) return null;
  const slug = decodeURIComponent(segments[0]);

  const destination = await getDestinationBySlug(slug, locale).catch(() => null);
  if (destination) {
    return (destination as { esimType?: string }).esimType === "local"
      ? null
      : { kind: "destination", slug };
  }
  const region = await getRegionBySlug(slug, locale).catch(() => null);
  if (region && (region as { esimType?: string }).esimType !== "local") {
    return { kind: "region", slug };
  }
  return null;
});

export async function hasPageSchemaGraph(locale: string, path: string): Promise<boolean> {
  return (await resolveGraphPage(locale, path)) !== null;
}
