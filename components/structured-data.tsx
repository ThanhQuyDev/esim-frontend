/**
 * Renders structured data (JSON-LD) into the document <head>.
 * Supports both raw JSON-LD content and one or more full <script> tags
 * from the CMS — each <script> tag is preserved as its own element.
 *
 * Uses plain <script> tags (not next/script) so they are emitted
 * server-side inside <head> when this component is placed there.
 */

interface ParsedScript {
  type: string;
  content: string;
}

function parseTypeAttr(openingTag: string): string {
  const match = openingTag.match(/type\s*=\s*["']([^"']+)["']/i);
  return match?.[1] ?? 'application/ld+json';
}

function parseScripts(raw: string): ParsedScript[] {
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const scripts: ParsedScript[] = [];
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(raw)) !== null) {
    const content = match[2].trim();
    if (!content) continue;
    scripts.push({
      type: parseTypeAttr(match[1]),
      content
    });
  }

  return scripts;
}

export function StructuredData({ data }: { data: string | null }) {
  if (!data) return null;

  const trimmed = data.trim();
  if (!trimmed) return null;

  // CMS may store one or more full <script> tags. Preserve each tag
  // separately instead of merging them into a single script element.
  const scripts = trimmed.toLowerCase().includes('<script')
    ? parseScripts(trimmed)
    : [{ type: 'application/ld+json', content: trimmed }];

  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((script, index) => (
        <script
          key={index}
          type={script.type}
          dangerouslySetInnerHTML={{ __html: script.content }}
        />
      ))}
    </>
  );
}
