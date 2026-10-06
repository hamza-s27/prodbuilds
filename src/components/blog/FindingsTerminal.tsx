"use client";

import { useRef } from "react";
import type { TerminalLine } from "@/content/types";
import { usePlayProgress } from "@/hooks/usePlayProgress";
import { cursorLine, scheduleTerminal, typedAt, visibleByLine } from "@/lib/motion/terminal";
import "./terminal.css";

const TONE: Readonly<Record<NonNullable<TerminalLine["tone"]> | "default", string>> = {
  default: "text-foreground",
  good: "text-primary",
  bad: "text-destructive",
  muted: "text-muted-foreground",
};

interface FindingsTerminalProps {
  readonly lines: readonly TerminalLine[];
  readonly className?: string;
}

/**
 * Types measured results from the posts once it's seen, in under 5 s.
 * aria-hidden: it repeats what the posts say. Every character is always laid
 * out (untyped ones are invisible), so typing never shifts the layout.
 */
export function FindingsTerminal({ lines, className }: FindingsTerminalProps) {
  const ref = useRef<HTMLElement>(null);
  const schedule = scheduleTerminal(lines);
  const progress = usePlayProgress(ref, schedule.totalMs);
  const typed =
    progress === null ? Number.POSITIVE_INFINITY : typedAt(lines, schedule, progress * schedule.totalMs);
  const visible = visibleByLine(lines, typed);
  const complete = visible.every((shown, index) => shown === lines[index]!.text.length);
  const cursorAt = complete ? lines.length : cursorLine(lines, typed);
  const reached = (index: number) => index === 0 || visible[index - 1] === lines[index - 1]!.text.length;

  return (
    <figure
      ref={ref}
      aria-hidden
      data-terminal-state={progress === null ? "final" : typed === 0 ? "armed" : "typing"}
      className={`surface flex flex-col overflow-hidden rounded-lg ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <span className="hud">~/prodbuilds/findings</span>
        <span className="hud text-primary">from our tests</span>
      </div>
      <div className="flex-1 p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] sm:text-sm md:p-6">
        {lines.map((line, index) => {
          const shown = visible[index]!;
          return (
            <p
              key={index}
              className={`${TONE[line.tone ?? "default"]} ${line.kind === "command" && index > 0 ? "mt-3" : ""}`}
            >
              {line.kind === "command" && (
                <span className={reached(index) ? "text-primary" : "invisible"}>$ </span>
              )}
              {line.text.slice(0, shown)}
              {cursorAt === index && <span className="terminal-cursor" />}
              <span className="invisible">{line.text.slice(shown)}</span>
            </p>
          );
        })}
        <p className={`mt-3 ${complete ? "text-primary" : "invisible"}`}>
          {"$ "}
          {cursorAt === lines.length && <span className="terminal-cursor" />}
        </p>
      </div>
    </figure>
  );
}
