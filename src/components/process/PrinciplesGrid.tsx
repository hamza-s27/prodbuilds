import type { Principle } from "@/content/types";
import { RichTextView } from "@/components/ui/RichTextView";
import { cn } from "@/lib/utils";

interface PrinciplesGridProps {
  readonly principles: readonly Principle[];
}

/**
 * Bento spans, in content order: the four hero principles alternate wide and
 * narrow (4·2 / 2·4 of 6 columns); the two quieter ones share the last row.
 */
const BENTO_SPANS = [
  "md:col-span-2 lg:col-span-4",
  "lg:col-span-2",
  "lg:col-span-2",
  "md:col-span-2 lg:col-span-4",
  "lg:col-span-3",
  "lg:col-span-3",
] as const;

/** Bento with hierarchy: the four hero principles as raised surfaces, the other two as quiet outlines. */
export function PrinciplesGrid({ principles }: PrinciplesGridProps) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {principles.map((principle, index) => (
        <li
          key={principle.title}
          className={cn(
            "group relative flex flex-col overflow-hidden rounded-lg p-6 transition-colors hover:border-primary md:p-8",
            BENTO_SPANS[index] ?? "lg:col-span-3",
            principle.featuredInHero ? "surface" : "border border-border",
          )}
        >
          <p aria-hidden className="hud text-primary">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3
            className={cn(
              "mt-4 font-semibold tracking-tight",
              principle.featuredInHero
                ? "display text-(length:--text-h3) md:text-3xl"
                : "text-(length:--text-h3)",
            )}
          >
            {principle.title}
          </h3>
          <p className="mt-4 max-w-xl text-body">
            <RichTextView text={principle.body} />
          </p>
        </li>
      ))}
    </ul>
  );
}
