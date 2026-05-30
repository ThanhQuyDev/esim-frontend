import Script from 'next/script';

/**
 * Renders structured data (JSON-LD, schema scripts) in the document head.
 * Supports both raw JSON-LD content and full <script> tags from CMS.
 */
export function StructuredData({ data }: { data: string | null }) {
  if (!data) return null;

  const trimmed = data.trim();

  // If content contains <script> tags, strip them and render just the inner content
  if (trimmed.toLowerCase().includes('<script')) {
    const innerContent = trimmed.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '').trim();
    if (!innerContent) return null;
    return (
      <Script
        id='structured-data'
        type='application/ld+json'
        strategy='beforeInteractive'
        dangerouslySetInnerHTML={{ __html: innerContent }}
      />
    );
  }

  // Raw JSON-LD content without script wrapper
  return (
    <Script
      id='structured-data'
      type='application/ld+json'
      strategy='beforeInteractive'
      dangerouslySetInnerHTML={{ __html: trimmed }}
    />
  );
}

