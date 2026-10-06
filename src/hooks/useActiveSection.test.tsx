import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useActiveSection } from "./useActiveSection";

type Report = (changes: Record<string, boolean>) => void;
let report: Report = () => {};
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  document.body.innerHTML = '<section id="a"></section><section id="b"></section>';
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (this: unknown, callback: IntersectionObserverCallback) {
      report = (changes) =>
        act(() =>
          callback(
            Object.entries(changes).map(
              ([id, isIntersecting]) =>
                ({
                  target: document.getElementById(id)!,
                  isIntersecting,
                }) as unknown as IntersectionObserverEntry,
            ),
            this as IntersectionObserver,
          ),
        );
      return { observe, disconnect };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  observe.mockClear();
  disconnect.mockClear();
});

describe("useActiveSection", () => {
  it("observes every section on a line 30% down the viewport", () => {
    renderHook(() => useActiveSection(["a", "b"]));

    expect(observe).toHaveBeenCalledTimes(2);
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: "-30% 0px -70% 0px",
    });
  });

  it("keeps one observer across renders with an equal (but new) ids array", () => {
    const { rerender } = renderHook(({ ids }) => useActiveSection(ids), {
      initialProps: { ids: ["a", "b"] },
    });

    rerender({ ids: ["a", "b"] });

    expect(IntersectionObserver).toHaveBeenCalledTimes(1);
  });

  it("does nothing while disabled, and forgets the active section when disabled", () => {
    const { result, rerender } = renderHook(({ enabled }) => useActiveSection(["a", "b"], enabled), {
      initialProps: { enabled: false },
    });
    expect(IntersectionObserver).not.toHaveBeenCalled();

    rerender({ enabled: true });
    report({ a: true });
    expect(result.current).toBe("a");

    rerender({ enabled: false });
    expect(result.current).toBeNull();
    expect(disconnect).toHaveBeenCalled();
  });

  it("tracks which section crosses the centre as reports arrive", () => {
    const { result } = renderHook(() => useActiveSection(["a", "b"]));
    expect(result.current).toBeNull();

    report({ a: true });
    expect(result.current).toBe("a");
    report({ b: true, a: false });
    expect(result.current).toBe("b");
    report({ b: false });
    expect(result.current).toBeNull();
  });

  it("disconnects on unmount", () => {
    const { unmount } = renderHook(() => useActiveSection(["a", "b"]));

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
