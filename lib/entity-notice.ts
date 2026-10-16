/**
 * "Ghi chú" an admin writes on a destination / region (doitac-1410 #078),
 * shown at the top of its page — e.g. Turkey, India, China. Rich text from
 * the CMS editor: bold, italic, underline and links. The API cleans it before
 * storing; it is cleaned again here, since it goes in as HTML.
 */

export interface EntityWithNotice {
  notice?: string | null;
  noticeVi?: string | null;
}

const DANGEROUS_BLOCKS =
  /<(script|style|iframe|object|embed|frameset|form|noscript|template)\b[\s\S]*?<\/\1\s*>/gi;
const DANGEROUS_TAGS =
  /<\/?(script|style|iframe|object|embed|frame|frameset|form|noscript|template|meta|link|base)\b[^>]*>/gi;
const EVENT_ATTRS = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const SCRIPT_URLS =
  /\s+(href|src|xlink:href|action|formaction)\s*=\s*("\s*(javascript|vbscript|data):[^"]*"|'\s*(javascript|vbscript|data):[^']*'|(javascript|vbscript|data):[^\s>]*)/gi;

export function sanitizeNoticeHtml(input: string): string {
  let html = String(input ?? "");
  for (let i = 0; i < 2; i++) {
    html = html
      .replace(DANGEROUS_BLOCKS, "")
      .replace(DANGEROUS_TAGS, "")
      .replace(EVENT_ATTRS, "")
      .replace(SCRIPT_URLS, "");
  }
  return html.trim();
}

const hasText = (html: string) =>
  html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;

/**
 * The note for the page's language, as safe HTML, or null when there is none.
 * English falls back to the Vietnamese note: a warning in the other language
 * beats no warning.
 */
export function entityNoticeHtml(
  entity: EntityWithNotice | null | undefined,
  lang: string,
): string | null {
  if (!entity) return null;
  const candidates = lang === "vi" ? [entity.noticeVi] : [entity.notice, entity.noticeVi];
  for (const raw of candidates) {
    if (!raw) continue;
    const html = sanitizeNoticeHtml(raw);
    if (hasText(html)) return html;
  }
  return null;
}

/** For a page showing several regions at once: the first one with a note. */
export function firstEntityNoticeHtml(
  entities: Array<EntityWithNotice | null | undefined>,
  lang: string,
): string | null {
  for (const entity of entities) {
    const html = entityNoticeHtml(entity, lang);
    if (html) return html;
  }
  return null;
}
