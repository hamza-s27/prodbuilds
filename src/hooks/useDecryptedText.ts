"use client";

import { useEffect, useState } from "react";
import { decryptFrame, scrambleTick } from "@/lib/motion/text-effects";
import { animateProgress } from "@/lib/motion/timeline";
import { useMotionAllowed } from "./useMotionAllowed";

interface Scramble {
  /** The text this frame belongs to. */
  readonly source: string;
  /** null once settled. */
  readonly frame: string | null;
}

/**
 * The text, decrypting into place each time it changes (and once on mount).
 * Plain text on the server, with motion off and while `enabled` is false.
 */
export function useDecryptedText(text: string, enabled = true, durationMs = 450): string {
  const { allowed } = useMotionAllowed();
  const animate = allowed && enabled;
  const [scramble, setScramble] = useState<Scramble | null>(null);

  useEffect(() => {
    if (!animate) return;
    return animateProgress({
      durationMs,
      onFrame: (progress) =>
        setScramble({
          source: text,
          frame: progress >= 1 ? null : decryptFrame(text, progress, scrambleTick(progress, durationMs)),
        }),
    });
  }, [text, animate, durationMs]);

  if (!animate) return text;
  // New text whose run hasn't drawn yet: show its first frame, never a flash of the plain text.
  if (scramble?.source !== text) return decryptFrame(text, 0, 0);
  return scramble.frame ?? text;
}
