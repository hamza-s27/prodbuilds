// The handshake (/contact): a signal travels the arc from the far point to the
// near one, through slow-moving haze.
import { loadCinemagraph } from "./cinemagraph";

export const loadHandshakeScene = () =>
  loadCinemagraph({
    image: "handshake",
    pushTo: [0.7, 0.5],
    pulse: { kind: "line", from: [0.92, 0.59], to: [0.51, 0.42], seconds: 4 },
    motes: { velocity: [-0.01, -0.012], density: 0.08 },
  });
