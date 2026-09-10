/**
 * Parser for the CMS "Schema / Script" block (#049).
 *
 * The field holds whatever an admin pastes: a JSON-LD schema, Google Analytics
 * (gtag.js), a Google Ads conversion snippet, HTML comments between them, or all
 * of the above at once. Two bugs made everything except JSON-LD useless:
 *
 *   1. Every script was stamped `type="application/ld+json"`, so the browser
 *      treated real JavaScript as data and never ran it.
 *   2. A loader tag — `<script async src="…/gtag/js?id=G-…"></script>` — has no
 *      inner content, and empty scripts were skipped outright, so it never even
 *      reached the page.
 */

/** Attributes worth carrying over, mapped to their React prop names. */
const ATTR_PROP_NAMES: Record<string, string> = {
  src: "src",
  type: "type",
  id: "id",
  async: "async",
  defer: "defer",
  nomodule: "noModule",
  crossorigin: "crossOrigin",
  referrerpolicy: "referrerPolicy",
  integrity: "integrity",
  nonce: "nonce",
};

const BOOLEAN_ATTRS = new Set(["async", "defer", "nomodule"]);

export const JSON_LD_TYPE = "application/ld+json";

export interface ScriptBlock {
  /** Props to spread onto a `<script>` element. */
  props: Record<string, string | boolean>;
  /** Inline body; empty for an external loader. */
  content: string;
}

/**
 * Pull the attributes off an opening tag. Only known attributes and `data-*` are
 * kept — anything else an admin pastes (an inline event handler, say) is dropped
 * rather than forwarded blindly.
 */
function parseAttrs(openingTag: string): Record<string, string | boolean> {
  const props: Record<string, string | boolean> = {};
  const attrRegex =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(openingTag)) !== null) {
    const rawName = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4];

    if (rawName.startsWith("data-")) {
      props[rawName] = value ?? "";
      continue;
    }

    const propName = ATTR_PROP_NAMES[rawName];
    if (!propName) continue;

    props[propName] = BOOLEAN_ATTRS.has(rawName) ? true : (value ?? "");
  }

  return props;
}

/** First non-whitespace character decides whether a body is JSON. */
export function looksLikeJson(content: string): boolean {
  const first = content.trimStart()[0];
  return first === "{" || first === "[";
}

/**
 * Split a pasted block into renderable scripts, in the order they were written —
 * a gtag config snippet must not be reordered ahead of the loader it configures.
 *
 * Bare content with no `<script>` tag at all is only ever a schema; that is the
 * one case where defaulting the type to JSON-LD is right.
 */
export function parseScriptBlocks(raw: string): ScriptBlock[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (!trimmed.toLowerCase().includes("<script")) {
    return [{ props: { type: JSON_LD_TYPE }, content: trimmed }];
  }

  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const scripts: ScriptBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(trimmed)) !== null) {
    const props = parseAttrs(match[1]);
    const content = match[2].trim();

    // A loader tag carries no body; an inline tag with no body carries nothing
    // at all and is dropped.
    if (!content && !props.src) continue;

    if (!props.type && content && looksLikeJson(content)) {
      props.type = JSON_LD_TYPE;
    }

    scripts.push({ props, content });
  }

  return scripts;
}

export function isJsonLd(script: ScriptBlock): boolean {
  return script.props.type === JSON_LD_TYPE;
}
