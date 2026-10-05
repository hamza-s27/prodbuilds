import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { H2 } from "@/components/blog/mdx/AnchorHeading";
import {
  Callout,
  Caption,
  Figure,
  Lede,
  PostFooter,
  Sources,
  Stat,
  Stats,
  TableWrap,
  Tldr,
  Verdict,
} from "@/components/blog/mdx/PostBlocks";
import { ClockSkewDiagram } from "@/components/blog/diagrams/ClockSkewDiagram";
import { LockOverrunDiagram } from "@/components/blog/diagrams/LockOverrunDiagram";
import { PollingGapDiagram } from "@/components/blog/diagrams/PollingGapDiagram";
import { SoftCloseDiagram } from "@/components/blog/diagrams/SoftCloseDiagram";

/** Code blocks are focusable so keyboard users can scroll them. */
function Pre(props: ComponentPropsWithoutRef<"pre">) {
  return <pre tabIndex={0} {...props} />;
}

const components: MDXComponents = {
  pre: Pre,
  H2,
  Lede,
  Stats,
  Stat,
  Tldr,
  TableWrap,
  Verdict,
  Callout,
  Figure,
  Caption,
  PostFooter,
  Sources,
  ClockSkewDiagram,
  LockOverrunDiagram,
  PollingGapDiagram,
  SoftCloseDiagram,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
