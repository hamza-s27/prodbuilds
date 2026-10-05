import { act, renderHook, waitFor } from "@testing-library/react";
import { createRef, StrictMode, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PillarRendererOptions } from "./create-pillar-renderer";
import { usePillarEngine } from "./use-pillar-engine";

const engine = { setRunning: vi.fn(), setQuality: vi.fn(), destroy: vi.fn() };
const createPillarRenderer = vi.fn<
  (canvas: HTMLCanvasElement, options: PillarRendererOptions) => typeof engine
>(() => engine);

vi.mock("./create-pillar-renderer", () => ({
  createPillarRenderer: (canvas: HTMLCanvasElement, options: PillarRendererOptions) =>
    createPillarRenderer(canvas, options),
}));

const canvasRef = () => {
  const ref = createRef<HTMLCanvasElement>() as { current: HTMLCanvasElement | null };
  ref.current = document.createElement("canvas");
  return ref;
};
const lastOptions = () => createPillarRenderer.mock.calls.at(-1)![1];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePillarEngine", () => {
  it("does nothing until enabled", () => {
    renderHook(() => usePillarEngine(canvasRef(), { enabled: false, running: true }));

    expect(createPillarRenderer).not.toHaveBeenCalled();
  });

  it("creates the engine once and becomes ready on the first frame", async () => {
    const { result } = renderHook(() => usePillarEngine(canvasRef(), { enabled: true, running: true }));

    await waitFor(() => expect(createPillarRenderer).toHaveBeenCalledTimes(1));
    expect(result.current).toBe("idle");
    act(() => lastOptions().onFirstFrame());
    expect(result.current).toBe("ready");
  });

  it("still creates the engine when enabled flaps while the chunk downloads", async () => {
    const ref = canvasRef();
    const { rerender } = renderHook(({ enabled }) => usePillarEngine(ref, { enabled, running: true }), {
      initialProps: { enabled: true },
    });

    rerender({ enabled: false });
    rerender({ enabled: true });

    await waitFor(() => expect(createPillarRenderer).toHaveBeenCalledTimes(1));
  });

  it("does not create an engine after unmounting mid-download", async () => {
    const { unmount } = renderHook(() => usePillarEngine(canvasRef(), { enabled: true, running: true }));

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createPillarRenderer).not.toHaveBeenCalled();
  });

  it("survives a StrictMode double mount with exactly one live engine", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;
    renderHook(() => usePillarEngine(canvasRef(), { enabled: true, running: true }), { wrapper });

    await waitFor(() => expect(createPillarRenderer).toHaveBeenCalledTimes(1));
    expect(engine.destroy).not.toHaveBeenCalled();
  });

  it("follows `running` once ready, and destroys the engine on unmount", async () => {
    const ref = canvasRef();
    const { rerender, unmount } = renderHook(
      ({ running }) => usePillarEngine(ref, { enabled: true, running }),
      {
        initialProps: { running: true },
      },
    );
    await waitFor(() => expect(createPillarRenderer).toHaveBeenCalled());
    act(() => lastOptions().onFirstFrame());

    rerender({ running: false });
    expect(engine.setRunning).toHaveBeenLastCalledWith(false);

    unmount();
    expect(engine.destroy).toHaveBeenCalledTimes(1);
  });

  it("fails over to the poster when frames stay too slow", async () => {
    const { result } = renderHook(() => usePillarEngine(canvasRef(), { enabled: true, running: true }));
    await waitFor(() => expect(createPillarRenderer).toHaveBeenCalled());
    const { onSample, onFirstFrame } = lastOptions();
    act(() => onFirstFrame());

    act(() => {
      for (let i = 0; i < 4; i += 1) onSample(Array(60).fill(50));
    });

    expect(result.current).toBe("failed");
    expect(engine.destroy).toHaveBeenCalled();
  });

  it("fails over when the renderer cannot start (no hardware WebGL)", async () => {
    createPillarRenderer.mockImplementationOnce(() => {
      throw new Error("WebGL unavailable");
    });

    const { result } = renderHook(() => usePillarEngine(canvasRef(), { enabled: true, running: true }));

    await waitFor(() => expect(result.current).toBe("failed"));
  });
});
