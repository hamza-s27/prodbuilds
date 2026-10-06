import type { FullscreenPass } from "@/lib/webgl/fullscreen-pass";

/**
 * One hero animation: a fragment shader drawn in a single fullscreen pass.
 * Every scene gets uTime (s), uResolution (px), uColor (brand teal, 0–1 RGB)
 * and uIntensity, and draws premultiplied colour over the page background.
 */
export interface HeroScene {
  /** GLSL ES 1.0, so WebGL 1 works too. Declares `varying vec2 vUv` (0–1). */
  readonly fragment: string;
  /** Scene-specific uniforms, set once after the program links. */
  readonly init?: (pass: FullscreenPass) => void;
}

export const SCENE_VERTEX = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
