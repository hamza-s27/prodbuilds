"use client";

import { useEffect, useState } from "react";
import { headingBeingRead, READ_LINE } from "@/lib/content/headings";

/** The band above the read line: headings crossing its edge trigger a recount. */
const READ_BAND = `0px 0px -${100 - READ_LINE * 100}% 0px`;

/**
 * The heading (by id, in page order) being read. IntersectionObservers only
 * trigger a recount, which reads the real positions, so instant jumps (anchor
 * links, Home/End) can't leave stale state. Does nothing while disabled.
 */
export function useScrollSpy<Id extends string>(ids: readonly Id[], enabled = true): Id | null {
  const [active, setActive] = useState<Id | null>(null);
  const key = ids.join(" ");

  useEffect(() => {
    if (!enabled) return;
    const order = key.split(" ") as Id[];
    const headings = order.flatMap((id) => document.getElementById(id) ?? []);
    const end = document.querySelector("footer");
    let atEnd = false;

    const recount = () =>
      setActive(
        headingBeingRead(
          order,
          headings.map((heading) => heading.getBoundingClientRect().top),
          window.innerHeight,
          atEnd,
        ),
      );
    const bandObserver = new IntersectionObserver(recount, { rootMargin: READ_BAND });
    const endObserver = new IntersectionObserver((entries) => {
      atEnd = entries.at(-1)?.isIntersecting ?? false;
      recount();
    });
    headings.forEach((heading) => bandObserver.observe(heading));
    if (end) endObserver.observe(end);

    return () => {
      bandObserver.disconnect();
      endObserver.disconnect();
      setActive(null);
    };
  }, [key, enabled]);

  return active;
}
