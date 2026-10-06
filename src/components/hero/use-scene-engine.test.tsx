import { act, renderHook, waitFor } from "@testing-library/react";
import { createRef, StrictMode, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SceneRendererOptions } from "./create-scene-renderer";
import type { HeroScene } from "./scenes/types";
import { useSceneEngine } from "./use-scene-engine";

const engine = { setRunning: vi.fn(), setQuality: vi.fn(), destroy: vi.fn() };
const createSceneRenderer = vi.fn<
  (canvas: HTMLCanvasElement, options: SceneRendererOptions) => typeof engine
>(() => engine);

vi.mock("./create-scene-renderer", () => ({
  createSceneRenderer: (canvas: HTMLCanvasElement, options: SceneRendererOptions) =>
    createSceneRenderer(canvas, options),
}));

const scene: HeroScene = { fragment: "void main() {}" };
const loadScene = () => Promise.resolve(scene);

const canvasRef = () => {
  const ref = createRef<HTMLCanvasElement>() as { current: HTMLCanvasElement | null };
  ref.current = document.createElement("canvas");
  return ref;
};
const lastOptions = () => createSceneRenderer.mock.calls.at(-1)![1];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSceneEngine", () => {
  it("hands the loaded scene to the renderer", async () => {
    renderHook(() => useSceneEngine(canvasRef(), { loadScene, enabled: true, running: true }));

    await waitFor(() => expect(createSceneRenderer).toHaveBeenCalledTimes(1));
    expect(lastOptions().scene).toBe(scene);
  });

  it("fails over when the scene's chunk can't load", async () => {
    const failing = () => Promise.reject(new Error("chunk failed"));
    const { result } = renderHook(() =>
      useSceneEngine(canvasRef(), { loadScene: failing, enabled: true, running: true }),
    );

    await waitFor(() => expect(result.current).toBe("failed"));
  });

  it("does nothing until enabled", () => {
    renderHook(() => useSceneEngine(canvasRef(), { loadScene, enabled: false, running: true }));

    expect(createSceneRenderer).not.toHaveBeenCalled();
  });

  it("creates the engine once and becomes ready on the first frame", async () => {
    const { result } = renderHook(() =>
      useSceneEngine(canvasRef(), { loadScene, enabled: true, running: true }),
    );

    await waitFor(() => expect(createSceneRenderer).toHaveBeenCalledTimes(1));
    expect(result.current).toBe("idle");
    act(() => lastOptions().onFirstFrame());
    expect(result.current).toBe("ready");
  });

  it("still creates the engine when enabled flaps while the chunk downloads", async () => {
    const ref = canvasRef();
    const { rerender } = renderHook(
      ({ enabled }) => useSceneEngine(ref, { loadScene, enabled, running: true }),
      {
        initialProps: { enabled: true },
      },
    );

    rerender({ enabled: false });
    rerender({ enabled: true });

    await waitFor(() => expect(createSceneRenderer).toHaveBeenCalledTimes(1));
  });

  it("does not create an engine after unmounting mid-download", async () => {
    const { unmount } = renderHook(() =>
      useSceneEngine(canvasRef(), { loadScene, enabled: true, running: true }),
    );

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(createSceneRenderer).not.toHaveBeenCalled();
  });

  it("survives a StrictMode double mount with exactly one live engine", async () => {
    const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;
    renderHook(() => useSceneEngine(canvasRef(), { loadScene, enabled: true, running: true }), { wrapper });

    await waitFor(() => expect(createSceneRenderer).toHaveBeenCalledTimes(1));
    expect(engine.destroy).not.toHaveBeenCalled();
  });

  it("follows `running` once ready, and destroys the engine on unmount", async () => {
    const ref = canvasRef();
    const { rerender, unmount } = renderHook(
      ({ running }) => useSceneEngine(ref, { loadScene, enabled: true, running }),
      {
        initialProps: { running: true },
      },
    );
    await waitFor(() => expect(createSceneRenderer).toHaveBeenCalled());
    act(() => lastOptions().onFirstFrame());

    rerender({ running: false });
    expect(engine.setRunning).toHaveBeenLastCalledWith(false);

    unmount();
    expect(engine.destroy).toHaveBeenCalledTimes(1);
  });

  it("fails over to the poster when frames stay too slow", async () => {
    const { result } = renderHook(() =>
      useSceneEngine(canvasRef(), { loadScene, enabled: true, running: true }),
    );
    await waitFor(() => expect(createSceneRenderer).toHaveBeenCalled());
    const { onSample, onFirstFrame } = lastOptions();
    act(() => onFirstFrame());

    act(() => {
      for (let i = 0; i < 4; i += 1) onSample(Array(60).fill(50));
    });

    expect(result.current).toBe("failed");
    expect(engine.destroy).toHaveBeenCalled();
  });

  it("fails over when the renderer cannot start (no hardware WebGL)", async () => {
    createSceneRenderer.mockImplementationOnce(() => {
      throw new Error("WebGL unavailable");
    });

    const { result } = renderHook(() =>
      useSceneEngine(canvasRef(), { loadScene, enabled: true, running: true }),
    );

    await waitFor(() => expect(result.current).toBe("failed"));
  });
});
