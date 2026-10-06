"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { LEAD_ENDPOINT } from "@/content/site";
import { EMAIL_MAX_LENGTH } from "@/lib/lead/submit-lead";
import { LeadStatus } from "./LeadStatus";
import { useLeadForm } from "./use-lead-form";
import "./beam.css";

interface LeadFormProps {
  /** Prefix for element ids, e.g. "hero" → hero-email, hero-status, hero-note. */
  readonly idPrefix: string;
  readonly note: ReactNode;
  /** Landmark name; must differ between forms on the same page. */
  readonly formLabel?: string;
  readonly submitLabel?: string;
  readonly className?: string;
}

/**
 * Progressive enhancement: a real POST form that works without JavaScript;
 * with JavaScript it submits in place and reports the outcome.
 */
export function LeadForm({
  idPrefix,
  note,
  formLabel = "Leave your email",
  submitLabel = "Let’s talk",
  className,
}: LeadFormProps) {
  const { state, onSubmit } = useLeadForm();
  const inputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const ids = { email: `${idPrefix}-email`, status: `${idPrefix}-status`, note: `${idPrefix}-note` };
  const isSent = state === "sent";

  useEffect(() => {
    if (state === "sent") statusRef.current?.focus();
    if (state === "failed" || state === "invalid") inputRef.current?.focus();
  }, [state]);

  return (
    <div className={className}>
      {!isSent && (
        <form method="post" action={LEAD_ENDPOINT} aria-label={formLabel} onSubmit={onSubmit}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor={ids.email}>
              Email address
            </label>
            <span className="beam-field min-w-0 sm:flex-1">
              <input
                ref={inputRef}
                id={ids.email}
                name="email"
                type="email"
                required
                maxLength={EMAIL_MAX_LENGTH}
                autoComplete="email"
                placeholder="you@company.com"
                aria-describedby={`${ids.status} ${ids.note}`}
                aria-invalid={state === "invalid" || undefined}
                className="h-12 w-full min-w-0 rounded-full border border-input bg-background/60 px-5 text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
              />
              <span aria-hidden className="beam-ring">
                <span className="beam-spinner" />
              </span>
            </span>
            <button type="submit" className="btn-primary" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : submitLabel}
            </button>
          </div>
        </form>
      )}
      <LeadStatus ref={statusRef} id={ids.status} state={state} />
      {!isSent && (
        <p id={ids.note} className="mt-3 text-sm text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}
