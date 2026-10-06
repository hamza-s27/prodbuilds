// Minimal WebGL for one fullscreen fragment shader: compile, link, draw a
// single oversized triangle, optionally sampling an image. Replaces ogl
// (~14 kb gz) for our hero scenes.

type GL = WebGLRenderingContext | WebGL2RenderingContext;

/** Covers clip space with one triangle: (-1,-1), (3,-1), (-1,3). */
const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

export interface FullscreenPass {
  setFloat(name: string, value: number): void;
  setVec2(name: string, x: number, y: number): void;
  setVec3(name: string, value: readonly [number, number, number]): void;
  /** Uploads an image (rows flipped so uv (0,0) is bottom-left) and binds it to a sampler2D. */
  setTexture(name: string, source: TexImageSource, unit?: number): void;
  draw(): void;
  dispose(): void;
}

function compile(gl: GL, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

function link(gl: GL, vertexSource: string, fragmentSource: string): WebGLProgram {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

/** The vertex shader must declare `attribute vec2 position`. */
export function createFullscreenPass(gl: GL, vertexSource: string, fragmentSource: string): FullscreenPass {
  const program = link(gl, vertexSource, fragmentSource);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.useProgram(program);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const textures: WebGLTexture[] = [];
  const locations = new Map<string, WebGLUniformLocation | null>();
  const location = (name: string) => {
    if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
    return locations.get(name) ?? null;
  };

  return {
    setFloat: (name, value) => gl.uniform1f(location(name), value),
    setVec2: (name, x, y) => gl.uniform2f(location(name), x, y),
    setVec3: (name, [r, g, b]) => gl.uniform3f(location(name), r, g, b),
    setTexture(name, source, unit = 0) {
      const texture = gl.createTexture();
      if (!texture) throw new Error("Could not create texture");
      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
      // Non-power-of-two images: no mipmaps, clamp at the edges (WebGL 1 rules).
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(location(name), unit);
    },
    draw() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
