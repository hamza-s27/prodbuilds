import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollSpy } from "./useScrollSpy";

const callbacks: IntersectionObserverCallback[] = [];
const tops: Record<string, number> = {};

function layout(next: Record<string, number>) {
  Object.assign(tops, next);
}

/** Fire every observer, as when something crosses a band edge. */
function trigger(footerVisible = false) {
  act(() =>
    callbacks.forEach((callback) =>
      callback([{ isIntersecting: footerVisible } as IntersectionObserverEntry], {} as IntersectionObserver),
    ),
  );
}

beforeEach(() => {
  callbacks.length = 0;
  document.body.innerHTML = '<h2 id="a"></h2><h2 id="b"></h2><h2 id="c"></h2><footer></footer>';
  for (const id of ["a", "b", "c"]) {
    document.getElementById(id)!.getBoundingClientRect = () => ({ top: tops[id] ?? 0 }) as DOMRect;
  }
  vi.stubGlobal("innerHeight", 1000);
  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn(function (callback: IntersectionObserverCallback) {
      callbacks.push(callback);
      return { observe: vi.fn(), disconnect: vi.fn() };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useScrollSpy", () => {
  it("marks the last heading that reached the top 30%", () => {
    const { result } = renderHook(() => useScrollSpy(["a", "b", "c"]));

    layout({ a: -400, b: 250, c: 900 });
    trigger();

    expect(result.current).toBe("b");
  });

  it("recovers after an instant jump back to the top", () => {
    const { result } = renderHook(() => useScrollSpy(["a", "b", "c"]));
    layout({ a: -2000, b: -1000, c: 100 });
    trigger();
    expect(result.current).toBe("c");

    layout({ a: 200, b: 1200, c: 2200 });
    trigger();

    expect(result.current).toBe("a");
  });

  it("reaches a short last section at the end of the page", () => {
    const { result } = renderHook(() => useScrollSpy(["a", "b", "c"]));

    layout({ a: -1500, b: -300, c: 600 });
    trigger(true);

    expect(result.current).toBe("c");
  });

  it("does nothing while disabled", () => {
    const { result } = renderHook(() => useScrollSpy(["a", "b"], false));

    expect(IntersectionObserver).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });
});
