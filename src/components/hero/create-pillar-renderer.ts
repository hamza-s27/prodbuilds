// Loaded with dynamic import() only once the hero is idle, in view and motion
// is allowed, so none of the WebGL code ships in the initial bundle.
import { webglContextAttributes } from "@/lib/webgl/capability";
import { createFullscreenPass, type FullscreenPass } from "@/lib/webgl/fullscreen-pass";
import type { RenderQuality } from "@/lib/webgl/quality";
import { createFrameLoop } from "./frame-loop";
import { PILLAR_FRAGMENT, PILLAR_VERTEX } from "./light-pillar-shaders";

type GL = WebGLRenderingContext | WebGL2RenderingContext;

export interface PillarRendererOptions {
  readonly quality: RenderQuality;
  /** sRGB 0–1. */
  readonly color: readonly [number, number, number];
  /** Pillar position across the canvas, 0–1. */
  readonly pillarX: number;
  /** Tests only: accept software WebGL (headless browsers have no GPU). */
  readonly allowSoftware?: boolean;
  /** Frame times normalised to a 60 fps budget, one window at a time. */
  readonly onSample: (frameTimes: readonly number[]) => void;
  readonly onFirstFrame: () => void;
  readonly onContextLost: () => void;
}

export interface PillarRenderer {
  setRunning(running: boolean): void;
  setQuality(quality: RenderQuality): void;
  destroy(): void;
}

/** Hardware WebGL 2, then 1; throws when only software rendering is on offer. */
function getContext(canvas: HTMLCanvasElement, allowSoftware: boolean): GL {
  const attributes = webglContextAttributes(allowSoftware);
  const gl = canvas.getContext("webgl2", attributes) ?? canvas.getContext("webgl", attributes);
  if (!gl) throw new Error("WebGL unavailable");
  return gl;
}

function releaseContext(gl: GL): void {
  if (!gl.isContextLost()) gl.getExtension("WEBGL_lose_context")?.loseContext();
}

function createPass(gl: GL, options: PillarRendererOptions): FullscreenPass {
  try {
    const pass = createFullscreenPass(gl, PILLAR_VERTEX, PILLAR_FRAGMENT);
    pass.setVec3("uColor", options.color);
    pass.setFloat("uPillarX", options.pillarX);
    pass.setFloat("uIntensity", 1);
    return pass;
  } catch (error) {
    // e.g. highp unsupported on an old mobile GPU: don't leak the context.
    releaseContext(gl);
    throw error;
  }
}

export function createPillarRenderer(
  canvas: HTMLCanvasElement,
  options: PillarRendererOptions,
): PillarRenderer {
  let quality = options.quality;
  const gl = getContext(canvas, options.allowSoftware === true);
  gl.clearColor(0, 0, 0, 0);
  const pass = createPass(gl, options);

  /** Resizing clears the canvas, so redraw: a paused hero must never go blank. */
  function resize() {
    const scale = quality.renderScale * quality.dpr;
    const width = Math.max(1, Math.round(canvas.clientWidth * scale));
    const height = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    pass.setVec2("uResolution", width, height);
    pass.draw();
  }

  const loop = createFrameLoop({
    maxFps: () => quality.maxFps,
    render: (elapsedSeconds) => {
      pass.setFloat("uTime", elapsedSeconds);
      pass.draw();
    },
    onFirstFrame: options.onFirstFrame,
    onSample: options.onSample,
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    options.onContextLost();
  };
  canvas.addEventListener("webglcontextlost", handleContextLost);

  let destroyed = false;
  return {
    setRunning: (running) => (running && !destroyed ? loop.start() : loop.stop()),
    setQuality(next) {
      quality = next;
      loop.resetSamples();
      resize();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      loop.stop();
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      if (!gl.isContextLost()) pass.dispose();
      releaseContext(gl);
    },
  };
}
