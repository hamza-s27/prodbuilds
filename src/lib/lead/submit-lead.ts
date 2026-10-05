export const LEAD_TIMEOUT_MS = 20_000;

/** "invalid" is caught before sending; the others describe the request. */
export type LeadResult = "sent" | "network-error" | "timeout" | "invalid";

export interface SubmitLeadOptions {
  readonly endpoint: string;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
}

export const EMAIL_MAX_LENGTH = 254;

// The WHATWG "valid email address" rule used by <input type="email">, so the
// JS path accepts exactly what the browser (and the no-JS form) accepts.
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(trimmed);
}

/**
 * Posts the email to the Apps Script endpoint, exactly as the plain form would.
 * The response is opaque (no-cors): resolving means it reached Google,
 * rejecting means it never left the browser.
 */
export async function submitLead(email: string, options: SubmitLeadOptions): Promise<LeadResult> {
  if (!isValidEmail(email)) return "invalid";

  const { endpoint, fetchImpl = fetch, timeoutMs = LEAD_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    await fetchImpl(endpoint, {
      method: "POST",
      mode: "no-cors",
      // The visitor's Google cookies have no business on a lead form.
      credentials: "omit",
      body: new URLSearchParams({ email: email.trim() }),
      signal: controller.signal,
    });
    return "sent";
  } catch {
    return controller.signal.aborted ? "timeout" : "network-error";
  } finally {
    clearTimeout(timer);
  }
}
