"use client";

import { Pause, Play } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useIdle } from "@/hooks/useIdle";
import { useInView } from "@/hooks/useInView";
import { useMotionAllowed } from "@/hooks/useMotionAllowed";
import { usePageVisible } from "@/hooks/usePageVisible";
import { prefersSavingData } from "@/lib/webgl/capability";
import { deriveRenderState } from "./render-state";
import type { HeroScene } from "./scenes/types";
import { useSceneEngine } from "./use-scene-engine";
import "./hero.css";

const neverChanges = () => () => {};

interface HeroVisualProps {
  /** Imports the scene's shader; a module-level function, so it's stable. */
  readonly loadScene: () => Promise<HeroScene>;
  /** Static picture: shown first, and for good with reduced motion or no WebGL. */
  readonly poster: ReactNode;
}

/**
 * Hero background: the static poster first (also the reduced-motion / no-WebGL
 * fallback), then the WebGL scene once the page is idle and the hero in view.
 * Pauses offscreen, in hidden tabs and on request.
 */
export function HeroVisual({ loadScene, poster }: HeroVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { allowed } = useMotionAllowed();
  const idle = useIdle();
  const inView = useInView(containerRef);
  const pageVisible = usePageVisible();
  // No GL probe here (it would run during hydration): the renderer's own context
  // request, after idle, decides. Only Save-Data rules WebGL out up front.
  const webglSupported = !useSyncExternalStore(neverChanges, prefersSavingData, () => false);
  const [userPaused, setUserPaused] = useState(false);

  const running = allowed && inView && pageVisible && !userPaused;
  const status = useSceneEngine(canvasRef, {
    loadScene,
    enabled: allowed && idle && inView && webglSupported,
    running,
  });
  const renderState = deriveRenderState({ motionAllowed: allowed, webglSupported, status, running });

  // The principle chips live outside this component; let them follow the hero's motion state.
  useEffect(() => {
    containerRef.current?.closest<HTMLElement>("[data-hero]")?.setAttribute("data-hero-motion", renderState);
  }, [renderState]);

  const canPause = allowed && status === "ready";

  return (
    <div ref={containerRef} className="hero-visual" data-render-state={renderState}>
      <div aria-hidden className="hero-visual__layer">
        <div className="hero-poster">{poster}</div>
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-poster__scrim" />
      </div>
      {canPause && (
        <button
          type="button"
          aria-pressed={userPaused}
          onClick={() => setUserPaused((paused) => !paused)}
          className="hero-pause btn-ghost hud"
        >
          {userPaused ? <Play aria-hidden className="size-3" /> : <Pause aria-hidden className="size-3" />}
          {/* Constant label: aria-pressed carries the state. */}
          <span>Pause animation</span>
        </button>
      )}
    </div>
  );
}
