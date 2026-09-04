import type { Destination } from "./api";

/**
 * Pick the locale-appropriate display title for a destination.
 * CMS data can predate `titleVi`, so keep `name` as the final safe fallback.
 */
export function localizedDestinationName(
  destination: Pick<Destination, "name" | "title" | "titleVi">,
  locale: string
): string {
  if (locale === "vi") {
    return destination.titleVi || destination.name || destination.title || "";
  }
  return destination.title || destination.name || destination.titleVi || "";
}
