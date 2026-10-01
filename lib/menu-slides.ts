import type { GroupedMenuSlides, MenuSlide } from "./api";

/**
 * The mega-menu "Explore" carousels, filled from the CMS (#073).
 *
 * The cards used to be hard-coded in `navbar.tsx` — still pointing at the
 * reference design's NordVPN CDN images — so changing a picture or a line of copy
 * needed a developer and a deploy.
 *
 * The built-in cards stay as the fallback, per panel. A panel the admin has not
 * configured yet keeps showing what it shows today, so the menu never goes blank
 * between deploying this and filling the table in; a panel with slides shows only
 * those. That also means the API being down costs nothing: `getMenuSlides` returns
 * an empty object and every panel falls back.
 */

/** The card shape the navbar renders. `desc` is the navbar's own field name. */
export interface ExploreCardLike {
  title: string;
  desc: string;
  href: string;
  image: string;
  imageAlt: string;
}

export function toExploreCard(slide: MenuSlide): ExploreCardLike {
  return {
    title: slide.title,
    desc: slide.description,
    href: slide.href,
    image: slide.image,
    // An empty alt is the correct markup for a decorative image, so a blank one
    // is left blank rather than being filled with the title.
    imageAlt: slide.imageAlt ?? "",
  };
}

/**
 * Replace each panel's built-in cards with the CMS slides configured for it.
 * Panels with no slides are returned untouched.
 */
export function withCmsMenuSlides<T extends { explore: ExploreCardLike[] }>(
  menuData: Record<string, T>,
  slides: GroupedMenuSlides | undefined,
): Record<string, T> {
  if (!slides) return menuData;

  let changed = false;
  const merged: Record<string, T> = {};

  for (const [key, panel] of Object.entries(menuData)) {
    const configured = slides[key];
    if (configured && configured.length > 0) {
      merged[key] = { ...panel, explore: configured.map(toExploreCard) };
      changed = true;
    } else {
      merged[key] = panel;
    }
  }

  // Returning the original object when nothing was configured keeps referential
  // equality, so the menu does not re-render for no reason.
  return changed ? merged : menuData;
}
