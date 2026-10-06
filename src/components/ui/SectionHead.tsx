import { type CSSProperties, Fragment, type ReactNode } from "react";

interface SectionHeadProps {
  /** Two-digit section index, e.g. "02". */
  readonly index: string;
  readonly label: string;
  readonly headingId: string;
  readonly heading: string;
  readonly children?: ReactNode;
}

/**
 * Section header on the 12-column grid: a mono index + label in the left
 * columns and an expanded heading offset to the right (editorial asymmetry).
 */
export function SectionHead({ index, label, headingId, heading, children }: SectionHeadProps) {
  return (
    <div className="page-grid gap-y-6">
      <div className="col-span-12 rule-ticks" aria-hidden />
      <p className="hud col-span-12 md:col-span-3">
        <span className="text-primary">§{index}</span>
        <span aria-hidden> — </span>
        {label}
      </p>
      <div className="col-span-12 md:col-span-9">
        <h2 id={headingId} className="display text-(length:--text-h2)">
          {/* One span per word, so each can fill in as it scrolls up (scroll-scenes.css). */}
          {heading.split(" ").map((word, index) => (
            <Fragment key={index}>
              {index > 0 && " "}
              <span className="scroll-word" style={{ "--w": index } as CSSProperties}>
                {word}
              </span>
            </Fragment>
          ))}
        </h2>
        {children}
      </div>
    </div>
  );
}
