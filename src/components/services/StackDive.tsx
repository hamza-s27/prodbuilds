import type { Service } from "@/content/types";
import { ServiceLayerSection } from "./ServiceLayerSection";
import { StackVisual } from "./StackVisual";
import "./stack-dive.css";

interface StackDiveProps {
  /** In page (depth) order. */
  readonly services: readonly Service[];
}

/**
 * /services body: the service sections in normal document flow, with a sticky
 * stack navigation beside them from 1024px. Nothing is pinned, so anchors,
 * find-in-page and the no-JS view behave as on any page.
 */
export function StackDive({ services }: StackDiveProps) {
  const layers = services.map(({ id, title, layer }) => ({ id, title, hud: layer.hud, depth: layer.depth }));
  return (
    <div className="page-grid">
      <div className="hidden pt-(--space-section) lg:col-span-4 lg:block">
        {/* Never taller than the viewport, so every layer stays reachable on short screens. */}
        <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] overflow-y-auto p-1">
          <StackVisual layers={layers} />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-8">
        {services.map((service) => (
          <ServiceLayerSection key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}
