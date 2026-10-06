"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import type { PostHeading } from "@/lib/content/headings";

/** Matches the `xl` breakpoint where the post page shows this list. */
const SHOWN_QUERY = "(min-width: 80rem)";

interface PostTocProps {
  readonly headings: readonly PostHeading[];
}

/** "On this page" links (1280px and up), marking the section being read. Plain links without JavaScript. */
export function PostToc({ headings }: PostTocProps) {
  const shown = useMediaQuery(SHOWN_QUERY);
  const active = useScrollSpy(
    headings.map((heading) => heading.id),
    shown,
  );

  return (
    <nav aria-labelledby="toc-label">
      {/* Not a heading: it would end up in the post's own outline. */}
      <p id="toc-label" className="hud">
        On this page
      </p>
      <ol className="mt-5 space-y-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={heading.id === active ? "location" : undefined}
              className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=location]:border-primary aria-[current=location]:text-foreground"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
