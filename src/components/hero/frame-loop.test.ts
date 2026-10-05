import { describe, expect, it, vi } from "vitest";
import { createFrameLoop } from "./frame-loop";

/** Manual rAF: `step(time)` runs the pending callback at that timestamp. */
function manualFrames() {
  let pending: FrameRequestCallback | null = null;
  return {
    requestFrame: vi.fn((callback: FrameRequestCallback) => ((pending = callback), 1)),
    cancelFrame: vi.fn(() => {
      pending = null;
    }),
    step(time: number) {
      const callback = pending;
      pending = null;
      callback?.(time);
    },
    get hasPending() {
      return pending !== null;
    },
  };
}

function setup(maxFps = 60) {
  const frames = manualFrames();
  const render = vi.fn();
  const onFirstFrame = vi.fn();
  const onSample = vi.fn();
  const loop = createFrameLoop({ maxFps: () => maxFps, render, onFirstFrame, onSample, ...frames });
  return { frames, render, onFirstFrame, onSample, loop };
}

describe("createFrameLoop", () => {
  it("renders with elapsed seconds and reports the first frame once", () => {
    const { frames, render, onFirstFrame, loop } = setup();

    loop.start();
    frames.step(1000);
    frames.step(1016);

    expect(render).toHaveBeenNthCalledWith(1, 0);
    expect(render).toHaveBeenNthCalledWith(2, 0.016);
    expect(onFirstFrame).toHaveBeenCalledTimes(1);
  });

  it("skips frames faster than the fps cap", () => {
    const { frames, render, loop } = setup(30);

    loop.start();
    frames.step(1000);
    frames.step(1016);
    frames.step(1034);

    expect(render).toHaveBeenCalledTimes(2);
  });

  it("resumes after a pause without jumping ahead in time", () => {
    const { frames, render, loop } = setup();

    loop.start();
    frames.step(1000);
    frames.step(1016);
    loop.stop();
    loop.start();
    frames.step(9000);

    expect(render).toHaveBeenLastCalledWith(0.016);
  });

  it("clamps long stalls to 100 ms", () => {
    const { frames, render, loop } = setup();

    loop.start();
    frames.step(1000);
    frames.step(3000);

    expect(render).toHaveBeenLastCalledWith(0.1);
  });

  it("reports a window of 60 normalised frame times after warm-up", () => {
    const { frames, onSample, loop } = setup(30);

    loop.start();
    for (let i = 0; i <= 91; i += 1) frames.step(1000 + i * 40);

    expect(onSample).toHaveBeenCalledTimes(1);
    expect(onSample.mock.calls[0][0]).toHaveLength(60);
    expect(onSample.mock.calls[0][0][0]).toBe(20);
  });

  it("stop cancels the pending frame and start is idempotent", () => {
    const { frames, loop } = setup();

    loop.start();
    loop.start();
    expect(frames.requestFrame).toHaveBeenCalledTimes(1);

    loop.stop();
    expect(frames.cancelFrame).toHaveBeenCalledTimes(1);
    expect(frames.hasPending).toBe(false);
  });
});
