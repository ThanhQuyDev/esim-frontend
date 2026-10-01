import type { Manufacturer } from "./api";

/**
 * The extra note shown under a brand on the supported-devices page (#079).
 *
 * The page used to show exactly one note: a string in the locale file, rendered
 * only when the brand happened to be called "iPhone". Any other brand needing a
 * caveat had nowhere to put it, and editing the iPhone wording took a deploy.
 *
 * The note now comes from the CMS, per brand and per language. The old locale
 * string is kept as the iPhone fallback so the page reads exactly as it does today
 * for anyone who has not configured anything yet — and so it still reads correctly
 * if the API call for the notes comes back empty.
 */
export function brandNote(
  manufacturer: Pick<Manufacturer, "manufacturer" | "note">,
  iphoneFallback?: string,
): string | null {
  const configured = manufacturer.note?.trim();
  if (configured) return configured;

  // Compared case-insensitively: the brand is typed by hand in the CMS, so
  // "IPHONE" must not lose the fallback it would have had.
  if (manufacturer.manufacturer?.trim().toLowerCase() === "iphone") {
    return iphoneFallback?.trim() || null;
  }

  return null;
}
