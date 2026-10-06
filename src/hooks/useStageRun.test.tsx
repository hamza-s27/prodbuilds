import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeMotionPreference } from "@/lib/motion/motion-preference";
import { useStageRun } from "./useStageRun";

let report: (indexes: number[]) => void = () => {};

function list(count: number) {
  const element = document.createElement("ol");
  for (let i = 0; i < count; i += 1) element.appendChild(document.createElement("li"));
  return { current: element };
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  delete document.documentElement.dataset.motion;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (this: unknown, callback: IntersectionObserverCallback) {
      let targets: Element[] = [];
      report = (indexes) =>
        act(() =>
          callback(
            indexes.map(
              (i) => ({ target: targets[i], isIntersecting: true }) as unknown as IntersectionObserverEntry,
            ),
            this as IntersectionObserver,
          ),
        );
      return {
        observe: (target: Element) => (targets = [...targets, target]),
        disconnect: vi.fn(),
      };
    }),
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useStageRun", () => {
  it("is static until the first report, then queues unseen stages", () => {
    const ref = list(3);
    const { result } = renderHook(() => useStageRun(ref, 3, 500));
    expect(result.current).toBeNull();

    report([]);

    expect(result.current).toEqual(["queued", "queued", "queued"]);
  });

  it("runs stages in order, but waits for each to be seen", () => {
    const ref = list(3);
    const { result } = renderHook(() => useStageRun(ref, 3, 500));

    report([0]);
    expect(result.current).toEqual(["running", "queued", "queued"]);
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toEqual(["passed", "queued", "queued"]);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current).toEqual(["passed", "queued", "queued"]);

    report([1, 2]);
    expect(result.current).toEqual(["passed", "running", "queued"]);
    // Each stage's timer starts after the previous one has rendered as passed.
    act(() => vi.advanceTimersByTime(500));
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBeNull();
  });

  it("counts stages skipped past (a fast scroll or a jump) as seen", () => {
    const ref = list(3);
    const { result } = renderHook(() => useStageRun(ref, 3, 500));

    report([2]);

    expect(result.current).toEqual(["running", "queued", "queued"]);
    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toEqual(["passed", "running", "queued"]);
  });

  it("stays static with motion off", () => {
    writeMotionPreference("off");
    const { result } = renderHook(() => useStageRun(list(3), 3, 500));

    expect(IntersectionObserver).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });
});
