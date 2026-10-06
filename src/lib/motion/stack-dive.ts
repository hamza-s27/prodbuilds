// Active-layer logic for the /services stack dive.

/** The section crossing the active line; the deeper one wins at a boundary. */
export function pickActive<Id extends string>(
  order: readonly Id[],
  intersecting: ReadonlySet<string>,
): Id | null {
  return order.findLast((id) => intersecting.has(id)) ?? null;
}

/** Gauge needle stop for a layer depth (0 = surface). The AI rail and "none" sit at the surface. */
export function gaugeStop(depth: number | null | undefined): number {
  return depth ?? 0;
}
