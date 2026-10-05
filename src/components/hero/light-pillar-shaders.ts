// Light pillar: a column of teal light rising through drifting motes, drawn
// in one fullscreen pass. Original shader; the idea (a vertical light column)
// is credited to React Bits' LightPillar. GLSL ES 1.0 so WebGL 1 works too.

export const PILLAR_VERTEX = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const PILLAR_FRAGMENT = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
uniform float uPillarX;
uniform float uIntensity;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

float motes(vec2 uv, float aspect, float t, float dx) {
  vec2 grid = vec2(36.0 * aspect, 22.0);
  vec2 p = vec2(uv.x * grid.x, uv.y * grid.y - t * 0.6);
  vec2 cell = floor(p);
  float seed = hash(cell);
  vec2 position = vec2(hash(cell + 7.1), hash(cell + 3.7));
  float twinkle = 0.5 + 0.5 * sin(t * (1.5 + seed * 3.0) + seed * 6.2831);
  float spark = 1.0 - smoothstep(0.0, 0.08, length(fract(p) - position));
  return spark * step(0.82, seed) * twinkle * exp(-dx * 3.5) * smoothstep(0.0, 0.2, uv.y);
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  float x = (vUv.x - uPillarX) * aspect;
  float y = vUv.y;
  float t = uTime;

  float wobble = (fbm(vec2(y * 3.0 - t * 0.15, t * 0.1)) - 0.5) * 0.02;
  float dx = abs(x + wobble);
  float rise = smoothstep(0.0, 0.25, y) * (1.0 - smoothstep(0.55, 1.0, y) * 0.75);

  // Squares written out: pow() with a negative base is undefined in GLSL.
  float coreX = dx * 140.0;
  float hazeX = dx * 4.0;
  float poolX = x * 2.2;
  float core = exp(-coreX * coreX) * rise;
  float glow = exp(-dx * 22.0) * rise * 0.55;
  float haze = exp(-hazeX * hazeX) * rise * 0.18;
  float wisps = smoothstep(0.45, 0.9, fbm(vec2(x * 9.0, y * 2.5 - t * 0.35))) * exp(-dx * 9.0) * rise * 0.6;
  float pool = exp(-poolX * poolX) * exp(-y * 14.0) * 0.5;
  float mote = motes(vUv, aspect, t, dx);

  vec3 color = uColor * (glow + haze + wisps + pool)
    + vec3(0.92, 1.0, 0.97) * core
    + mix(uColor, vec3(1.0), 0.5) * mote * 0.8;
  color *= uIntensity;
  // Dither away 8-bit banding in the soft gradients.
  color += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  color = max(color, 0.0);

  float alpha = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0);
  gl_FragColor = vec4(min(color, vec3(alpha)), alpha);
}
`;
