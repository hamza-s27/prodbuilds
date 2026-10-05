export type EngineStatus = "idle" | "ready" | "failed";

/**
 * What the hero shows:
 * - off: motion not allowed (OS setting or footer toggle) → static poster
 * - poster: waiting for idle / view / the WebGL chunk
 * - running | paused: WebGL pillar drawn (paused offscreen, hidden tab or by the visitor)
 * - fallback: no usable WebGL, too slow, or context lost → static poster for good
 */
export type HeroRenderState = "off" | "poster" | "running" | "paused" | "fallback";

export interface RenderStateInput {
  readonly motionAllowed: boolean;
  /** False when WebGL is ruled out before trying (the visitor asked to save data). */
  readonly webglSupported: boolean;
  readonly status: EngineStatus;
  readonly running: boolean;
}

export function deriveRenderState({
  motionAllowed,
  webglSupported,
  status,
  running,
}: RenderStateInput): HeroRenderState {
  if (!motionAllowed) return "off";
  if (!webglSupported || status === "failed") return "fallback";
  if (status === "ready") return running ? "running" : "paused";
  return "poster";
}
