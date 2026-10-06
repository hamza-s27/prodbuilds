// Pure frame functions for animated text. Each returns the string to show at a
// given progress (0–1), so components only hold a number in state.

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

/** NumberTicker: counts from 0 up to `to`, easing out. */
export function countFrame(to: number, progress: number): string {
  return String(Math.round(to * easeOutCubic(clamp01(progress))));
}

// Letters only (no wide symbols, no m/w), so a scrambled word stays close to the real word's width.
const UPPER_GLYPHS = "ABCDEFGHJKLNOPRSTUVXYZ";
const LOWER_GLYPHS = "abcdefghijklnopqrstuvxyz";

/** A pseudo-random glyph for (character index, tick): same inputs, same glyph. */
function scrambleGlyph(index: number, tick: number, upper: boolean): string {
  const glyphs = upper ? UPPER_GLYPHS : LOWER_GLYPHS;
  const hash = Math.imul(index + 1, 0x9e3779b1) ^ Math.imul(tick + 1, 0x85ebca6b);
  return glyphs.charAt((hash >>> 0) % glyphs.length);
}

/**
 * DecryptedText: characters settle left to right; the rest are scrambled
 * glyphs of the same case. `tick` picks the scramble, so frames are pure.
 */
export function decryptFrame(text: string, progress: number, tick: number): string {
  const characters = [...text];
  const settled = Math.floor(clamp01(progress) * characters.length);
  return characters
    .map((character, index) =>
      index < settled || character.trim() === ""
        ? character
        : scrambleGlyph(index, tick, character === character.toUpperCase()),
    )
    .join("");
}
