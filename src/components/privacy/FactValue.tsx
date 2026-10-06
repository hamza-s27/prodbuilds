"use client";

import { useRef } from "react";
import type { FactEffect } from "@/content/types";
import { usePlayProgress } from "@/hooks/usePlayProgress";
import { countFrame, decryptFrame, scrambleTick } from "@/lib/motion/text-effects";

const DURATION_MS: Readonly<Record<FactEffect, number>> = { count: 1400, decrypt: 1200 };

interface FactValueProps {
  readonly value: string;
  readonly effect: FactEffect;
}

function frameFor(value: string, effect: FactEffect, progress: number): string {
  if (effect === "count") return countFrame(Number(value), progress);
  return decryptFrame(value, progress, scrambleTick(progress, DURATION_MS.decrypt));
}

/**
 * The real value is always in the DOM (and the server HTML). While animating
 * it is transparent, keeping its box and its accessible text, and an
 * aria-hidden overlay shows the frames.
 */
export function FactValue({ value, effect }: FactValueProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const progress = usePlayProgress(ref, DURATION_MS[effect]);
  const frame = progress === null ? null : frameFor(value, effect, progress);

  return (
    <span
      ref={ref}
      className="relative inline-block whitespace-nowrap [overflow-x:clip]"
      data-fact-state={frame === null ? "final" : "animating"}
    >
      <span className={frame === null ? undefined : "opacity-0 print:opacity-100"}>{value}</span>
      {frame !== null && (
        <span aria-hidden className="absolute inset-0 tabular-nums print:hidden">
          {frame}
        </span>
      )}
    </span>
  );
}
