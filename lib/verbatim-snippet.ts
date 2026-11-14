/**
 * The site-wide snippet exactly as the admin pasted it (vande-1411 #039).
 *
 * React writes every element itself: a boolean `async` always comes out as
 * `async=""`, and an async loader is moved away from the inline part of its
 * snippet. Admins compare the page source with what they pasted, so the snippet
 * goes into the page as the original text instead.
 *
 * Only text made of `<script>…</script>` tags, HTML comments and blank space is
 * taken as it is: those stay inside `<head>` and cannot break the page around
 * them. Anything else (a `<noscript>`, an `<iframe>`, half a tag) returns null
 * and is rendered the old way, tag by tag.
 */
export function verbatimSnippet(raw: string | null | undefined): string | null {
  const text = (raw ?? "").trim();
  if (!text || !/<script\b/i.test(text)) return null;
  const rest = text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  return rest.trim() === "" ? text : null;
}

/**
 * The HTML for an empty `<script>` that carries the snippet after it: the
 * snippet's text closes the empty tag, then the next tag that React closes.
 * `marker` names the pair in the page source.
 */
export function verbatimScriptHtml(snippet: string, marker: string): string {
  return `</script>\n${snippet}\n<script data-site-scripts="${marker}-end">`;
}
