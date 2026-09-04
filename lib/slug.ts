/**
 * Pick the locale-appropriate slug for a destination/region.
 *
 * Vietnamese pages prefer `slugVi` (e.g. `esim-thai-lan`) for SEO, falling back
 * to the canonical `slug` when no VI slug is set. All other locales use `slug`.
 */
export function localizedSlug(
  entity: { slug: string; slugVi?: string | null },
  locale: string
): string {
  if (locale === "vi") {
    return entity.slugVi || entity.slug;
  }
  return entity.slug;
}
