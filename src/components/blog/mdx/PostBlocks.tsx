// Building blocks used inside post MDX (registered in src/mdx-components.tsx).
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "good" | "bad" | "plain" | "note";

interface ChildrenProps {
  readonly children: ReactNode;
}

export function Lede({ children }: ChildrenProps) {
  return <p className="lede">{children}</p>;
}

export function Stats({ children }: ChildrenProps) {
  return <ul className="stats">{children}</ul>;
}

interface StatProps extends ChildrenProps {
  readonly value: string;
  readonly tone: Tone;
}

export function Stat({ value, tone, children }: StatProps) {
  return (
    <li>
      <strong className={cn("stat-num", tone)}>{value}</strong> <span className="stat-lbl">{children}</span>
    </li>
  );
}

export function Tldr({ children }: ChildrenProps) {
  return (
    <section className="tldr" aria-labelledby="in-short">
      {children}
    </section>
  );
}

interface TableWrapProps extends ChildrenProps {
  readonly label: string;
}

/** Scrollable, keyboard-focusable region around wide tables. */
export function TableWrap({ label, children }: TableWrapProps) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={label}>
      {children}
    </div>
  );
}

interface VerdictProps extends ChildrenProps {
  readonly tone: "good" | "bad";
}

export function Verdict({ tone, children }: VerdictProps) {
  return <span className={cn("verdict", tone)}>{children}</span>;
}

interface CalloutProps extends ChildrenProps {
  readonly tone: Tone;
  readonly label: string;
}

export function Callout({ tone, label, children }: CalloutProps) {
  return (
    <div className={cn("callout", tone)} role="note">
      <p className="callout-label">{label}</p>
      {children}
    </div>
  );
}

export function Figure({ children }: ChildrenProps) {
  return <figure className="diagram">{children}</figure>;
}

export function Caption({ children }: ChildrenProps) {
  return <figcaption>{children}</figcaption>;
}

export function PostFooter({ children }: ChildrenProps) {
  return <div className="post-footer">{children}</div>;
}

export function Sources({ children }: ChildrenProps) {
  return <p className="sources">{children}</p>;
}
