import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("follows the query live", () => {
    const listeners = new Set<() => void>();
    const list = {
      matches: false,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    };
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => list),
    );
    const { result, unmount } = renderHook(() => useMediaQuery("(min-width: 64rem)"));
    expect(result.current).toBe(false);

    list.matches = true;
    act(() => listeners.forEach((listener) => listener()));
    expect(result.current).toBe(true);

    unmount();
    expect(listeners.size).toBe(0);
  });
});
