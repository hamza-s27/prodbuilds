// Cinemagraph: brings a concept still (public/images/heroes) to life. The
// photo stays the picture; the shader adds smoke that drifts and thickens,
// light travelling over the lit parts with volumetric shafts through the haze,
// drifting motes, glints and a slow camera push. Image coordinates in the
// config are fractions of the image, y down (as you'd read them off the still).
import { type HeroStill, SHIFT_MIN_ASPECT, STILL_FOCUS_X, STILL_SHIFT, stillUrl } from "../hero-stills";
import { SCENE_HEADER } from "./glsl";
import type { HeroScene } from "./types";

type Point = readonly [number, number];

export interface CinemagraphConfig {
  readonly image: HeroStill;
  /** Where the camera slowly pushes in towards. */
  readonly pushTo: Point;
  /** Light sweeping along a path (the beam), or rippling out from a point (a core). */
  readonly pulse:
    | { readonly kind: "line"; readonly from: Point; readonly to: Point; readonly seconds: number }
    | { readonly kind: "radial"; readonly from: Point; readonly seconds: number };
  /** Mote drift, in image heights per second (y down), and how many (0–1). */
  readonly motes: { readonly velocity: Point; readonly density: number };
}

const CINEMAGRAPH_FRAGMENT = /* glsl */ `
${SCENE_HEADER}

uniform sampler2D uImage;
uniform float uImageAspect;
uniform float uFocusX;
uniform float uShift;
uniform float uShiftMinAspect;
uniform vec2 uPushTo;
uniform vec2 uPulseFrom;
uniform vec2 uPulseTo;
uniform float uPulseRadial;
uniform float uPulseSeconds;
uniform vec2 uMoteVelocity;
uniform float uMoteDensity;

const int RAY_STEPS = 16;

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

/**
 * object-fit: cover with object-position (uFocusX, 50%), moved right by uShift
 * on wide heroes: exactly how hero.css places the poster <img>.
 */
vec2 coverUv(vec2 uv) {
  float canvasAspect = uResolution.x / uResolution.y;
  uv.x -= canvasAspect >= uShiftMinAspect ? uShift : 0.0;
  vec2 scale = canvasAspect > uImageAspect
    ? vec2(1.0, uImageAspect / canvasAspect)
    : vec2(canvasAspect / uImageAspect, 1.0);
  vec2 anchor = vec2(uFocusX, 0.5);
  return anchor + (uv - anchor) * scale;
}

void main() {
  float t = uTime;
  vec2 aspect = vec2(uImageAspect, 1.0);

  // A slow push-in towards the subject and back (about 26 s).
  vec2 uv = coverUv(vUv);
  float push = 0.035 * (0.5 - 0.5 * cos(t * 0.24));
  uv = uPushTo + (uv - uPushTo) / (1.0 + push);

  // Smoke: the dim haze (not the lit edges) is warped along a drifting flow
  // field, and its density swells and thins as it moves.
  vec3 raw = texture2D(uImage, uv).rgb;
  float rawLuma = luma(raw);
  float haze = smoothstep(0.01, 0.08, rawLuma) * (1.0 - smoothstep(0.2, 0.5, rawLuma));
  vec2 q = uv * aspect * 2.4;
  vec2 flow = vec2(
    fbm(q + vec2(t * 0.045, -t * 0.03)),
    fbm(q + vec2(-t * 0.035, t * 0.05) + 5.2)
  ) - 0.5;
  vec3 color = texture2D(uImage, uv + flow * 0.02 * haze).rgb;
  float density = fbm(q * 1.4 + vec2(t * 0.03, t * 0.045) + flow * 2.5);
  color *= 1.0 + (density - 0.5) * 1.1 * haze;
  color += mix(vec3(rawLuma), uColor, 0.6) * max(density - 0.5, 0.0) * 0.35 * haze;

  // Light travelling over the lit parts: a band sweeping along the beam, or a
  // ring spreading from the core.
  float phase = fract(t / uPulseSeconds);
  float pulse;
  vec2 light;
  if (uPulseRadial > 0.5) {
    float radius = length((uv - uPulseFrom) * aspect);
    float front = phase * 0.55;
    float d = (radius - front) / 0.045;
    pulse = exp(-d * d) * (1.0 - phase) + exp(-radius * 14.0) * (0.6 + 0.4 * sin(t * 1.6));
    light = uPulseFrom;
  } else {
    vec2 path = uPulseTo - uPulseFrom;
    float along = dot(uv - uPulseFrom, path) / dot(path, path);
    float front = mix(-0.15, 1.15, phase);
    float d = (along - front) / 0.06;
    pulse = exp(-d * d);
    light = uPulseFrom + path * clamp(front, 0.0, 1.0);
  }
  float lit = smoothstep(0.2, 0.65, luma(color));
  color += uColor * pulse * lit * 0.9 + vec3(0.9, 1.0, 0.97) * pulse * lit * lit * 0.45;

  // Volumetric shafts: the lit parts smeared towards the travelling light,
  // strongest near it and inside the haze.
  vec2 toLight = (light - uv) / float(RAY_STEPS);
  vec2 probe = uv;
  float rays = 0.0;
  float weight = 1.0;
  for (int i = 0; i < RAY_STEPS; i++) {
    probe += toLight;
    rays += smoothstep(0.3, 0.8, luma(texture2D(uImage, probe).rgb)) * weight;
    weight *= 0.9;
  }
  float nearLight = exp(-length((uv - light) * aspect) * 2.6);
  color += uColor * rays / float(RAY_STEPS) * nearLight * (0.35 + 0.9 * haze);

  // Motes drifting through the lit haze.
  vec2 moteSpace = uv * aspect * 64.0 - uMoteVelocity * t * 64.0;
  vec2 cell = floor(moteSpace);
  float seed = hash(cell);
  vec2 offset = vec2(hash(cell + 7.1), hash(cell + 3.7));
  float spark = 1.0 - smoothstep(0.0, 0.1, length(fract(moteSpace) - offset));
  float twinkle = 0.5 + 0.5 * sin(t * (1.5 + seed * 3.0) + seed * 6.2831);
  float moteMask = smoothstep(0.03, 0.25, rawLuma) * step(1.0 - uMoteDensity, seed);
  color += mix(uColor, vec3(1.0), 0.5) * spark * twinkle * moteMask * 0.8;

  // Glints: a few bright pixels catch the light now and then.
  float glint = step(0.992, hash(floor(uv * aspect * 150.0) + floor(t * 2.5)));
  color += vec3(0.85, 1.0, 0.95) * smoothstep(0.5, 0.9, rawLuma) * glint * 0.5;

  // Film grain, so the gradients never band.
  color += (hash(gl_FragCoord.xy + fract(t) * 91.0) - 0.5) * 0.02;
  gl_FragColor = vec4(max(color * uIntensity, 0.0), 1.0);
}
`;

/** Image coordinates are y down; texture uvs are y up. */
const toUv = ([x, y]: Point) => [x, 1 - y] as const;

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

/** Loads the still and returns its scene: the lazy chunk's entry point. */
export async function loadCinemagraph(config: CinemagraphConfig): Promise<HeroScene> {
  const image = await loadImage(stillUrl(config.image, window.innerWidth * (window.devicePixelRatio || 1)));
  return {
    fragment: CINEMAGRAPH_FRAGMENT,
    init(pass) {
      pass.setTexture("uImage", image);
      pass.setFloat("uImageAspect", image.naturalWidth / image.naturalHeight);
      pass.setFloat("uFocusX", STILL_FOCUS_X);
      pass.setFloat("uShift", STILL_SHIFT[config.image]);
      pass.setFloat("uShiftMinAspect", SHIFT_MIN_ASPECT);
      pass.setVec2("uPushTo", ...toUv(config.pushTo));
      pass.setVec2("uPulseFrom", ...toUv(config.pulse.from));
      pass.setVec2("uPulseTo", ...toUv(config.pulse.kind === "line" ? config.pulse.to : config.pulse.from));
      pass.setFloat("uPulseRadial", config.pulse.kind === "radial" ? 1 : 0);
      pass.setFloat("uPulseSeconds", config.pulse.seconds);
      pass.setVec2("uMoteVelocity", config.motes.velocity[0], -config.motes.velocity[1]);
      pass.setFloat("uMoteDensity", config.motes.density);
    },
  };
}
