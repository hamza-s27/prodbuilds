"use client";

import { useEffect, useState } from "react";

const DEFAULT_FALLBACK_MS = 1200;

/** True once the main thread is idle after load; used to defer non-critical work (WebGL). */
export function useIdle(fallbackMs: number = DEFAULT_FALLBACK_MS): boolean {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    const markIdle = () => setIsIdle(true);
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(markIdle, { timeout: fallbackMs * 2 });
      return () => window.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(markIdle, fallbackMs);
    return () => window.clearTimeout(timer);
  }, [fallbackMs]);

  return isIdle;
}
