import type { Ref } from "react";
import { CONTACT_EMAIL } from "@/content/site";
import type { LeadFormState } from "./use-lead-form";

const MESSAGES: Partial<Record<LeadFormState, { text: string; tone: "ok" | "error"; withEmail: boolean }>> = {
  sent: {
    text: "✓  Thanks — we’ll be in touch by email. If you don’t hear from us, write to ",
    tone: "ok",
    withEmail: true,
  },
  failed: {
    text: "That didn’t go through. Check your connection and try again, or write to ",
    tone: "error",
    withEmail: true,
  },
  invalid: { text: "Please enter a full email address.", tone: "error", withEmail: false },
};

interface LeadStatusProps {
  readonly id: string;
  readonly state: LeadFormState;
  readonly ref?: Ref<HTMLParagraphElement>;
}

/** Live region for the form outcome; focusable once sent so focus can land on it. */
export function LeadStatus({ id, state, ref }: LeadStatusProps) {
  const message = MESSAGES[state];
  // No cn() here: in a client bundle it ships ~10 kb of class-merging tables.
  const tone = message?.tone === "error" ? "text-destructive" : "text-primary";
  return (
    <p
      ref={ref}
      id={id}
      role="status"
      tabIndex={state === "sent" ? -1 : undefined}
      className={`mt-3 text-sm empty:hidden ${tone}`}
    >
      {message && (
        <>
          {message.text}
          {message.withEmail && (
            <>
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-inline">
                {CONTACT_EMAIL}
              </a>
              .
            </>
          )}
        </>
      )}
    </p>
  );
}
