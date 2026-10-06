// The stack (/services): light drops down the beam through the five glass
// slabs, motes fall with it, and the smoke drifts around the layers.
import { loadCinemagraph } from "./cinemagraph";

export const loadStackScene = () =>
  loadCinemagraph({
    image: "stack",
    pushTo: [0.63, 0.45],
    pulse: { kind: "line", from: [0.625, 0], to: [0.625, 1], seconds: 4.5 },
    motes: { velocity: [0, 0.06], density: 0.16 },
  });
