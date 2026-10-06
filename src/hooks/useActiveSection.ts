"use client";

import { useEffect, useState } from "react";
import { pickActive } from "@/lib/motion/stack-dive";

/**
 * A zero-height line 30% down the viewport. Near the top rather than the
 * centre, so the section a deep link lands on is the one marked, even on very
 * tall screens and for the last section when the page bottoms out.
 */
const ACTIVE_LINE = "-30% 0px -70% 0px";

/**
 * Which of the sections (by element id, in page order) crosses the active
 * line. Does nothing while `enabled` is false.
 */
export function useActiveSection<Id extends string>(ids: readonly Id[], enabled = true): Id | null {
  const [active, setActive] = useState<Id | null>(null);
  // A string key, so a new array with the same ids doesn't rebuild the observer.
  const key = ids.join(" ");

  useEffect(() => {
    if (!enabled) return;
    const order = key.split(" ") as Id[];
    let intersecting: ReadonlySet<string> = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        const next = new Set(intersecting);
        for (const entry of entries) {
          if (entry.isIntersecting) next.add(entry.target.id);
          else next.delete(entry.target.id);
        }
        intersecting = next;
        setActive(pickActive(order, intersecting));
      },
      { rootMargin: ACTIVE_LINE },
    );
    for (const id of order) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => {
      observer.disconnect();
      setActive(null);
    };
  }, [key, enabled]);

  return active;
}
