import type { JsonLdNode } from "@/lib/seo/json-ld";

interface JsonLdProps {
  readonly data: JsonLdNode;
}

/**
 * Structured data. The only dangerouslySetInnerHTML in the app: the payload is
 * our own content, and "<" is escaped so it cannot close the script element.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
