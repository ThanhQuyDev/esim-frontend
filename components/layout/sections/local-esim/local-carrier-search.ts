import { useMemo } from "react";
import type { Locale } from "@/lib/i18n-config";
import type { LocalCarrier } from "@/lib/api";
import { useLocalCarriers } from "@/lib/hooks";
import { normalizeSearchTerm } from "@/lib/text";
import { getCarrierMeta } from "./carrier-meta";

export { normalizeSearchTerm } from "@/lib/text";

/**
 * Queries that should surface the whole domestic-eSIM carrier list, because
 * the customer is clearly looking for a Vietnamese SIM rather than a country
 * destination page ("viet nam", "esim viet nam", "esim noi dia", "vn", ...).
 *
 * Matching is prefix-based in both directions, so partial typing ("viet",
 * "esim viet") still hits. Terms of <=2 characters must match exactly, so that
 * "vn" means Vietnam while "vnsky" keeps matching only the VNSKY carrier.
 */
const VIETNAM_QUERY_TERMS = [
  "vn",
  "viet nam",
  "vietnam",
  "esim vn",
  "esim viet nam",
  "esim vietnam",
  "sim viet nam",
  "noi dia",
  "esim noi dia",
  "sim noi dia",
  "trong nuoc",
  "domestic",
  "domestic esim",
  "esim domestic",
  "local esim",
];

/** True when the query reads as "I want a Vietnamese / domestic eSIM". */
export function isDomesticEsimQuery(query: string): boolean {
  const q = normalizeSearchTerm(query);
  if (q.length < 2) return false;
  return VIETNAM_QUERY_TERMS.some((term) =>
    term.length <= 2 ? q === term : term.startsWith(q) || q.startsWith(term)
  );
}

/**
 * Domestic carriers to show for a search query.
 *
 * - A Vietnam / "noi dia" query returns every carrier (that is the product the
 *   customer asked for).
 * - Otherwise the query is matched against the carrier slug and its brand
 *   label, so typing "wintel" / "vnsky" / "itel" finds that carrier directly.
 *
 * Returns `[]` for queries shorter than 2 characters so the suggestion list
 * does not flood on the first keystroke.
 */
export function matchLocalCarriers(
  query: string,
  carriers: LocalCarrier[]
): LocalCarrier[] {
  const q = normalizeSearchTerm(query);
  if (q.length < 2 || carriers.length === 0) return [];

  if (isDomesticEsimQuery(q)) return carriers;

  return carriers.filter((carrier) => {
    const provider = normalizeSearchTerm(carrier.provider);
    const label = normalizeSearchTerm(getCarrierMeta(carrier.provider).label);
    return provider.startsWith(q) || label.startsWith(q);
  });
}

/**
 * Domestic carriers matching a live search box. Returns `[]` when the query is
 * not a domestic-eSIM search, so a caller can simply check `.length` before
 * rendering its "eSIM nội địa" section (and before deciding it has no results
 * at all).
 */
export function useMatchedLocalCarriers(query: string) {
  const { data: carriers = [], isLoading } = useLocalCarriers();
  const matches = useMemo(
    () => matchLocalCarriers(query, carriers),
    [query, carriers]
  );
  return { matches, isLoading };
}

/**
 * Localized href of a carrier detail page - `/esim-noi-dia/{provider}` in
 * Vietnamese, `/en/domestic-esim/{provider}` in English (see i18n/routing.ts).
 */
export function localCarrierHref(lang: Locale, provider: string): string {
  return lang === "vi"
    ? `/esim-noi-dia/${provider}`
    : `/${lang}/domestic-esim/${provider}`;
}

/** Card title, e.g. "eSIM Wintel" (vi) / "Wintel eSIM" (en). */
export function localCarrierTitle(lang: Locale, provider: string): string {
  const { label } = getCarrierMeta(provider);
  return lang === "vi" ? `eSIM ${label}` : `${label} eSIM`;
}
