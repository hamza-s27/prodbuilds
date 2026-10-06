"use client";

import { HeroVisual } from "../HeroVisual";
import { ImagePoster } from "../HeroPosters";

const loadScene = () => import("../scenes/stack").then((module) => module.loadStackScene());

/** /services: the stack, a beam through five layers with the AI rail. */
export function StackHero() {
  return <HeroVisual loadScene={loadScene} poster={<ImagePoster name="stack" />} />;
}
