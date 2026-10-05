import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPillarRenderer, type PillarRendererOptions } from "./create-pillar-renderer";

const loseContext = vi.fn();
let lost = false;
const gl = {
  VERTEX_SHADER: 1,
  FRAGMENT_SHADER: 2,
  COMPILE_STATUS: 3,
  LINK_STATUS: 4,
  ARRAY_BUFFER: 5,
  STATIC_DRAW: 6,
  FLOAT: 7,
  TRIANGLES: 8,
  COLOR_BUFFER_BIT: 9,
  createShader: () => ({}),
  shaderSource: () => {},
  compileShader: () => {},
  getShaderParameter: () => true,
  getShaderInfoLog: () => "",
  deleteShader: () => {},
  createProgram: () => ({}),
  attachShader: () => {},
  linkProgram: () => {},
  getProgramParameter: () => true,
  getProgramInfoLog: () => "",
  createBuffer: () => ({}),
  bindBuffer: () => {},
  bufferData: () => {},
  getAttribLocation: () => 0,
  useProgram: () => {},
  enableVertexAttribArray: () => {},
  vertexAttribPointer: () => {},
  getUniformLocation: () => ({}),
  uniform1f: () => {},
  uniform2f: () => {},
  uniform3f: () => {},
  clear: () => {},
  clearColor: () => {},
  viewport: vi.fn(),
  drawArrays: vi.fn(),
  deleteBuffer: () => {},
  deleteProgram: () => {},
  isContextLost: () => lost,
  getExtension: () => ({ loseContext }),
};

let resizeCallback: () => void = () => {};
const options: PillarRendererOptions = {
  quality: { dpr: 1, renderScale: 0.5, maxFps: 60 },
  color: [0.1, 0.7, 0.6],
  pillarX: 0.5,
  onSample: () => {},
  onFirstFrame: () => {},
  onContextLost: vi.fn(),
};

function canvasWith(context: unknown) {
  const canvas = document.createElement("canvas");
  Object.defineProperty(canvas, "clientWidth", { value: 800 });
  Object.defineProperty(canvas, "clientHeight", { value: 600 });
  vi.spyOn(canvas, "getContext").mockImplementation((() => context) as typeof canvas.getContext);
  return canvas;
}

beforeEach(() => {
  lost = false;
  vi.clearAllMocks();
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn(function (this: unknown, callback: () => void) {
      resizeCallback = callback;
      return { observe: vi.fn(), disconnect: vi.fn() };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createPillarRenderer", () => {
  it("sizes the drawing buffer to the render scale and draws straight away", () => {
    const canvas = canvasWith(gl);

    createPillarRenderer(canvas, options);

    expect([canvas.width, canvas.height]).toEqual([400, 300]);
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 400, 300);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it("redraws on resize even while paused, so the hero never goes blank", () => {
    createPillarRenderer(canvasWith(gl), options);

    resizeCallback();

    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it("asks for hardware WebGL only, unless software is explicitly allowed", () => {
    const canvas = canvasWith(gl);

    createPillarRenderer(canvas, options);

    expect(canvas.getContext).toHaveBeenCalledWith(
      "webgl2",
      expect.objectContaining({ failIfMajorPerformanceCaveat: true }),
    );
  });

  it("throws when no hardware context is available", () => {
    expect(() => createPillarRenderer(canvasWith(null), options)).toThrow("WebGL unavailable");
  });

  it("forwards context loss and destroys only once", () => {
    const canvas = canvasWith(gl);
    const renderer = createPillarRenderer(canvas, options);

    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    renderer.destroy();
    renderer.destroy();

    expect(options.onContextLost).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it("does not lose an already-lost context again", () => {
    const renderer = createPillarRenderer(canvasWith(gl), options);
    lost = true;

    renderer.destroy();

    expect(loseContext).not.toHaveBeenCalled();
  });
});
