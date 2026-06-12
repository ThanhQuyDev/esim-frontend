// Shared types for the legal policy pages.
// Content is modelled as structured blocks so a single renderer can display
// every policy consistently (clear typography, accessible headings, links).

export type LegalLocale = "vi" | "en";

/**
 * Inline rich-text run. Lines are arrays of runs; a plain string is the most
 * common case. `b` = bold, `i` = italic, `a` = anchor link.
 */
export type LegalRun =
  | string
  | { b: LegalRun[] }
  | { i: LegalRun[] }
  | { a: { href: string }; c: LegalRun[] };

/**
 * A content block: an optional bold heading followed by one or more lines.
 * Each line renders on its own row (equivalent to <br/>-separated text).
 */
export interface LegalBlock {
  heading?: string;
  lines: LegalRun[][];
}

export interface LegalPolicyContent {
  title: string;
  /** Display timestamp shown under the title, e.g. "00:15 30/03/2024". */
  date: string;
  blocks: LegalBlock[];
}

export interface LegalPolicy {
  /** Canonical slug, shared across locales (e.g. "chinh-sach-hoan-tien"). */
  slug: string;
  /** Public URL slug per locale (vi keeps the Vietnamese slug, en uses an
   *  English one), used to build/resolve `/phap-ly/{vi}` and `/legal/{en}`. */
  urlSlug: { vi: string; en: string };
  /** Short label for the quick-links sidebar. */
  navLabel: { vi: string; en: string };
  content: { vi: LegalPolicyContent; en: LegalPolicyContent };
}
