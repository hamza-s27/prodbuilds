export interface RenderQuality {
  /** Device pixel ratio cap. */
  readonly dpr: number;
  /** Fraction of the CSS size the canvas renders at (upscaled by the browser). */
  readonly renderScale: number;
  readonly maxFps: 30 | 60;
}

export interface DeviceInfo {
  readonly dpr: number;
  readonly cores: number;
  readonly viewportWidth: number;
}

const PHONE_MAX_WIDTH = 767;
const LOW_CORE_COUNT = 4;
const SLOW_FRAME_MS = 20;
const UNUSABLE_FRAME_MS = 33;
const SCALE_STEP = 0.15;
const MIN_SCALE = 0.4;

export function initialQuality({ dpr, cores, viewportWidth }: DeviceInfo): RenderQuality {
  const isLowEnd = cores <= LOW_CORE_COUNT;
  return {
    dpr: Math.min(dpr, viewportWidth <= PHONE_MAX_WIDTH ? 1 : 1.5),
    renderScale: isLowEnd ? 0.5 : 0.75,
    maxFps: isLowEnd ? 30 : 60,
  };
}

const average = (values: readonly number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;
const roundScale = (scale: number) => Math.round(scale * 100) / 100;

/**
 * Adapts quality from a window of frame times (ms): lower the render scale when
 * frames are slow, and give up for the static poster when even the minimum is too slow.
 */
export function nextQuality(
  frameTimes: readonly number[],
  current: RenderQuality,
): RenderQuality | "fallback" {
  if (frameTimes.length === 0) return current;
  const avg = average(frameTimes);
  const atMinimum = current.renderScale <= MIN_SCALE;
  if (atMinimum && avg > UNUSABLE_FRAME_MS) return "fallback";
  if (avg <= SLOW_FRAME_MS || atMinimum) return current;
  return { ...current, renderScale: roundScale(Math.max(MIN_SCALE, current.renderScale - SCALE_STEP)) };
}
