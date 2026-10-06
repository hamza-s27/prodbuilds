"use client";

import { HeroVisual } from "../HeroVisual";
import { ImagePoster } from "../HeroPosters";

const loadScene = () => import("../scenes/pipeline").then((module) => module.loadPipelineScene());

/** /how-we-work: a pulse running through four stages. */
export function PipelineHero() {
  return <HeroVisual loadScene={loadScene} poster={<ImagePoster name="pipeline" />} />;
}
