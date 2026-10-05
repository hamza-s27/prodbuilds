// requestAnimationFrame loop with an fps cap, pause-safe elapsed time and
// frame-time sampling for adaptive quality.

const SAMPLE_WINDOW = 60;
const WARMUP_FRAMES = 30;
/** Longest step fed to the animation, so a stalled tab doesn't jump ahead. */
const MAX_STEP_MS = 100;

export interface FrameLoopOptions {
  readonly maxFps: () => number;
  readonly render: (elapsedSeconds: number) => void;
  readonly onFirstFrame: () => void;
  /** Frame times normalised to a 60 fps budget, one window at a time. */
  readonly onSample: (frameTimes: readonly number[]) => void;
  readonly requestFrame?: (callback: FrameRequestCallback) => number;
  readonly cancelFrame?: (handle: number) => void;
}

export interface FrameLoop {
  start(): void;
  stop(): void;
  resetSamples(): void;
}

export function createFrameLoop({
  maxFps,
  render,
  onFirstFrame,
  onSample,
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (handle) => cancelAnimationFrame(handle),
}: FrameLoopOptions): FrameLoop {
  let handle = 0;
  let lastTime = 0;
  let elapsedMs = 0;
  let renderedFrames = 0;
  let samples: readonly number[] = [];

  function record(delta: number, fps: number) {
    if (renderedFrames <= WARMUP_FRAMES || delta === 0) return;
    samples = [...samples, (delta * fps) / 60];
    if (samples.length < SAMPLE_WINDOW) return;
    onSample(samples);
    samples = [];
  }

  function tick(now: number) {
    handle = requestFrame(tick);
    const fps = maxFps();
    const delta = lastTime === 0 ? 0 : now - lastTime;
    if (lastTime !== 0 && delta < 1000 / fps - 1) return;
    lastTime = now;
    elapsedMs += Math.min(delta, MAX_STEP_MS);
    render(elapsedMs / 1000);
    renderedFrames += 1;
    if (renderedFrames === 1) onFirstFrame();
    record(delta, fps);
  }

  return {
    start() {
      if (handle !== 0) return;
      // Resume without a time jump: the first frame after a pause has delta 0.
      lastTime = 0;
      handle = requestFrame(tick);
    },
    stop() {
      if (handle === 0) return;
      cancelFrame(handle);
      handle = 0;
    },
    resetSamples() {
      samples = [];
    },
  };
}
