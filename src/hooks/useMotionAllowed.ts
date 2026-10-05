"use client";

import { useSyncExternalStore } from "react";
import {
  type MotionPreference,
  readMotionPreference,
  subscribeMotionPreference,
  writeMotionPreference,
} from "@/lib/motion/motion-preference";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeSystem(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const readSystemReduced = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

/**
 * Whether decorative motion may run: the OS allows it AND the visitor hasn't
 * switched it off. On the server (static HTML) motion is off, so the first
 * paint is always the static state.
 */
export function useMotionAllowed() {
  const systemReduced = useSyncExternalStore(subscribeSystem, readSystemReduced, () => true);
  const preference = useSyncExternalStore<MotionPreference>(
    subscribeMotionPreference,
    readMotionPreference,
    () => "on",
  );
  return {
    allowed: !systemReduced && preference === "on",
    systemReduced,
    preference,
    setPreference: writeMotionPreference,
  };
}
