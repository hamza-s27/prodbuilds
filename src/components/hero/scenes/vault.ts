// The vault (/privacy, /terms): the core inside the cube breathes and sends
// rings of light out through the glass; the haze around it drifts.
import { loadCinemagraph } from "./cinemagraph";

export const loadVaultScene = () =>
  loadCinemagraph({
    image: "vault",
    pushTo: [0.68, 0.42],
    pulse: { kind: "radial", from: [0.685, 0.4], seconds: 5 },
    motes: { velocity: [0.004, -0.012], density: 0.14 },
  });
