// Static hero pictures. Server-safe (no hooks): passed into HeroVisual by the
// per-scene wrappers in ./scene-heroes.
import type { CSSProperties } from "react";
import { type HeroStill, STILL_SHIFT } from "./hero-stills";

/** The light pillar, drawn in CSS (no download). */
export function PillarPoster() {
  return (
    <>
      <div className="hero-poster__beam" />
      <div className="hero-poster__bloom" />
    </>
  );
}

/** A concept still (public/images/heroes, made in Google Flow), placed exactly as the cinemagraph draws it. */
export function ImagePoster({ name }: { readonly name: HeroStill }) {
  return (
    // Plain <img> by convention (CLAUDE.md): next/image's client code doesn't fit the budget.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/heroes/${name}-1376.webp`}
      srcSet={`/images/heroes/${name}-800.webp 800w, /images/heroes/${name}-1376.webp 1376w`}
      sizes="100vw"
      width={1376}
      height={768}
      alt=""
      decoding="async"
      className="hero-poster__image"
      style={{ "--still-shift": STILL_SHIFT[name] } as CSSProperties}
    />
  );
}
