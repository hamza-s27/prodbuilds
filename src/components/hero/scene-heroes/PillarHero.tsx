"use client";

import { HeroVisual } from "../HeroVisual";
import { PillarPoster } from "../HeroPosters";

const loadScene = () => import("../scenes/pillar").then((module) => module.pillarScene);

/** Home: the light pillar. */
export function PillarHero() {
  return <HeroVisual loadScene={loadScene} poster={<PillarPoster />} />;
}
