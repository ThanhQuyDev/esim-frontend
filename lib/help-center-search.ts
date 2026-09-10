import type { HelpCenterArticle } from "@/lib/api";

/**
 * Help-center quick search (#074).
 *
 * The search box used to show nothing while typing: three copies of the same
 * debounce-and-fetch code called `/api/help-center?search=…`, but the backend
 * controller is versioned (`@Controller({ path: 'help-center', version: '1' })`)
 * and exposes the keyword search at `/api/v1/help-center/search?q=…` — the old
 * URL simply 404s, so the result list was always empty and the popup never had
 * anything to show. The results page (`/help-center/search`) called the right
 * URL, which is why searching "worked" only after pressing Enter.
 */

const DEFAULT_LIMIT = 8;

export interface HelpCenterSearchParams {
  limit?: number;
  page?: number;
  lang?: string;
}

/** The endpoint the quick-search popup reads. Same one the results page uses. */
export function helpCenterSearchUrl(
  apiBase: string,
  query: string,
  { limit = DEFAULT_LIMIT, page = 1, lang }: HelpCenterSearchParams = {},
): string {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(limit),
  });
  if (lang) params.set("language", lang);
  return `${apiBase}/api/v1/help-center/search?${params.toString()}`;
}

/**
 * Article URL slug. Prefers the canonical `slug` from the CMS and only derives
 * one from the title when the CMS has not provided it.
 */
export function helpCenterArticleSlug(article: {
  slug?: string;
  title: string;
}): string {
  if (article.slug && article.slug.trim().length > 0) return article.slug;
  return article.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Read the article list out of whatever the endpoint returned. Paginated
 * responses wrap it in `data`; a bare array is accepted too so a change on the
 * API side degrades to "no results" rather than a crash inside the popup.
 */
export function helpCenterResults(payload: unknown): HelpCenterArticle[] {
  if (Array.isArray(payload)) return payload as HelpCenterArticle[];
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as HelpCenterArticle[];
  }
  return [];
}

/**
 * Move the keyboard highlight inside the popup.
 *
 * `-1` means "nothing highlighted, Enter submits the whole query". Arrowing
 * past either end wraps around, which is what a combobox is expected to do;
 * arrowing up from nothing lands on the last item.
 */
export function moveActiveIndex(
  current: number,
  delta: number,
  count: number,
): number {
  if (count <= 0) return -1;
  if (current < 0) return delta > 0 ? 0 : count - 1;
  return (current + delta + count) % count;
}
