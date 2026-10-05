import type { RichText } from "@/content/types";

interface RichTextViewProps {
  readonly text: RichText;
}

export function RichTextView({ text }: RichTextViewProps) {
  return text.map((node, index) =>
    typeof node === "string" ? (
      node
    ) : (
      <a key={index} href={node.href} className="link-inline">
        {node.label}
      </a>
    ),
  );
}
