/**
 * Renders structured data (JSON-LD) into the document <head>.
 * Supports both raw JSON-LD content and full <script> tags from the CMS.
 *
 * Uses a plain <script> tag (not next/script) so it is emitted server-side
 * inside <head> when this component is placed there.
 */
export function StructuredData({ data }: { data: string | null }) {
  if (!data) return null;

  const trimmed = data.trim();

  // If content is wrapped in <script> tags (CMS often stores the full tag),
  // strip the wrapper and keep only the inner JSON-LD.
  const innerContent = trimmed.toLowerCase().includes('<script')
    ? trimmed
        .replace(/<script[^>]*>/gi, '')
        .replace(/<\/script>/gi, '')
        .trim()
    : trimmed;

  if (!innerContent) return null;

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: innerContent }}
    />
  );
}

