import { act, render, renderHook, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeMotionPreference } from "@/lib/motion/motion-preference";
import { useIdle } from "./useIdle";
import { useInView } from "./useInView";
import { useMotionAllowed } from "./useMotionAllowed";
import { usePageVisible } from "./usePageVisible";

function mockReducedMotion(matches: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches,
    addEventListener: (_: string, l: () => void) => listeners.add(l),
    removeEventListener: (_: string, l: () => void) => listeners.delete(l),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => query),
  );
  return {
    set(next: boolean) {
      query.matches = next;
      listeners.forEach((l) => l());
    },
  };
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.motion;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useMotionAllowed", () => {
  it("allows motion by default", () => {
    mockReducedMotion(false);

    expect(renderHook(() => useMotionAllowed()).result.current).toMatchObject({
      allowed: true,
      systemReduced: false,
      preference: "on",
    });
  });

  it("respects the OS reduced-motion setting, live", () => {
    const media = mockReducedMotion(false);
    const { result } = renderHook(() => useMotionAllowed());

    act(() => media.set(true));

    expect(result.current).toMatchObject({ allowed: false, systemReduced: true });
  });

  it("respects the visitor's toggle", () => {
    mockReducedMotion(false);
    const { result } = renderHook(() => useMotionAllowed());

    act(() => result.current.setPreference("off"));

    expect(result.current).toMatchObject({ allowed: false, preference: "off" });
  });

  it("picks up a preference written elsewhere", () => {
    mockReducedMotion(false);
    const { result } = renderHook(() => useMotionAllowed());

    act(() => writeMotionPreference("off"));

    expect(result.current.allowed).toBe(false);
  });
});

describe("useIdle", () => {
  it("turns true once the browser is idle", () => {
    let idleCallback: () => void = () => {};
    vi.stubGlobal(
      "requestIdleCallback",
      vi.fn((cb: () => void) => ((idleCallback = cb), 1)),
    );
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    const { result } = renderHook(() => useIdle());

    expect(result.current).toBe(false);
    act(() => idleCallback());
    expect(result.current).toBe(true);
  });

  it("falls back to a timeout where requestIdleCallback is missing (Safari)", () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestIdleCallback", undefined);
    const { result } = renderHook(() => useIdle(500));

    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe(true);
  });
});

describe("useInView", () => {
  it("tracks intersection and disconnects on unmount", () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(function (this: unknown, cb: typeof callback) {
        callback = cb;
        return { observe: vi.fn(), disconnect };
      }),
    );
    function Probe() {
      const ref = useRef<HTMLDivElement>(null);
      const inView = useInView(ref);
      return <div ref={ref}>{inView ? "in" : "out"}</div>;
    }
    const { unmount } = render(<Probe />);

    expect(screen.getByText("out")).toBeInTheDocument();
    act(() => callback([{ isIntersecting: true }]));
    expect(screen.getByText("in")).toBeInTheDocument();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});

describe("usePageVisible", () => {
  it("follows document.visibilityState", () => {
    let state: DocumentVisibilityState = "visible";
    vi.spyOn(document, "visibilityState", "get").mockImplementation(() => state);
    const { result } = renderHook(() => usePageVisible());

    act(() => {
      state = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(result.current).toBe(false);
  });
});
