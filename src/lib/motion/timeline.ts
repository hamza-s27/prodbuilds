// One-shot progress animation on requestAnimationFrame: progress runs 0 → 1
// over the duration, measured from the first frame.

export interface ProgressAnimation {
  readonly durationMs: number;
  readonly onFrame: (progress: number) => void;
  readonly onDone?: () => void;
  readonly requestFrame?: (callback: FrameRequestCallback) => number;
  readonly cancelFrame?: (handle: number) => void;
}

/** Starts the animation; returns a function that cancels it. */
export function animateProgress({
  durationMs,
  onFrame,
  onDone,
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (handle) => cancelAnimationFrame(handle),
}: ProgressAnimation): () => void {
  let startTime: number | null = null;

  function step(time: number) {
    startTime ??= time;
    const progress = Math.min(1, (time - startTime) / durationMs);
    onFrame(progress);
    if (progress < 1) handle = requestFrame(step);
    else onDone?.();
  }

  let handle = requestFrame(step);
  return () => cancelFrame(handle);
}
