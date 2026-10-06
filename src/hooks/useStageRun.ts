"use client";

import { type RefObject, useEffect, useState } from "react";
import { pipelineStates, type StageState } from "@/lib/motion/pipeline";
import { useMotionAllowed } from "./useMotionAllowed";

/** A stage counts as seen once it's well inside the viewport, horizontally too. */
const SEEN_MARGIN = "0px -8% -15% 0px";

/**
 * Runs a list's stages one after another, each taking `stageMs`, but never
 * ahead of what has been seen: a stage waits (queued) until it scrolls or
 * slides into view. Returns null for the static state (server HTML, motion off).
 */
export function useStageRun(
  listRef: RefObject<HTMLElement | null>,
  count: number,
  stageMs: number,
): StageState[] | null {
  const { allowed } = useMotionAllowed();
  const [seen, setSeen] = useState<readonly boolean[] | null>(null);
  const [passed, setPassed] = useState(0);

  useEffect(() => {
    const items = [...(listRef.current?.children ?? [])];
    if (!allowed || items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) =>
        setSeen((previous) => {
          // Seeing a stage counts for those before it too, so a fast scroll
          // or a jump past one never leaves the run stuck behind it.
          const furthest = Math.max(
            -1,
            ...entries.filter((entry) => entry.isIntersecting).map((entry) => items.indexOf(entry.target)),
          );
          return items.map((_, index) => (previous?.[index] ?? false) || index <= furthest);
        }),
      { rootMargin: SEEN_MARGIN },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [allowed, listRef]);

  const canAdvance = allowed && seen !== null && passed < count && seen[passed] === true;
  useEffect(() => {
    if (!canAdvance) return;
    const timer = setTimeout(() => setPassed((value) => value + 1), stageMs);
    return () => clearTimeout(timer);
  }, [canAdvance, passed, stageMs]);

  if (!allowed || seen === null || passed >= count) return null;
  return pipelineStates(count, passed, seen);
}
