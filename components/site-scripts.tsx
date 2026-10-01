import { getSiteScripts } from '@/lib/api';
import { StructuredData } from '@/components/structured-data';

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
      {forPlacement.map((script) => (
        <StructuredData key={script.id} data={script.content} />
      ))}
    </>
  );
}
