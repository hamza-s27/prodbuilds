"use client";

import { type CSSProperties, useRef } from "react";
import type { ProcessStep } from "@/content/types";
import { useStageRun } from "@/hooks/useStageRun";
import type { StageState } from "@/lib/motion/pipeline";
import "./pipeline.css";

/** Time each stage spends "running"; the whole run is steps × this. */
const STAGE_MS = 700;

const STAGE_STATES: readonly StageState[] = ["queued", "running", "passed"];
const STATUS: Readonly<Record<StageState, string>> = {
  queued: "○ queued",
  running: "◌ running",
  passed: "✓ passed",
};

interface ProcessPipelineProps {
  readonly steps: readonly ProcessStep[];
  /** Extra classes on the <ol> (the home page's horizontal band). */
  readonly listClassName?: string;
}

/**
 * The four steps as CI stages: horizontal from 1024px, vertical below. Each
 * runs queued → running → passed once it's in view, in order; the static
 * state is all passed.
 */
export function ProcessPipeline({ steps, listClassName }: ProcessPipelineProps) {
  const ref = useRef<HTMLOListElement>(null);
  // Each stage runs once it's in view (on the home band they slide in one by one).
  const states = useStageRun(ref, steps.length, STAGE_MS);

  return (
    <ol
      ref={ref}
      className={`grid gap-10 lg:grid-cols-4 lg:gap-8 ${listClassName ?? ""}`}
      style={{ "--stage-ms": `${STAGE_MS}ms` } as CSSProperties}
    >
      {steps.map((step, index) => {
        const state = states?.[index] ?? "passed";
        return (
          <li
            key={step.id}
            data-stage-state={state}
            className="pipeline-stage relative pl-8 lg:pt-10 lg:pl-0"
          >
            <span aria-hidden className="pipeline-node top-1 left-0 lg:top-0" />
            <p className="hud flex flex-wrap justify-between gap-x-4">
              <span>{step.label}</span>
              {/* All three labels share one grid cell, so the width never changes mid-run. */}
              <span aria-hidden className="pipeline-status grid whitespace-nowrap">
                {STAGE_STATES.map((label) => (
                  <span key={label} className={`[grid-area:1/1] ${label === state ? "" : "invisible"}`}>
                    {STATUS[label]}
                  </span>
                ))}
              </span>
            </p>
            <h3 className="mt-3 text-(length:--text-h3) font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-3 text-body">{step.summary}</p>
          </li>
        );
      })}
    </ol>
  );
}
