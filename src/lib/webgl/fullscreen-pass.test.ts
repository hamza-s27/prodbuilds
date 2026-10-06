import { describe, expect, it, vi } from "vitest";
import { createFullscreenPass } from "./fullscreen-pass";

interface FakeOptions {
  readonly compileOk?: boolean;
  readonly linkOk?: boolean;
}

/** Records WebGL calls; just enough of the API for a fullscreen pass. */
function fakeGl({ compileOk = true, linkOk = true }: FakeOptions = {}) {
  const constants = {
    VERTEX_SHADER: 1,
    FRAGMENT_SHADER: 2,
    COMPILE_STATUS: 3,
    LINK_STATUS: 4,
    ARRAY_BUFFER: 5,
    STATIC_DRAW: 6,
    FLOAT: 7,
    TRIANGLES: 8,
    COLOR_BUFFER_BIT: 9,
    TEXTURE0: 100,
    TEXTURE_2D: 10,
    UNPACK_FLIP_Y_WEBGL: 11,
    RGB: 12,
    UNSIGNED_BYTE: 13,
    TEXTURE_MIN_FILTER: 14,
    TEXTURE_MAG_FILTER: 15,
    TEXTURE_WRAP_S: 16,
    TEXTURE_WRAP_T: 17,
    LINEAR: 18,
    CLAMP_TO_EDGE: 19,
  };
  const gl = {
    ...constants,
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => compileOk),
    getShaderInfoLog: vi.fn(() => "ERROR: 0:1: syntax error"),
    deleteShader: vi.fn(),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => linkOk),
    getProgramInfoLog: vi.fn(() => "varying mismatch"),
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn(() => 0),
    useProgram: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    getUniformLocation: vi.fn((_program: unknown, name: string) => ({ name })),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    clear: vi.fn(),
    drawArrays: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteProgram: vi.fn(),
    createTexture: vi.fn(() => ({ texture: true })),
    activeTexture: vi.fn(),
    bindTexture: vi.fn(),
    pixelStorei: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    uniform1i: vi.fn(),
    deleteTexture: vi.fn(),
  };
  return gl;
}

const asGl = (gl: ReturnType<typeof fakeGl>) => gl as unknown as WebGLRenderingContext;

describe("createFullscreenPass", () => {
  it("uploads one triangle that covers clip space", () => {
    const gl = fakeGl();

    createFullscreenPass(asGl(gl), "v", "f");

    expect(gl.bufferData).toHaveBeenCalledWith(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    expect(gl.vertexAttribPointer).toHaveBeenCalledWith(0, 2, gl.FLOAT, false, 0, 0);
  });

  it("sets uniforms, looking each location up only once", () => {
    const gl = fakeGl();
    const pass = createFullscreenPass(asGl(gl), "v", "f");

    pass.setFloat("uTime", 1);
    pass.setFloat("uTime", 2);
    pass.setVec2("uResolution", 640, 480);
    pass.setVec3("uColor", [0.1, 0.7, 0.6]);

    expect(gl.getUniformLocation).toHaveBeenCalledTimes(3);
    expect(gl.uniform1f).toHaveBeenLastCalledWith({ name: "uTime" }, 2);
    expect(gl.uniform2f).toHaveBeenCalledWith({ name: "uResolution" }, 640, 480);
    expect(gl.uniform3f).toHaveBeenCalledWith({ name: "uColor" }, 0.1, 0.7, 0.6);
  });

  it("clears and draws three vertices per frame", () => {
    const gl = fakeGl();
    const pass = createFullscreenPass(asGl(gl), "v", "f");

    pass.draw();

    expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
    expect(gl.drawArrays).toHaveBeenCalledWith(gl.TRIANGLES, 0, 3);
  });

  it("uploads an image as a clamped, linear, flipped texture bound to its sampler", () => {
    const gl = fakeGl();
    const pass = createFullscreenPass(asGl(gl), "v", "f");
    const image = {} as TexImageSource;

    pass.setTexture("uImage", image, 1);

    expect(gl.activeTexture).toHaveBeenCalledWith(gl.TEXTURE0 + 1);
    expect(gl.pixelStorei).toHaveBeenCalledWith(gl.UNPACK_FLIP_Y_WEBGL, true);
    expect(gl.texImage2D).toHaveBeenCalledWith(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    expect(gl.texParameteri).toHaveBeenCalledWith(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    expect(gl.uniform1i).toHaveBeenCalledWith({ name: "uImage" }, 1);
  });

  it("frees textures on dispose", () => {
    const gl = fakeGl();
    const pass = createFullscreenPass(asGl(gl), "v", "f");
    pass.setTexture("uImage", {} as TexImageSource);

    pass.dispose();

    expect(gl.deleteTexture).toHaveBeenCalledWith({ texture: true });
  });

  it("frees the buffer and program on dispose", () => {
    const gl = fakeGl();
    const pass = createFullscreenPass(asGl(gl), "v", "f");

    pass.dispose();

    expect(gl.deleteBuffer).toHaveBeenCalled();
    expect(gl.deleteProgram).toHaveBeenCalled();
  });

  it("throws with the compiler log when a shader fails to compile", () => {
    const gl = fakeGl({ compileOk: false });

    expect(() => createFullscreenPass(asGl(gl), "v", "f")).toThrow(/Shader compile failed: ERROR: 0:1/);
    expect(gl.deleteShader).toHaveBeenCalled();
  });

  it("throws with the linker log when the program fails to link", () => {
    const gl = fakeGl({ linkOk: false });

    expect(() => createFullscreenPass(asGl(gl), "v", "f")).toThrow(/Program link failed: varying mismatch/);
  });
});
