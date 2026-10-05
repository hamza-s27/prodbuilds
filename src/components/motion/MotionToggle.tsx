"use client";

import { useSyncExternalStore } from "react";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";

const neverChanges = () => () => {};

/**
 * Site-wide switch for decorative motion (WCAG 2.2.2 Pause, Stop, Hide).
 * Stored in localStorage; the OS reduced-motion setting always wins.
 */
export function MotionToggle() {
  // The server can't know the visitor's settings: render an inert placeholder
  // of the same size until hydrated, instead of a guess.
  const hydrated = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
  const { allowed, systemReduced, preference, setPreference } = useMotionAllowed();

  if (!hydrated) return <span aria-hidden className="hud inline-block min-h-6 w-24" />;
  if (systemReduced) return <p className="hud min-h-6">Motion off · system setting</p>;

  return (
    <button
      type="button"
      aria-pressed={allowed}
      onClick={() => setPreference(preference === "on" ? "off" : "on")}
      className="hud group inline-flex min-h-6 items-center gap-2 transition-colors hover:text-foreground"
    >
      {/* Constant name ("Motion"); aria-pressed and the filled dot carry the state. */}
      <span
        aria-hidden
        className="size-2 rounded-full border border-current transition-colors group-aria-pressed:border-primary group-aria-pressed:bg-primary"
      />
      Motion
    </button>
  );
}
