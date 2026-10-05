import type { ProcessStep } from "@/content/types";

interface ProcessPipelineProps {
  readonly steps: readonly ProcessStep[];
}

/** The four steps as pipeline stages: horizontal from 1024px, vertical below. */
export function ProcessPipeline({ steps }: ProcessPipelineProps) {
  return (
    <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-8">
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[5px] w-px bg-gradient-to-b from-primary via-teal-dim to-border lg:top-[5px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto lg:bg-gradient-to-r"
      />
      {steps.map((step) => (
        <li key={step.id} className="relative pl-8 lg:pt-10 lg:pl-0">
          <span
            aria-hidden
            className="absolute top-1 left-0 size-[11px] rounded-full border-2 border-primary bg-background lg:top-0"
          />
          <p className="hud">{step.label}</p>
          <h3 className="mt-3 text-(length:--text-h3) font-semibold tracking-tight">{step.title}</h3>
          <p className="mt-3 text-body">{step.summary}</p>
        </li>
      ))}
    </ol>
  );
}
