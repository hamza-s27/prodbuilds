import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeMotionPreference } from "@/lib/motion/motion-preference";
import { useDecryptedText } from "./useDecryptedText";

let frame: FrameRequestCallback | null = null;
const runFrame = (time: number) => {
  const callback = frame;
  frame = null;
  act(() => callback?.(time));
};

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.motion;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useDecryptedText", () => {
  it("scrambles, then settles on the new text when it changes", () => {
    const { result, rerender } = renderHook(({ text }) => useDecryptedText(text, true, 400), {
      initialProps: { text: "L0 · Surface" },
    });
    runFrame(0);
    runFrame(400);
    expect(result.current).toBe("L0 · Surface");

    rerender({ text: "L1 · Interface" });
    runFrame(1000);
    runFrame(1100);
    expect(result.current).not.toBe("L1 · Interface");
    expect(result.current).toHaveLength("L1 · Interface".length);

    runFrame(1400);
    expect(result.current).toBe("L1 · Interface");
  });

  it("never flashes the plain new text before its first frame", () => {
    const { result, rerender } = renderHook(({ text }) => useDecryptedText(text, true, 400), {
      initialProps: { text: "Surface" },
    });
    runFrame(0);
    runFrame(400);

    rerender({ text: "Interface" });

    expect(result.current).not.toBe("Interface");
    expect(result.current).toHaveLength("Interface".length);
  });

  it("is the plain text while disabled", () => {
    const { result } = renderHook(() => useDecryptedText("Cloud", false));

    expect(result.current).toBe("Cloud");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("is always the plain text with motion off", () => {
    writeMotionPreference("off");
    const { result, rerender } = renderHook(({ text }) => useDecryptedText(text), {
      initialProps: { text: "a" },
    });

    rerender({ text: "Cloud" });

    expect(result.current).toBe("Cloud");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
