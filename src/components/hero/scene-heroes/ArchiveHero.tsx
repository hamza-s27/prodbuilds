"use client";

import { HeroVisual } from "../HeroVisual";
import { ImagePoster } from "../HeroPosters";

const loadScene = () => import("../scenes/archive").then((module) => module.loadArchiveScene());

/** /blog: a search light sweeping a row of glass log panes. */
export function ArchiveHero() {
  return <HeroVisual loadScene={loadScene} poster={<ImagePoster name="archive" />} />;
}
