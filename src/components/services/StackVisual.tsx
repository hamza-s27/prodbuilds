"use client";

import type { CSSProperties } from "react";
import type { ServiceId } from "@/content/types";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useDecryptedText } from "@/hooks/useDecryptedText";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { gaugeStop } from "@/lib/motion/stack-dive";

export interface StackLayer {
  readonly id: ServiceId;
  readonly title: string;
  readonly hud: string;
  /** null = the cross-cutting AI rail. */
  readonly depth: number | null;
}

/** Layers the AI rail taps into: product features (L0) and APIs/data via MCP (L1). */
const AI_TAP_MAX_DEPTH = 1;
const IDLE_READOUT = "5 layers + AI";
/** Matches the `lg` breakpoint where StackDive shows this navigation. */
const SHOWN_QUERY = "(min-width: 64rem)";

interface StackVisualProps {
  /** In page order. */
  readonly layers: readonly StackLayer[];
}

/**
 * Sticky "jump to layer" navigation for /services (1024px and up). The layer
 * whose section crosses the viewport centre is marked aria-current; a depth
 * gauge and HUD readout follow it. Works as plain links without JavaScript.
 */
export function StackVisual({ layers }: StackVisualProps) {
  // Hidden below 1024px: don't observe or animate there.
  const shown = useMediaQuery(SHOWN_QUERY);
  const active = useActiveSection(
    layers.map((layer) => layer.id),
    shown,
  );
  const activeLayer = layers.find((layer) => layer.id === active);
  const readout = useDecryptedText(activeLayer?.hud ?? IDLE_READOUT, shown);
  const slabs = layers.filter((layer) => layer.depth !== null);
  const rail = layers.find((layer) => layer.depth === null);
  const current = (id: ServiceId) => (id === active ? "true" : undefined);

  return (
    <nav
      aria-label="Layers of the stack"
      data-active-layer={active ?? "none"}
      className="stack-visual"
      style={{ "--gauge-stop": gaugeStop(activeLayer?.depth) } as CSSProperties}
    >
      <p aria-hidden className="hud stack-readout">
        <span className="text-primary">Depth</span> {readout}
      </p>
      <div className="stack-body">
        <span aria-hidden className="stack-gauge">
          <span className="stack-gauge-needle" />
        </span>
        <ol className="stack-slabs">
          {slabs.map((layer) => (
            <li key={layer.id} style={{ "--depth": layer.depth } as CSSProperties}>
              <a href={`#${layer.id}`} aria-current={current(layer.id)} className="stack-slab">
                <span className="hud stack-slab-depth">L{layer.depth}</span>
                <span className="stack-slab-title">{layer.title}</span>
              </a>
              {layer.depth! <= AI_TAP_MAX_DEPTH && <span aria-hidden className="stack-beam" />}
            </li>
          ))}
        </ol>
        {rail && (
          <a href={`#${rail.id}`} aria-current={current(rail.id)} className="stack-rail">
            {rail.title}
          </a>
        )}
      </div>
    </nav>
  );
}
