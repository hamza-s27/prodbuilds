import { Plus } from "lucide-react";
import type { FaqItem } from "@/content/types";
import { RichTextView } from "@/components/ui/RichTextView";
import "./faq.css";

interface FaqListProps {
  readonly items: readonly FaqItem[];
}

/**
 * Native <details> accordion (one open at a time via `name`): no JavaScript,
 * and closed answers stay in the HTML for search engines and find-in-page.
 */
export function FaqList({ items }: FaqListProps) {
  return (
    <div className="border-t border-hairline">
      {items.map((item, index) => (
        <details
          key={item.question}
          name="faq"
          open={index === 0}
          className="faq-item group border-b border-hairline"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <h3 className="text-(length:--text-h3) font-semibold tracking-tight transition-colors group-hover:text-primary">
              {item.question}
            </h3>
            <Plus aria-hidden className="faq-icon mt-1 size-5 shrink-0 text-primary group-open:rotate-45" />
          </summary>
          <p className="max-w-2xl pb-8 text-body">
            <RichTextView text={item.answer} />
          </p>
        </details>
      ))}
    </div>
  );
}
