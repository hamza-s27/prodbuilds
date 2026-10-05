import type { ReactNode } from "react";

interface AnchorHeadingProps {
  /** Explicit id: post deep links predate the redesign and must not change. */
  readonly id: string;
  readonly children: ReactNode;
}

/**
 * h2 with a "#" link that appears on hover / focus for copying deep links. The
 * link sits beside the heading (not inside it) so the heading's accessible name
 * stays clean, and it is named "Link to section: <heading>" via aria-labelledby.
 */
export function H2({ id, children }: AnchorHeadingProps) {
  const labelId = `${id}-anchor-label`;
  return (
    <div className="heading-anchor">
      <h2 id={id}>{children}</h2>
      <a href={`#${id}`} className="anchor-link" aria-labelledby={`${labelId} ${id}`}>
        <span id={labelId} hidden>
          Link to section:
        </span>
        <span aria-hidden>#</span>
      </a>
    </div>
  );
}
