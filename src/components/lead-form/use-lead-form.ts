"use client";

import { type FormEvent, useRef, useState } from "react";
import { LEAD_ENDPOINT } from "@/content/site";
import { type LeadResult, submitLead } from "@/lib/lead/submit-lead";

export type LeadFormState = "idle" | "sending" | "sent" | "failed" | "invalid";

const STATE_FOR_RESULT: Readonly<Record<LeadResult, LeadFormState>> = {
  sent: "sent",
  invalid: "invalid",
  "network-error": "failed",
  timeout: "failed",
};

/** Submit lifecycle for LeadForm: idle → sending → sent | failed | invalid (→ sending on retry). */
export function useLeadForm() {
  const [state, setState] = useState<LeadFormState>("idle");
  const sendingRef = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendingRef.current) return;
    const email = String(new FormData(event.currentTarget).get("email") ?? "");

    sendingRef.current = true;
    setState("sending");
    const result = await submitLead(email, { endpoint: LEAD_ENDPOINT });
    sendingRef.current = false;
    setState(STATE_FOR_RESULT[result]);
  }

  return { state, onSubmit };
}
