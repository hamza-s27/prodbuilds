"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const neverChanges = () => () => {};
const RESET_MS = 2000;

type CopyState = "idle" | "copied" | "failed";
const LABEL: Readonly<Record<CopyState, string>> = { idle: "Copy", copied: "Copied", failed: "Copy failed" };

/** Copies the code block it sits in. Renders nothing without JavaScript. */
export function CopyCodeButton() {
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
  const ref = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), RESET_MS);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    const code = ref.current?.closest(".code-block")?.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  if (!hydrated) return null;
  return (
    <>
      <button ref={ref} type="button" onClick={copy} className="code-copy hud" aria-label="Copy code">
        <span aria-hidden>{LABEL[state]}</span>
      </button>
      {/* Outside the button: a button's children are presentational, so a live region there is never heard. */}
      <span role="status" className="sr-only">
        {state === "idle" ? "" : LABEL[state]}
      </span>
    </>
  );
}
