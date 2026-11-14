import { getSiteScripts } from '@/lib/api';
import { StructuredData } from '@/components/structured-data';
import { verbatimScriptHtml, verbatimSnippet } from '@/lib/verbatim-snippet';

/**
 * The site-wide third-party scripts, on every page (#075).
 *
 * Scripts could previously only be attached to one page at a time, through its
 * SEO record — unusable for analytics, which has to be everywhere, and impossible
 * to keep up to date as pages are added.
 *
 * Rendered through `StructuredData`, the same parser the per-page field already
 * uses (`lib/script-blocks.ts`): a pasted snippet keeps its attributes, a loader
 * tag with no body still reaches the page, and real JavaScript is not stamped as
 * JSON-LD. Admins therefore get exactly the behaviour they already know, and a
 * `<noscript>` fallback is not carried here either.
 *
 * A snippet made only of scripts and comments now skips that parser and goes
 * into the page exactly as pasted (vande-1411 #039, `lib/verbatim-snippet.ts`):
 * in <head> after an empty marker script, at the end of <body> inside a hidden
 * <div>. Either way React's tree matches the server HTML, so hydration holds.
 *
 * No `vars` are passed: SEO template variables belong to page metadata, and
 * rewriting `${…}` inside a vendor snippet would corrupt it.
 */
export async function SiteScripts({
  placement
}: {
  placement: 'head' | 'bodyEnd';
}) {
  const scripts = await getSiteScripts();
  const forPlacement = scripts[placement] ?? [];

  if (forPlacement.length === 0) return null;

  return (
    <>
      {forPlacement.map((script) => {
        // As pasted, character for character (vande-1411 #039).
        const snippet = verbatimSnippet(script.content);
        if (snippet && placement === 'bodyEnd') {
          return (
            <div
              key={script.id}
              hidden
              data-site-scripts={placement}
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: `\n${snippet}\n` }}
            />
          );
        }
        return snippet ? (
          <script
            key={script.id}
            data-site-scripts={placement}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: verbatimScriptHtml(snippet, placement) }}
          />
        ) : (
          <StructuredData key={script.id} data={script.content} />
        );
      })}
    </>
  );
}
