import type { PrivacyFact } from "@/content/types";

interface DataFactsProps {
  readonly facts: readonly PrivacyFact[];
}

/** Final values are always in the HTML; Phase 3 animates them after hydration. */
export function DataFacts({ facts }: DataFactsProps) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label} className="flex flex-col-reverse gap-4 bg-card p-8 md:p-10">
          <dt className="max-w-[28ch] text-body">{fact.label}</dt>
          <dd className="display text-(length:--text-h1) text-foreground">
            {fact.value}
            {fact.unit && <span className="hud ml-2 align-baseline text-primary">{fact.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
