"use client";

import { HeroVisual } from "../HeroVisual";
import { ImagePoster } from "../HeroPosters";

const loadScene = () => import("../scenes/vault").then((module) => module.loadVaultScene());

/** /privacy and /terms: a sealed cube of light holding the data. */
export function VaultHero() {
  return <HeroVisual loadScene={loadScene} poster={<ImagePoster name="vault" />} />;
}
