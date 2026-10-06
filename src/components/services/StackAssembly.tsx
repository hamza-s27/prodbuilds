import type { CSSProperties } from "react";
import type { Service } from "@/content/types";
import "./assembly.css";

interface StackAssemblyProps {
  /** In depth order; the cross-cutting one becomes the rail. */
  readonly services: readonly Service[];
}

/**
 * Home services chapter: a stack of five slabs plus the AI rail. With scroll
 * scenes on, each slab drops in as its service row scrolls through
 * (scroll-scenes.css); otherwise it's shown fully built. Decorative.
 */
export function StackAssembly({ services }: StackAssemblyProps) {
  const slabs = services.filter((service) => service.layer.depth !== null);
  return (
    <div aria-hidden className="stack-assembly">
      <div className="assembly-stack">
        {slabs.map((service) => (
          <div
            key={service.id}
            data-layer={service.id}
            className="assembly-slab"
            style={{ "--depth": service.layer.depth } as CSSProperties}
          >
            <span className="assembly-slab-shape" />
            <span className="hud assembly-slab-label">{service.layer.hud}</span>
          </div>
        ))}
      </div>
      <div data-layer="ai" className="assembly-rail">
        <span className="hud">AI</span>
      </div>
    </div>
  );
}
