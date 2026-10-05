import type { Service } from "@/content/types";

const depthKey = (service: Service): number => service.layer.depth ?? Number.POSITIVE_INFINITY;

/** Request-path order (user-facing layers first); cross-cutting services last. */
export function orderedByDepth(services: readonly Service[]): Service[] {
  return [...services].sort((a, b) => depthKey(a) - depthKey(b));
}

/** Every technology across services, once each, in first-seen order. */
export function stackUnion(services: readonly Service[]): string[] {
  return [...new Set(services.flatMap((service) => service.stack))];
}
