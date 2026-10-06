import { describe, expect, it, vi } from "vitest";
import { animateProgress } from "./timeline";

/** A manual frame queue: tick(time) runs the pending callback at that timestamp. */
function fakeFrames() {
  let pending: FrameRequestCallback | null = null;
  return {
    requestFrame: vi.fn((callback: FrameRequestCallback) => {
      pending = callback;
      return 1;
    }),
    cancelFrame: vi.fn(() => {
      pending = null;
    }),
    tick(time: number) {
      const callback = pending;
      pending = null;
      callback?.(time);
    },
    get pending() {
      return pending !== null;
    },
  };
}

describe("animateProgress", () => {
  it("reports progress from 0 to 1 over the duration, then finishes once", () => {
    const frames = fakeFrames();
    const onFrame = vi.fn();
    const onDone = vi.fn();

    animateProgress({ durationMs: 1000, onFrame, onDone, ...frames });
    frames.tick(500);
    frames.tick(1000);
    frames.tick(1500);
    frames.tick(2000);

    expect(onFrame.mock.calls.map(([progress]) => progress)).toEqual([0, 0.5, 1]);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(frames.pending).toBe(false);
  });

  it("stops when cancelled", () => {
    const frames = fakeFrames();
    const onFrame = vi.fn();

    const cancel = animateProgress({ durationMs: 1000, onFrame, ...frames });
    frames.tick(0);
    cancel();
    frames.tick(500);

    expect(onFrame).toHaveBeenCalledTimes(1);
    expect(frames.cancelFrame).toHaveBeenCalled();
  });

  it("uses requestAnimationFrame by default", () => {
    const raf = vi.fn(() => 7);
    const caf = vi.fn();
    vi.stubGlobal("requestAnimationFrame", raf);
    vi.stubGlobal("cancelAnimationFrame", caf);

    animateProgress({ durationMs: 100, onFrame: () => {} })();

    expect(raf).toHaveBeenCalledTimes(1);
    expect(caf).toHaveBeenCalledWith(7);
    vi.unstubAllGlobals();
  });
});
