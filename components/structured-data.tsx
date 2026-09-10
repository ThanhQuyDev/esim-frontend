import { applySeoVars, type SeoTemplateVars } from '@/lib/seo-vars';
import { isJsonLd, parseScriptBlocks } from '@/lib/script-blocks';

/**
 * Renders the CMS "Schema / Script" block into the document <head>.
 *
 * Parsing lives in lib/script-blocks.ts, which explains why a script's type is
 * no longer forced to JSON-LD and why external loader tags are kept (#049).
 *
 * Uses plain <script> tags (not next/script) so they are emitted server-side
 * inside <head> when this component is placed there.
 */
export function StructuredData({
  data,
  vars
}: {
  data: string | null;
  /**
   * SEO template variables (#047). Applied to JSON-LD blocks ONLY: a pasted
   * JavaScript snippet may legitimately contain `${…}` template literals, and
   * rewriting those would corrupt the script.
   */
  vars?: SeoTemplateVars;
}) {
  if (!data) return null;

  const scripts = parseScriptBlocks(data);
  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((script, index) => {
        if (!script.content) return <script key={index} {...script.props} />;

        const content =
          vars && isJsonLd(script)
            ? applySeoVars(script.content, vars, { stripUnresolved: true })
            : script.content;

        return (
          <script
            key={index}
            {...script.props}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      })}
    </>
  );
}
