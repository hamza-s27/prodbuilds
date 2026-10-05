import type { ProcessStep } from "@/content/types";

interface ProcessTimelineProps {
  readonly steps: readonly ProcessStep[];
}

/**
 * The four steps on /how-we-work along a vertical beam. Static here; Phase 5
 * fills the beam as you scroll. Step heading ids (#step-1…4) match the legacy page.
 */
export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <div className="page-grid">
      <div className="relative col-span-12 lg:col-span-10 lg:col-start-2">
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-[5px] w-px bg-gradient-to-b from-primary via-teal-dim to-transparent md:left-[calc(25%+5px)]"
        />
        {steps.map((step) => (
          <section
            key={step.id}
            aria-labelledby={step.id}
            className="relative grid gap-4 pb-16 pl-10 md:grid-cols-4 md:gap-8 md:pl-0"
          >
            <span
              aria-hidden
              className="absolute top-2 left-0 size-[11px] rounded-full border-2 border-primary bg-background md:left-1/4"
            />
            <p className="hud pt-1 md:text-right md:pr-10">{step.label}</p>
            <div className="reveal md:col-span-3 md:pl-10">
              <h2 id={step.id} className="display text-(length:--text-h2)">
                {step.title}
              </h2>
              <p className="mt-5 max-w-2xl text-(length:--text-lead) text-body">{step.detail}</p>
              <p className="surface mt-6 max-w-2xl rounded-hud px-5 py-4 text-body">
                <strong className="hud mr-2 text-primary">What you get:</strong> {step.deliverable}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
