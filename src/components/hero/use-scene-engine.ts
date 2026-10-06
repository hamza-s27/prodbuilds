"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { softwareWebGLAllowed } from "@/lib/webgl/capability";
import { initialQuality, nextQuality, type RenderQuality } from "@/lib/webgl/quality";
import type { SceneRenderer } from "./create-scene-renderer";
import type { EngineStatus } from "./render-state";
import type { HeroScene } from "./scenes/types";

/** Brand teal #1CB495 as 0–1 RGB. */
const TEAL: readonly [number, number, number] = [28 / 255, 180 / 255, 149 / 255];

export interface EngineOptions {
  /** Imports the scene's shader (its own lazy chunk). */
  readonly loadScene: () => Promise<HeroScene>;
  /** Load and create the renderer the first time this is true (idle, in view, motion allowed). */
  readonly enabled: boolean;
  /** Draw frames while true. */
  readonly running: boolean;
}

const deviceInfo = () => ({
  dpr: window.devicePixelRatio || 1,
  cores: navigator.hardwareConcurrency || 4,
  viewportWidth: window.innerWidth,
});

/**
 * Owns the lazily imported WebGL renderer. Lifecycle is deliberately stable:
 * the chunk is requested once (first time `enabled`), and when it arrives the
 * engine is created if the component is still mounted, whatever `enabled` did
 * meanwhile; `running` then starts and stops it.
 */
export function useSceneEngine(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { loadScene, enabled, running }: EngineOptions,
): EngineStatus {
  const [status, setStatus] = useState<EngineStatus>("idle");
  const engineRef = useRef<SceneRenderer | null>(null);
  const qualityRef = useRef<RenderQuality | null>(null);
  const mountedRef = useRef(false);
  const requestedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Let a StrictMode remount (or a real one) request the engine again.
      requestedRef.current = false;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled || requestedRef.current) return;
    requestedRef.current = true;

    const fail = () => {
      engineRef.current?.destroy();
      engineRef.current = null;
      if (mountedRef.current) setStatus("failed");
    };
    const adapt = (frameTimes: readonly number[]) => {
      const current = qualityRef.current;
      if (!current) return;
      const next = nextQuality(frameTimes, current);
      if (next === "fallback") return fail();
      if (next === current) return;
      qualityRef.current = next;
      engineRef.current?.setQuality(next);
    };

    Promise.all([import("./create-scene-renderer"), loadScene()])
      .then(([{ createSceneRenderer }, scene]) => {
        const canvas = canvasRef.current;
        if (!mountedRef.current || !canvas || engineRef.current) return;
        qualityRef.current = initialQuality(deviceInfo());
        engineRef.current = createSceneRenderer(canvas, {
          scene,
          quality: qualityRef.current,
          color: TEAL,
          allowSoftware: softwareWebGLAllowed(),
          onSample: adapt,
          onFirstFrame: () => setStatus("ready"),
          onContextLost: fail,
        });
        // Draw until the first frame lands; the effect below then applies `running`.
        engineRef.current.setRunning(true);
      })
      .catch(fail);
  }, [enabled, canvasRef, loadScene]);

  useEffect(() => {
    if (status === "ready") engineRef.current?.setRunning(running);
  }, [running, status]);

  return status;
}
