// The archive (/blog): a search light sweeps along the row of glass log panes,
// catching each one, while smoke rolls around the pane it found.
import { loadCinemagraph } from "./cinemagraph";

export const loadArchiveScene = () =>
  loadCinemagraph({
    image: "archive",
    pushTo: [0.64, 0.45],
    pulse: { kind: "line", from: [0.3, 0.5], to: [1, 0.45], seconds: 5 },
    motes: { velocity: [0.006, -0.01], density: 0.1 },
  });
