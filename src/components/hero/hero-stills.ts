// The concept stills behind the page heroes (public/images/heroes, made in
// Google Flow), shared by the poster <img> and the cinemagraph shader so the
// two always line up.

export type HeroStill = "stack" | "pipeline" | "handshake" | "vault" | "archive";

/** object-position x of the still (the subject sits right of centre). */
export const STILL_FOCUS_X = 0.7;

/** From this hero aspect up the copy sits beside the picture, so the picture moves right. */
export const SHIFT_MIN_ASPECT = 1.2;

/**
 * How far right each still moves on wide heroes, as a fraction of the hero's
 * width, so its brightest part stays clear of the headline. The uncovered
 * left edge is the still's own near-black edge, stretched.
 */
export const STILL_SHIFT: Readonly<Record<HeroStill, number>> = {
  stack: 0.06,
  pipeline: 0.2,
  handshake: 0,
  vault: 0.06,
  archive: 0.05,
};

/** The width the poster's srcset most likely picked, so the shader's copy comes from cache. */
export const stillUrl = (still: HeroStill, viewportPx: number) =>
  `/images/heroes/${still}-${viewportPx > 800 ? 1376 : 800}.webp`;
