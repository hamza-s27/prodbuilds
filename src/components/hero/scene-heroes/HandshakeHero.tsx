"use client";

import { HeroVisual } from "../HeroVisual";
import { ImagePoster } from "../HeroPosters";

const loadScene = () => import("../scenes/handshake").then((module) => module.loadHandshakeScene());

/** /contact: a signal arcing between two points. */
export function HandshakeHero() {
  return <HeroVisual loadScene={loadScene} poster={<ImagePoster name="handshake" />} />;
}
