import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeMotionPreference } from "@/lib/motion/motion-preference";
import { usePlayOnView, usePlayProgress } from "./usePlayProgress";

let intersect: (isIntersecting: boolean) => void = () => {};
let reportAll: (states: boolean[]) => void = () => {};
const disconnect = vi.fn();
let frame: FrameRequestCallback | null = null;

function element() {
  return { current: document.createElement("div") };
}

function runFrame(time: number) {
  const callback = frame;
  frame = null;
  act(() => callback?.(time));
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.motion;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (this: unknown, callback: IntersectionObserverCallback) {
      reportAll = (states) =>
        callback(
          states.map((isIntersecting) => ({ isIntersecting }) as IntersectionObserverEntry),
          this as IntersectionObserver,
        );
      intersect = (isIntersecting) => act(() => reportAll([isIntersecting]));
      return { observe: vi.fn(), disconnect };
    }),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn(() => {
      frame = null;
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  disconnect.mockClear();
});

describe("usePlayOnView", () => {
  it("stays static until the first intersection report", () => {
    const { result } = renderHook(() => usePlayOnView(element()));

    expect(result.current).toBe("static");
  });

  it("arms offscreen, plays once seen and stops observing", () => {
    const ref = element();
    const { result } = renderHook(() => usePlayOnView(ref));

    intersect(false);
    expect(result.current).toBe("armed");
    intersect(true);
    expect(result.current).toBe("play");
    expect(disconnect).toHaveBeenCalled();
  });

  it("stays static with the motion toggle off", () => {
    writeMotionPreference("off");
    const { result } = renderHook(() => usePlayOnView(element()));

    expect(IntersectionObserver).not.toHaveBeenCalled();
    expect(result.current).toBe("static");
  });
});

describe("usePlayProgress", () => {
  it("shows the start while armed, runs once seen, then settles on the final state", () => {
    const ref = element();
    const { result } = renderHook(() => usePlayProgress(ref, 1000));

    expect(result.current).toBeNull();
    intersect(false);
    expect(result.current).toBe(0);

    intersect(true);
    runFrame(0);
    runFrame(500);
    expect(result.current).toBe(0.5);

    runFrame(1000);
    expect(result.current).toBeNull();
  });

  it("drops to the final state when motion is switched off mid-run", () => {
    const ref = element();
    const { result } = renderHook(() => usePlayProgress(ref, 1000));
    intersect(true);
    runFrame(0);

    act(() => writeMotionPreference("off"));

    expect(result.current).toBeNull();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("restarts from the beginning, not a stale frame, when motion comes back on", () => {
    const ref = element();
    const { result } = renderHook(() => usePlayProgress(ref, 1000));
    intersect(true);
    runFrame(0);
    runFrame(600);

    act(() => writeMotionPreference("off"));
    act(() => writeMotionPreference("on"));

    expect(result.current).toBe(0);
  });

  it("acts on the latest of several queued intersection reports", () => {
    const ref = element();
    const { result } = renderHook(() => usePlayOnView(ref));

    act(() => reportAll([false, true]));

    expect(result.current).toBe("play");
  });
});
