import type { WhyChooseUs } from "./api";
import { applySeoVars, type SeoTemplateVars } from "./seo-vars";

/**
 * "TẠI SAO" blocks: variables and a random subset per page (#087).
 *
 * Two things were missing. The copy was fixed text, so one record could not
 * say "eSIM ${name} chỉ từ ${fromPrice}" and stay true for every country; and
 * the page always showed the first six by sort order, so writing ten reasons
 * meant four of them were never seen by anyone.
 *
 * The variables are the same ones the CMS already uses for SEO records
 * (`lib/seo-vars.ts`) — one syntax for admins to learn, one place that knows
 * how to price a page.
 */

/** Fetch this many candidates before picking; well above any page's count. */
export const WHY_CHOOSE_US_POOL_SIZE = 50;

/**
 * How many blocks each page shows.
 *
 * 👨‍💻 Assumption: the per-page count lives here rather than in the CMS. There
 * is no settings table to hang it on, and inventing one for a single number
 * would be a bigger change than the feature. Editing this map is a one-line
 * change; if the number should be admin-editable, that is a follow-up.
 */
export const WHY_CHOOSE_US_COUNT: Record<string, number> = {
  /** Country page — the example in the brief: 6 shown out of however many. */
  quoc_gia: 6,
  khu_vuc: 6,
  /** The homepage asks with its CMS type, `trang_chu`. */
  trang_chu: 6,
  homepage: 6,
  esim_noi_dia: 6,
};

export const WHY_CHOOSE_US_DEFAULT_COUNT = 6;

export function whyChooseUsCount(pageType: string | undefined): number {
  if (!pageType) return WHY_CHOOSE_US_DEFAULT_COUNT;
  return WHY_CHOOSE_US_COUNT[pageType] ?? WHY_CHOOSE_US_DEFAULT_COUNT;
}

export interface PickWhyChooseUsOptions {
  /** How many to show; the whole (active) pool if it is smaller. */
  count: number;
  /** Values for `${name}`, `${fromPrice}`, … in the title and description. */
  vars?: SeoTemplateVars;
  /** Injectable RNG so a test can pin the draw. */
  random?: () => number;
}

/**
 * Choose the blocks one page shows.
 *
 * Inactive records are dropped, the copy is filled in, and a random subset of
 * `count` is drawn — but the drawn subset is then put back in the admin's own
 * `sortOrder`, so the ordering they set still decides how the shown blocks
 * read top to bottom.
 *
 * The draw happens on the server, per render, and the result is handed to the
 * client as data — no hydration mismatch, and a page rebuild reshuffles.
 */
export function pickWhyChooseUs(
  items: WhyChooseUs[] | null | undefined,
  { count, vars, random = Math.random }: PickWhyChooseUsOptions
): WhyChooseUs[] {
  const active = (items ?? []).filter((item) => item?.isActive !== false);
  if (active.length === 0 || count <= 0) return [];

  const chosen =
    active.length <= count ? [...active] : drawWithout(active, count, random);

  return chosen
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({
      ...item,
      title: applySeoVars(item.title, vars ?? {}),
      description: applySeoVars(item.description, vars ?? {}),
    }));
}

/**
 * The whole active pool with its copy filled in, in the admin's order — what a
 * page hands to `FeaturesSection` together with its `count` (#042).
 *
 * Country and region pages are prerendered, so a draw made on the server was
 * frozen into the HTML: every visitor saw the same six until the next build.
 * The server now sends the pool and the browser draws, so each visit gets its
 * own handful.
 */
export function prepareWhyChooseUs(
  items: WhyChooseUs[] | null | undefined,
  vars?: SeoTemplateVars
): WhyChooseUs[] {
  return pickWhyChooseUs(items, { count: Number.POSITIVE_INFINITY, vars });
}

/** Fisher–Yates over a copy, taking the first `count`. */
function drawWithout<T>(items: T[], count: number, random: () => number): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
