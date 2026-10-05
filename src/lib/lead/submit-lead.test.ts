import { afterEach, describe, expect, it, vi } from "vitest";
import { isValidEmail, submitLead } from "./submit-lead";

const ENDPOINT = "https://script.google.com/macros/s/x/exec";

afterEach(() => {
  vi.useRealTimers();
});

describe("isValidEmail", () => {
  // Same rule as the browser's <input type="email">, so JS and no-JS agree.
  it.each(["you@company.com", "a.b+c@sub.example.co.uk", "a@b", "you@company"])("accepts %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(["", "you", "you@", "@company.com", "a b@c.com", "you@-company.com", `${"a".repeat(250)}@b.co`])(
    "rejects %j",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});

describe("submitLead", () => {
  it("posts the email as form data in no-cors mode and resolves 'sent'", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null));

    await expect(submitLead("you@company.com", { endpoint: ENDPOINT, fetchImpl })).resolves.toBe("sent");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    // No credentials: the visitor's Google cookies have no business on a lead form.
    expect(init).toMatchObject({ method: "POST", mode: "no-cors", credentials: "omit" });
    expect(String(init.body)).toBe("email=you%40company.com");
  });

  it("resolves 'network-error' when the request never leaves the browser", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(submitLead("you@company.com", { endpoint: ENDPOINT, fetchImpl })).resolves.toBe(
      "network-error",
    );
  });

  it("resolves 'timeout' and aborts the request after the timeout", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const fetchImpl = vi.fn((_url: RequestInfo | URL, init?: RequestInit) => {
      signal = init?.signal ?? undefined;
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      });
    });

    const result = submitLead("you@company.com", { endpoint: ENDPOINT, fetchImpl, timeoutMs: 20_000 });
    await vi.advanceTimersByTimeAsync(20_000);

    await expect(result).resolves.toBe("timeout");
    expect(signal?.aborted).toBe(true);
  });

  it("rejects an invalid email without sending anything", async () => {
    const fetchImpl = vi.fn();

    await expect(submitLead("nope", { endpoint: ENDPOINT, fetchImpl })).resolves.toBe("invalid");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
