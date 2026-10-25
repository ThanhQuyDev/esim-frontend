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
        if (!script.content) {
          // React turns `<script async src>` into a resource and moves it to
          // the top of <head>, away from the inline part of the same snippet
          // — and out of <body> for an "end of body" snippet (vande #049).
          // `itemProp` is the switch React offers to emit a script where it
          // stands; the empty attribute means nothing to the browser.
          const props =
            script.props.async && script.props.src
              ? { ...script.props, itemProp: "" }
              : script.props;
          return <script key={index} {...props} />;
        }

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
