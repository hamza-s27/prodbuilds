// The pipeline (/how-we-work): a pulse of light runs up the diagonal beam
// through the four chambers; motes stream along with it.
import { loadCinemagraph } from "./cinemagraph";

export const loadPipelineScene = () =>
  loadCinemagraph({
    image: "pipeline",
    pushTo: [0.55, 0.55],
    pulse: { kind: "line", from: [0.06, 0.98], to: [0.98, 0.19], seconds: 5 },
    motes: { velocity: [0.035, -0.03], density: 0.12 },
  });
