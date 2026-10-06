import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSceneRenderer, type SceneRendererOptions } from "./create-scene-renderer";

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
const sceneInit = vi.fn();
const options: SceneRendererOptions = {
  scene: { fragment: "void main() {}", init: sceneInit },
  quality: { dpr: 1, renderScale: 0.5, maxFps: 60 },
  color: [0.1, 0.7, 0.6],
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

describe("createSceneRenderer", () => {
  it("sets the scene's own uniforms once the program is ready", () => {
    createSceneRenderer(canvasWith(gl), options);

    expect(sceneInit).toHaveBeenCalledTimes(1);
    expect(sceneInit).toHaveBeenCalledWith(expect.objectContaining({ setFloat: expect.any(Function) }));
  });

  it("sizes the drawing buffer to the render scale and draws straight away", () => {
    const canvas = canvasWith(gl);

    createSceneRenderer(canvas, options);

    expect([canvas.width, canvas.height]).toEqual([400, 300]);
    expect(gl.viewport).toHaveBeenLastCalledWith(0, 0, 400, 300);
    expect(gl.drawArrays).toHaveBeenCalledTimes(1);
  });

  it("redraws on resize even while paused, so the hero never goes blank", () => {
    createSceneRenderer(canvasWith(gl), options);

    resizeCallback();

    expect(gl.drawArrays).toHaveBeenCalledTimes(2);
  });

  it("asks for hardware WebGL only, unless software is explicitly allowed", () => {
    const canvas = canvasWith(gl);

    createSceneRenderer(canvas, options);

    expect(canvas.getContext).toHaveBeenCalledWith(
      "webgl2",
      expect.objectContaining({ failIfMajorPerformanceCaveat: true }),
    );
  });

  it("throws when no hardware context is available", () => {
    expect(() => createSceneRenderer(canvasWith(null), options)).toThrow("WebGL unavailable");
  });

  it("forwards context loss and destroys only once", () => {
    const canvas = canvasWith(gl);
    const renderer = createSceneRenderer(canvas, options);

    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
    renderer.destroy();
    renderer.destroy();

    expect(options.onContextLost).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it("does not lose an already-lost context again", () => {
    const renderer = createSceneRenderer(canvasWith(gl), options);
    lost = true;

    renderer.destroy();

    expect(loseContext).not.toHaveBeenCalled();
  });
});
