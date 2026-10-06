"use client";

import { type RefObject, useEffect, useState } from "react";
import { animateProgress } from "@/lib/motion/timeline";
import { useMotionAllowed } from "./useMotionAllowed";

/** Start a little after the element enters, so the run is actually seen. */
const PLAY_ROOT_MARGIN = "0px 0px -15% 0px";

/**
 * "static": show the final state (server HTML, reduced motion, toggle off).
 * "armed": motion is on and the element hasn't been seen yet: show the start.
 * "play": it has been seen (once): run the animation.
 *
 * Something already on screen when the page hydrates goes straight to "play".
 */
export type PlayPhase = "static" | "armed" | "play";

export function usePlayOnView(ref: RefObject<Element | null>): PlayPhase {
  const { allowed } = useMotionAllowed();
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!allowed || seen || !element) return;
    const observer = new IntersectionObserver((entries) => setSeen(entries.at(-1)?.isIntersecting ?? false), {
      rootMargin: PLAY_ROOT_MARGIN,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [allowed, seen, ref]);

  if (!allowed || seen === null) return "static";
  return seen ? "play" : "armed";
}

/**
 * A once-per-page-view animation tied to the element entering the viewport.
 * Returns progress 0–1 while armed or running, and null for the final state.
 */
export function usePlayProgress(ref: RefObject<Element | null>, durationMs: number): number | null {
  const phase = usePlayOnView(ref);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (phase !== "play" || done) return;
    const cancel = animateProgress({ durationMs, onFrame: setProgress, onDone: () => setDone(true) });
    return () => {
      cancel();
      // Motion switched off mid-run: switching it back on restarts cleanly, not from a stale frame.
      setProgress(0);
    };
  }, [phase, done, durationMs]);

  if (phase === "static" || done) return null;
  return phase === "armed" ? 0 : progress;
}
