import type { Faq, PaginatedResponse } from "./api";

/**
 * Which FAQs a country/region page shows (#053).
 *
 * These pages ask the API twice: once for their own URL, once for the shared
 * "/destination" (or "/region") record that carries the blanket FAQs used across
 * every destination. The two result sets used to be merged, so a page that had
 * been given its own FAQs showed them *plus* the generic ones — the specific
 * answer buried among boilerplate, and often contradicting it.
 *
 * The URLs are passed in priority order, so the first set that has anything wins
 * and the rest are dropped.
 */

/** Unwrap either shape the endpoint may return. */
export function faqItems(
  result: PaginatedResponse<Faq> | Faq[] | null | undefined
): Faq[] {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.data)) return result.data;
  return [];
}

/**
 * The winning set: the first non-empty one, de-duplicated by id.
 *
 * Empty when no URL matched anything — the FAQ block then renders nothing rather
 * than falling back to unrelated questions.
 */
export function pickContextFaqs(
  resultsInPriorityOrder: (PaginatedResponse<Faq> | Faq[] | null | undefined)[]
): Faq[] {
  for (const result of resultsInPriorityOrder) {
    const items = faqItems(result);
    if (items.length === 0) continue;

    const seen = new Set<string>();
    const unique: Faq[] = [];
    for (const faq of items) {
      if (seen.has(faq.id)) continue;
      seen.add(faq.id);
      unique.push(faq);
    }
    return unique;
  }
  return [];
}
