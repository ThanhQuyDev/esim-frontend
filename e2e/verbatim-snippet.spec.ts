import { test, expect } from "@playwright/test";
import { verbatimScriptHtml, verbatimSnippet } from "../lib/verbatim-snippet";

/**
 * vande-1411 #039 — a site-wide snippet reaches the page as it was pasted:
 * `<script async src>`, not React's `async=""`, and in one piece.
 */

const GTAG = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-52FRJQL6SK"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-52FRJQL6SK');
</script>`;

test("keeps scripts and comments character for character", () => {
  expect(verbatimSnippet(`\n${GTAG}\n\n`)).toBe(GTAG);
});

test("leaves anything but scripts and comments to the tag-by-tag path", () => {
  expect(verbatimSnippet(`${GTAG}\n<noscript><img src="x"></noscript>`)).toBeNull();
  expect(verbatimSnippet(`<script async src="a.js">`)).toBeNull();
  expect(verbatimSnippet(`{"@context":"https://schema.org"}`)).toBeNull();
  expect(verbatimSnippet("")).toBeNull();
});

test("the head form closes its own empty tag around the snippet", () => {
  const html = `<script>${verbatimScriptHtml(GTAG, "head")}</script>`;
  expect(html).toContain(`<script async src="https://www.googletagmanager.com/gtag/js?id=G-52FRJQL6SK"></script>`);
  expect(html).not.toContain('async=""');
  expect(html.endsWith('<script data-site-scripts="head-end"></script>')).toBe(true);
});
